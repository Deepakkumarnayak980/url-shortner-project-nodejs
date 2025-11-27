import { z } from "zod";

export const signupPostRequestBodySchema = z.object({
  firstname: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .trim(),

  lastname: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .trim()
    .optional(),

  email: z
    .string()
    .email("Invalid email format")
    .trim(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});
