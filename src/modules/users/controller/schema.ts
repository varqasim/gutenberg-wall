import { z } from 'zod';

export const CreateUserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
});

export type CreateUserProfileReq = z.infer<typeof CreateUserProfileSchema>;