<script setup lang="ts">
import { computed, ref } from 'vue'

import { FONTS } from '@/constants/presets'
import { parseTemplate } from '@/constants/templates'
import { computeLayout } from '@/utils/layout'
import { loadImageFile } from '@/utils/image'
import type { DeviceSpec, PageConfig, ScreenshotImage } from '@/types'

const props = withDefaults(
  defineProps<{
    page: PageConfig
    device: DeviceSpec
    /** 预览缩放系数（导出节点本身始终按原生分辨率布局） */
    scale: number
    /** 是否展示上传占位并接受交互 */
    interactive?: boolean
  }>(),
  { interactive: false },
)

const emit = defineEmits<{
  select: []
  upload: [image: ScreenshotImage]
}>()

const pageEl = ref<HTMLElement | null>(null)
const fileEl = ref<HTMLInputElement | null>(null)
const dragHover = ref(false)

const layout = computed(() => computeLayout(props.page, props.device))
const fontCss = computed(() => FONTS.find((f) => f.id === props.page.font)?.css ?? FONTS[0]!.css)
/** 文字区位于主轴起边（上/左） */
const textAtStart = computed(() => {
  const { textPos } = parseTemplate(props.page.template)
  return textPos === 'top' || textPos === 'left'
})
/** 文字区是否纵向纵贯页面（文字在左/右） */
const verticalText = computed(() => {
  const { textPos } = parseTemplate(props.page.template)
  return textPos === 'left' || textPos === 'right'
})
/** 尺寸基准：以竖屏宽度（宽高中较小者）为准，横竖屏切换时观感一致 */
const base = computed(() => Math.min(props.device.width, props.device.height))

const wrapStyle = computed(() => ({
  width: `${props.device.width * props.scale}px`,
  height: `${props.device.height * props.scale}px`,
}))

const pageStyle = computed(() => {
  const bg = props.page.background
  return {
    width: `${props.device.width}px`,
    height: `${props.device.height}px`,
    background:
      bg.type === 'solid'
        ? bg.color
        : `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})`,
  }
})

/** 缩放层：transform 只在这里，被导出的 .page 节点保持无 transform */
const scalerStyle = computed(() => ({
  transform: `scale(${props.scale})`,
  transformOrigin: '0 0',
}))

/** 文字区（朝版心内侧留少量视觉呼吸，标题强制水平居中） */
const textStyle = computed(() => {
  const t = layout.value.text
  if (!t) return null
  const optical = verticalText.value
    ? { paddingLeft: textAtStart.value ? '0px' : `${t.w * 0.08}px`, paddingRight: textAtStart.value ? `${t.w * 0.08}px` : '0px' }
    : { paddingTop: textAtStart.value ? '0px' : `${t.h * 0.08}px`, paddingBottom: textAtStart.value ? `${t.h * 0.08}px` : '0px' }
  return {
    position: 'absolute' as const,
    left: `${t.x}px`,
    top: `${t.y}px`,
    width: `${t.w}px`,
    height: `${t.h}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...optical,
  }
})

const titleStyle = computed(() => {
  const H = props.device.height
  const t = layout.value.text
  const size = base.value * props.device.titleSizeRatio * props.page.fontScale
  // 文字在上/下：左右留白；文字在左/右：文字条内左右留白 + 上下留白
  const padding = verticalText.value
    ? `${H * 0.03}px ${t ? t.w * 0.08 : 0}px`
    : `0 ${base.value * 0.09}px`
  return {
    fontFamily: fontCss.value,
    fontSize: `${size}px`,
    lineHeight: 1.25,
    fontWeight: 700,
    letterSpacing: '0.01em',
    color: props.page.titleColor,
    textAlign: 'center' as const,
    whiteSpace: 'pre-wrap' as const,
    padding,
    width: '100%',
    boxSizing: 'border-box' as const,
    wordBreak: 'break-word' as const,
  }
})

/** 截图外框（伪真机边框） */
const shotStyle = computed(() => {
  const { shot, radius } = layout.value
  const B = base.value
  const frame = props.page.frame
  const bg = frame === 'black' ? '#000000' : frame === 'white' ? '#FFFFFF' : 'transparent'
  const hairline = B * 0.003
  const insetLine =
    frame === 'black'
      ? `inset 0 0 0 ${hairline}px rgba(255,255,255,0.16)`
      : frame === 'white'
        ? `inset 0 0 0 ${hairline}px rgba(0,0,0,0.10)`
        : ''
  const outer = `0 ${B * 0.008}px ${B * 0.03}px rgba(0,0,0,0.25)`
  return {
    position: 'absolute' as const,
    left: `${shot.x}px`,
    top: `${shot.y}px`,
    width: `${shot.w}px`,
    height: `${shot.h}px`,
    background: bg,
    borderRadius: `${radius}px`,
    padding: 0,
    boxShadow: [outer, insetLine].filter(Boolean).join(', '),
  }
})

const imgStyle = computed(() => {
  const { inner, innerRadius } = layout.value
  return {
    position: 'absolute' as const,
    left: `${inner.x - layout.value.shot.x}px`,
    top: `${inner.y - layout.value.shot.y}px`,
    width: `${inner.w}px`,
    height: `${inner.h}px`,
    borderRadius: `${innerRadius}px`,
    objectFit: 'cover' as const,
    display: 'block' as const,
  }
})

/** 上传占位（仅预览用，尺寸按原生坐标系等比绘制） */
const placeholderStyle = computed(() => {
  const { shot, radius } = layout.value
  const B = base.value
  return {
    position: 'absolute' as const,
    left: `${shot.x}px`,
    top: `${shot.y}px`,
    width: `${shot.w}px`,
    height: `${shot.h}px`,
    border: `${B * 0.004}px dashed rgba(255,255,255,0.65)`,
    borderRadius: `${radius}px`,
    background: 'rgba(15,23,42,0.28)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${B * 0.02}px`,
    color: 'rgba(255,255,255,0.92)',
    fontSize: `${B * 0.028}px`,
    fontWeight: 600,
    cursor: 'pointer',
  }
})

