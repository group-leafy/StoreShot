import type { ScreenshotImage } from '@/types'

/**
 * 读取用户选择的图片文件为 dataURL（导出时可直接内联，纯本地处理不上传）。
 * 失败时 reject 的 Error.message 为 i18n 键（errors.*），由调用方翻译展示。
 */
export function loadImageFile(file: File): Promise<ScreenshotImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('errors.imageType'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('errors.imageRead'))
    reader.onload = () => {
      const src = String(reader.result)
      const img = new Image()
      img.onerror = () => reject(new Error('errors.imageParse'))
      img.onload = () => {
        resolve({ src, width: img.naturalWidth, height: img.naturalHeight, name: file.name })
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  })
}
