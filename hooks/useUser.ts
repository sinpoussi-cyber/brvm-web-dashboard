'use client';

import { useEffect, useState } from 'react';

export function useUser() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('user');
    if (data) setUser(JSON.parse(data));
  }, []);

  function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('paid');
    document.cookie = 'brvm_token=; Max-Age=0; path=/;';
    window.location.href = '/auth/login';
  }

  return { user, setUser, logout };
}
