import { z } from "zod";

// Profile validation schemas
export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  age: z.number().int().min(18, "Must be 18 or older").max(99, "Must be 99 or younger"),
  gender: z.enum(["man", "woman", "non-binary"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  interestedIn: z.enum(["men", "women", "everyone"], {
    errorMap: () => ({ message: "Please select who you're interested in" }),
  }),
  city: z.string().trim().min(1, "City is required").max(100, "City must be 100 characters or less"),
  bio: z.string().trim().max(500, "Bio must be 500 characters or less").optional(),
  lookingFor: z.string().trim().max(200, "Must be 200 characters or less").optional(),
});

export const preferencesSchema = z.object({
  ageRange: z.tuple([z.number().min(18).max(99), z.number().min(18).max(99)]),
  radius: z.number().min(1).max(500),
});

export const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type PreferencesFormData = z.infer<typeof preferencesSchema>;
export type AuthFormData = z.infer<typeof authSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
