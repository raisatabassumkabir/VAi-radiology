import { create } from 'zustand';

interface AuthStore {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

// Helper to safely get token from localStorage on the client side
const getTokenFromStorage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const useAuthStore = create<AuthStore>((set) => ({
  token: getTokenFromStorage(),
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
    set({ token });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ token: null });
  },
}));