function openPicker() {
  if (!props.interactive) return
  fileEl.value?.click()
}

function onPlaceholderClick() {
  emit('select')
  openPicker()
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const image = await loadImageFile(file)
    emit('upload', image)
  } catch (err) {
    console.error(err)
  } finally {
    input.value = ''
  }
}

async function onDrop(e: DragEvent) {
  if (!props.interactive) return
  dragHover.value = false
  const file = e.dataTransfer?.files[0]
  if (!file) return
  try {
    const image = await loadImageFile(file)
    emit('upload', image)
  } catch (err) {
    console.error(err)
  }
}

defineExpose({ pageEl })
</script>

<template>
  <div
    class="canvas-wrap"
    :class="{ 'drag-hover': dragHover }"
    :style="wrapStyle"
    @click="emit('select')"
    @dragover.prevent="interactive && (dragHover = true)"
    @dragleave.prevent="dragHover = false"
    @drop.prevent="onDrop"
  >
    <div class="scaler" :style="scalerStyle">
      <div ref="pageEl" class="page" :style="pageStyle">
        <!-- 文字区（模板 E 无） -->
        <div v-if="textStyle" :style="textStyle">
          <div :style="titleStyle">{{ page.title }}</div>
        </div>

        <!-- 截图 + 伪真机边框 -->
        <div v-if="page.image" :style="shotStyle">
          <img :src="page.image.src" alt="" draggable="false" :style="imgStyle" />
        </div>

        <!-- 上传占位（仅交互模式） -->
        <div
          v-else-if="interactive"
          :style="placeholderStyle"
          @click.stop="onPlaceholderClick"
        >
          <svg
            :width="base * 0.06"
            :height="base * 0.06"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="M3 15l4.5-4.5a1.5 1.5 0 0 1 2.1 0L14 15" />
            <path d="M14.5 13.5l2-2a1.5 1.5 0 0 1 2.1 0L21 14" />
            <circle cx="15.5" cy="9" r="1" fill="currentColor" stroke="none" />
          </svg>
          <span>点击或拖入 App 截图</span>
        </div>
      </div>
    </div>

    <input ref="fileEl" type="file" accept="image/*" hidden @change="onFileChange" />
  </div>
</template>

<style scoped>
.canvas-wrap {
  position: relative;
  overflow: hidden;
  flex: none;
}

.canvas-wrap.drag-hover::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 3px solid var(--accent);
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.12);
  pointer-events: none;
}

.scaler {
  position: absolute;
  left: 0;
  top: 0;
  transform-origin: 0 0;
}

.page {
  position: relative;
  overflow: hidden;
  user-select: none;
}
</style>
