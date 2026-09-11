<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import AppSettings from '@/components/AppSettings.vue'
import { DEVICE_LIST } from '@/constants/devices'
import { useProjectStore } from '@/stores/project'
import type { DeviceId } from '@/types'

const { t } = useI18n()
const router = useRouter()
const store = useProjectStore()

function choose(id: DeviceId) {
  store.device = id
}

function start() {
  router.push('/workspace')
}
</script>

<template>
  <div class="home">
    <div class="settings-float">
      <AppSettings />
    </div>

    <div class="hero">
      <div class="logo-mark">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="M3 15l4.5-4.5a1.5 1.5 0 0 1 2.1 0L14 15" />
          <path d="M14.5 13.5l2-2a1.5 1.5 0 0 1 2.1 0L21 14" />
          <circle cx="15.5" cy="9" r="1" fill="#fff" stroke="none" />
        </svg>
      </div>
      <h1 class="title">StoreShot</h1>
      <p class="subtitle">{{ t('home.subtitle') }}</p>
    </div>

    <section class="device-section">
      <h2 class="section-label">{{ t('home.chooseDevice') }}</h2>
      <div class="device-grid">
        <button
          v-for="d in DEVICE_LIST"
          :key="d.id"
          class="device-card"
          :class="{ active: store.device === d.id }"
          @click="choose(d.id)"
        >
          <!-- 迷你设备预览 -->
          <span class="mock" :data-device="d.id">
            <span class="mock-screen" />
          </span>
          <span class="device-name">{{ t(`devices.${d.id}.name`) }}</span>
          <span class="device-desc">{{ t(`devices.${d.id}.desc`) }}</span>
          <span class="check-badge">
            <AppIcon name="check" :size="12" />
          </span>
        </button>
      </div>

      <p v-if="store.device === 'ipad-129'" class="pad-orient-tip">{{ t('home.padTip') }}</p>
    </section>

    <button class="btn btn-primary btn-lg start-btn" @click="start">
      {{ t('home.start') }}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14 M13 6l6 6-6 6" />
      </svg>
    </button>

    <footer class="features">
      <span>{{ t('home.featureLocal') }}</span>
      <span>{{ t('home.featureResolution') }}</span>
      <span>{{ t('home.featureTemplates') }}</span>
    </footer>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 36px;
  padding: 48px 24px;
}

.settings-float {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 10;
}

.hero {
  text-align: center;
}

.logo-mark {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  margin: 0 auto 18px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.35);
}

.title {
  margin: 0;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.subtitle {
  margin: 10px 0 0;
  color: var(--text-2);
  font-size: 15px;
}

/* ---- 设备选择 ---- */
.device-section {
  width: min(680px, 100%);
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
  text-align: center;
  margin: 0 0 16px;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.device-card {
  position: relative;
  background: var(--panel);
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 28px 20px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-family: var(--font-ui);
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}

.device-card:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

.device-card.active {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft), var(--shadow-card);
}

/* 迷你机身预览 */
.mock {
  display: block;
  border: 4px solid #18181b;
  border-radius: 16px;
  background: #18181b;
  margin-bottom: 12px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14), 0 8px 20px rgba(0, 0, 0, 0.18);
}

.mock[data-device='iphone-67'] {
  width: 96px;
  height: 208px;
}

.mock[data-device='ipad-129'] {
  width: 168px;
  height: 224px;
  border-radius: 12px;
}

.mock-screen {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: linear-gradient(160deg, #6366f1, #a855f7);
}

.mock[data-device='ipad-129'] .mock-screen {
  border-radius: 8px;
}

.device-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.device-desc {
  font-size: 12px;
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}

.check-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: none;
  align-items: center;
  justify-content: center;
}

.device-card.active .check-badge {
  display: inline-flex;
}

.pad-orient-tip {
  margin: 14px 0 0;
  text-align: center;
  font-size: 12px;
  color: var(--text-3);
}

.start-btn {
  gap: 10px;
}

.features {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 12px;
  color: var(--text-3);
}
</style>
