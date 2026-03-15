import {
  AreaChartOutlined,
  ControlOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  ExportOutlined,
  ProfileOutlined,
} from '@ant-design/icons'
import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { Breadcrumb, Layout, Menu, theme } from 'antd'
import { Suspense, useMemo } from 'react'

import { NetworkStatusBar } from '@/shared/ui/NetworkStatusBar'
import { LoadingBlock } from '@/shared/ui/LoadingBlock'

const { Content, Sider } = Layout

const MENU_ITEMS = [
  { key: 'files', label: '数据资产', to: '/files', icon: <DatabaseOutlined /> },
  { key: 'dashboard', label: '工作台', to: '/dashboard', icon: <DashboardOutlined /> },
  { key: 'tasks', label: '任务中心', to: '/tasks', icon: <ControlOutlined /> },
  { key: 'reports', label: '报告大屏', to: '/reports', icon: <ProfileOutlined /> },
  { key: 'exports', label: '数据导出', to: '/exports', icon: <ExportOutlined /> },
] as const

const getSelectedKey = (pathname: string) => {
  if (pathname.startsWith('/files')) return 'files'
  if (pathname.startsWith('/tasks')) return 'tasks'
  if (pathname.startsWith('/dashboard')) return 'dashboard'
  if (pathname.startsWith('/reports')) return 'reports'
  if (pathname.startsWith('/exports')) return 'exports'
  return 'files'
}

const buildBreadcrumb = (pathname: string) => {
  // MVP：先用路径段生成，后续你可以做 route meta 映射
  const parts = pathname.split('/').filter(Boolean)
  const items = [{ title: '首页' }]

  if (parts.length === 0) return items
  items.push({ title: parts[0] })
  if (parts.length > 1) items.push({ title: parts[1] })
  return items
}

export function AppLayout() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const location = useLocation()
  const pathname = location.pathname

  const selectedKey = useMemo(() => getSelectedKey(pathname), [pathname])
  const breadcrumbItems = useMemo(() => buildBreadcrumb(pathname), [pathname])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <NetworkStatusBar />

      <Sider breakpoint="lg" collapsedWidth={0}>
        <div className="h-12 m-4 flex items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 shadow-inner overflow-hidden cursor-default transition-all hover:bg-white/10">
          {/* Logo 图标：带点渐变色或品牌色的高亮 */}
          <AreaChartOutlined className="text-indigo-400 text-2xl" />

          {/* Logo 文字：通过粗细和颜色的对比，打造高级感 */}
          <span className="text-white font-black text-xl tracking-wider font-mono">
            Data<span className="text-indigo-400">V</span>
          </span>
        </div>{' '}
        <Menu theme="dark" selectedKeys={[selectedKey]} mode="inline">
          {MENU_ITEMS.map((item) => (
            <Menu.Item key={item.key} icon={item.icon}>
              <Link to={item.to}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>

      <Layout>
        <Content style={{ margin: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Breadcrumb items={breadcrumbItems} />

          <div
            style={{
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              flex: 1,
              overflow: 'auto',
            }}
          >
            <Suspense fallback={<LoadingBlock text="加载模块中..." />}>
              <Outlet />
            </Suspense>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
