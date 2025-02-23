import { create } from "zustand";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
