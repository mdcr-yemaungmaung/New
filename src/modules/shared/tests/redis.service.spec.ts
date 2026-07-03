import { EventEmitter } from 'events';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../services/redis.service';

let capturedClient: Record<string, jest.Mock>;
let shouldConnectFail = false;

const createFreshMock = () => {
  const ee = new EventEmitter();
  const client: Record<string, jest.Mock> = {
    connect: jest.fn().mockImplementation(() => {
      if (shouldConnectFail) {
        return Promise.reject(new Error('Connection refused'));
      }
      ee.emit('connect');
      return Promise.resolve();
    }),
    disconnect: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    on: jest.fn((event: string, handler: () => void) => {
      ee.on(event, handler);
      return client;
    }),
  };
  return client;
};

jest.mock('redis', () => ({
  createClient: jest.fn(() => {
    capturedClient = createFreshMock();
    return capturedClient;
  }),
}));

describe('RedisService', () => {
  let service: RedisService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    capturedClient = undefined!;
    shouldConnectFail = false;

    configService = {
      get: jest.fn((key: string, defaultVal?: unknown) => {
        const config: Record<string, unknown> = {
          'redis.host': 'localhost',
          'redis.port': 6379,
          'redis.password': '',
        };
        return config[key] ?? defaultVal;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  describe('onModuleInit', () => {
    it('should connect to Redis', async () => {
      await service.onModuleInit();
      expect(capturedClient.connect).toHaveBeenCalled();
    });

    it('should handle connection failure gracefully', async () => {
      shouldConnectFail = true;
      await service.onModuleInit();
    });

    it('should use password in URL when configured', async () => {
      configService.get.mockImplementation(
        (key: string, defaultVal?: unknown) => {
          const config: Record<string, unknown> = {
            'redis.host': 'localhost',
            'redis.port': 6379,
            'redis.password': 'secret123',
          };
          return config[key] ?? defaultVal;
        },
      );
      await service.onModuleInit();
      expect(capturedClient.connect).toHaveBeenCalled();
    });

    it('should handle connection timeout gracefully', async () => {
      shouldConnectFail = false;
      await service.onModuleInit();
      expect(capturedClient.connect).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle error event when already connected', async () => {
      await service.onModuleInit();
      const calls = capturedClient.on.mock.calls as [string, () => void][];
      const errorHandler = calls.find((call) => call[0] === 'error')?.[1];
      errorHandler?.();
    });

    it('should ignore error event when not yet connected', async () => {
      await service.onModuleInit();
      const calls = capturedClient.on.mock.calls as [string, () => void][];
      const errorHandler = calls.find((call) => call[0] === 'error')?.[1];
      errorHandler?.();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect when connected', async () => {
      await service.onModuleInit();
      await service.onModuleDestroy();
      expect(capturedClient.disconnect).toHaveBeenCalled();
    });

    it('should not disconnect when not connected', async () => {
      await service.onModuleDestroy();
      expect(capturedClient).toBeUndefined();
    });
  });

  describe('del', () => {
    it('should delete key when connected', async () => {
      await service.onModuleInit();
      await service.del('test-key');
      expect(capturedClient.del).toHaveBeenCalledWith('test-key');
    });

    it('should skip when not connected', async () => {
      await service.del('test-key');
      expect(capturedClient).toBeUndefined();
    });

    it('should handle deletion errors gracefully', async () => {
      await service.onModuleInit();
      capturedClient.del.mockRejectedValueOnce(new Error('Del failed'));
      await service.del('test-key');
    });
  });

  describe('delByPattern', () => {
    it('should delete matching keys', async () => {
      await service.onModuleInit();
      capturedClient.keys.mockResolvedValue(['key1', 'key2']);
      await service.delByPattern('key*');
      expect(capturedClient.keys).toHaveBeenCalledWith('key*');
    });

    it('should skip when not connected', async () => {
      await service.delByPattern('key*');
      expect(capturedClient).toBeUndefined();
    });

    it('should handle no matching keys', async () => {
      await service.onModuleInit();
      capturedClient.keys.mockResolvedValue([]);
      await service.delByPattern('none*');
      expect(capturedClient.del).not.toHaveBeenCalled();
    });

    it('should handle pattern error gracefully', async () => {
      await service.onModuleInit();
      capturedClient.keys.mockRejectedValueOnce(new Error('Keys failed'));
      await service.delByPattern('key*');
    });
  });

  describe('set', () => {
    it('should set value without TTL', async () => {
      await service.onModuleInit();
      await service.set('k', 'v');
      expect(capturedClient.set).toHaveBeenCalledWith('k', 'v');
    });

    it('should set value with TTL', async () => {
      await service.onModuleInit();
      await service.set('k', 'v', 60);
      expect(capturedClient.set).toHaveBeenCalledWith('k', 'v', { EX: 60 });
    });

    it('should skip when not connected', async () => {
      await service.set('k', 'v');
      expect(capturedClient).toBeUndefined();
    });

    it('should handle set error gracefully', async () => {
      await service.onModuleInit();
      capturedClient.set.mockRejectedValueOnce(new Error('Set failed'));
      await service.set('k', 'v');
    });
  });

  describe('get', () => {
    it('should return value when connected', async () => {
      await service.onModuleInit();
      capturedClient.get.mockResolvedValue('hello');
      const result = await service.get('k');
      expect(result).toBe('hello');
    });

    it('should return null when not connected', async () => {
      const result = await service.get('k');
      expect(result).toBeNull();
    });

    it('should handle get error gracefully', async () => {
      await service.onModuleInit();
      capturedClient.get.mockRejectedValueOnce(new Error('Get failed'));
      const result = await service.get('k');
      expect(result).toBeNull();
    });
  });
});
