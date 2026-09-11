<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import AppIcon from '@/components/AppIcon.vue'
import PageCanvas from '@/components/PageCanvas.vue'
import { resolveDeviceSpec } from '@/constants/devices'
import { useProjectStore } from '@/stores/project'
import { exportNodeAsPng } from '@/utils/export'
import type { DeviceSpec, PageConfig } from '@/types'

const { t } = useI18n()

const props = defineProps<{
  page: PageConfig
  index: number
  /** 设备竖屏基准规格（页面方向由 page 自身决定） */
  device: DeviceSpec
  /** 预览高度（px），宽度按设备比例自适应 */
  previewHeight: number
}>()

const store = useProjectStore()

/** 按页面方向解析出的有效规格 */
const spec = computed(() => resolveDeviceSpec(props.device.id, props.page.orientation))
const scale = computed(() => props.previewHeight / spec.value.height)
const canRotate = computed(() => props.device.id === 'ipad-129')

const isSelected = computed(() => store.selectedId === props.page.id)
const isDragging = computed(() => store.draggingId === props.page.id)

const canvasRef = ref<InstanceType<typeof PageCanvas> | null>(null)
const exporting = ref(false)
const exportError = ref(false)

function select() {
  store.selectedId = props.page.id
}

async function download() {
  const el = canvasRef.value?.pageEl
  if (!el || exporting.value) return
  exporting.value = true
  exportError.value = false
  const orientSuffix = spec.value.orientation === 'landscape' ? '-landscape' : ''
  try {
    await exportNodeAsPng(
      el,
      spec.value.width,
      spec.value.height,
      `StoreShot_${spec.value.id}${orientSuffix}_${props.index + 1}.png`,
    )
  } catch (err) {
    console.error('导出失败', err)
    exportError.value = true
    setTimeout(() => (exportError.value = false), 2500)
  } finally {
    exporting.value = false
  }
}

/* ---- 拖拽排序 ---- */
function onDragStart(e: DragEvent) {
  store.draggingId = props.page.id
  e.dataTransfer?.setData('text/plain', props.page.id)
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onDragEnter() {
  if (!store.draggingId || store.draggingId === props.page.id) return
  store.moveDraggingTo(props.index)
}

function onDragEnd() {
  store.draggingId = null
}

function onUpload(image: PageConfig['image']) {
  if (image) store.updatePage(props.page.id, { image })
}
</script>

<template>
  <div
    class="page-card"
    :class="{ selected: isSelected, dragging: isDragging }"
    draggable="true"
    @click="select"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @dragover.prevent
    @dragenter.prevent="onDragEnter"
  >
    <!-- 功能区 -->
    <div class="card-header">
      <span class="card-index">{{ index + 1 }}</span>
      <div v-if="canRotate" class="orient-toggle" :title="t('workspace.orientToggleTitle')" @click.stop>
        <button
          :class="{ active: page.orientation === 'portrait' }"
          :title="t('workspace.portraitCanvas')"
          @click="store.setPageOrientation(page.id, 'portrait')"
        >
          {{ t('workspace.portraitShort') }}
        </button>
        <button
          :class="{ active: page.orientation === 'landscape' }"
          :title="t('workspace.landscapeCanvas')"
          @click="store.setPageOrientation(page.id, 'landscape')"
        >
          {{ t('workspace.landscapeShort') }}
        </button>
      </div>
      <div class="card-actions">
        <button
          class="btn btn-icon"
          :title="t('workspace.duplicateTitle')"
          @click.stop="store.duplicatePage(page.id)"
        >
          <AppIcon name="copy" />{{ t('workspace.copy') }}
        </button>
        <button
          class="btn btn-icon"
          :title="t('workspace.exportTitle')"
          :disabled="!page.image || exporting"
          @click.stop="download"
        >
          <AppIcon :name="exporting ? 'spinner' : 'download'" />{{
            exporting ? t('workspace.exporting') : t('workspace.download')
          }}
        </button>
        <button
          class="btn btn-icon danger"
          :title="t('workspace.deleteTitle')"
          @click.stop="store.removePage(page.id)"
        >
          <AppIcon name="trash" />{{ t('workspace.deleteShort') }}
        </button>
      </div>
    </div>

    <!-- 展示区 -->
    <div class="card-body">
      <PageCanvas
        ref="canvasRef"
        :page="page"
        :device="spec"
        :scale="scale"
        interactive
        @upload="onUpload"
      />
    </div>

    <div v-if="exportError" class="card-error">{{ t('workspace.exportFailed') }}</div>
  </div>
</template>

<style scoped>
.page-card {
  width: fit-content;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-card);
  padding: 10px;
  cursor: grab;
  transition: border-color 0.15s, box-shadow 0.15s, opacity 0.15s;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: none;
}

.page-card:hover {
  border-color: var(--border-strong);
}

.page-card.selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft), var(--shadow-card);
}

.page-card.dragging {
  opacity: 0.35;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 230px;
}

.card-index {
  flex: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 卡片级 横/竖 方向切换（仅 iPad） */
.orient-toggle {
  flex: none;
  display: flex;
  background: var(--bg-inset);
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
}

.orient-toggle button {
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  padding: 2px 7px;
  border-radius: 5px;
  cursor: pointer;
  font-family: var(--font-ui);
  transition: background 0.15s, color 0.15s;
}

.orient-toggle button.active {
  background: var(--panel);
  color: var(--accent-strong);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.card-actions {
  margin-left: auto;
  display: flex;
  gap: 4px;
}

.card-body {
  border-radius: var(--radius-sm);
  overflow: hidden;
  font-size: 0;
  align-self: center;
}

.card-error {
  font-size: 12px;
  color: var(--danger);
  text-align: center;
}
</style>
