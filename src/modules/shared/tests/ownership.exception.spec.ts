import { OwnershipException } from '../exceptions/ownership.exception';

describe('OwnershipException', () => {
  it('should be an instance of OwnershipException', () => {
    const exception = new OwnershipException();
    expect(exception).toBeInstanceOf(OwnershipException);
  });

  it('should have the correct message', () => {
    const exception = new OwnershipException();
    expect(exception.message).toBe(
      'You do not have permission to perform this operation',
    );
  });

  it('should have status 403 (Forbidden)', () => {
    const exception = new OwnershipException();
    expect(exception.getStatus()).toBe(403);
  });
});
