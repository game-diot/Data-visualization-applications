import { Button } from 'antd'

import { PageContainer } from '@/shared/ui/PageContainer'

export default function ExportsPage() {
  return (
    <PageContainer
      title="数据导出"
      extra={
        <div className="flex gap-2">
          <Button type="primary">新建导出</Button>
          <Button>刷新</Button>
        </div>
      }
    >
      <div className="bg-red-500 text-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold">Tailwind 测试面板</h2>
        <p className="mt-2">Exports 模块占位页：后续承接导出任务、下载、导出历史。</p>
      </div>

      <div className="p-4 border border-gray-300 rounded-lg">
        <h2 className="text-lg font-bold mb-4">MVP 提示</h2>
        <p className="text-gray-600 mb-4">
          下一步你可以接入：executeSafeDownload（下载）+ 任务轮询（导出进度）+ 导出历史列表。
        </p>
        <Button type="primary" size="large">
          Ant Design 主按钮
        </Button>
      </div>
    </PageContainer>
  )
}
