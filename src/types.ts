/** 设备标识 */
export type DeviceId = 'iphone-67' | 'ipad-129'

/** 画布方向：竖屏 / 横屏 */
export type Orientation = 'portrait' | 'landscape'

/** 文字区位置：上 / 下 / 左 / 右 / 无（纯图） */
export type TextPos = 'top' | 'bottom' | 'left' | 'right' | 'none'

/**
 * 模板标识：`${文字位置}-${fit|overflow}`
 * - fit：图片完整显示
 * - overflow：图片沿文字反方向溢出，20% 被页面裁切
 * 竖屏页面仅支持上/下（与 iPhone 一致），横屏页面支持全部方位。
 */
export type TemplateId =
  | 'top-fit'
  | 'top-overflow'
  | 'bottom-fit'
  | 'bottom-overflow'
  | 'left-fit'
  | 'left-overflow'
  | 'right-fit'
  | 'right-overflow'
  | 'none'

/** 边框样式：黑边框 / 白边框 / 无边框 */
export type FrameStyle = 'black' | 'white' | 'none'

/** 字体标识 */
export type FontId = 'sans' | 'rounded' | 'serif'

/** 背景样式：纯色 或 渐变 */
export type BackgroundStyle =
  | { type: 'solid'; color: string }
  | { type: 'gradient'; from: string; to: string; angle: number }

/** 用户上传的截图（dataURL + 原始尺寸） */
export interface ScreenshotImage {
  src: string
  width: number
  height: number
  name: string
}

/** 单个商店图页面的全部配置 */
export interface PageConfig {
  id: string
  /** 页面画布方向（iPad 可逐页切换横竖；iPhone 固定竖屏） */
  orientation: Orientation
  template: TemplateId
  /** 标题文字（空字符串表示不渲染标题） */
  title: string
  titleColor: string
  /** 字号缩放系数（相对设备基准字号） */
  fontScale: number
  font: FontId
  frame: FrameStyle
  background: BackgroundStyle
  image: ScreenshotImage | null
}

/** 设备规格 */
export interface DeviceSpec {
  id: DeviceId
  /** 展示名 */
  label: string
  /** 副标题说明 */
  desc: string
  /** 画布方向（iPad 支持横屏，iPhone 固定竖屏） */
  orientation: Orientation
  /** 导出宽度（App Store 原生要求，px） */
  width: number
  /** 导出高度（App Store 原生要求，px） */
  height: number
  /** 伪真机边框内边距（占宽度比例） */
  framePadRatio: number
  /** 伪真机圆角（占宽度比例） */
  frameRadiusRatio: number
  /** 无边框时截图圆角（占宽度比例） */
  bareRadiusRatio: number
  /** 标题基准字号（占宽度比例） */
  titleSizeRatio: number
  /** 文字区高度（占页面高度比例） */
  textZoneRatio: number
}
