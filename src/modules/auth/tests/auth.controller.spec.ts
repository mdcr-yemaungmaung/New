import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { User } from '../../shared/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser: Partial<User> = {
    userId: 1,
    email: 'test@example.com',
    roleId: 1,
    branch: 'Tokyo',
    department: 'Engineering',
    employeeNumber: 'EMP001',
    fullName: 'Test User',
  };

  beforeEach(async () => {
    authService = {
      login: jest.fn().mockReturnValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: { sub: 1, email: 'test@example.com' },
      }),
    } as unknown as jest.Mocked<AuthService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('should return auth response with tokens', () => {
      const req = { user: mockUser as User };
      const result = controller.login(req);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('refresh', () => {
    it('should return new access token', () => {
      const req = { user: mockUser as User };
      const result = controller.refresh(req);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('mock-access-token');
    });
  });

  describe('logout', () => {
    it('should return success', () => {
      const result = controller.logout();
      expect(result).toEqual({ success: true });
    });
  });
});
