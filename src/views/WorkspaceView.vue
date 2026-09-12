<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import AppSettings from '@/components/AppSettings.vue'
import PageCard from '@/components/PageCard.vue'
import PropertyPanel from '@/components/PropertyPanel.vue'
import { DEVICES } from '@/constants/devices'
import { useProjectStore } from '@/stores/project'
import type { DeviceId } from '@/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useProjectStore()

/** 返回首页（确认弹窗与数据清理由路由守卫统一处理，浏览器返回同样生效） */
function goBack() {
  router.push('/')
}

onMounted(() => {
  // 刷新后从 URL 恢复设备（Pinia 只在内存，不恢复会退回默认 iPhone）；非法值忽略
  const q = route.query.device
  if (typeof q === 'string' && q in DEVICES) store.device = q as DeviceId
  // 直接进入工作区时自动创建第一页
  if (store.pages.length === 0) store.addPage()
  if (areaEl.value) ro.observe(areaEl.value)
})

onBeforeUnmount(() => {
  ro.disconnect()
  rowRo.disconnect()
})

/* ---- 预览高度自适应：卡片在保持比例的前提下尽可能占满可用高度 ---- */
const areaEl = ref<HTMLElement | null>(null)
const areaHeight = ref(700)

const ro = new ResizeObserver((entries) => {
  for (const e of entries) {
    areaHeight.value = e.contentRect.height
  }
})

/** 页面卡片除画布外的固定开销：卡片头部 ~34 + 间距 8 + 内边距 20 + 边框 2 */
const CARD_CHROME = 66
/** 底部提示行高度（含外边距） */
const TIP_HEIGHT = 42

const previewHeight = computed(() =>
  Math.max(280, Math.round(areaHeight.value - CARD_CHROME - TIP_HEIGHT)),
)

/* ---- 新建卡片尺寸：实时测量第一张页面卡片，保证完全一致 ---- */
const rowEl = ref<HTMLElement | null>(null)
const addCardSize = ref({ w: 220, h: previewHeight.value + CARD_CHROME })

const rowRo = new ResizeObserver(() => {
  const card = rowEl.value?.querySelector('.page-card') as HTMLElement | null
  if (card) addCardSize.value = { w: card.offsetWidth, h: card.offsetHeight }
})

watch(rowEl, (el) => {
  rowRo.disconnect()
  if (el) rowRo.observe(el)
})
</script>

<template>
  <div class="workspace">
    <header class="topbar">
      <button class="btn" @click="goBack">
        <AppIcon name="arrow-left" />{{ t('workspace.back') }}
      </button>
      <div class="topbar-title">{{ t('workspace.title') }}</div>
      <div class="device-chip">
        {{ t(`devices.${store.deviceSpec.id}.name`) }} · {{ store.deviceSpec.width }} ×
        {{ store.deviceSpec.height }} px
      </div>
      <AppSettings />
    </header>

    <div class="workspace-body">
      <PropertyPanel />

      <main ref="areaEl" class="pages-area">
        <div v-if="store.pages.length > 0" ref="rowEl" class="pages-row-wrap">
          <TransitionGroup name="card" tag="div" class="pages-row">
            <PageCard
              v-for="(page, i) in store.pages"
              :key="page.id"
              :page="page"
              :index="i"
              :device="store.deviceSpec"
              :preview-height="previewHeight"
            />
            <button
              key="__add"
              class="add-card"
              type="button"
              :style="{ width: `${addCardSize.w}px`, height: `${addCardSize.h}px` }"
              @click="store.addPage()"
            >
              <AppIcon name="plus" :size="26" />
              <span>{{ t('workspace.addPage') }}</span>
            </button>
          </TransitionGroup>
        </div>

        <div v-else class="empty-state">
          <button class="btn btn-primary btn-lg" @click="store.addPage()">
            <AppIcon name="plus" />{{ t('workspace.createFirst') }}
          </button>
        </div>

        <p class="pages-tip">{{ t('workspace.tip') }}</p>
      </main>
    </div>
  </div>
</template>

<style scoped>
.workspace {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  flex: none;
  height: 56px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
}

.topbar-title {
  font-size: 15px;
  font-weight: 700;
}

.device-chip {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-2);
  background: var(--bg-inset);
  border: 1px solid var(--border);
  padding: 3px 12px;
  border-radius: 99px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.workspace-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.pages-area {
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: 24px 28px;
}

.pages-row-wrap {
  width: fit-content;
  min-width: min-content;
}

.pages-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

/* 新建页面卡片（列表最后一项），尺寸与页面卡片保持一致 */
.add-card {
  flex: none;
  min-width: 180px;
  min-height: 240px;
  border: 1.5px dashed var(--border-strong);
  border-radius: var(--radius);
  background: transparent;
  color: var(--text-3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 13px;
  font-family: var(--font-ui);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.add-card:hover {
  border-color: var(--accent);
  color: var(--accent-strong);
  background: var(--accent-soft);
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pages-tip {
  margin: 16px 0 0;
  font-size: 12px;
  color: var(--text-3);
}

/* 列表重排过渡 */
.card-move {
  transition: transform 0.25s ease;
}
</style>
