<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import AppIcon from '@/components/AppIcon.vue'
import TemplateGlyph from '@/components/TemplateGlyph.vue'
import { parseTemplate, templatesFor } from '@/constants/templates'
import {
  FONTS,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  FONT_SCALE_STEP,
  FONT_SIZE_PRESETS,
  GRADIENT_PRESETS,
} from '@/constants/presets'
import { useProjectStore } from '@/stores/project'
import { loadImageFile } from '@/utils/image'
import type { BackgroundStyle, FrameStyle, TemplateId } from '@/types'

const { t } = useI18n()
const store = useProjectStore()
const page = computed(() => store.selectedPage)

const hasText = computed(() => parseTemplate(template.value).textPos !== 'none')
/** 选中页面的画布方向（决定可选模板方位） */
const isLandscape = computed(() => page.value?.orientation === 'landscape')
/** 当前方向下可选的排版模板 */
const templateOptions = computed(() => templatesFor(page.value?.orientation ?? 'portrait'))

/* ---------- 受控字段 ---------- */
const title = computed({
  get: () => page.value?.title ?? '',
  set: (v) => page.value && store.updatePage(page.value.id, { title: v }),
})
const titleColor = computed({
  get: () => page.value?.titleColor ?? '#ffffff',
  set: (v) => page.value && store.updatePage(page.value.id, { titleColor: v }),
})
const fontScale = computed({
  get: () => page.value?.fontScale ?? 1,
  set: (v) => page.value && store.updatePage(page.value.id, { fontScale: v }),
})
const font = computed({
  get: () => page.value?.font ?? 'sans',
  set: (v) => page.value && store.updatePage(page.value.id, { font: v }),
})
const frame = computed({
  get: () => page.value?.frame ?? 'black',
  set: (v) => page.value && store.updatePage(page.value.id, { frame: v }),
})
const template = computed({
  get: () => page.value?.template ?? 'top-fit',
  set: (v) => page.value && store.updatePage(page.value.id, { template: v }),
})

function setTemplate(tpl: TemplateId) {
  template.value = tpl
}

/* ---------- 背景 ---------- */
const isGradient = computed(() => page.value?.background.type === 'gradient')

function setBackgroundType(type: BackgroundStyle['type']) {
  const p = page.value
  if (!p) return
  const next: BackgroundStyle =
    type === 'gradient'
      ? { type: 'gradient', from: GRADIENT_PRESETS[0]!.from, to: GRADIENT_PRESETS[0]!.to, angle: GRADIENT_PRESETS[0]!.angle }
      : { type: 'solid', color: '#ffffff' }
  store.updatePage(p.id, { background: next })
}

function patchGradient(patch: Partial<{ from: string; to: string; angle: number }>) {
  const p = page.value
  if (!p || p.background.type !== 'gradient') return
  store.updatePage(p.id, { background: { ...p.background, ...patch } })
}

function patchSolidColor(color: string) {
  const p = page.value
  if (!p || !/^#[0-9a-fA-F]{6}$/.test(color)) return
  store.updatePage(p.id, { background: { type: 'solid', color: color.toLowerCase() } })
}

/** 当前命中的预设渐变 id */
const activePreset = computed(() => {
  const bg = page.value?.background
  if (!bg || bg.type !== 'gradient') return null
  return (
    GRADIENT_PRESETS.find((g) => g.from === bg.from && g.to === bg.to && g.angle === bg.angle)?.id ??
    null
  )
})

function setGradientPreset(id: string) {
  const preset = GRADIENT_PRESETS.find((g) => g.id === id)
  if (!preset) return
  patchGradient({ from: preset.from, to: preset.to, angle: preset.angle })
}

/** 标题颜色 hex 输入（失焦时校验提交） */
function commitTitleHex(v: string) {
  if (/^#[0-9a-fA-F]{6}$/.test(v)) titleColor.value = v.toLowerCase()
}

const activeSizePreset = computed(() => {
  const s = fontScale.value
  return FONT_SIZE_PRESETS.reduce((best, p) =>
    Math.abs(p.scale - s) < Math.abs(best.scale - s) ? p : best,
  ).id
})

/* ---------- 截图管理 ---------- */
const fileEl = ref<HTMLInputElement | null>(null)
const uploadError = ref('')

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !page.value) return
  try {
    const image = await loadImageFile(file)
    store.updatePage(page.value.id, { image })
    uploadError.value = ''
  } catch (err) {
    // loadImageFile 抛出的 message 为 i18n 键（errors.*）
    const key = err instanceof Error && /^errors\./.test(err.message) ? err.message : 'errors.imageRead'
    uploadError.value = t(key)
  } finally {
    input.value = ''
  }
}

