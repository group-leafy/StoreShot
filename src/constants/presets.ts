import type { BackgroundStyle, FontId } from '@/types'

/** 预设渐变背景（默认使用第一组） */
export const GRADIENT_PRESETS: { id: string; name: string; from: string; to: string; angle: number }[] = [
  { id: 'indigo', name: '靛蓝紫', from: '#6366F1', to: '#A855F7', angle: 160 },
  { id: 'ocean', name: '海洋蓝', from: '#0EA5E9', to: '#6366F1', angle: 160 },
  { id: 'sunset', name: '日落橙粉', from: '#F97316', to: '#EC4899', angle: 160 },
  { id: 'dusk', name: '薄暮紫粉', from: '#8B5CF6', to: '#EC4899', angle: 150 },
  { id: 'forest', name: '青森薄荷', from: '#10B981', to: '#06B6D4', angle: 150 },
  { id: 'warm', name: '暖阳金橙', from: '#FBBF24', to: '#F97316', angle: 150 },
  { id: 'graphite', name: '极简深灰', from: '#374151', to: '#111827', angle: 160 },
  { id: 'cloud', name: '极简浅灰', from: '#F8FAFC', to: '#E2E8F0', angle: 160 },
]

export const DEFAULT_BACKGROUND: BackgroundStyle = {
  type: 'gradient',
  from: GRADIENT_PRESETS[0]!.from,
  to: GRADIENT_PRESETS[0]!.to,
  angle: GRADIENT_PRESETS[0]!.angle,
}

/** 字体选项：全部使用系统内置字体，无需网络加载 */
export const FONTS: { id: FontId; name: string; css: string }[] = [
  {
    id: 'sans',
    name: '默认无衬线',
    css: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
  },
  {
    id: 'rounded',
    name: '圆体',
    css: "ui-rounded, -apple-system, 'SF Pro Rounded', 'Yuanti SC', 'Hiragino Maru Gothic ProN', 'PingFang SC', sans-serif",
  },
  {
    id: 'serif',
    name: '衬线体',
    css: "'Songti SC', 'Noto Serif SC', Georgia, 'Times New Roman', serif",
  },
]

/** 字号快捷预设：小 / 中 / 大（基准字号的缩放系数） */
export const FONT_SIZE_PRESETS = [
  { id: 's', name: '小', scale: 0.8 },
  { id: 'm', name: '中', scale: 1 },
  { id: 'l', name: '大', scale: 1.25 },
] as const

export const FONT_SCALE_MIN = 0.6
export const FONT_SCALE_MAX = 1.6
export const FONT_SCALE_STEP = 0.05
