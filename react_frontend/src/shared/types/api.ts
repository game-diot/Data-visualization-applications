// src/shared/types/api.ts

export interface ApiResponse<T = unknown> {
  status: 'success' | 'fail' | string
  code: number
  message: string
  data: T
  requestId?: string
}

export class AppError extends Error {
  public readonly code: number
  public readonly isBusinessError: boolean
  public readonly originalError?: unknown
  public readonly stage?: string
  public readonly requestId?: string

  constructor(args: {
    message: string
    code: number
    isBusinessError: boolean
    originalError?: unknown
    stage?: string
    requestId?: string
  }) {
    super(args.message)
    this.name = 'AppError'
    this.code = args.code
    this.isBusinessError = args.isBusinessError
    this.originalError = args.originalError
    this.stage = args.stage
    this.requestId = args.requestId
  }
}
