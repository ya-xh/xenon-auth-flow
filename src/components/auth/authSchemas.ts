
import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
});

export type AuthFormValues = z.infer<typeof authSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
