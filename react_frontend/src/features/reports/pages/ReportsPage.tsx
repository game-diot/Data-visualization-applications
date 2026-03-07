import { Button } from 'antd'

import { PageContainer } from '@/shared/ui/PageContainer'

export default function ReportsPage() {
  return (
    <PageContainer
      title="报告大屏"
      extra={
        <div className="flex gap-2">
          <Button type="primary">创建报告</Button>
          <Button>刷新</Button>
        </div>
      }
    >
      <div className="bg-red-500 text-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold">Tailwind 测试面板</h2>
        <p className="mt-2">Reports 模块占位页：后续承接报告列表、详情、版本、导出。</p>
      </div>

      <div className="p-4 border border-gray-300 rounded-lg">
        <h2 className="text-lg font-bold mb-4">MVP 提示</h2>
        <p className="text-gray-600 mb-4">
          下一步你可以接入：reportsSearchSchema + PreviewTable（列表预览）+ LazyChart（图表渲染）。
        </p>
        <Button type="primary" size="large">
          Ant Design 主按钮
        </Button>
      </div>
    </PageContainer>
  )
}