function removeImage() {
  if (page.value) store.updatePage(page.value.id, { image: null })
}

const FRAME_OPTIONS: { id: FrameStyle; labelKey: string; swatch: string }[] = [
  { id: 'black', labelKey: 'panel.frameBlack', swatch: '#0a0a0a' },
  { id: 'white', labelKey: 'panel.frameWhite', swatch: '#ffffff' },
  { id: 'none', labelKey: 'panel.frameNone', swatch: 'transparent' },
]
</script>

<template>
  <aside class="panel">
    <div class="panel-head">
      <span class="panel-title">{{ t('panel.title') }}</span>
      <span v-if="store.selectedIndex >= 0" class="panel-sub">
        {{ t('panel.pageOf', { n: store.selectedIndex + 1 }) }}
      </span>
    </div>

    <template v-if="page">
      <!-- ============ 模板 ============ -->
      <section class="sec">
        <h3 class="sec-title">{{ t('panel.tplSection') }}</h3>
        <div class="tpl-grid">
          <button
            v-for="tpl in templateOptions"
            :key="tpl.id"
            class="tpl-item"
            :class="{ active: template === tpl.id }"
            :title="t(`templates.${tpl.id}`)"
            :aria-label="t(`templates.${tpl.id}`)"
            @click="setTemplate(tpl.id)"
          >
            <TemplateGlyph :text-pos="tpl.textPos" :overflow="tpl.overflow" :landscape="isLandscape" />
          </button>
        </div>
        <p class="hint">
          {{ isLandscape ? t('panel.hintLandscape') : t('panel.hintPortrait') }}
        </p>
      </section>

      <!-- ============ 文字 ============ -->
      <section class="sec" :class="{ 'sec-disabled': !hasText }">
        <h3 class="sec-title">{{ t('panel.textSection') }}</h3>
        <textarea
          v-model="title"
          :placeholder="t('panel.titlePlaceholder')"
          :maxlength="60"
          rows="2"
        />
        <div class="field-row" style="margin-top: 12px">
          <span class="field-label">{{ t('panel.colorLabel') }}</span>
          <input v-model="titleColor" type="color" />
          <input
            class="hex-input"
            type="text"
            maxlength="7"
            spellcheck="false"
            :value="titleColor.toUpperCase()"
            @change="commitTitleHex(($event.target as HTMLInputElement).value)"
          />
        </div>
        <div class="field-row" style="margin-top: 12px">
          <span class="field-label">{{ t('panel.sizeLabel') }}</span>
          <div class="seg" style="flex: 1">
            <button
              v-for="p in FONT_SIZE_PRESETS"
              :key="p.id"
              :class="{ active: activeSizePreset === p.id }"
              @click="fontScale = p.scale"
            >
              {{ t(`sizes.${p.id}`) }}
            </button>
          </div>
        </div>
        <input
          v-model.number="fontScale"
          class="range-row"
          type="range"
          :min="FONT_SCALE_MIN"
          :max="FONT_SCALE_MAX"
          :step="FONT_SCALE_STEP"
        />
        <div class="range-marks">
          <span>{{ t('panel.sizeSmallMark') }}</span>
          <span>{{ Math.round((fontScale ?? 1) * 100) }}%</span>
          <span>{{ t('panel.sizeLargeMark') }}</span>
        </div>
        <div class="field-row" style="margin-top: 12px">
          <span class="field-label">{{ t('panel.fontLabel') }}</span>
          <div class="seg" style="flex: 1">
            <button
              v-for="f in FONTS"
              :key="f.id"
              :class="{ active: font === f.id }"
              :style="{ fontFamily: f.css }"
              @click="font = f.id"
            >
              {{ t(`fonts.${f.id}`) }}
            </button>
          </div>
        </div>
        <p v-if="!hasText" class="hint">{{ t('panel.pureImageHint') }}</p>
        <p v-else class="hint">{{ t('panel.centerHint') }}</p>
      </section>

      <!-- ============ 边框 ============ -->
      <section class="sec">
        <h3 class="sec-title">{{ t('panel.frameSection') }}</h3>
        <div class="frame-row">
          <button
            v-for="opt in FRAME_OPTIONS"
            :key="opt.id"
            class="frame-item"
            :class="{ active: frame === opt.id }"
            @click="frame = opt.id"
          >
            <span class="frame-swatch" :style="{ background: opt.swatch }">
              <span v-if="opt.id === 'none'" class="frame-none">×</span>
            </span>
            <span>{{ t(opt.labelKey) }}</span>
          </button>
        </div>
      </section>

      <!-- ============ 背景 ============ -->
      <section class="sec">
        <h3 class="sec-title">{{ t('panel.bgSection') }}</h3>
        <div class="seg" style="margin-bottom: 12px">
          <button :class="{ active: isGradient }" @click="setBackgroundType('gradient')">
            {{ t('panel.gradient') }}
          </button>
          <button :class="{ active: !isGradient }" @click="setBackgroundType('solid')">
            {{ t('panel.solid') }}
          </button>
        </div>

        <template v-if="page.background.type === 'gradient'">
          <div class="swatch-grid">
            <button
              v-for="g in GRADIENT_PRESETS"
              :key="g.id"
              class="swatch"
              :class="{ active: activePreset === g.id }"
              :style="{ background: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})` }"
              :title="t(`gradients.${g.id}`)"
              @click="setGradientPreset(g.id)"
            />
          </div>
          <div class="field-row" style="margin-top: 14px">
            <span class="field-label">{{ t('panel.gradientColors') }}</span>
            <input
              :value="page.background.from"
              type="color"
              @input="patchGradient({ from: ($event.target as HTMLInputElement).value })"
            />
            <span class="arrow">→</span>
            <input
              :value="page.background.to"
              type="color"
              @input="patchGradient({ to: ($event.target as HTMLInputElement).value })"
            />
          </div>
          <div class="field-row" style="margin-top: 12px">
            <span class="field-label">{{ t('panel.angle') }}</span>
            <input
              class="range-row"
              type="range"
              min="0"
              max="360"
              step="1"
              :value="page.background.angle"
              @input="patchGradient({ angle: Number(($event.target as HTMLInputElement).value) })"
            />
            <span class="angle-val">{{ page.background.angle }}°</span>
          </div>
        </template>

        <template v-else>
          <div class="field-row">
            <span class="field-label">{{ t('panel.colorLabel') }}</span>
            <input
              :value="page.background.color"
              type="color"
              @input="patchSolidColor(($event.target as HTMLInputElement).value)"
            />
            <input
              class="hex-input"
              type="text"
              maxlength="7"
              spellcheck="false"
              :value="page.background.color.toUpperCase()"
              @change="patchSolidColor(($event.target as HTMLInputElement).value)"
            />
          </div>
        </template>
      </section>

      <!-- ============ 截图 ============ -->
      <section class="sec">
        <h3 class="sec-title">{{ t('panel.shotSection') }}</h3>
        <div v-if="page.image" class="shot-info">
          <img class="shot-thumb" :src="page.image.src" alt="" />
          <div class="shot-meta">
            <div class="shot-name" :title="page.image.name">{{ page.image.name }}</div>
            <div class="shot-dim">{{ page.image.width }} × {{ page.image.height }} px</div>
          </div>
        </div>
        <div class="shot-actions">
          <button class="btn" @click="fileEl?.click()">
            <AppIcon name="image" />{{
              page.image ? t('panel.replaceShot') : t('panel.uploadShot')
            }}
          </button>
          <button v-if="page.image" class="btn btn-icon danger" @click="removeImage">
            <AppIcon name="trash" />{{ t('panel.removeShot') }}
          </button>
        </div>
        <p class="hint">{{ t('panel.dragHint') }}</p>
        <p v-if="uploadError" class="hint" style="color: var(--danger)">{{ uploadError }}</p>
        <input ref="fileEl" type="file" accept="image/*" hidden @change="onFileChange" />
      </section>
    </template>

    <div v-else class="panel-empty">
      <AppIcon name="image" :size="28" />
      <p>{{ t('panel.selectPage') }}</p>
    </div>
  </aside>
