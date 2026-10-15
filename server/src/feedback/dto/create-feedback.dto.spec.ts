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

  it('accepts praise with testimonial consent and a name', async () => {
    const dto = plainToInstance(CreateFeedbackDto, { ...valid, type: 'praise', testimonialOk: true, testimonialName: 'Maria' });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a non-boolean consent and a name over 80 chars', async () => {
    const dto = plainToInstance(CreateFeedbackDto, { ...valid, type: 'praise', testimonialOk: 'yes', testimonialName: 'x'.repeat(81) });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'testimonialOk')).toBe(true);
    expect(errors.some(e => e.property === 'testimonialName')).toBe(true);
  });

  it('accepts a whole-number rating from 1 to 5', async () => {
    for (const rating of [1, 5]) {
      expect(await validate(plainToInstance(CreateFeedbackDto, { ...valid, type: 'praise', rating }))).toHaveLength(0);
    }
  });

  it('rejects ratings outside 1–5 or with decimals', async () => {
    for (const rating of [0, 6, 3.5, '4']) {
      const errors = await validate(plainToInstance(CreateFeedbackDto, { ...valid, type: 'praise', rating }));
      expect(errors.some(e => e.property === 'rating')).toBe(true);
    }
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
