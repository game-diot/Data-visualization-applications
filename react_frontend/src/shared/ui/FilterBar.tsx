import { ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input, Select, Space } from 'antd'
import { useEffect, useState } from 'react'

import { useDebounce } from '@/shared/hooks/useDebouncedValue'

// 1. 引入泛型 TStage，默认回退为 string
export type StageOptionItem<T> =
  | { label: string; value: T }
  | { label: string; options: { label: string; value: T }[] }
export interface FilterBarProps<TStage extends string = string> {
  initialQuery?: string
  initialStage?: TStage
  stageOptions?: StageOptionItem<TStage>[] // 👈 使用新的联合类型
  onFilterChange: (filters: { query?: string; stage?: TStage }) => void
  onReset: () => void
}

// 2. 移除 React.FC，改用标准函数声明以完美支持泛型推导
export function FilterBar<TStage extends string = string>({
  initialQuery = '',
  initialStage,
  stageOptions = [],
  onFilterChange,
  onReset,
}: FilterBarProps<TStage>) {
  const [localQuery, setLocalQuery] = useState(initialQuery)
  // 3. 内部状态也使用泛型
  const [localStage, setLocalStage] = useState<TStage | undefined>(initialStage)

  const debouncedQuery = useDebounce(localQuery, 300)

  useEffect(() => {
    onFilterChange({ query: debouncedQuery, stage: localStage })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, localStage])

  useEffect(() => {
    setLocalQuery(initialQuery)
    setLocalStage(initialStage)
  }, [initialQuery, initialStage])

  const handleReset = () => {
    setLocalQuery('')
    // 将 'all' 强转为 TStage，因为我们在业务中约定了 'all' 是通用兜底状态
    setLocalStage('all' as TStage)
    onReset()
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-sm border border-slate-100 mb-4">
      <Space size="middle" className="flex-wrap">
        <Input
          placeholder="搜索..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          prefix={<SearchOutlined className="text-slate-400" />}
          allowClear
          className="w-64"
        />
        {stageOptions.length > 0 && (
          <Select
            value={localStage}
            onChange={(value) => setLocalStage(value)}
            // 🟢 修改这里：合并 'all' 选项并进行安全的类型断言
            options={[{ label: '全部状态', value: 'all' }, ...stageOptions] as any}
            className="w-48" // 稍微加宽一点点，因为分组标题可能比较长
          />
        )}
      </Space>

      <Button icon={<ReloadOutlined />} onClick={handleReset}>
        重置筛选
      </Button>
    </div>
  )
}
