import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from '../filters/http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  const mockResponse = () => {
    const res: { status: jest.Mock; json: jest.Mock } = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    return res;
  };

  const mockRequest = (url = '/test', method = 'GET') =>
    ({
      url,
      method,
      ip: '127.0.0.1',
      headers: {},
    }) as never;

  const mockHost = (req: unknown, res: unknown) =>
    ({
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
    }) as never;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('should handle HttpException with object response', () => {
    const res = mockResponse();
    const req = mockRequest();
    const exception = new HttpException(
      { message: 'Bad Request', details: [{ field: 'name' }] },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost(req, res));

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Bad Request',
        details: [{ field: 'name' }],
      }),
    );
  });

  it('should handle HttpException with string response', () => {
    const res = mockResponse();
    const req = mockRequest();
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost(req, res));

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Not Found',
      }),
    );
  });

  it('should handle non-Http exceptions as 500', () => {
    const res = mockResponse();
    const req = mockRequest();
    const exception = new Error('Unexpected error');

    filter.catch(exception, mockHost(req, res));

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'A system error occurred. Please contact the administrator.',
      }),
    );
  });

  it('should include timestamp and path in response', () => {
    const res = mockResponse();
    const req = mockRequest('/api/test', 'POST');
    const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost(req, res));

    const jsonCalls = res.json.mock.calls as Array<[Record<string, unknown>]>;
    const jsonCall = jsonCalls[0][0];
    expect(jsonCall.path).toBe('/api/test');
    expect(typeof jsonCall.timestamp).toBe('string');
  });
});
