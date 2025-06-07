import { create } from "zustand";
import { authApi, Credentials, AuthResponse, User } from "@/lib/auth";

type AuthState = {
  user:   User | null;
  token:  string | null;
  isHydrated: boolean;

  /* acciones */
  setSession: (data: AuthResponse) => void;
  logout: () => void;
  hydrate: () => void;

  /* llamadas a API */
  login:  (c: Credentials) => Promise<void>;
  signup: (c: Credentials) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isHydrated: false,

  /* ---------- helpers internos ---------- */
  setSession: ({ user, token }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user",  JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },

  hydrate: () => {
    const token = localStorage.getItem("token");
    const raw   = localStorage.getItem("user");
    set({
      token,
      user: raw ? (JSON.parse(raw) as User) : null,
      isHydrated: true,
    });
  },

  /* ---------- llamadas remotas ---------- */
  login: async (cred) => {
    const res = await authApi.login(cred);
    set((s) => {                      // setSession sin duplicar código
      localStorage.setItem("token", res.token);
      localStorage.setItem("user",  JSON.stringify(res.user));
      return { user: res.user, token: res.token };
    });
  },

  signup: async (cred) => {
    const res = await authApi.signup(cred);
    set((s) => {
      localStorage.setItem("token", res.token);
      localStorage.setItem("user",  JSON.stringify(res.user));
      return { user: res.user, token: res.token };
    });
  },
}));
