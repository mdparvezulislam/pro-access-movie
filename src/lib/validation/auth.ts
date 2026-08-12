import { z } from "zod";

export const emailSchema = z.string().trim().email("Please enter a valid email address");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(60, "Full name must be 60 characters or fewer"),
  confirmPassword: z.string().min(6, "Password confirmation required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long").max(72, "Password must be 72 characters or fewer"),
  confirmPassword: z.string().min(6, "Password confirmation required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Display name is required").max(60, "Display name must be 60 characters or fewer"),
  themePreference: z.enum(["dark", "light"], {
    error: "Theme preference must be dark or light",
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
