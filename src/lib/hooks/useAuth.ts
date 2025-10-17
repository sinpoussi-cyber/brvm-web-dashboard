// ==============================================================================
// HOOK: useAuth - Gestion de l'authentification
// ==============================================================================

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'next/navigation';

export const useAuth = (requireAuth = false) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, login, logout, fetchProfile } = useAuthStore();

  useEffect(() => {
    if (requireAuth && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [requireAuth, isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchProfile();
    }
  }, [isAuthenticated, user, fetchProfile]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};
