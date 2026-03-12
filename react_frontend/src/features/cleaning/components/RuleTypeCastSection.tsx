// src/features/cleaning/components/RuleTypeCastSection.tsx
import React from 'react'
import { Card, Form, Select, Switch, Space, Typography, Button, Input, Row, Col } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useFormContext, Controller, useWatch, useFieldArray } from 'react-hook-form'
import type { CleanRulesFormValues } from '../schemas/cleaningRules.schema'
const { Text } = Typography
interface Props {
  availableColumns: string[]
}
export const RuleTypeCastSection: React.FC<Props> = ({ availableColumns }) => {
  const { control } = useFormContext<CleanRulesFormValues>()
  const isEnabled = useWatch({ control, name: 'typeCast.enabled' })

  // 核心：操作动态数组的 Hook
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'typeCast.rules',
  })

  return (
    <Card
      title={
        <Space>
          <Text strong>3. 数据类型强制转换 (Type Cast)</Text>
        </Space>
      }
      className="mb-6 shadow-sm border-slate-200"
      extra={
        <Controller
          name="typeCast.enabled"
          control={control}
          render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
        />
      }
    >
      {isEnabled ? (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Row
              gutter={16}
              key={field.id}
              className="items-start mb-4 bg-slate-50 p-4 rounded border border-slate-100"
            >
              <Col span={8}>
                <Controller
                  name={`typeCast.rules.${index}.column`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Form.Item
                      label="请选择目标列"
                      help={fieldState.error?.message}
                      validateStatus={fieldState.error ? 'error' : ''}
                      className="mb-0"
                    >
                      <Select
                        {...field}
                        showSearch // 允许打字搜索，对上百列的数据集极度友好
                        options={availableColumns.map((col) => ({ label: col, value: col }))}
                      />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name={`typeCast.rules.${index}.targetType`}
                  control={control}
                  render={({ field: f, fieldState }) => (
                    <Form.Item
                      label="转换为"
                      required
                      validateStatus={fieldState.error ? 'error' : ''}
                      help={fieldState.error?.message}
                    >
                      <Select
                        {...f}
                        options={[
                          { label: '整数 (int)', value: 'int' },
                          { label: '浮点数 (float)', value: 'float' },
                          { label: '字符串 (string)', value: 'string' },
                          { label: '日期时间 (datetime)', value: 'datetime' },
                        ]}
                      />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={6}>
                {/* 只有为了日期时间才提供 format 占位 */}
                <Controller
                  name={`typeCast.rules.${index}.format`}
                  control={control}
                  render={({ field: f, fieldState }) => (
                    <Form.Item
                      label="格式化字符串 (可选)"
                      validateStatus={fieldState.error ? 'error' : ''}
                      help={fieldState.error?.message}
                    >
                      <Input {...f} placeholder="例如: %Y-%m-%d" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={2} className="flex justify-end pt-8">
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => remove(index)}
                />
              </Col>
            </Row>
          ))}

          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={() => append({ column: '', targetType: 'int', format: '' })}
          >
            添加一条类型转换规则
          </Button>

          {/* 展示针对 rules 数组本身的整体报错 (例如开了开关却没加规则) */}
          <Controller
            name="typeCast.rules"
            control={control}
            render={({ fieldState }) =>
              fieldState.error ? (
                <div className="text-red-500 mt-2">{fieldState.error.message}</div>
              ) : (
                <></>
              )
            }
          />
        </div>
      ) : (
        <Text type="secondary">
          类型转换规则已关闭。可用于将由于脏数据导致的“字符串”列强转为“数值型”。
        </Text>
      )}
    </Card>
  )
}
