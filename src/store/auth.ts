import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserRole = 'buyer' | 'seller';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  role: UserRole;
  login: (user: User) => void;
  logout: () => void;
}

// For now, we'll set a default role without authentication
export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: true, // Always authenticated for now
      role: 'buyer', // Default role
      setUser: (user) => set({ user }),
      login: (user) => set({ user, role: user.role }),
      logout: () => set({ user: null, role: 'buyer' }), // Reset to buyer role
    }),
    {
      name: 'auth-storage',
    }
  )
);