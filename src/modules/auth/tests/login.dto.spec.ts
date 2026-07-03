import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from '../dto/login.dto';

describe('LoginDto', () => {
  it('should pass with valid email and password', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'test@example.com',
      password: 'password123',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid email', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'invalid-email',
      password: 'password123',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail with empty email', async () => {
    const dto = plainToInstance(LoginDto, {
      email: '',
      password: 'password123',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with short password', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'test@example.com',
      password: '12345',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });

  it('should fail with empty password', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'test@example.com',
      password: '',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