</template>

<style scoped>
.panel {
  width: 320px;
  flex: none;
  background: var(--panel);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.panel-head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: baseline;
  gap: 10px;
  position: sticky;
  top: 0;
  background: var(--panel);
  z-index: 1;
}

.panel-title {
  font-size: 15px;
  font-weight: 700;
}

.panel-sub {
  font-size: 12px;
  color: var(--accent-strong);
  background: var(--accent-soft);
  padding: 1px 8px;
  border-radius: 99px;
}

.panel-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-3);
}

/* ---- 模板选择（仅缩略示意图，悬停显示名称） ---- */
.tpl-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tpl-item {
  width: 52px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--panel);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.tpl-item:hover {
  border-color: var(--border-strong);
  background: var(--hover);
}

.tpl-item.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  box-shadow: 0 0 0 1px var(--accent);
}

/* ---- 字段行 ---- */
.field-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.field-label {
  flex: none;
  width: 44px;
  font-size: 12px;
  color: var(--text-2);
}

.hex-input {
  width: 82px;
  flex: none;
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 12px;
  text-transform: uppercase;
}

.arrow {
  color: var(--text-3);
}

.range-row {
  margin-top: 10px;
}

.angle-val {
  flex: none;
  width: 38px;
  text-align: right;
  font-size: 12px;
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
}

