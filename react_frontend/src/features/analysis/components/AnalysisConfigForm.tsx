import React, { useEffect } from 'react'
import { Form, Select, InputNumber, Button, Card, Divider, Radio, Empty, Alert } from 'antd'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RocketOutlined } from '@ant-design/icons'
import { analysisConfigFormSchema, type AnalysisConfigFormValues } from '../schemas/analysis.schema'
import type { ColumnProfileVM } from '@/entities/analysis/types/analysis.type'

interface Props {
  selectedMethod: string | null
  availableColumns: ColumnProfileVM[] // 环节二传过来的列画像
  onSubmitTask: (values: AnalysisConfigFormValues) => void
  isSubmitting?: boolean
}

export const AnalysisConfigForm: React.FC<Props> = ({
  selectedMethod,
  availableColumns,
  onSubmitTask,
  isSubmitting = false,
}) => {
  // RHF 实例绑定 Zod
  const { control, handleSubmit, reset, watch } = useForm<AnalysisConfigFormValues>({
    resolver: zodResolver(analysisConfigFormSchema),
  })

  // 监听外部 method 变化，立刻重置表单并注入对应的默认值
  useEffect(() => {
    if (!selectedMethod) return

    // 1. 显式构造完全符合 Zod 分支的 analysisConfig 对象
    let newAnalysisConfig: AnalysisConfigFormValues['analysisConfig']

    switch (selectedMethod) {
      case 'descriptive':
        newAnalysisConfig = {
          type: 'descriptive',
          columns: [],
          options: { bins: 10 },
        }
        break
      case 'correlation':
        newAnalysisConfig = {
          type: 'correlation',
          columns: [],
          options: { method: 'pearson' },
        }
        break
      case 'group_compare':
        newAnalysisConfig = {
          type: 'group_compare',
          columns: [],
          groupBy: '',
          target: '',
          options: { agg: 'mean' },
        }
        break
      default:
        return // 遇到未知的 method 直接 return
    }

    // 2. 将干净、毫无歧义的对象喂给 reset
    reset({
      dataSelection: { rows: null, columns: null },
      analysisConfig: newAnalysisConfig,
    })
  }, [selectedMethod, reset])

  // UI 兜底
  if (!selectedMethod) {
    return (
      <Card
        title="参数配置"
        size="small"
        className="shadow-sm border-slate-200 h-full flex flex-col items-center justify-center"
      >
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请先在左侧选择一种分析模型" />
      </Card>
    )
  }

  // 根据类型过滤出数值列和类别列，防呆设计
  const numericColOptions = availableColumns
    .filter((c) => c.isNumeric)
    .map((c) => ({ label: `${c.columnName} (数值)`, value: c.columnName }))
  const categoricalColOptions = availableColumns
    .filter((c) => !c.isNumeric)
    .map((c) => ({ label: `${c.columnName} (类别)`, value: c.columnName }))
  const allColOptions = availableColumns.map((c) => ({ label: c.columnName, value: c.columnName }))
  // 🚀 发射前的最后一道组装工序
  const handleFinalSubmit = (values: AnalysisConfigFormValues) => {
    // 拷贝一份，防止污染 RHF 内部状态
    const payload = { ...values }

    if (payload.analysisConfig.type === 'group_compare') {
      // 满足 FastAPI Pydantic 对 columns.min_length = 1 的铁血要求！
      // 把 groupBy 和 target 组装成数组塞进去
      payload.analysisConfig.columns = [
        payload.analysisConfig.groupBy,
        payload.analysisConfig.target,
      ].filter(Boolean) // 过滤掉可能为空的值，确保安全
    }

    // 将组装好的完美 Payload 移交给父组件 (AnalysisPage) 去发请求
    onSubmitTask(payload)
  }
  return (
    <Card title="参数配置" size="small" className="shadow-sm border-slate-200 h-full">
      {/* 🚀 加上 onError 回调，Zod 拦截的原因将会在控制台大白于天下！ */}
      <Form layout="vertical" onFinish={handleSubmit(handleFinalSubmit)}>
        {' '}
        {/* ================= 动态渲染区：描述性统计 ================= */}
        {selectedMethod === 'descriptive' && (
          <>
            <Controller
              name="analysisConfig.columns"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Item
                  label="选择待统计的字段 (必选)"
                  validateStatus={fieldState.error ? 'error' : ''}
                  help={fieldState.error?.message}
                >
                  <Select
                    {...field}
                    mode="multiple"
                    placeholder="请选择字段 (可多选，建议选中可表示文件主要内容的字段)"
                    options={allColOptions}
                    maxTagCount="responsive"
                  />
                </Form.Item>
              )}
            />
            <Controller
              name="analysisConfig.options.bins"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Item
                  label="直方图分箱数量 (Bins)"
                  validateStatus={fieldState.error ? 'error' : ''}
                  help={fieldState.error?.message}
                >
                  <InputNumber {...field} min={2} max={100} className="w-full" />
                </Form.Item>
              )}
            />
          </>
        )}
        {/* ================= 动态渲染区：相关性分析 ================= */}
        {selectedMethod === 'correlation' && (
          <>
            <Controller
              name="analysisConfig.columns"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Item
                  label="选择参与计算的字段 (≥2 个数值列)"
                  validateStatus={fieldState.error ? 'error' : ''}
                  help={fieldState.error?.message}
                >
                  {/* 防呆：这里强行只喂给它 numericColOptions，用户想选文本列都选不到 */}
                  <Select
                    {...field}
                    mode="multiple"
                    placeholder="请选择至少2个数值字段"
                    options={numericColOptions}
                    maxTagCount="responsive"
                  />
                </Form.Item>
              )}
            />
            <Controller
              name="analysisConfig.options.method"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Item
                  label="相关性系数算法"
                  validateStatus={fieldState.error ? 'error' : ''}
                  help={fieldState.error?.message}
                >
                  <Radio.Group {...field} optionType="button" buttonStyle="solid">
                    <Radio.Button value="pearson">Pearson (皮尔逊)</Radio.Button>
                    <Radio.Button value="spearman">Spearman (斯皮尔曼)</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              )}
            />
          </>
        )}
        {/* ================= 动态渲染区：分组对比 ================= */}
        {selectedMethod === 'group_compare' && (
          <>
            {/* 1. 分组维度 (groupBy)：防呆设计，只允许选类别列 */}
            <Controller
              name="analysisConfig.groupBy"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Item
                  label="分组维度 (Group By) - 类别列"
                  validateStatus={fieldState.error ? 'error' : ''}
                  help={fieldState.error?.message}
                >
                  <Select
                    {...field}
                    placeholder="请选择用哪个类别列进行分组 (如：部门、性别)"
                    options={categoricalColOptions}
                  />
                </Form.Item>
              )}
            />

            {/* 2. 对比目标 (target)：防呆设计，只允许选数值列 */}
            <Controller
              name="analysisConfig.target"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Item
                  label="对比指标 (Target) - 数值列"
                  validateStatus={fieldState.error ? 'error' : ''}
                  help={fieldState.error?.message}
                >
                  <Select
                    {...field}
                    placeholder="请选择要对比的数值列 (如：薪资、身高)"
                    options={numericColOptions}
                  />
                </Form.Item>
              )}
            />

            {/* 3. 聚合算法 (agg) */}
            <Controller
              name="analysisConfig.options.agg"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Item
                  label="聚合算法 (Aggregation)"
                  validateStatus={fieldState.error ? 'error' : ''}
                  help={fieldState.error?.message}
                >
                  <Radio.Group
                    {...field}
                    optionType="button"
                    buttonStyle="solid"
                    className="w-full flex"
                  >
                    <Radio.Button value="mean" className="flex-1 text-center">
                      平均值 (Mean)
                    </Radio.Button>
                    <Radio.Button value="median" className="flex-1 text-center">
                      中位数 (Median)
                    </Radio.Button>
                    <Radio.Button value="sum" className="flex-1 text-center">
                      总和 (Sum)
                    </Radio.Button>
                  </Radio.Group>
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
          size="large"
          icon={<RocketOutlined />}
          loading={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-500"
        >
          提交分析任务
        </Button>
      </Form>
    </Card>
  )
}
