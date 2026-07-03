import { WebsocketGateway } from '../websocket.gateway';

describe('WebsocketGateway', () => {
  let gateway: WebsocketGateway;

  const mockSocket = (id = 'socket-1') => ({
    id,
    join: jest.fn(),
  });

  const mockServer = () => ({
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  });

  beforeEach(() => {
    gateway = new WebsocketGateway();
    gateway.server = mockServer() as never;
  });

  describe('handleConnection', () => {
    it('should log client connection', () => {
      const logSpy = jest.spyOn(gateway['logger'], 'log');
      gateway.handleConnection(mockSocket('client-1') as never);
      expect(logSpy).toHaveBeenCalledWith('Client connected: client-1');
    });
  });

  describe('handleDisconnect', () => {
    it('should log client disconnection', () => {
      const logSpy = jest.spyOn(gateway['logger'], 'log');
      gateway.handleDisconnect(mockSocket('client-1') as never);
      expect(logSpy).toHaveBeenCalledWith('Client disconnected: client-1');
    });
  });

  describe('handleJoinRoom', () => {
    it('should join role and user rooms', () => {
      const client = mockSocket();
      const logSpy = jest.spyOn(gateway['logger'], 'log');

      const result = gateway.handleJoinRoom(client as never, {
        role: 'MANAGER',
        userId: 5,
      });

      expect(client.join).toHaveBeenCalledWith('MANAGER');
      expect(client.join).toHaveBeenCalledWith('user:5');
      expect(logSpy).toHaveBeenCalledWith(
        'User 5 with role MANAGER joined rooms.',
      );
      expect(result).toEqual({ status: 'joined' });
    });
  });

  describe('sendStatusUpdate', () => {
    it('should emit status update to role room', () => {
      gateway.sendStatusUpdate('MANAGER', { status: 'approved' });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(gateway.server.to).toHaveBeenCalledWith('MANAGER');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(gateway.server.emit).toHaveBeenCalledWith(
        'request:status-changed',
        { status: 'approved' },
      );
    });
  });

  describe('sendPersonalNotification', () => {
    it('should emit notification to user room', () => {
      gateway.sendPersonalNotification(5, 'notification', { title: 'test' });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(gateway.server.to).toHaveBeenCalledWith('user:5');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(gateway.server.emit).toHaveBeenCalledWith('notification', {
        title: 'test',
      });
    });
  });
});
