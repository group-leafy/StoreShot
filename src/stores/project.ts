import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { DEVICES } from '@/constants/devices'
import { coerceTemplate } from '@/constants/templates'
import { DEFAULT_BACKGROUND } from '@/constants/presets'
import { uid } from '@/utils/id'
import type { BackgroundStyle, DeviceId, Orientation, PageConfig } from '@/types'

/** 新建页面的默认标题文案 */
const DEFAULT_TITLE = '写下你的卖点标题'

export const useProjectStore = defineStore('project', () => {
  /** 当前设备规格（竖屏基准；横竖由每页自身决定） */
  const device = ref<DeviceId>('iphone-67')
  /** 全部页面 */
  const pages = ref<PageConfig[]>([])
  /** 当前编辑中的页面 id */
  const selectedId = ref<string | null>(null)
  /** 拖拽排序中正在拖动的页面 id */
  const draggingId = ref<string | null>(null)

  const deviceSpec = computed(() => DEVICES[device.value])

  const selectedPage = computed(
    () => pages.value.find((p) => p.id === selectedId.value) ?? null,
  )

  const selectedIndex = computed(() =>
    pages.value.findIndex((p) => p.id === selectedId.value),
  )

  function createPage(orientation: Orientation, background: BackgroundStyle = DEFAULT_BACKGROUND): PageConfig {
    return {
      id: uid('page'),
      orientation,
      template: 'top-fit',
      title: DEFAULT_TITLE,
      titleColor: '#FFFFFF',
      fontScale: 1,
      font: 'sans',
      frame: 'black',
      background: JSON.parse(JSON.stringify(background)),
      image: null,
    }
  }

  /** 新增页面（追加到列表末尾）并选中；iPad 新页沿用上一页的横竖方向 */
  function addPage() {
    const isPad = device.value === 'ipad-129'
    const inherit = isPad ? (pages.value.at(-1)?.orientation ?? 'portrait') : 'portrait'
    const page = createPage(inherit)
    pages.value.push(page)
    selectedId.value = page.id
    return page
  }

  /** 切换页面画布方向（仅 iPad）；竖屏下自动把 左/右 排版映射为 上/下 */
  function setPageOrientation(id: string, orientation: Orientation) {
    const page = pages.value.find((p) => p.id === id)
    if (!page || device.value !== 'ipad-129') return
    page.orientation = orientation
    page.template = coerceTemplate(page.template, orientation)
  }

  /** 复制页面并插入到其后方 */
  function duplicatePage(id: string) {
    const index = pages.value.findIndex((p) => p.id === id)
    if (index === -1) return
    const source = pages.value[index]!
    const copy: PageConfig = {
      ...JSON.parse(JSON.stringify(source)),
      id: uid('page'),
    }
    pages.value.splice(index + 1, 0, copy)
    selectedId.value = copy.id
  }

  /** 删除页面 */
  function removePage(id: string) {
    const index = pages.value.findIndex((p) => p.id === id)
    if (index === -1) return
    pages.value.splice(index, 1)
    if (selectedId.value === id) {
      const next = pages.value[Math.min(index, pages.value.length - 1)]
      selectedId.value = next ? next.id : null
    }
  }

  /** 更新页面局部配置 */
  function updatePage(id: string, patch: Partial<Omit<PageConfig, 'id'>>) {
    const page = pages.value.find((p) => p.id === id)
    if (!page) return
    Object.assign(page, patch)
  }

  /** 将 draggingId 对应页面移动到目标下标（拖拽排序） */
  function moveDraggingTo(index: number) {
    const from = pages.value.findIndex((p) => p.id === draggingId.value)
    if (from === -1 || index < 0 || index >= pages.value.length) return
    if (from === index) return
    const [item] = pages.value.splice(from, 1)
    if (item) pages.value.splice(index, 0, item)
  }

  /** 页面在列表中的下标 */
  function indexOfPage(id: string) {
    return pages.value.findIndex((p) => p.id === id)
  }

  function $reset() {
    pages.value = []
    selectedId.value = null
    draggingId.value = null
  }

  return {
    device,
    pages,
    selectedId,
    draggingId,
    deviceSpec,
    selectedPage,
    selectedIndex,
    addPage,
    setPageOrientation,
    duplicatePage,
    removePage,
    updatePage,
    moveDraggingTo,
    indexOfPage,
    $reset,
  }
})
