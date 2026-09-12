import type { DeviceId, DeviceSpec, Orientation } from '@/types'

/**
 * 支持的设备规格（竖屏基准尺寸）。
 * 导出尺寸严格遵循 App Store 原生要求：
 * - iPhone：1242 × 2688
 * - iPad：竖屏 2064 × 2752 / 横屏 2752 × 2064（由 store 按方向解析）
 * 展示名/副标题文案见 locales 的 devices.* 命名空间。
 */
export const DEVICES: Record<DeviceId, DeviceSpec> = {
  'iphone-67': {
    id: 'iphone-67',
    orientation: 'portrait',
    width: 1242,
    height: 2688,
    framePadRatio: 0.025, // ≈ 31px 边框厚度，接近真机屏幕黑边比例
    frameRadiusRatio: 0.09, // ≈ 112px 圆角，接近现代 iPhone
    bareRadiusRatio: 0.045, // 无边框时截图自身圆角
    titleSizeRatio: 0.052, // ≈ 65px 基准字号
    textZoneRatio: 0.3,
  },
  'ipad-129': {
    id: 'ipad-129',
    orientation: 'portrait',
    width: 2064,
    height: 2752,
    framePadRatio: 0.028, // ≈ 58px 边框厚度
    frameRadiusRatio: 0.035,
    bareRadiusRatio: 0.02,
    titleSizeRatio: 0.04,
    textZoneRatio: 0.3,
  },
}

export const DEVICE_LIST: DeviceSpec[] = [DEVICES['iphone-67'], DEVICES['ipad-129']]

/**
 * 按页面方向解析有效规格：iPad 横屏即宽高互换，其余返回竖屏基准。
 * 方向是页面级属性，每张卡片可独立横竖。
 */
export function resolveDeviceSpec(id: DeviceId, orientation: Orientation): DeviceSpec {
  const base = DEVICES[id]
  if (id === 'ipad-129' && orientation === 'landscape') {
    return { ...base, orientation: 'landscape', width: base.height, height: base.width }
  }
  return base
}
