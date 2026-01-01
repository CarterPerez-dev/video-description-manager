/**
 * AngelaMos | 2025
 * draft.store.ts
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS, type Platform } from '@/config'

interface Draft {
  id: string
  description: string
  youtube_description?: string
  scheduled_time?: string
  isDirty: boolean
}

interface DraftState {
  drafts: Record<string, Draft>
  activePlatform: Platform

  setActivePlatform: (platform: Platform) => void
  updateDraft: (id: string, updates: Partial<Draft>) => void
  clearDraft: (id: string) => void
  clearAllDrafts: () => void
  getDraft: (id: string) => Draft | undefined
  hasDirtyDrafts: () => boolean
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      drafts: {},
      activePlatform: 'tiktok',

      setActivePlatform: (platform) => set({ activePlatform: platform }),

      updateDraft: (id, updates) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [id]: {
              ...state.drafts[id],
              id,
              description: state.drafts[id]?.description || '',
              ...updates,
              isDirty: true,
            },
          },
        })),

      clearDraft: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.drafts
          return { drafts: rest }
        }),

      clearAllDrafts: () => set({ drafts: {} }),

      getDraft: (id) => get().drafts[id],

      hasDirtyDrafts: () => Object.values(get().drafts).some((d) => d.isDirty),
    }),
    {
      name: STORAGE_KEYS.DRAFT,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
