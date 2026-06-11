import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateFeedbackDto } from './create-feedback.dto';

const valid = {
  project: 'colorpage',
  type: 'bug',
  message: 'Something broke',
  turnstileToken: 'token123',
  hp: '',
};

describe('CreateFeedbackDto', () => {
  it('accepts a valid payload', async () => {
    const dto = plainToInstance(CreateFeedbackDto, valid);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects missing project', async () => {
    const dto = plainToInstance(CreateFeedbackDto, { ...valid, project: undefined });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'project')).toBe(true);
  });

  it('rejects invalid type', async () => {
    const dto = plainToInstance(CreateFeedbackDto, { ...valid, type: 'complaint' });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'type')).toBe(true);
  });

  it('rejects message over 5000 chars', async () => {
    const dto = plainToInstance(CreateFeedbackDto, { ...valid, message: 'x'.repeat(5001) });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'message')).toBe(true);
  });

  it('rejects invalid email', async () => {
    const dto = plainToInstance(CreateFeedbackDto, { ...valid, email: 'not-an-email' });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'email')).toBe(true);
  });
});
