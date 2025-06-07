"use client";
import { useAuthStore } from "@/stores/auth";
import { useEffect, useState } from "react";

export function useAuth() {
  const { token, user, isHydrated, hydrate, logout, login, signup } =
    useAuthStore();
  const [hydrated, setHydrated] = useState(isHydrated);

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
      setHydrated(true);
    }
  }, [isHydrated]);

  return {
    token,
    user,
    isHydrated: hydrated,
    isAuthenticated: () => !!token,
    login,
    signup,
    logout,
  };
}

