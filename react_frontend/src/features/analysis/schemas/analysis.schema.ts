import { z } from 'zod'

// 1. 公共的切片配置 (MVP阶段：默认处理全量数据，留出扩展口)
const dataSelectionSchema = z
  .object({
    rows: z
      .object({
        start: z.number().min(0),
        end: z.number().min(1),
      })
      .nullable(),
    columns: z.array(z.string()).nullable(),
  })
  .optional()

// 2. 描述性统计参数校验
const descriptiveSchema = z.object({
  type: z.literal('descriptive'),
  columns: z.array(z.string()).min(1, '请至少选择 1 个字段进行统计'),
  options: z.object({
    bins: z.number().min(2, '分箱数至少为 2').max(100, '分箱数最多为 100'),
  }),
})

// 3. 相关性分析参数校验
const correlationSchema = z.object({
  type: z.literal('correlation'),
  // 🌟 安检核心：相关性分析雷区，必须 >= 2 列
  columns: z.array(z.string()).min(2, '相关性分析必须至少选择 2 个数值字段'),
  options: z.object({
    method: z.enum(['pearson', 'spearman']),
  }),
})

// 4. 分组对比参数校验 (预留)
const groupCompareSchema = z.object({
  type: z.literal('group_compare'),
  columns: z.array(z.string()).min(1, '需选择参与计算的列'),
  groupBy: z.string().min(1, '必须选择 1 个类别型字段作为分组依据'),
  target: z.string().min(1, '必须选择 1 个数值型字段作为对比目标'),
  options: z.object({
    agg: z.enum(['mean', 'median']),
  }),
})

// 🌟 终极组装：根据选中的 type，自动应用不同的校验规则！
export const analysisConfigFormSchema = z.object({
  dataSelection: dataSelectionSchema,
  analysisConfig: z.discriminatedUnion('type', [
    descriptiveSchema,
    correlationSchema,
    groupCompareSchema,
  ]),
})

// 导出类型，供 RHF 使用
export type AnalysisConfigFormValues = z.infer<typeof analysisConfigFormSchema>
