import {
  IsTodayOrAfterConstraint,
  IsTodayOrAfter,
} from '../validators/is-today-or-after.validator';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

class TestDto {
  @IsTodayOrAfter()
  date!: string;
}

describe('IsTodayOrAfterValidator', () => {
  let constraint: IsTodayOrAfterConstraint;

  beforeEach(() => {
    constraint = new IsTodayOrAfterConstraint();
  });

  describe('validate', () => {
    it('should return true for today', () => {
      const today = new Date();
      expect(constraint.validate(today)).toBe(true);
    });

    it('should return true for future date', () => {
      const future = new Date();
      future.setDate(future.getDate() + 1);
      expect(constraint.validate(future)).toBe(true);
    });

    it('should return true for ISO string of future date', () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      expect(constraint.validate(future.toISOString())).toBe(true);
    });

    it('should return false for past date', () => {
      const past = new Date('2020-01-01');
      expect(constraint.validate(past)).toBe(false);
    });

    it('should return false for falsy value', () => {
      expect(constraint.validate(null)).toBe(false);
      expect(constraint.validate(undefined)).toBe(false);
      expect(constraint.validate('')).toBe(false);
    });

    it('should return false for invalid date string', () => {
      expect(constraint.validate('not-a-date')).toBe(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return the correct error message', () => {
      expect(constraint.defaultMessage()).toBe(
        'VAL-APP-002: Desired payment date must be today or a future date',
      );
    });
  });

  describe('class-validator integration', () => {
    it('should pass validation for future date', async () => {
      const future = new Date();
      future.setDate(future.getDate() + 1);
      const dto = plainToInstance(TestDto, { date: future.toISOString() });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation for past date', async () => {
      const dto = plainToInstance(TestDto, { date: '2020-01-01' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
