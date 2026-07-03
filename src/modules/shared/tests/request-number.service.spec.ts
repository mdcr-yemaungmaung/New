import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestNumberService } from '../services/request-number.service';
import { PaymentRequest } from '../entities/payment-request.entity';

describe('RequestNumberService', () => {
  let service: RequestNumberService;
  let repo: jest.Mocked<Repository<PaymentRequest>>;

  const mockQueryBuilder = () => ({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  });

  beforeEach(async () => {
    repo = {
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<PaymentRequest>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestNumberService,
        { provide: getRepositoryToken(PaymentRequest), useValue: repo },
      ],
    }).compile();

    service = module.get<RequestNumberService>(RequestNumberService);
  });

  describe('generateNext', () => {
    it('should generate PRF-YYYY-000001 when no existing requests', async () => {
      const qb = mockQueryBuilder();
      qb.getRawMany.mockResolvedValue([]);
      repo.createQueryBuilder.mockReturnValue(qb as never);

      const result = await service.generateNext();
      const year = new Date().getFullYear();

      expect(result).toBe(`PRF-${year}-000001`);
    });

    it('should increment from the highest existing sequence', async () => {
      const year = new Date().getFullYear();
      const qb = mockQueryBuilder();
      qb.getRawMany.mockResolvedValue([
        { requestNumber: `PRF-${year}-000005` },
        { requestNumber: `PRF-${year}-000003` },
      ]);
      repo.createQueryBuilder.mockReturnValue(qb as never);

      const result = await service.generateNext();
      expect(result).toBe(`PRF-${year}-000006`);
    });

    it('should handle request_number field (snake_case)', async () => {
      const year = new Date().getFullYear();
      const qb = mockQueryBuilder();
      qb.getRawMany.mockResolvedValue([
        { request_number: `PRF-${year}-000010` },
      ]);
      repo.createQueryBuilder.mockReturnValue(qb as never);

      const result = await service.generateNext();
      expect(result).toBe(`PRF-${year}-000011`);
    });

    it('should skip malformed request numbers', async () => {
      const year = new Date().getFullYear();
      const qb = mockQueryBuilder();
      qb.getRawMany.mockResolvedValue([
        { requestNumber: 'invalid' },
        { requestNumber: `PRF-${year}-000002` },
      ]);
      repo.createQueryBuilder.mockReturnValue(qb as never);

      const result = await service.generateNext();
      expect(result).toBe(`PRF-${year}-000003`);
    });

    it('should pad sequence to 6 digits', async () => {
      const year = new Date().getFullYear();
      const qb = mockQueryBuilder();
      qb.getRawMany.mockResolvedValue([]);
      repo.createQueryBuilder.mockReturnValue(qb as never);

      const result = await service.generateNext();
      expect(result).toBe(`PRF-${year}-000001`);
      expect(result.split('-')[2]).toHaveLength(6);
    });
  });
});
