// src/features/cleaning/components/RuleMissingSection.tsx
import React from 'react'
import { Card, Form, Select, Switch, Input, Space, Typography } from 'antd'
import { useFormContext, Controller, useWatch } from 'react-hook-form'
import type { CleanRulesFormValues } from '../schemas/cleaningRules.schema'

const { Text } = Typography
// 修改 Props 定义
interface Props {
  availableColumns: string[] // 👈 新增接收列名的 Prop
}
export const RuleMissingSection: React.FC<Props> = ({ availableColumns }) => {
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
                {/* 🌟 核心改造：使用多选 Select，且提供一键全选功能 */}
                <Select
                  {...field}
                  mode="multiple"
                  allowClear
                  placeholder={
                    availableColumns.length > 0
                      ? '请选择需要处理缺失值的列'
                      : '🎉 当前数据极其健康，无缺失值！'
                  }
                  disabled={availableColumns.length === 0}
                  options={availableColumns.map((col) => ({ label: col, value: col }))}
                  className="w-full"
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
