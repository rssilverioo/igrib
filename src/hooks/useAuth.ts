import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserRole = 'buyer' | 'seller';

interface User {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: UserRole) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Simulate login - in a real app, this would make an API call
        set({ 
          user: { 
            id: '1', 
            email, 
            role: 'buyer' // Default role
          }, 
          isAuthenticated: true 
        });
      },
      signup: async (email: string, password: string, role: UserRole) => {
        // Simulate signup
        set({ 
          user: { 
            id: '1', 
            email, 
            role 
          }, 
          isAuthenticated: true 
        });
      },
      confirmSignUp: async (email: string, code: string) => {
        // Simulate confirmation
        if (code === '123456') {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Invalid code'));
      },
      resendConfirmationCode: async (email: string) => {
        // Simulate resending code
        return Promise.resolve();
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      switchRole: (role: UserRole) => {
        set((state) => ({
          user: state.user ? { ...state.user, role } : null
        }));
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);