import React from 'react'

interface LogsPanelProps {
  rawLog: string
}

export const LogsPanelMock: React.FC<LogsPanelProps> = ({ rawLog }) => {
  // 模拟一段后端或用户可能注入的恶意日志
  // rawLog = "任务崩溃了... <script>alert('XSS 攻击！窃取 Token！')</script> <img src=x onerror=alert(1)>"

  return (
    <div className="rounded-md bg-slate-900 p-4 shadow-inner">
      <h3 className="mb-2 text-sm font-semibold text-slate-300">执行日志</h3>
      {/* 安全策略：React 会自动对大括号 {} 内的字符串进行 HTML 实体转义。
        这里的 <script> 会被安全地渲染为 &lt;script&gt; 纯文本，而绝不会被浏览器执行。
      */}
      <pre className="whitespace-pre-wrap text-xs font-mono text-emerald-400">{rawLog}</pre>
    </div>
  )
}
