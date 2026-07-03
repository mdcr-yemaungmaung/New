import { buildPaginationMeta } from '../utils/pagination.util';

describe('buildPaginationMeta', () => {
  it('should build pagination meta with correct totalPages', () => {
    const result = buildPaginationMeta(100, 1, 10);
    expect(result).toEqual({
      page: 1,
      pageSize: 10,
      totalItems: 100,
      totalPages: 10,
    });
  });

  it('should round up totalPages for non-even division', () => {
    const result = buildPaginationMeta(15, 1, 10);
    expect(result.totalPages).toBe(2);
  });

  it('should return 0 totalPages when totalItems is 0', () => {
    const result = buildPaginationMeta(0, 1, 10);
    expect(result.totalPages).toBe(0);
  });

  it('should handle page 1 with 1 item per page', () => {
    const result = buildPaginationMeta(1, 1, 1);
    expect(result).toEqual({
      page: 1,
      pageSize: 1,
      totalItems: 1,
      totalPages: 1,
    });
  });
});
