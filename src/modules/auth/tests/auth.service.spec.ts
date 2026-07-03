import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { User } from '../../shared/entities/user.entity';
import { RoleCode } from '../../shared/types';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser: Partial<User> = {
    userId: 1,
    email: 'test@example.com',
    passwordHash: '$2b$10$hashedpassword',
    roleId: 1,
    branch: 'Tokyo',
    department: 'Engineering',
    employeeNumber: 'EMP001',
    fullName: 'Test User',
    isActive: true,
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
    } as unknown as jest.Mocked<JwtService>;

    configService = {
      get: jest.fn().mockReturnValue('3600s'),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      userRepo.findOne.mockResolvedValue(mockUser as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com', isActive: true },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      const result = await service.validateUser(
        'unknown@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      userRepo.findOne.mockResolvedValue(mockUser as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and refresh token', () => {
      const result = service.login(mockUser as User);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.sub).toBe(1);
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.role).toBe(RoleCode.APPLICANT);
    });

    it('should map roleId 2 to MANAGER', () => {
      const managerUser = { ...mockUser, roleId: 2 } as User;
      const result = service.login(managerUser);
      expect(result.user.role).toBe(RoleCode.MANAGER);
    });

    it('should map roleId 3 to APPROVER', () => {
      const approverUser = { ...mockUser, roleId: 3 } as User;
      const result = service.login(approverUser);
      expect(result.user.role).toBe(RoleCode.APPROVER);
    });

    it('should map roleId 4 to ACCOUNTING', () => {
      const accountingUser = { ...mockUser, roleId: 4 } as User;
      const result = service.login(accountingUser);
      expect(result.user.role).toBe(RoleCode.ACCOUNTING);
    });

    it('should map roleId 5 to ADMIN', () => {
      const adminUser = { ...mockUser, roleId: 5 } as User;
      const result = service.login(adminUser);
      expect(result.user.role).toBe(RoleCode.ADMIN);
    });

    it('should default unknown roleId to APPLICANT', () => {
      const unknownUser = { ...mockUser, roleId: 99 } as User;
      const result = service.login(unknownUser);
      expect(result.user.role).toBe(RoleCode.APPLICANT);
    });
  });
});
