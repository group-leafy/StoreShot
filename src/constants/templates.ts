import type { Orientation, TemplateId, TextPos } from '@/types'

/** 模板选项元数据（显示文案见 locales 的 templates.* 命名空间） */
export interface TemplateOption {
  id: TemplateId
  textPos: TextPos
  overflow: boolean
}

/**
 * 当前方向下可选的排版模板。
 * 竖屏仅支持上/下；横屏支持上下左右全部方位。
 */
export function templatesFor(orientation: Orientation): TemplateOption[] {
  const positions: Exclude<TextPos, 'none'>[] =
    orientation === 'landscape' ? ['top', 'bottom', 'left', 'right'] : ['top', 'bottom']
  const list: TemplateOption[] = []
  for (const p of positions) {
    list.push({ id: `${p}-fit`, textPos: p, overflow: false })
    list.push({ id: `${p}-overflow`, textPos: p, overflow: true })
  }
  list.push({ id: 'none', textPos: 'none', overflow: false })
  return list
}

/** 解析模板：文字位置与是否溢出 */
export function parseTemplate(id: TemplateId): { textPos: TextPos; overflow: boolean } {
  if (id === 'none') return { textPos: 'none', overflow: false }
  const [pos, mode] = id.split('-') as [Exclude<TextPos, 'none'>, 'fit' | 'overflow']
  return { textPos: pos, overflow: mode === 'overflow' }
}

/** 切换到竖屏时，将仅在横屏合法的 左/右 排版映射为等效的 上/下 排版 */
export function coerceTemplate(id: TemplateId, orientation: Orientation): TemplateId {
  const { textPos, overflow } = parseTemplate(id)
  if (orientation !== 'portrait' || (textPos !== 'left' && textPos !== 'right')) return id
  const mapped = textPos === 'left' ? 'top' : 'bottom'
  return (overflow ? `${mapped}-overflow` : `${mapped}-fit`) as TemplateId
}
