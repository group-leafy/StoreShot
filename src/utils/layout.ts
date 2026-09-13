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
  /** 外框（含边框）的排版盒——视觉边距的基准 */
  region: { x: number; y: number; w: number; h: number }
  /** 边框厚度（向外扩张，不侵占截图内容） */
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

/** 完整显示：外框沿横轴两侧的边距（占横轴比例） */
const SIDE_MARGIN_RATIO = 0.07
/** 完整显示：文字区与外框的主轴间距（占主轴比例） */
const TEXT_GAP_RATIO = 0.02
/** 完整显示：外框与页面外侧的主轴边距（占主轴比例） */
const EDGE_MARGIN_RATIO = 0.05
/** 溢出：外框沿横轴两侧的边距（占横轴比例；若为 0 则宽截图会贴边显得局促） */
const OVERFLOW_SIDE_RATIO = 0.07

/**
 * 按模板与设备规格计算像素级布局。
 *
 * 排版沿「主轴」分区，主轴由文字位置决定：
 * - 文字在上/下：主轴为纵轴（文字区横贯页面顶部或底部）
 * - 文字在左/右：主轴为横轴（文字区纵贯页面左侧或右侧）
 * 画布方向（横/竖）只决定宽高，不改变规则本身；竖屏页面仅允许上/下。
 *
 * 边距模型：所有比例边距一律描述「外框（含伪真机边框）到页面边缘」的可视间距，
 * 截图本体的排版盒由外框盒四边内缩边框厚度得到，边框不再侵占边距。
 * 溢出模板沿主轴冲出背离文字侧的页面边缘（出血量随截图纵横比变化）；
 * 截图尺寸不足以冲出页面时（如竖屏画布传横屏截图），
 * 退化为按完整显示的主轴边距居中，避免贴边。
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

  // 外框排版盒：
  // - 纯图：整页留边居中
  // - 完整显示：横轴两侧边距 + 与文字区间隙 + 页面外侧边距
  // - 溢出：主轴占文字区以外全部（冲出页面是设计意图），横轴两侧同样留边距
  const sideFit = Math.round(crossLen * SIDE_MARGIN_RATIO)
  const sideOverflow = Math.round(crossLen * OVERFLOW_SIDE_RATIO)
  const gap = Math.round(mainLen * TEXT_GAP_RATIO)
  const edge = Math.round(mainLen * EDGE_MARGIN_RATIO)
  let region: Rect
  if (textPos === 'none') {
    const m = Math.round(crossLen * 0.06)
    region = axisRect(m, mainLen - m * 2, m, crossLen - m * 2)
  } else if (!overflow) {
    const start = textAtStart ? tzLen + gap : edge
    region = axisRect(start, mainLen - tzLen - gap - edge, sideFit, crossLen - sideFit * 2)
  } else {
    region = axisRect(textAtStart ? tzLen : 0, mainLen - tzLen, sideOverflow, crossLen - sideOverflow * 2)
  }

  // 截图本体排版盒 = 外框盒四边内缩 pad
  const innerRegion: Rect = {
    x: region.x + pad,
    y: region.y + pad,
    w: region.w - pad * 2,
    h: region.h - pad * 2,
  }

  const img = page.image
  const ratio = img && img.height > 0 ? img.width / img.height : W / H // 无图时按画布比例占位

  // 以下 outer* 为「截图本体」几何；边框自该盒四边向外扩张（见末尾 shot 计算），
  // 因此 outer 贴住 innerRegion 边缘时，外框恰好落在 region 边缘上，边距不被边框侵占
  let outerW: number
  let outerH: number
  let outerX: number
  let outerY: number

  if (textPos === 'none' || !overflow) {
    // 完整显示：等比 contain 进截图本体排版盒
    if (ratio >= innerRegion.w / innerRegion.h) {
      outerW = innerRegion.w
      outerH = innerRegion.w / ratio
    } else {
      outerH = innerRegion.h
      outerW = innerRegion.h * ratio
    }
    outerX = innerRegion.x + (innerRegion.w - outerW) / 2
    outerY = innerRegion.y + (innerRegion.h - outerH) / 2
  } else if (horizontal) {
    // 溢出（文字在左/右）：高度占满排版盒，宽度按比例
    outerH = innerRegion.h
    outerW = outerH * ratio
    const availW = mainLen - tzLen
    if (outerW > availW) {
      // 超出文字区以外的可用宽度：冲出背离文字侧的页面边缘
      outerX = textAtStart ? tzLen : mainLen - tzLen - outerW
    } else {
      // 宽度不足无法冲出页面（如横屏画布传竖屏截图）：
      // 退化为完整显示的主轴边距落位并居中，避免贴边显得局促
      const spanX = (textAtStart ? tzLen + gap : edge) + pad
      const spanW = mainLen - tzLen - gap - edge - pad * 2
      outerX = spanX + (spanW - outerW) / 2
    }
    outerY = innerRegion.y
  } else {
    // 溢出（文字在上/下）：宽度占满排版盒，高度按比例；规则同上，方向沿纵轴
    outerW = innerRegion.w
    outerH = outerW / ratio
    const availH = mainLen - tzLen
    if (outerH > availH) {
      outerY = textAtStart ? tzLen : mainLen - tzLen - outerH
    } else {
      // 高度不足无法冲出页面（如竖屏画布传横屏截图）：同上退化为完整显示边距居中
      const spanY = (textAtStart ? tzLen + gap : edge) + pad
      const spanH = mainLen - tzLen - gap - edge - pad * 2
      outerY = spanY + (spanH - outerH) / 2
    }
    outerX = innerRegion.x
  }

  const round = (n: number) => Math.round(n * 100) / 100
  const inner = { x: round(outerX), y: round(outerY), w: round(outerW), h: round(outerH) }
  const shot = {
    x: round(outerX - pad),
    y: round(outerY - pad),
    w: round(outerW + pad * 2),
    h: round(outerH + pad * 2),
  }

  return { text, shot, inner, region, pad, radius, innerRadius }
}
