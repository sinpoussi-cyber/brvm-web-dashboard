'use client';

import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { token, setToken, logout } = useAuthStore();

  return {
    token,
    isAuthenticated: !!token,
    setToken,
    logout,
  };
};
