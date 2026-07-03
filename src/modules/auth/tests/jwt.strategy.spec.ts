import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-secret') },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('should return the payload as-is', () => {
      const payload = {
        sub: 1,
        email: 'test@example.com',
        role: 'APPLICANT',
        roleId: 1,
        branch: 'Tokyo',
        department: 'Engineering',
        employeeNumber: 'EMP001',
        fullName: 'Test User',
        iat: 1234567890,
        exp: 1234567899,
      };

      const result = strategy.validate(payload);
      expect(result).toEqual(payload);
    });
  });
});
