import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UIState = {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'datavis-ui-storage',
      version: 1,
      // 只持久化真正需要的字段，避免把方法/临时字段写进去
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
      // 未来字段变更时清洗旧数据（你之前处理 persist 问题的那套思路）
      migrate: (persisted, version) => {
        if (!persisted || typeof persisted !== 'object') {
          return { sidebarCollapsed: false } as any
        }
        if (version < 1) {
          return { sidebarCollapsed: false } as any
        }
        return persisted as any
      },
    },
  ),
)
