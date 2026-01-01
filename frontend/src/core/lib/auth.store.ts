/**
 * AngelaMos | 2025
 * auth.store.ts
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '@/config'
import type { UserResponse } from '@/api/types'

interface AuthState {
  user: UserResponse | null
  accessToken: string | null
  isAuthenticated: boolean

  login: (user: UserResponse, token: string) => void
  setAccessToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: (user, token) =>
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
        }),

      setAccessToken: (token) =>
        set({
          accessToken: token,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: STORAGE_KEYS.AUTH,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
