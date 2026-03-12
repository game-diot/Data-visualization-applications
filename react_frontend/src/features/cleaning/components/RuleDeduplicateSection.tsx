// src/features/cleaning/components/RuleDeduplicateSection.tsx
import React from 'react'
import { Card, Form, Select, Switch, Space, Typography } from 'antd'
import { useFormContext, Controller, useWatch } from 'react-hook-form'
import type { CleanRulesFormValues } from '../schemas/cleaningRules.schema'

const { Text } = Typography
interface Props {
  availableColumns: string[]
}
export const RuleDeduplicateSection: React.FC<Props> = ({ availableColumns }) => {
  const { control } = useFormContext<CleanRulesFormValues>()
  const isEnabled = useWatch({ control, name: 'deduplicate.enabled' })

  return (
    <Card
      title={
        <Space>
          <Text strong>2. 重复项剔除 (Deduplicate)</Text>
        </Space>
      }
      className="mb-6 shadow-sm border-slate-200"
      extra={
        <Controller
          name="deduplicate.enabled"
          control={control}
          render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
        />
      }
    >
      {isEnabled ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <Controller
            name="deduplicate.keep"
            control={control}
            render={({ field, fieldState }) => (
              <Form.Item
                label="保留策略"
                validateStatus={fieldState.error ? 'error' : ''}
                help={fieldState.error?.message}
              >
                <Select
                  {...field}
                  options={[
                    { label: '保留第一项 (First)', value: 'first' },
                    { label: '保留最后一项 (Last)', value: 'last' },
                  ]}
                />
              </Form.Item>
            )}
          />

          <Controller
            name="deduplicate.subset"
            control={control}
            render={({ field, fieldState }) => (
              <Form.Item
                label="🎯 查重依据列 (可选子集)"
                tooltip="留空则默认整行完全相同才算重复"
                className="mb-0"
              >
                <Select
                  {...field}
                  mode="multiple"
                  allowClear
                  placeholder="请选择基于哪些列判断重复 (默认全列)"
                  options={availableColumns.map((col) => ({ label: col, value: col }))}
                  className="w-full"
                />
              </Form.Item>
            )}
          />
        </div>
      ) : (
        <Text type="secondary">重复项剔除规则已关闭。开启后将识别并删除完全重复的数据行。</Text>
      )}
    </Card>
  )
}
