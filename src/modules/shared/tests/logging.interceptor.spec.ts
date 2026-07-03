import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  const mockRequest = (
    overrides: Record<string, unknown> = {},
  ): Record<string, unknown> => ({
    method: 'GET',
    url: '/api/test',
    ip: '127.0.0.1',
    user: { sub: 1 },
    headers: { 'x-request-id': 'req-123' },
    ...overrides,
  });

  const mockContext = (req: unknown): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  const mockCallHandler = (result?: unknown): CallHandler => ({
    handle: () => of(result ?? { data: 'ok' }),
  });

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  it('should log request details on completion', (done) => {
    const req = mockRequest();
    const context = mockContext(req);
    const next = mockCallHandler();
    const logSpy = jest.spyOn(interceptor['logger'], 'log');

    interceptor.intercept(context, next).subscribe(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('GET /api/test'),
      );
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('userId=1'));
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('requestId=req-123'),
      );
      done();
    });
  });

  it('should handle missing user and x-request-id', (done) => {
    const req = mockRequest({ user: undefined, headers: {} });
    const context = mockContext(req);
    const next = mockCallHandler();
    const logSpy = jest.spyOn(interceptor['logger'], 'log');

    interceptor.intercept(context, next).subscribe(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('requestId=N/A'),
      );
      done();
    });
  });
});
