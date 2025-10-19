'use client';

import { create } from 'zustand';

interface PreferencesState {
  theme: 'light' | 'dark';
  language: 'fr' | 'en';
}

export const usePreferencesStore = create<PreferencesState>(() => ({
  theme: 'light',
  language: 'fr',
}));
