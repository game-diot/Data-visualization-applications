import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface DatasetVersions {
  qualityVersion?: number
  cleaningVersion?: number
  analysisVersion?: number
}

interface DatasetContextState {
  // 当前正在操作的数据集 ID
  currentFileId: string | null
  // 当前数据集对应的版本选择草稿
  versions: DatasetVersions

  // 操作方法
  syncFileId: (fileId: string) => void
  setVersion: (module: keyof DatasetVersions, version: number) => void
  clearContext: () => void
}

export const useDatasetContextStore = create<DatasetContextState>()(
  persist(
    (set, get) => ({
      currentFileId: null,
      versions: {},

      // 核心防污染机制：当进入详情页或工作台时调用此方法
      // 如果发现传入的 fileId 和内存中的不一样，立刻清空之前的版本草稿
      syncFileId: (fileId: string) => {
        const current = get().currentFileId
        if (current !== fileId) {
          set({ currentFileId: fileId, versions: {} })
        }
      },

      // 局部更新某个模块的版本选择
      setVersion: (module, version) => {
        set((state) => ({
          versions: {
            ...state.versions,
            [module]: version,
          },
        }))
      },

      // 手动彻底清理（如用户删除了该数据集）
      clearContext: () => {
        set({ currentFileId: null, versions: {} })
      },
    }),
    {
      name: 'dataset-working-context', // 缓存的 Key
      // 使用 sessionStorage：刷新页面状态还在，但关掉浏览器页签就清空，符合“临时工作台”的定位
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
