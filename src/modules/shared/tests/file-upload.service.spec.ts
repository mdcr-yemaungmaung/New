import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { FileUploadService } from '../services/file-upload.service';
import { FILE_VALIDATION_ERRORS } from '../validators/file-validators';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('FileUploadService', () => {
  let service: FileUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('./uploads/test'),
          },
        },
      ],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
  });

  describe('validateFile', () => {
    it('should pass for valid PDF file', () => {
      expect(() =>
        service.validateFile({
          mimetype: 'application/pdf',
          size: 1024,
        } as never),
      ).not.toThrow();
    });

    it('should throw for invalid MIME type', () => {
      expect(() =>
        service.validateFile({
          mimetype: 'text/plain',
          size: 1024,
        } as never),
      ).toThrow(BadRequestException);
    });

    it('should throw for oversized file', () => {
      expect(() =>
        service.validateFile({
          mimetype: 'application/pdf',
          size: 20 * 1024 * 1024,
        } as never),
      ).toThrow(BadRequestException);
    });

    it('should include validation error message', () => {
      try {
        service.validateFile({
          mimetype: 'image/gif',
          size: 1024,
        } as never);
      } catch (e: unknown) {
        expect((e as BadRequestException).message).toBe(
          FILE_VALIDATION_ERRORS.INVALID_TYPE,
        );
      }
    });
  });

  describe('saveFile', () => {
    it('should save file and return paths', async () => {
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await service.saveFile(
        {
          mimetype: 'application/pdf',
          size: 1024,
          buffer: Buffer.from('test'),
          originalname: 'receipt.pdf',
        } as never,
        10,
      );

      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
      expect(result.storedFileName).toContain('receipt.pdf');
      expect(result.fileStoragePath).toContain('10');
    });

    it('should throw for invalid file', async () => {
      await expect(
        service.saveFile(
          {
            mimetype: 'text/plain',
            size: 100,
            buffer: Buffer.from(''),
          } as never,
          10,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
