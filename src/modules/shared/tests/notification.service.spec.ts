import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../entities/notification.entity';
import { WebsocketGateway } from '../websocket.gateway';

describe('NotificationService', () => {
  let service: NotificationService;
  let repo: jest.Mocked<Repository<Notification>>;
  let wsGateway: jest.Mocked<WebsocketGateway>;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<Repository<Notification>>;

    wsGateway = {
      sendPersonalNotification: jest.fn(),
    } as unknown as jest.Mocked<WebsocketGateway>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: getRepositoryToken(Notification), useValue: repo },
        { provide: WebsocketGateway, useValue: wsGateway },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  describe('create', () => {
    it('should create and save notification, then send via websocket', async () => {
      const mockNotification = {
        id: 1,
        userId: 5,
        title: 'Test',
        message: 'Hello',
        paymentRequestId: 10,
        link: '/test',
        createdDate: new Date('2025-01-01T00:00:00Z'),
      } as Notification;
      repo.create.mockReturnValue(mockNotification);
      repo.save.mockResolvedValue(mockNotification);

      const result = await service.create(5, {
        paymentRequestId: 10,
        title: 'Test',
        message: 'Hello',
        link: '/test',
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.create).toHaveBeenCalledWith({
        userId: 5,
        paymentRequestId: 10,
        title: 'Test',
        message: 'Hello',
        link: '/test',
        messageKey: null,
        messageParams: null,
        isRead: false,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.save).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(wsGateway.sendPersonalNotification).toHaveBeenCalled();
      expect(result).toBe(mockNotification);
    });

    it('should default paymentRequestId and link to null', async () => {
      const mockNotification = {
        id: 1,
        paymentRequestId: null,
        link: null,
        createdDate: new Date(),
      } as Notification;
      repo.create.mockReturnValue(mockNotification);
      repo.save.mockResolvedValue(mockNotification);

      await service.create(5, {
        title: 'Test',
        message: 'Hello',
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentRequestId: null,
          link: null,
        }),
      );
    });
  });

  describe('findByUserId', () => {
    it('should return notifications ordered by createdDate DESC', async () => {
      const mockNotifications = [{ id: 1 }] as Notification[];
      repo.find.mockResolvedValue(mockNotifications);

      const result = await service.findByUserId(5);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.find).toHaveBeenCalledWith({
        where: { userId: 5 },
        order: { createdDate: 'DESC' },
        take: 50,
      });
      expect(result).toBe(mockNotifications);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      repo.count.mockResolvedValue(3);

      const result = await service.getUnreadCount(5);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.count).toHaveBeenCalledWith({
        where: { userId: 5, isRead: false },
      });
      expect(result).toBe(3);
    });
  });

  describe('markAsRead', () => {
    it('should update notification as read', async () => {
      repo.update.mockResolvedValue({ affected: 1 } as never);

      await service.markAsRead(10, 5);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.update).toHaveBeenCalledWith(
        { id: 10, userId: 5 },
        { isRead: true },
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should update all unread notifications as read', async () => {
      repo.update.mockResolvedValue({ affected: 3 } as never);

      await service.markAllAsRead(5);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.update).toHaveBeenCalledWith(
        { userId: 5, isRead: false },
        { isRead: true },
      );
    });
  });
});
