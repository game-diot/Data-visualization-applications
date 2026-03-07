// src/shared/security/sanitizeHtml.ts
import DOMPurify from 'dompurify'

/**
 * HTML 净化器：用于渲染可信度不高的富文本（例如 AI 报告/后端生成的 HTML）
 * 默认策略：最小允许集 + 安全外链
 */

let hookRegistered = false

const ensureHook = () => {
  if (hookRegistered) return
  hookRegistered = true

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    // 统一外链安全属性
    if ((node as Element).tagName?.toLowerCase() === 'a') {
      const el = node as Element

      // target/_blank + rel 防 opener
      el.setAttribute('target', '_blank')
      el.setAttribute('rel', 'noopener noreferrer')

      // 额外：限制 href 协议（防 javascript: / data:）
      const href = el.getAttribute('href')
      if (href) {
        const trimmed = href.trim().toLowerCase()
        const isSafe =
          trimmed.startsWith('http://') ||
          trimmed.startsWith('https://') ||
          trimmed.startsWith('mailto:')

        if (!isSafe) {
          el.removeAttribute('href')
        }
      }
    }
  })
}

export const sanitizeHtml = (dirtyHtml: string): string => {
  if (!dirtyHtml) return ''

  ensureHook()

  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: [
      'b',
      'i',
      'em',
      'strong',
      'a',
      'p',
      'br',
      'ul',
      'li',
      'ol',
      'code',
      'pre',
      'span',
      'div',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ],
    // 建议不要开放 style；用 class + 你自己的样式体系控制展示
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  })
}
