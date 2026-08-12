"use client";

import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/browser";

export interface UserProfileData {
  display_name: string | null;
  avatar_url: string | null;
  language_preference: string;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    async function fetchProfile(userId: string) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("display_name, avatar_url, language_preference")
          .eq("id", userId)
          .maybeSingle();

        let isRpcAdmin = false;
        try {
          const res = await supabase.rpc("is_admin", { check_user_id: userId });
          isRpcAdmin = Boolean(res.data);
        } catch {
          isRpcAdmin = false;
        }

        if (!error && data) {
          setProfile(data as UserProfileData);
        }
        setIsAdmin(isRpcAdmin);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    profile,
    isAuthenticated: !!user,
    isAdmin,
    isLoading,
  };
}
