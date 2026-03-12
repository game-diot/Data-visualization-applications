import React, { useEffect } from 'react'
import { Form, Select, InputNumber, Button, Card, Divider } from 'antd'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  analysisConfigFormSchema,
  type AnalysisConfigFormValues,
} from '../schemas/analysis.form.schema'
import type { ColumnProfileVM } from '@/entities/analysis/types/analysis.types'
import { RocketOutlined } from '@ant-design/icons'

interface Props {
  selectedMethod: string // 当前选中的分析方法，如 'descriptive'
  availableColumns: ColumnProfileVM[] // 环节二传过来的全量列信息
  onSubmitTask: (values: AnalysisConfigFormValues) => void
  isSubmitting?: boolean
}

export const AnalysisConfigForm: React.FC<Props> = ({
  selectedMethod,
  availableColumns,
  onSubmitTask,
  isSubmitting = false,
}) => {
  const { control, handleSubmit, reset, watch, setValue } = useForm<AnalysisConfigFormValues>({
    resolver: zodResolver(analysisConfigFormSchema),
    defaultValues: {
      analysisType: selectedMethod as any,
      dataSelection: { columns: null },
      options: {},
      columns: [],
    },
  })

  // 监听外部 method 变化，重置表单并注入默认值
  useEffect(() => {
    reset({
      analysisType: selectedMethod as any,
      dataSelection: { columns: null },
      columns: [],
      ...(selectedMethod === 'descriptive' ? { options: { bins: 10 } } : {}),
      ...(selectedMethod === 'correlation' ? { options: { method: 'pearson' } } : {}),
      ...(selectedMethod === 'group_compare' ? { options: { agg: 'mean' } } : {}),
    })
  }, [selectedMethod, reset])

  // 过滤出纯数值列（用于相关性等必须数值的场景）
  const numericColumns = availableColumns
    .filter((c) => c.isNumeric)
    .map((c) => ({ label: `${c.columnName} (数值)`, value: c.columnName }))

  return (
    <Card title="参数配置" size="small" className="shadow-sm border-slate-200">
      <Form layout="vertical" onFinish={handleSubmit(onSubmitTask)}>
        {/* === 动态渲染区：描述性统计 === */}
        {selectedMethod === 'descriptive' && (
          <>
            <Controller
              name="columns"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Item
                  label="选择待统计的列"
                  validateStatus={fieldState.error ? 'error' : ''}
                  help={fieldState.error?.message}
                >
                  <Select
                    {...field}
                    mode="multiple"
                    placeholder="请选择列"
                    options={availableColumns.map((c) => ({
                      label: c.columnName,
                      value: c.columnName,
                    }))}
                  />
                </Form.Item>
              )}
            />
            <Controller
              name="options.bins"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Item
                  label="分箱数量 (Bins)"
                  validateStatus={fieldState.error ? 'error' : ''}
                  help={fieldState.error?.message}
                >
                  <InputNumber {...field} min={2} max={100} className="w-full" />
                </Form.Item>
              )}
            />
          </>
        )}

        {/* === 动态渲染区：相关性分析 === */}
        {selectedMethod === 'correlation' && (
          <>
            <Controller
              name="columns"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Item
                  label="选择对比列 (≥2个数值列)"
                  validateStatus={fieldState.error ? 'error' : ''}
                  help={fieldState.error?.message}
                >
                  <Select
                    {...field}
                    mode="multiple"
                    placeholder="请选择至少2列"
                    options={numericColumns}
                  />
                </Form.Item>
              )}
            />
            <Controller
              name="options.method"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Item
                  label="相关性系数算法"
                  validateStatus={fieldState.error ? 'error' : ''}
                  help={fieldState.error?.message}
                >
                  <Select
                    {...field}
                    options={[
                      { label: 'Pearson (皮尔逊)', value: 'pearson' },
                      { label: 'Spearman (斯皮尔曼)', value: 'spearman' },
                    ]}
                  />
                </Form.Item>
              )}
            />
          </>
        )}

        <Divider className="my-4" />

        <Button
          type="primary"
          htmlType="submit"
          block
          icon={<RocketOutlined />}
          loading={isSubmitting}
        >
          提交计算任务
        </Button>
      </Form>
    </Card>
  )
}
