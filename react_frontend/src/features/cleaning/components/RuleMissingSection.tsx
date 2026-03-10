// src/features/cleaning/components/RuleMissingSection.tsx
import React from 'react'
import { Card, Form, Select, Switch, Input, Space, Typography } from 'antd'
import { useFormContext, Controller, useWatch } from 'react-hook-form'
import type { CleanRulesFormValues } from '../schemas/cleaningRules.schema'

const { Text } = Typography

export const RuleMissingSection: React.FC = () => {
  // 1. 接入 RHF 上下文，获取绝对类型安全的 control
  const { control } = useFormContext<CleanRulesFormValues>()

  // 2. 监听当前区块的关键状态，用于 UI 条件渲染 (类似 Vue 的 computed)
  const isEnabled = useWatch({ control, name: 'missing.enabled' })
  const fillMethod = useWatch({ control, name: 'missing.fillMethod' })

  return (
    <Card
      title={
        <Space>
          <Text strong>1. 缺失值处理 (Missing Values)</Text>
        </Space>
      }
      className="mb-6 shadow-sm border-slate-200"
      extra={
        <Controller
          name="missing.enabled"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onChange={field.onChange}
              checkedChildren="启用"
              unCheckedChildren="关闭"
            />
          )}
        />
      }
    >
      {isEnabled ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* 策略选择 */}
          <Controller
            name="missing.strategy"
            control={control}
            render={({ field, fieldState }) => (
              <Form.Item
                label="处理策略"
                validateStatus={fieldState.error ? 'error' : ''}
                help={fieldState.error?.message}
              >
                <Select
                  {...field}
                  options={[
                    { label: '填充 (Fill)', value: 'fill' },
                    { label: '删除整行 (Drop)', value: 'drop' },
                  ]}
                />
              </Form.Item>
            )}
          />

          {/* 填充方法选择 */}
          <Controller
            name="missing.fillMethod"
            control={control}
            render={({ field, fieldState }) => (
              <Form.Item
                label="填充方法"
                validateStatus={fieldState.error ? 'error' : ''}
                help={fieldState.error?.message}
              >
                <Select
                  {...field}
                  options={[
                    { label: '平均值 (Mean)', value: 'mean' },
                    { label: '中位数 (Median)', value: 'median' },
                    { label: '众数 (Mode)', value: 'mode' },
                    { label: '指定常数 (Constant)', value: 'constant' },
                  ]}
                />
              </Form.Item>
            )}
          />

          {/* 🚨 联动条件渲染：只有选了 constant 才出现这个输入框 */}
          {fillMethod === 'constant' && (
            <Controller
              name="missing.constantValue"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Item
                  label="常数值"
                  required
                  validateStatus={fieldState.error ? 'error' : ''}
                  help={fieldState.error?.message}
                >
                  <Input {...field} placeholder="请输入要填充的具体数值或文本" />
                </Form.Item>
              )}
            />
          )}

          {/* 目标列选择：使用 mode="tags" 允许用户输入/多选列名 */}
          <Controller
            name="missing.applyColumns"
            control={control}
            render={({ field, fieldState }) => (
              <Form.Item
                className="col-span-1 md:col-span-2"
                label="应用目标列"
                required
                validateStatus={fieldState.error ? 'error' : ''}
                help={fieldState.error?.message}
              >
                <Select
                  {...field}
                  mode="tags"
                  placeholder="请输入或选择要处理的列名（输入后回车）"
                  style={{ width: '100%' }}
                  // 理想状态下，这里应该传入 Quality 传过来的列名字典，MVP 先让用户自由输入标签
                  options={[]}
                />
              </Form.Item>
            )}
          />
        </div>
      ) : (
        <Text type="secondary">
          缺失值处理规则已关闭。若开启，引擎将尝试修复数据中的空值 (NaN/Null)。
        </Text>
      )}
    </Card>
  )
}
