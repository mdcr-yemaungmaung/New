import { BusinessRuleException } from '../exceptions/business-rule.exception';

describe('BusinessRuleException', () => {
  it('should be an instance of BusinessRuleException', () => {
    const exception = new BusinessRuleException('Test error');
    expect(exception).toBeInstanceOf(BusinessRuleException);
  });

  it('should have status 422 (Unprocessable Entity)', () => {
    const exception = new BusinessRuleException('Test error');
    expect(exception.getStatus()).toBe(422);
  });

  it('should include message in response', () => {
    const exception = new BusinessRuleException('Validation failed');
    const response = exception.getResponse() as Record<string, unknown>;
    expect(response.message).toBe('Validation failed');
  });

  it('should include empty details when not provided', () => {
    const exception = new BusinessRuleException('Test error');
    const response = exception.getResponse() as Record<string, unknown>;
    expect(response.details).toEqual([]);
  });

  it('should include details when provided', () => {
    const details = [
      { field: 'amount', code: 'ERR-001', message: 'Amount is required' },
    ];
    const exception = new BusinessRuleException('Validation failed', details);
    const response = exception.getResponse() as Record<string, unknown>;
    expect(response.details).toEqual(details);
  });

  it('should include statusCode and error in response', () => {
    const exception = new BusinessRuleException('Test error');
    const response = exception.getResponse() as Record<string, unknown>;
    expect(response.statusCode).toBe(422);
    expect(response.error).toBe('Unprocessable Entity');
  });
});
