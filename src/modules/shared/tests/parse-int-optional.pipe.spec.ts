import { BadRequestException } from '@nestjs/common';
import { ParseIntOptionalPipe } from '../pipes/parse-int-optional.pipe';

describe('ParseIntOptionalPipe', () => {
  let pipe: ParseIntOptionalPipe;

  beforeEach(() => {
    pipe = new ParseIntOptionalPipe();
  });

  it('should return undefined for undefined value', () => {
    expect(pipe.transform(undefined)).toBeUndefined();
  });

  it('should return undefined for null value', () => {
    expect(pipe.transform(null as unknown as string)).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    expect(pipe.transform('')).toBeUndefined();
  });

  it('should parse valid integer string', () => {
    expect(pipe.transform('42')).toBe(42);
  });

  it('should parse zero', () => {
    expect(pipe.transform('0')).toBe(0);
  });

  it('should parse negative numbers', () => {
    expect(pipe.transform('-5')).toBe(-5);
  });

  it('should throw BadRequestException for non-integer string', () => {
    expect(() => pipe.transform('abc')).toThrow(BadRequestException);
  });

  it('should parse decimal strings (parseInt behavior)', () => {
    expect(pipe.transform('3.14')).toBe(3);
  });
});
