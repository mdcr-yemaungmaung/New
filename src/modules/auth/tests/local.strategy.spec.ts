import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from '../strategies/local.strategy';
import { AuthService } from '../auth.service';
import { User } from '../../shared/entities/user.entity';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  const mockUser: Partial<User> = {
    userId: 1,
    email: 'test@example.com',
    fullName: 'Test User',
  };

  beforeEach(async () => {
    authService = {
      validateUser: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
  });

  describe('validate', () => {
    it('should return user when credentials are valid', async () => {
      authService.validateUser.mockResolvedValue(mockUser as User);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await strategy.validate('test@example.com', 'password123');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.validateUser).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      authService.validateUser.mockResolvedValue(null);

      await expect(
        strategy.validate('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
