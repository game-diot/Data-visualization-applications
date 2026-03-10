// src/features/cleaning/schemas/cleaning.rules.schema.ts
import { z } from 'zod'

// ==========================================
// 1. 缺失值处理规则 (Missing Rule)
// ==========================================
export const missingRuleSchema = z
  .object({
    enabled: z.boolean(), // 删除了 .default()
    strategy: z.enum(['fill', 'drop']),
    fillMethod: z.enum(['mean', 'median', 'mode', 'constant']),
    constantValue: z.string().optional(),
    applyColumns: z.array(z.string()),
  })
  .superRefine((data, ctx) => {
    if (data.enabled && data.applyColumns.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '开启缺失值处理时，请至少选择一个目标列',
        path: ['applyColumns'],
      })
    }
    if (
      data.enabled &&
      data.strategy === 'fill' &&
      data.fillMethod === 'constant' &&
      !data.constantValue
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '请填写要填充的常数值',
        path: ['constantValue'],
      })
    }
  })

// ==========================================
// 2. 重复项处理规则 (Deduplicate Rule)
// ==========================================
export const deduplicateRuleSchema = z.object({
  enabled: z.boolean(),
  subset: z.array(z.string()),
  keep: z.enum(['first', 'last']),
})

// ==========================================
// 3. 类型转换规则 (Type Cast Rule)
// ==========================================
export const typeCastItemSchema = z.object({
  column: z.string().min(1, '必须选择要转换的列'),
  targetType: z.enum(['int', 'float', 'string', 'datetime'], {
    error: '必须选择目标类型',
  }),
  format: z.string().optional(),
})

export const typeCastRuleSchema = z
  .object({
    enabled: z.boolean(),
    rules: z.array(typeCastItemSchema),
  })
  .superRefine((data, ctx) => {
    if (data.enabled && data.rules.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '开启类型转换后，请至少添加一条转换规则',
        path: ['rules'],
      })
    }
  })

// ==========================================
// 4. 大一统：清洗规则总架构 (CleanRules)
// ==========================================
export const cleanRulesSchema = z.object({
  missing: missingRuleSchema,
  deduplicate: deduplicateRuleSchema,
  typeCast: typeCastRuleSchema,
})

export type CleanRulesFormValues = z.infer<typeof cleanRulesSchema>

// ==========================================
// 5. 默认值工厂 (依然保留，交给 RHF 处理默认值)
// ==========================================
export const getDefaultCleanRules = (): CleanRulesFormValues => ({
  missing: {
    enabled: false,
    strategy: 'fill',
    fillMethod: 'mean',
    applyColumns: [],
  },
  deduplicate: {
    enabled: false,
    subset: [],
    keep: 'first',
  },
  typeCast: {
    enabled: false,
    rules: [],
  },
})
