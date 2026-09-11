<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import AppIcon, { type IconName } from '@/components/AppIcon.vue'
import { useTheme, type ThemeMode } from '@/composables/useTheme'
import { LOCALES, setLocale, type LocaleCode } from '@/locales'

const { locale, t } = useI18n()
const { mode, cycle } = useTheme()

const THEME_ICONS: Record<ThemeMode, IconName> = {
  system: 'monitor',
  light: 'sun',
  dark: 'moon',
}

function onLangChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value
  setLocale(value as LocaleCode)
}
</script>

<template>
  <div class="app-settings">
    <button
      class="btn btn-icon setting-btn"
      :title="t(`theme.${mode}`)"
      :aria-label="t(`theme.${mode}`)"
      @click="cycle"
    >
      <AppIcon :name="THEME_ICONS[mode]" :size="15" />
    </button>

    <!-- select 自身即整个按钮区域；地球图标为穿透叠加层，点击任意位置都能唤起下拉 -->
    <div class="lang-select">
      <AppIcon name="globe" :size="14" class="globe" />
      <select aria-label="Language" :title="locale" :value="locale" @change="onLangChange">
        <option v-for="l in LOCALES" :key="l.code" :value="l.code">{{ l.nativeName }}</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.app-settings {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.setting-btn {
  width: 32px;
  height: 30px;
  justify-content: center;
  padding: 0;
}

.lang-select {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.globe {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-2);
  pointer-events: none;
}

.lang-select select {
  appearance: none;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--panel);
  color: var(--text);
  font-family: var(--font-ui);
  font-size: 12px;
  /* 左侧给地球图标留位，右侧给自绘箭头留位 */
  padding: 0 22px 0 30px;
  cursor: pointer;
  outline: none;
  background-image: linear-gradient(45deg, transparent 50%, var(--text-3) 50%),
    linear-gradient(135deg, var(--text-3) 50%, transparent 50%);
  background-position: calc(100% - 8px) 55%, calc(100% - 4px) 55%;
  background-size: 4px 4px, 4px 4px;
  background-repeat: no-repeat;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.lang-select select:hover {
  border-color: var(--border-strong);
}

.lang-select select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
</style>
