import type { BackgroundStyle, FontId } from '@/types'

/** 预设渐变背景（默认使用第一组；显示文案见 locales 的 gradients.* 命名空间） */
export const GRADIENT_PRESETS: { id: string; from: string; to: string; angle: number }[] = [
  { id: 'indigo', from: '#6366F1', to: '#A855F7', angle: 160 },
  { id: 'ocean', from: '#0EA5E9', to: '#6366F1', angle: 160 },
  { id: 'sunset', from: '#F97316', to: '#EC4899', angle: 160 },
  { id: 'dusk', from: '#8B5CF6', to: '#EC4899', angle: 150 },
  { id: 'forest', from: '#10B981', to: '#06B6D4', angle: 150 },
  { id: 'warm', from: '#FBBF24', to: '#F97316', angle: 150 },
  { id: 'graphite', from: '#374151', to: '#111827', angle: 160 },
  { id: 'cloud', from: '#F8FAFC', to: '#E2E8F0', angle: 160 },
  { id: 'cherry', from: '#E11D48', to: '#FB7185', angle: 150 },
  { id: 'lime', from: '#A3E635', to: '#22C55E', angle: 150 },
  { id: 'aqua', from: '#22D3EE', to: '#3B82F6', angle: 160 },
  { id: 'midnight', from: '#1E3A8A', to: '#172554', angle: 160 },
  { id: 'peach', from: '#FECDD3', to: '#FDE68A', angle: 160 },
  { id: 'lavender', from: '#DDD6FE', to: '#FBCFE8', angle: 160 },
  { id: 'mocha', from: '#D97706', to: '#92400E', angle: 150 },
  { id: 'grape', from: '#6D28D9', to: '#312E81', angle: 160 },
]

/** 预设纯色背景（id 与渐变预设的色系一一对应；显示文案见 locales 的 solids.* 命名空间） */
export const SOLID_PRESETS: { id: string; color: string }[] = [
  { id: 'indigo', color: '#6366f1' },
  { id: 'ocean', color: '#0ea5e9' },
  { id: 'sunset', color: '#f97316' },
  { id: 'dusk', color: '#8b5cf6' },
  { id: 'forest', color: '#10b981' },
  { id: 'warm', color: '#f59e0b' },
  { id: 'graphite', color: '#1f2937' },
  { id: 'cloud', color: '#f1f5f9' },
  { id: 'cherry', color: '#e11d48' },
  { id: 'lime', color: '#84cc16' },
  { id: 'aqua', color: '#06b6d4' },
  { id: 'midnight', color: '#1e3a8a' },
  { id: 'peach', color: '#fda4af' },
  { id: 'lavender', color: '#ddd6fe' },
  { id: 'mocha', color: '#92400e' },
  { id: 'grape', color: '#6d28d9' },
]

export const DEFAULT_BACKGROUND: BackgroundStyle = {
  type: 'gradient',
  from: GRADIENT_PRESETS[0]!.from,
  to: GRADIENT_PRESETS[0]!.to,
  angle: GRADIENT_PRESETS[0]!.angle,
}

/** 字体选项：全部使用系统内置字体，无需网络加载（显示文案见 locales 的 fonts.* 命名空间） */
export const FONTS: { id: FontId; css: string }[] = [
  {
    id: 'sans',
    css: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
  },
  {
    id: 'rounded',
    css: "ui-rounded, -apple-system, 'SF Pro Rounded', 'Yuanti SC', 'Hiragino Maru Gothic ProN', 'PingFang SC', sans-serif",
  },
  {
    id: 'serif',
    css: "'Songti SC', 'Noto Serif SC', Georgia, 'Times New Roman', serif",
  },
]

/** 字号快捷预设（基准字号的缩放系数；显示文案见 locales 的 sizes.* 命名空间） */
export const FONT_SIZE_PRESETS = [
  { id: 's', scale: 0.8 },
  { id: 'm', scale: 1 },
  { id: 'l', scale: 1.25 },
] as const

export const FONT_SCALE_MIN = 0.6
export const FONT_SCALE_MAX = 1.6
export const FONT_SCALE_STEP = 0.05
