// src/features/quality/store/quality.store.ts
import { create } from 'zustand'

interface QualityUIState {
  // null 表示当前查看的是 "最新版本 (Latest)"
  selectedVersion: number | null
  setSelectedVersion: (version: number | null) => void
}

export const useQualityStore = create<QualityUIState>((set) => ({
  selectedVersion: null,
  setSelectedVersion: (version) => set({ selectedVersion: version }),
}))
