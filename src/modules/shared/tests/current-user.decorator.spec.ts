import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser } from '../decorators/current-user.decorator';
import { RoleCode } from '../types';

function getParamDecoratorFactory(
  decorator: (...args: any[]) => ParameterDecorator,
): (...args: any[]) => any {
  class TestClass {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    test(@decorator() _param: unknown) {}
  }
  const metadata = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    TestClass,
    'test',
  ) as Record<string, { factory: (...args: unknown[]) => unknown }>;
  const key = Object.keys(metadata)[0];
  return metadata[key].factory;
}

describe('CurrentUser', () => {
  const createMockContext = (user?: Record<string, unknown>) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  it('should return the full user when no data argument', () => {
    const user = {
      sub: 1,
      email: 'test@example.com',
      role: RoleCode.APPLICANT,
      roleId: 1,
      branch: 'Tokyo',
      department: 'Engineering',
      employeeNumber: 'EMP001',
      fullName: 'Test User',
    };
    const ctx = createMockContext(user);
    const factory = getParamDecoratorFactory(CurrentUser);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = factory(undefined, ctx);
    expect(result).toEqual(user);
  });

  it('should return undefined when no user on request', () => {
    const ctx = createMockContext(undefined);
    const factory = getParamDecoratorFactory(CurrentUser);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = factory(undefined, ctx);
    expect(result).toBeUndefined();
  });

  it('should return specific field when data argument provided', () => {
    const user = {
      sub: 1,
      email: 'test@example.com',
      role: RoleCode.MANAGER,
      fullName: 'Test User',
    };
    const ctx = createMockContext(user);
    const factory = getParamDecoratorFactory(CurrentUser);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = factory('email', ctx);
    expect(result).toBe('test@example.com');
  });

  it('should return undefined for specific field when user missing', () => {
    const ctx = createMockContext(undefined);
    const factory = getParamDecoratorFactory(CurrentUser);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = factory('email', ctx);
    expect(result).toBeUndefined();
  });

  it('should return undefined for non-existent field', () => {
    const user = { sub: 1, email: 'test@example.com' };
    const ctx = createMockContext(user);
    const factory = getParamDecoratorFactory(CurrentUser);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = factory('nonExistent', ctx);
    expect(result).toBeUndefined();
  });
});
