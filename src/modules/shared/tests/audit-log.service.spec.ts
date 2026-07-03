import { EntityManager } from 'typeorm';
import { AuditLogService } from '../services/audit-log.service';
import { ApprovalActionType } from '../types';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let manager: jest.Mocked<EntityManager>;

  beforeEach(() => {
    manager = {
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;

    service = new AuditLogService();
  });

  describe('createLog', () => {
    it('should throw if paymentRequestId is missing', async () => {
      await expect(
        service.createLog(manager, {
          paymentRequestId: 0,
          actionTakenByUserId: 1,
          actionTypeId: ApprovalActionType.CREATED,
          previousStatusId: null,
          newStatusId: 1,
          comment: null,
          ipAddress: '127.0.0.1',
          userAgent: 'test',
        }),
      ).rejects.toThrow('paymentRequestId is required');
    });

    it('should throw if paymentRequestId is negative', async () => {
      await expect(
        service.createLog(manager, {
          paymentRequestId: -1,
          actionTakenByUserId: 1,
          actionTypeId: ApprovalActionType.CREATED,
          previousStatusId: null,
          newStatusId: 1,
          comment: null,
          ipAddress: '127.0.0.1',
          userAgent: 'test',
        }),
      ).rejects.toThrow('paymentRequestId is required');
    });

    it('should create and save audit log entry', async () => {
      const mockLog = { id: 1, paymentRequestId: 10 };
      manager.create.mockReturnValue(mockLog as never);
      manager.save.mockResolvedValue(mockLog);

      const result = await service.createLog(manager, {
        paymentRequestId: 10,
        actionTakenByUserId: 1,
        actionTypeId: ApprovalActionType.SUBMITTED,
        previousStatusId: null,
        newStatusId: 2,
        comment: 'Submitted',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(manager.create).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(manager.save).toHaveBeenCalled();
      expect(result).toBe(mockLog);
    });

    it('should map null previousStatusId/newStatusId/comment to undefined', async () => {
      const mockLog = { id: 2 };
      manager.create.mockReturnValue(mockLog as never);
      manager.save.mockResolvedValue(mockLog);

      await service.createLog(manager, {
        paymentRequestId: 10,
        actionTakenByUserId: 1,
        actionTypeId: ApprovalActionType.CREATED,
        previousStatusId: null,
        newStatusId: null,
        comment: null,
        ipAddress: '127.0.0.1',
        userAgent: 'test',
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(manager.create).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          previousStatusId: undefined,
          newStatusId: undefined,
          comment: undefined,
        }),
      );
    });
  });
});
