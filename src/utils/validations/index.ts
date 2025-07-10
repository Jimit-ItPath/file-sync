import { z } from 'zod';
import { VALIDATION_MESSAGES as message } from '../constants';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, message.required('email'))
    .email(message.invalid('email')),
  password: z.string().trim().min(1, message.required('password')),
});
