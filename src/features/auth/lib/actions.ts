"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type SignupInput,
  type ResetPasswordInput,
} from "@/lib/validation/auth";

export interface ActionResponse {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Server Action: Sign In with Email and Password
 */
export async function signInAction(
  formData: LoginInput,
  nextUrl?: string
): Promise<ActionResponse> {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid login credentials",
    };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  const destination = nextUrl && nextUrl.startsWith("/") ? nextUrl : "/";
  redirect(destination);
}

/**
 * Server Action: Sign Up with Email, Password and Display Name
 */
export async function signUpAction(
  formData: SignupInput
): Promise<ActionResponse> {
  const parsed = signupSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid registration data",
    };
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.fullName,
        language_preference: "en",
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (data.session) {
    redirect("/");
  }

  return {
    success: true,
    message: "Registration successful! Please check your email for confirmation link if required.",
  };
}

/**
 * Server Action: Sign Out
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Server Action: Password Reset Request
 */
export async function resetPasswordAction(
  email: string
): Promise<ActionResponse> {
  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Please enter a valid email address",
    };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password`,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Password reset instructions have been sent to your email.",
  };
}

/**
 * Server Action: Update password after a valid recovery session is established.
 * Callers must first exchange the email recovery link tokens for a session
 * (handled by the client-side reset-password page).
 */
export async function updatePasswordAction(
  formData: ResetPasswordInput
): Promise<ActionResponse> {
  const parsed = resetPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Please enter a valid new password",
    };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  await supabase.auth.signOut();

  return {
    success: true,
    message: "Your password has been updated. Please sign in with your new password.",
  };
}
