// src/shared/zod/zodSafeParse.ts
import { z } from 'zod'

export type ZodParseFailure = {
  label: string
  error: z.ZodError
  receivedData: unknown
}

export type ZodSafeParseResult<T> = { ok: true; data: T } | { ok: false; failure: ZodParseFailure }

export function zodSafeParse<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  label: string,
): ZodSafeParseResult<z.infer<T>> {
  const result = schema.safeParse(data)
  if (!result.success) {
    return {
      ok: false,
      failure: {
        label,
        error: result.error,
        receivedData: data,
      },
    }
  }

  return { ok: true, data: result.data }
}
