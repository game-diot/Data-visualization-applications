import { Button } from 'antd'

import { PageContainer } from '@/shared/ui/PageContainer'

export default function DashboardPage() {
  return (
    <PageContainer title="工作台">
      {/* Tailwind 测试区：如果背景是红色，文字是白色，内边距有撑开，且圆角生效，说明 Tailwind 完全修复！ */}
      <div className="bg-red-500 text-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold">Tailwind 测试面板</h2>
        <p className="mt-2">如果你能看到这个红色面板，Tailwind 就生效了。</p>
      </div>

      {/* AntD 测试区：如果按钮是纯正的蓝色背景，且悬停有动画，说明 preflight 关闭成功，没和 Tailwind 冲突！ */}
      <div className="p-4 border border-gray-300 rounded-lg">
        <h2 className="text-lg font-bold mb-4">AntD 兼容测试面板</h2>
        <Button type="primary" size="large">
          Ant Design 主按钮
        </Button>
      </div>
    </PageContainer>
  )
}
