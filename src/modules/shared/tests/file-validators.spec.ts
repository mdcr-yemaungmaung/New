import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MAX_TOTAL_FILE_SIZE,
  FILE_VALIDATION_ERRORS,
  isValidMimeType,
  isValidFileSize,
} from '../validators/file-validators';

describe('File Validators', () => {
  describe('Constants', () => {
    it('should define allowed MIME types', () => {
      expect(ALLOWED_MIME_TYPES).toContain('application/pdf');
      expect(ALLOWED_MIME_TYPES).toContain('image/png');
      expect(ALLOWED_MIME_TYPES).toContain('image/jpeg');
      expect(ALLOWED_MIME_TYPES).toContain('image/jpg');
    });

    it('should define MAX_FILE_SIZE as 10MB', () => {
      expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
    });

    it('should define MAX_TOTAL_FILE_SIZE as 50MB', () => {
      expect(MAX_TOTAL_FILE_SIZE).toBe(50 * 1024 * 1024);
    });

    it('should define FILE_VALIDATION_ERRORS', () => {
      expect(FILE_VALIDATION_ERRORS.INVALID_TYPE).toBe(
        'VAL-APP-008: Invalid file format',
      );
      expect(FILE_VALIDATION_ERRORS.SIZE_EXCEEDED).toBe(
        'VAL-APP-009: File size exceeds the maximum limit (10MB)',
      );
      expect(FILE_VALIDATION_ERRORS.REQUIRED).toBe(
        'VAL-APP-010: Please attach the receipt file',
      );
    });
  });

  describe('isValidMimeType', () => {
    it('should return true for valid MIME types', () => {
      expect(isValidMimeType('application/pdf')).toBe(true);
      expect(isValidMimeType('image/png')).toBe(true);
      expect(isValidMimeType('image/jpeg')).toBe(true);
      expect(isValidMimeType('image/jpg')).toBe(true);
    });

    it('should return false for invalid MIME types', () => {
      expect(isValidMimeType('text/plain')).toBe(false);
      expect(isValidMimeType('image/gif')).toBe(false);
      expect(isValidMimeType('application/json')).toBe(false);
      expect(isValidMimeType('')).toBe(false);
    });
  });

  describe('isValidFileSize', () => {
    it('should return true for valid file sizes', () => {
      expect(isValidFileSize(1)).toBe(true);
      expect(isValidFileSize(5 * 1024 * 1024)).toBe(true);
      expect(isValidFileSize(MAX_FILE_SIZE)).toBe(true);
    });

    it('should return false for invalid file sizes', () => {
      expect(isValidFileSize(0)).toBe(false);
      expect(isValidFileSize(-1)).toBe(false);
      expect(isValidFileSize(MAX_FILE_SIZE + 1)).toBe(false);
    });
  });
});
