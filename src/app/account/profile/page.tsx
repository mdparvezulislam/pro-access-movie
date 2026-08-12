import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { getUserAccountDetails } from "@/features/user/lib/account-service";
import { AccountShell } from "@/components/account/AccountShell";
import { UserProfileForm } from "@/components/account/UserProfileForm";

export const metadata: Metadata = {
  title: "Profile Settings — PRO ACCESS MOVIE",
  description: "Update your profile information and viewing preferences.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const accountDetails = await getUserAccountDetails();

  return (
    <AccountShell userEmail={accountDetails?.email} displayName={accountDetails?.displayName}>
      <UserProfileForm profile={accountDetails} />
    </AccountShell>
  );
}
