import { z } from 'zod';

export const SignUpReqSchema = z.object({
  name: z.string(),
  email: z.string().email()
});

export type SignUpReq = z.infer<typeof SignUpReqSchema>;