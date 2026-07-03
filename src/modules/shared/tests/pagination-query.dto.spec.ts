import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PaginationQueryDto } from '../dto/pagination-query.dto';

describe('PaginationQueryDto', () => {
  it('should validate with default values', async () => {
    const dto = plainToInstance(PaginationQueryDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.page).toBe(1);
    expect(dto.pageSize).toBe(10);
    expect(dto.sortOrder).toBe('DESC');
  });

  it('should accept valid page and pageSize', async () => {
    const dto = plainToInstance(PaginationQueryDto, {
      page: 2,
      pageSize: 20,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject page < 1', async () => {
    const dto = plainToInstance(PaginationQueryDto, { page: 0 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject pageSize > 50', async () => {
    const dto = plainToInstance(PaginationQueryDto, { pageSize: 51 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should accept pageSize = 50', async () => {
    const dto = plainToInstance(PaginationQueryDto, { pageSize: 50 });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept valid sortOrder values', async () => {
    for (const order of ['ASC', 'DESC']) {
      const dto = plainToInstance(PaginationQueryDto, { sortOrder: order });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    }
  });

  it('should reject invalid sortOrder', async () => {
    const dto = plainToInstance(PaginationQueryDto, { sortOrder: 'UP' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should trim sortBy string', () => {
    const dto = plainToInstance(PaginationQueryDto, { sortBy: '  name  ' });
    expect(dto.sortBy).toBe('name');
  });
});
