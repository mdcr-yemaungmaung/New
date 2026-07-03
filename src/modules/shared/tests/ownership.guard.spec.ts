import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { OwnershipGuard } from '../guards/ownership.guard';
import { PaymentRequest } from '../entities/payment-request.entity';

describe('OwnershipGuard', () => {
  let guard: OwnershipGuard;
  let repo: jest.Mocked<Repository<PaymentRequest>>;

  const mockRequest = (
    params: Record<string, string> = {},
    user?: { sub: number },
  ) => ({
    user,
    params,
    paymentRequest: undefined,
  });

  const mockContext = (request: unknown): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<PaymentRequest>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnershipGuard,
        { provide: getRepositoryToken(PaymentRequest), useValue: repo },
      ],
    }).compile();

    guard = module.get<OwnershipGuard>(OwnershipGuard);
  });

  it('should return true when requestId is not a number', async () => {
    const req = mockRequest({ id: 'abc' }, { sub: 1 });
    expect(await guard.canActivate(mockContext(req))).toBe(true);
  });

  it('should throw NotFoundException when payment request not found', async () => {
    repo.findOne.mockResolvedValue(null);
    const req = mockRequest({ id: '999' }, { sub: 1 });
    await expect(guard.canActivate(mockContext(req))).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException when user is not the owner', async () => {
    repo.findOne.mockResolvedValue({
      id: 1,
      applicantUserId: 2,
    } as PaymentRequest);
    const req = mockRequest({ id: '1' }, { sub: 1 });
    await expect(guard.canActivate(mockContext(req))).rejects.toThrow(
      'You do not have permission',
    );
  });

  it('should return true and set paymentRequest when user is the owner', async () => {
    const pr = { id: 1, applicantUserId: 1 } as PaymentRequest;
    repo.findOne.mockResolvedValue(pr);
    const req = mockRequest({ id: '1' }, { sub: 1 });
    expect(await guard.canActivate(mockContext(req))).toBe(true);
    expect(req.paymentRequest).toBe(pr);
  });
});
