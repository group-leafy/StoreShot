import { toPng } from 'html-to-image'

/**
 * 将页面节点导出为严格符合设备原生分辨率的 PNG 并触发下载。
 * - pixelRatio 固定为 1：节点本身即按导出尺寸（如 1242×2688）布局
 * - skipFonts：仅使用系统字体，无需内联 Web 字体，避免多余网络请求
 */
export async function exportNodeAsPng(node: HTMLElement, width: number, height: number, filename: string) {
  const dataUrl = await toPng(node, {
    width,
    height,
    pixelRatio: 1,
    cacheBust: true,
    skipFonts: true,
    // 双保险：即使节点带有预览缩放 transform，导出克隆也强制按原始尺寸渲染
    style: { transform: 'none', transformOrigin: '0 0' },
  })
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}

/** 触发浏览器下载 dataURL */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
