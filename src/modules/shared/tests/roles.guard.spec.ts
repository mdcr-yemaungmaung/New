import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../guards/roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockRequest = (role?: string) => ({
    user: role ? { sub: 1, role } : undefined,
  });

  const mockContext = (request: unknown): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should return true when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(mockContext(mockRequest()))).toBe(true);
  });

  it('should return true when user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['MANAGER']);
    expect(guard.canActivate(mockContext(mockRequest('MANAGER')))).toBe(true);
  });

  it('should throw ForbiddenException when user has wrong role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['MANAGER']);
    expect(() =>
      guard.canActivate(mockContext(mockRequest('APPLICANT'))),
    ).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user is undefined', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['MANAGER']);
    expect(() => guard.canActivate(mockContext(mockRequest()))).toThrow(
      ForbiddenException,
    );
  });
});
