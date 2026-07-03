import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { AuthResponseDto } from '../dto/auth-response.dto';

describe('AuthResponseDto', () => {
  it('should create an instance with accessToken and refreshToken', () => {
    const dto = plainToInstance(AuthResponseDto, {
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh',
    });

    expect(dto.accessToken).toBe('mock-token');
    expect(dto.refreshToken).toBe('mock-refresh');
  });

  it('should create instance without properties when empty', () => {
    const dto = plainToInstance(AuthResponseDto, {});
    expect(dto).toBeDefined();
    expect(dto.accessToken).toBeUndefined();
    expect(dto.refreshToken).toBeUndefined();
  });
});
