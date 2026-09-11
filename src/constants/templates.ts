import type { Orientation, TemplateId, TextPos } from '@/types'

/** 模板选项元数据 */
export interface TemplateOption {
  id: TemplateId
  label: string
  textPos: TextPos
  overflow: boolean
}

const LABELS: Record<Exclude<TextPos, 'none'>, { fit: string; overflow: string }> = {
  top: { fit: '文字在上 · 图片完整', overflow: '文字在上 · 图片下沉溢出' },
  bottom: { fit: '文字在下 · 图片完整', overflow: '文字在下 · 图片上浮溢出' },
  left: { fit: '文字在左 · 图片完整', overflow: '文字在左 · 图片右溢出' },
  right: { fit: '文字在右 · 图片完整', overflow: '文字在右 · 图片左溢出' },
}

/**
 * 当前方向下可选的排版模板。
 * 竖屏仅支持上/下（与 iPhone 一致）；横屏支持上下左右全部方位。
 */
export function templatesFor(orientation: Orientation): TemplateOption[] {
  const positions: Exclude<TextPos, 'none'>[] =
    orientation === 'landscape' ? ['top', 'bottom', 'left', 'right'] : ['top', 'bottom']
  const list: TemplateOption[] = []
  for (const p of positions) {
    list.push({ id: `${p}-fit`, label: LABELS[p].fit, textPos: p, overflow: false })
    list.push({ id: `${p}-overflow`, label: LABELS[p].overflow, textPos: p, overflow: true })
  }
  list.push({ id: 'none', label: '纯图模式', textPos: 'none', overflow: false })
  return list
}

/** 解析模板：文字位置与是否溢出 */
export function parseTemplate(id: TemplateId): { textPos: TextPos; overflow: boolean } {
  if (id === 'none') return { textPos: 'none', overflow: false }
  const [pos, mode] = id.split('-') as [Exclude<TextPos, 'none'>, 'fit' | 'overflow']
  return { textPos: pos, overflow: mode === 'overflow' }
}

/** 模板显示名（按页面方向解析合法模板后查找） */
export function templateLabel(id: TemplateId, orientation: Orientation): string {
  return templatesFor(orientation).find((t) => t.id === id)?.label ?? LABELS.top.fit
}

/** 切换到竖屏时，将仅在横屏合法的 左/右 排版映射为等效的 上/下 排版 */
export function coerceTemplate(id: TemplateId, orientation: Orientation): TemplateId {
  const { textPos, overflow } = parseTemplate(id)
  if (orientation !== 'portrait' || (textPos !== 'left' && textPos !== 'right')) return id
  const mapped = textPos === 'left' ? 'top' : 'bottom'
  return (overflow ? `${mapped}-overflow` : `${mapped}-fit`) as TemplateId
}
