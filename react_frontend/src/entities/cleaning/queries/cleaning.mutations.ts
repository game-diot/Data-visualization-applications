// src/entities/cleaning/queries/cleaning.mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cleaningApi } from '../api/cleaning.api'
import { CLEANING_QUERY_KEYS } from './cleaning.queries'
import { notifySuccess, notifyError } from '@/shared/utils/notify'
import type { CreateSessionReqDTO } from '../dto/cleaning.dto'
import type { SubmitModificationsReqDTO } from '../dto/cleaning.dto'
import type { RunCleaningReqDTO } from '../dto/cleaning.dto'

export const useCleaningCreateSessionMutation = (fileId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSessionReqDTO) => cleaningApi.createSession(fileId, data),
    onSuccess: (_, variables) => {
      notifySuccess(`成功创建基于质量评估 v${variables.qualityVersion} 的清洗会话`)

      // 🚀 核心战术：创建成功后，立刻让相关缓存失效，强制 UI 重新拉取
      // 1. 刷新 activeSession 缓存
      queryClient.invalidateQueries({
        queryKey: CLEANING_QUERY_KEYS.activeSession(fileId, variables.qualityVersion),
      })
      // 2. 刷新环节一写好的 status 全局状态（让外层骨架感知到 session 已存在）
      queryClient.invalidateQueries({
        queryKey: CLEANING_QUERY_KEYS.status(fileId, variables.qualityVersion),
      })
    },
    onError: (error: Error) => {
      notifyError('创建清洗会话失败', error.message)
    },
  })
}

export const useCleaningSubmitModificationsMutation = (fileId: string, sessionId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<SubmitModificationsReqDTO, 'sessionId'>) => {
      // 自动补齐 sessionId
      return cleaningApi.submitModifications(fileId, { ...data, sessionId })
    },
    onSuccess: () => {
      notifySuccess('手工修改已成功记录到当前会话中')

      // 🚀 核心战术：提交修改后，立刻让修改历史列表失效，UI 自动刷新
      queryClient.invalidateQueries({
        queryKey: CLEANING_QUERY_KEYS.modification(fileId, sessionId),
      })
    },
    onError: (error: Error) => {
      notifyError('提交手工修改失败', error.message)
    },
  })
}

export const useCleaningRunMutation = (fileId: string, qualityVersion: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RunCleaningReqDTO) => cleaningApi.runCleaning(fileId, data),
    onSuccess: (_, variables) => {
      notifySuccess('数据清洗任务已提交，正在执行中...')

      // 🚀 核心战术升级：加入“黄金延时 (Golden Delay)”
      // 给后端 500~800 毫秒的时间去完成数据库事务(把状态改成 processing)
      // 然后再让 React Query 去拉取，这样 100% 能唤醒轮询！
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: CLEANING_QUERY_KEYS.status(fileId, qualityVersion),
        })

        queryClient.invalidateQueries({
          queryKey: CLEANING_QUERY_KEYS.modification(fileId, variables.sessionId),
        })
      }, 800) // 800ms 是一个几乎无感知，但对数据库极其安全的延时
    },
    onError: (error: Error) => {
      notifyError('提交清洗任务失败', error.message)
    },
  })
}
