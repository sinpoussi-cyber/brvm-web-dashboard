'use client';

import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};
