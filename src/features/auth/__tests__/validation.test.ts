import { describe, it, expect } from "vitest";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileSchema,
} from "@/lib/validation/auth";

describe("Auth Validation Schemas", () => {
  it("validates correct login credentials", () => {
    const valid = loginSchema.safeParse({
      email: "user@flex.bd",
      password: "password123",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects invalid email formats", () => {
    const invalid = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(invalid.success).toBe(false);
  });

  it("rejects short passwords", () => {
    const invalid = loginSchema.safeParse({
      email: "user@flex.bd",
      password: "123",
    });
    expect(invalid.success).toBe(false);
  });

  it("trims surrounding whitespace from email", () => {
    const valid = loginSchema.safeParse({
      email: "  user@flex.bd  ",
      password: "password123",
    });
    expect(valid.success).toBe(true);
    if (valid.success) expect(valid.data.email).toBe("user@flex.bd");
  });

  it("validates registration password matching", () => {
    const mismatch = signupSchema.safeParse({
      fullName: "Test User",
      email: "user@flex.bd",
      password: "password123",
      confirmPassword: "differentpassword",
    });
    expect(mismatch.success).toBe(false);
  });

  it("accepts matching password registration", () => {
    const valid = signupSchema.safeParse({
      fullName: "Test User",
      email: "user@flex.bd",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects empty full names", () => {
    const invalid = signupSchema.safeParse({
      fullName: "   ",
      email: "user@flex.bd",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates forgot-password email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "bad" }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: "user@flex.bd" }).success).toBe(true);
  });

  it("validates reset-password matching", () => {
    const mismatch = resetPasswordSchema.safeParse({
      password: "newpassword123",
      confirmPassword: "different123",
    });
    expect(mismatch.success).toBe(false);

    const valid = resetPasswordSchema.safeParse({
      password: "newpassword123",
      confirmPassword: "newpassword123",
    });
    expect(valid.success).toBe(true);
  });

  it("validates profile input", () => {
    const ok = profileSchema.safeParse({ displayName: "Ali", themePreference: "dark" });
    expect(ok.success).toBe(true);

    const badTheme = profileSchema.safeParse({ displayName: "Ali", themePreference: "neon" });
    expect(badTheme.success).toBe(false);

    const blankName = profileSchema.safeParse({ displayName: "   ", themePreference: "light" });
    expect(blankName.success).toBe(false);
  });
});