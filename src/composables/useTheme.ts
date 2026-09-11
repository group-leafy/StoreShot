import { computed, ref, watchEffect } from 'vue'

export type ThemeMode = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'storeshot-theme'

const ORDER: ThemeMode[] = ['system', 'light', 'dark']

function readStored(): ThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'system' || v === 'light' || v === 'dark') return v
  } catch {
    /* 忽略读取失败 */
  }
  return 'system'
}

/* 模块级共享状态：多个组件同时使用同一份主题 */
const mode = ref<ThemeMode>(readStored())

const media =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null

/** 系统当前是否深色（响应式，供“跟随系统”模式使用） */
const systemDark = ref(media?.matches ?? false)
media?.addEventListener('change', (e) => {
  systemDark.value = e.matches
})

const isDark = computed(
  () => mode.value === 'dark' || (mode.value === 'system' && systemDark.value),
)

watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDark.value)
})

export function useTheme() {
  function setMode(next: ThemeMode) {
    mode.value = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* 忽略写入失败 */
    }
  }

  /** 点击循环切换：跟随系统 → 浅色 → 深色 */
  function cycle() {
    setMode(ORDER[(ORDER.indexOf(mode.value) + 1) % ORDER.length]!)
  }

  return { mode, isDark, setMode, cycle }
}
