import React from 'react'
import { sanitizeHtml } from '../security/sanitizeHtml'

interface SafeHtmlProps {
  html: string
  className?: string
}

export const SafeHtml: React.FC<SafeHtmlProps> = ({ html, className = '' }) => {
  // 净化输入的 HTML 字符串
  const cleanHtml = sanitizeHtml(html)

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`} // 配合 Tailwind Typography 插件使用效果更佳
      // eslint-disable-next-line react/no-danger -- 全站唯一合法的逃生舱，已通过 DOMPurify 严格清洗
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  )
}