.range-marks {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-3);
  margin-top: 2px;
}

/* ---- 边框选择 ---- */
.frame-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.frame-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 10px 4px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--panel);
  cursor: pointer;
  font-size: 12px;
  color: var(--text-2);
  transition: border-color 0.15s, background 0.15s;
}

.frame-item:hover {
  border-color: var(--border-strong);
}

.frame-item.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-weight: 600;
}

.frame-swatch {
  width: 40px;
  height: 26px;
  border-radius: 7px;
  border: 1px solid var(--border-strong);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
}

.frame-none {
  font-size: 16px;
  line-height: 1;
}

/* ---- 渐变 swatch ---- */
.swatch-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.swatch {
  height: 34px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
}

.swatch:hover {
  transform: translateY(-1px);
}

.swatch.active {
  box-shadow: 0 0 0 2px var(--accent), 0 0 0 4px var(--accent-soft);
}

/* ---- 截图管理 ---- */
.shot-info {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.shot-thumb {
  width: 34px;
  height: 58px;
  object-fit: cover;
  border-radius: 5px;
  border: 1px solid var(--border);
  flex: none;
}

.shot-meta {
  min-width: 0;
}

.shot-name {
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shot-dim {
  font-size: 11px;
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}

.shot-actions {
  display: flex;
  gap: 8px;
}
</style>
