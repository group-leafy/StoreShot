import { parseTemplate } from '@/constants/templates'
import type { DeviceSpec, PageConfig } from '@/types'

/** 文字 / 截图区域的几何信息（原生导出坐标系，px） */
export interface PageLayout {
  /** 文字区（纯图模式无文字区） */
  text: { x: number; y: number; w: number; h: number } | null
  /** 截图外框（边框自截图四边向外扩张）位置与尺寸 */
  shot: { x: number; y: number; w: number; h: number }
  /** 截图本体（不含边框）位置与尺寸 */
  inner: { x: number; y: number; w: number; h: number }
  /** 图片展示区域（用于占位上传提示） */
  region: { x: number; y: number; w: number; h: number }
  /** 边框厚度（向外扩张，不侵入截图内容） */
  pad: number
  /** 外框圆角 */
  radius: number
  /** 截图本体圆角 */
  innerRadius: number
}

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/** 溢出类模板中，被裁切的截图比例 */
const OVERFLOW_RATIO = 0.2

/** 完整显示模板：图片与页面沿横轴的边距（占横轴比例） */
const SIDE_MARGIN_RATIO = 0.07
/** 完整显示模板：图片与文字区间距、与页面外边距（占主轴比例） */
const TEXT_GAP_RATIO = 0.02
const EDGE_MARGIN_RATIO = 0.045

/**
 * 按模板与设备规格计算像素级布局。
 *
 * 排版沿「主轴」分区，主轴由文字位置决定：
 * - 文字在上/下：主轴为纵轴（文字区横贯页面顶部或底部）
 * - 文字在左/右：主轴为横轴（文字区纵贯页面左侧或右侧）
 * 画布方向（横/竖）只决定宽高，不改变规则本身；竖屏页面仅允许上/下。
 * 全部使用绝对 px 定位，保证预览与导出完全一致。
 */
export function computeLayout(page: PageConfig, device: DeviceSpec): PageLayout {
  const { width: W, height: H } = device
  const { textPos, overflow } = parseTemplate(page.template)
  const horizontal = textPos === 'left' || textPos === 'right'
  /** 文字区位于主轴起边（上/左） */
  const textAtStart = textPos === 'top' || textPos === 'left'

  /** 主轴长度（文字在上/下时为高，在左/右时为宽） */
  const mainLen = horizontal ? W : H
  /** 横轴长度 */
  const crossLen = horizontal ? H : W

  // 伪真机几何以「竖屏宽度」为基准，横竖屏切换时保持一致的设备观感
  const frameBase = Math.min(W, H)
  const hasFrame = page.frame !== 'none'
  const pad = hasFrame ? Math.round(frameBase * device.framePadRatio) : 0
  const radius = hasFrame
    ? Math.round(frameBase * device.frameRadiusRatio)
    : Math.round(frameBase * device.bareRadiusRatio)
  const innerRadius = hasFrame ? Math.max(radius - pad, 0) : radius

  /** 主轴区间 + 横轴区间 → 页面矩形 */
  const axisRect = (start: number, len: number, crossStart: number, crossSize: number): Rect =>
    horizontal
      ? { x: start, y: crossStart, w: len, h: crossSize }
      : { x: crossStart, y: start, w: crossSize, h: len }

  const tzLen = Math.round(mainLen * device.textZoneRatio)
  const text =
    textPos === 'none'
      ? null
      : axisRect(textAtStart ? 0 : mainLen - tzLen, tzLen, 0, crossLen)

  // 图片展示区域：
  // - 纯图：整页留边居中
  // - 完整显示：四周留内边距（沿横轴、与文字区间隙、页面外侧边距）
  // - 溢出：占文字区以外的全部空间（裁切是设计意图）
  let region: Rect
  if (textPos === 'none') {
    const m = Math.round(crossLen * 0.06)
    region = axisRect(m, mainLen - m * 2, m, crossLen - m * 2)
  } else if (!overflow) {
    const side = Math.round(crossLen * SIDE_MARGIN_RATIO)
    const gap = Math.round(mainLen * TEXT_GAP_RATIO)
    const edge = Math.round(mainLen * EDGE_MARGIN_RATIO)
    const start = textAtStart ? tzLen + gap : edge
    region = axisRect(start, mainLen - tzLen - gap - edge, side, crossLen - side * 2)
  } else {
    region = axisRect(textAtStart ? tzLen : 0, mainLen - tzLen, 0, crossLen)
  }

  const img = page.image
  const ratio = img && img.height > 0 ? img.width / img.height : W / H // 无图时按画布比例占位

  // 以下 outer* 为「截图本体」几何：直接按 contain / 溢出规则落位，
  // 边框不挤占图片内容，而是从该盒四边向外扩张（见末尾 shot 计算）
  let outerW: number
  let outerH: number
  let outerX: number
  let outerY: number

  if (textPos === 'none' || !overflow) {
    // 完整显示：等比 contain 进区域
    if (ratio >= region.w / region.h) {
      outerW = region.w
      outerH = region.w / ratio
    } else {
      outerH = region.h
      outerW = region.h * ratio
    }
    outerX = region.x + (region.w - outerW) / 2
    outerY = region.y + (region.h - outerH) / 2
  } else if (horizontal) {
    // 溢出（文字在左/右）：截图沿横轴 80% 落在区域内，20% 溢出被页面裁切
    outerW = region.w / (1 - OVERFLOW_RATIO)
    outerH = outerW / ratio
    if (outerH > region.h) {
      // 过高截图（如横屏画布传竖屏图）：等比缩到区域高度内，改为贴住溢出侧页面边缘，
      // 保留“冲出画布”的沉浸视觉（否则图片会浮在区域中间、溢出感丢失）
      outerH = region.h
      outerW = outerH * ratio
      outerX = textAtStart ? W - outerW : 0
    } else {
      outerX = textAtStart ? region.x : region.x + region.w - outerW
    }
    outerY = region.y + (region.h - outerH) / 2
  } else {
    // 溢出（文字在上/下）：截图沿纵轴 80% 落在区域内，20% 溢出被页面裁切
    outerH = region.h / (1 - OVERFLOW_RATIO)
    outerW = outerH * ratio
    if (outerW > region.w) {
      // 过宽截图（如竖屏画布传横屏图）：等比缩到页宽内，改为贴住溢出侧页面边缘
      outerW = region.w
      outerH = outerW / ratio
      outerY = textAtStart ? H - outerH : 0
    } else {
      outerY = textAtStart ? region.y : region.y + region.h - outerH
    }
    outerX = region.x + (region.w - outerW) / 2
  }

  const round = (n: number) => Math.round(n * 100) / 100
  // 截图本体直接落位；外框四边向外扩 pad，图片内容不被边框吃掉
  const inner = { x: round(outerX), y: round(outerY), w: round(outerW), h: round(outerH) }
  const shot = {
    x: round(outerX - pad),
    y: round(outerY - pad),
    w: round(outerW + pad * 2),
    h: round(outerH + pad * 2),
  }

  return { text, shot, inner, region, pad, radius, innerRadius }
}
