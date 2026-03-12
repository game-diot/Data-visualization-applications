// src/features/cleaning/components/RulesForm.tsx
import React from 'react'
import { Form as AntdForm, Button, Alert } from 'antd'
import { PlayCircleFilled } from '@ant-design/icons'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  cleanRulesSchema,
  getDefaultCleanRules,
  type CleanRulesFormValues,
} from '../schemas/cleaningRules.schema'
import { useCleaningRunMutation } from '@/entities/cleaning/queries/cleaning.mutations'

import { RuleMissingSection } from './RuleMissingSection'
import { RuleDeduplicateSection } from './RuleDeduplicateSection'
import { RuleTypeCastSection } from './RuleTypeCastSection'
import { useQualityByVersion } from '@/entities/quality/queries/quality.queries'
import { all } from 'axios'

interface Props {
  fileId: string
  sessionId: string
  qualityVersion: number
}

export const RulesForm: React.FC<Props> = ({ fileId, sessionId, qualityVersion }) => {
  // 🌟 2. 启动雷达：拉取当前的质量基准报告
  const { data: qualityData, isLoading: isQualityLoading } = useQualityByVersion(
    fileId,
    qualityVersion,
  )

  // 🌟 3. 解析情报：基于干净的视图模型 (VM) 提取列名

  // 遍历 columnTypes 数组，提取出所有的 columnName
  const allColumns = qualityData?.columnTypes.map((col) => col.columnName) || []

  // 直接读取已经被 Mapper 洗干净的驼峰属性
  const missingColumns = qualityData?.missing.columnsWithMissing || []
  // 1. 初始化 RHF 引擎，注入 Zod 天罗地网
  const methods = useForm<CleanRulesFormValues>({
    resolver: zodResolver(cleanRulesSchema),
    defaultValues: getDefaultCleanRules(),
    mode: 'onSubmit', // 性能优化：只有在点提交时才进行全量校验
  })

  // 2. 引入环节五写好的“点火”突变
  const { mutate: runCleaning, isPending } = useCleaningRunMutation(fileId, qualityVersion)

  // 3. 提交拦截器：只有 Zod 校验完美通过，才会进入此函数
  const onSubmit = (validData: CleanRulesFormValues) => {
    // 此时的 validData 是一个绝对干净、严谨的 JSON
    runCleaning({
      sessionId: sessionId,
      cleanRules: validData,
    })
  }
  const onValidationError = (errors: any) => {
    console.error('🛑 Zod 表单校验失败，被拦截的字段及原因如下：', errors)
    // 你甚至可以在这里加一个全局 Toast 提示，避免用户不知所措
    // message.error("表单填写有误，请检查标红的字段！");
  }

  return (
    // FormProvider 将 methods 提供给内部的子组件 (RuleXXSection)
    <FormProvider {...methods}>
      {/* 使用 AntD 的 layout 统一表单样式 */}
      <AntdForm layout="vertical" onFinish={methods.handleSubmit(onSubmit, onValidationError)}>
        <Alert
          message="自动化清洗策略配置"
          description="请按需开启并配置下方的规则卡片。点击开始清洗后，系统将结合这套规则与您的手工修改记录，在后台生成一份全新的不可变快照 (Cleaning Version)。"
          type="info"
          showIcon
          className="mb-6"
        />

        <RuleMissingSection availableColumns={missingColumns} />
        <RuleDeduplicateSection availableColumns={allColumns} />
        <RuleTypeCastSection availableColumns={allColumns} />

        <div className="flex justify-end mt-8 border-t border-slate-200 pt-6">
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            icon={<PlayCircleFilled />}
            loading={isPending}
            className="w-full md:w-auto px-12"
          >
            开始执行数据清洗
          </Button>
        </div>
      </AntdForm>
    </FormProvider>
  )
}
