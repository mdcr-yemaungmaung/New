import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BreakdownItemDto } from '../dto/breakdown-item.dto';

describe('BreakdownItemDto', () => {
  describe('draft group (relaxed)', () => {
    it('should pass with empty object', async () => {
      const dto = plainToInstance(BreakdownItemDto, {});
      const errors = await validate(dto, { groups: ['draft'] });
      expect(errors.length).toBe(0);
    });

    it('should pass with valid data', async () => {
      const dto = plainToInstance(BreakdownItemDto, {
        itemDate: '2025-01-15',
        description: 'Office supplies',
        amount: '100.50',
        quantity: '2',
        unitPrice: '50.25',
      });
      const errors = await validate(dto, { groups: ['draft'] });
      expect(errors.length).toBe(0);
    });
  });

  describe('submit group (strict)', () => {
    it('should fail without required fields', async () => {
      const dto = plainToInstance(BreakdownItemDto, {});
      const errors = await validate(dto, { groups: ['submit'] });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass with all required fields', async () => {
      const dto = plainToInstance(BreakdownItemDto, {
        itemDate: '2025-01-15',
        description: 'Office supplies',
        amount: '100.50',
      });
      const errors = await validate(dto, { groups: ['submit'] });
      expect(errors.length).toBe(0);
    });
  });

  describe('field validations', () => {
    it('should reject description exceeding 200 characters', async () => {
      const dto = plainToInstance(BreakdownItemDto, {
        description: 'x'.repeat(201),
      });
      const errors = await validate(dto);
      const descErrors = errors.filter((e) => e.property === 'description');
      expect(descErrors.length).toBeGreaterThan(0);
    });

    it('should accept description at exactly 200 characters', async () => {
      const dto = plainToInstance(BreakdownItemDto, {
        description: 'x'.repeat(200),
      });
      const errors = await validate(dto);
      const descErrors = errors.filter((e) => e.property === 'description');
      expect(descErrors.length).toBe(0);
    });

    it('should transform number to string for amount', () => {
      const dto = plainToInstance(BreakdownItemDto, { amount: 100 });
      expect(typeof dto.amount).toBe('string');
    });

    it('should transform number to string for quantity', () => {
      const dto = plainToInstance(BreakdownItemDto, { quantity: 5 });
      expect(typeof dto.quantity).toBe('string');
    });

    it('should transform number to string for unitPrice', () => {
      const dto = plainToInstance(BreakdownItemDto, { unitPrice: 25 });
      expect(typeof dto.unitPrice).toBe('string');
    });

    it('should trim description', () => {
      const dto = plainToInstance(BreakdownItemDto, {
        description: '  test  ',
      });
      expect(dto.description).toBe('test');
    });

    it('should transform zero amount to string', () => {
      const dto = plainToInstance(BreakdownItemDto, { amount: 0 });
      expect(dto.amount).toBe('0');
    });
  });
});
