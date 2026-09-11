import type { ScreenshotImage } from '@/types'

/**
 * 读取用户选择的图片文件为 dataURL（导出时可直接内联，纯本地处理不上传）。
 */
export function loadImageFile(file: File): Promise<ScreenshotImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('仅支持图片文件'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('图片读取失败'))
    reader.onload = () => {
      const src = String(reader.result)
      const img = new Image()
      img.onerror = () => reject(new Error('图片解析失败'))
      img.onload = () => {
        resolve({ src, width: img.naturalWidth, height: img.naturalHeight, name: file.name })
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  })
}
