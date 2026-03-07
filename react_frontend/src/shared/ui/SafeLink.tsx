import React from 'react'

interface SafeLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

/**
 * @description 安全外链组件
 * 自动识别外部链接，并强制施加 target="_blank" 与 rel="noopener noreferrer"
 */
export const SafeLink: React.FC<SafeLinkProps> = ({ href, children, ...rest }) => {
  // 简单正则判定是否为外部 HTTP 链接
  const isExternal = /^https?:\/\//.test(href)

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        // 核心安全头：
        // noopener: 斩断新窗口对当前窗口 window.opener 对象的访问权限，防止被篡改重定向
        // noreferrer: 不向外部站点发送 Referer 头，保护来源页面的 URL 隐私（可能含有 token 或敏感参数）
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 underline-offset-2 transition-colors"
        {...rest}
      >
        {children}
      </a>
    )
  }

  return (
    <a href={href} className="text-blue-600 hover:text-blue-800" {...rest}>
      {children}
    </a>
  )
}
