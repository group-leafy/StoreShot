import { createI18n } from 'vue-i18n'

import de from './de'
import en from './en'
import es from './es'
import ja from './ja'
import ko from './ko'
import pt from './pt'
import zhCN from './zh-CN'
import zhTW from './zh-TW'

export const LOCALE_CODES = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'de', 'es', 'pt'] as const

export type LocaleCode = (typeof LOCALE_CODES)[number]

/** 语言切换器选项（nativeName 为各语言自称，跨语言保持原样） */
export const LOCALES: { code: LocaleCode; nativeName: string }[] = [
  { code: 'zh-CN', nativeName: '简体中文' },
  { code: 'zh-TW', nativeName: '繁體中文' },
  { code: 'en', nativeName: 'English' },
  { code: 'ja', nativeName: '日本語' },
  { code: 'ko', nativeName: '한국어' },
  { code: 'de', nativeName: 'Deutsch' },
  { code: 'es', nativeName: 'Español' },
  { code: 'pt', nativeName: 'Português' },
]

const STORAGE_KEY = 'storeshot-locale'

function isLocaleCode(v: string | null): v is LocaleCode {
  return !!v && (LOCALE_CODES as readonly string[]).includes(v)
}

/** 语言探测：本地存储 > 浏览器首选语言 > 英文兜底 */
function detectLocale(): LocaleCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isLocaleCode(stored)) return stored
  } catch {
    /* 隐私模式等场景下忽略读取失败 */
  }
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const tag of tags) {
    const l = tag.toLowerCase()
    if (l.startsWith('zh')) return /(tw|hk|mo|hant)/.test(l) ? 'zh-TW' : 'zh-CN'
    if (l.startsWith('ja')) return 'ja'
    if (l.startsWith('ko')) return 'ko'
    if (l.startsWith('de')) return 'de'
    if (l.startsWith('es')) return 'es'
    if (l.startsWith('pt')) return 'pt'
    if (l.startsWith('en')) return 'en'
  }
  return 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: {
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    en,
    ja,
    ko,
    de,
    es,
    pt,
  },
})

function applyDocumentMeta(code: LocaleCode) {
  document.documentElement.lang = code
  document.title = i18n.global.t('meta.title')
}

/** 切换语言并持久化 */
export function setLocale(code: LocaleCode) {
  i18n.global.locale.value = code
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    /* 忽略写入失败 */
  }
  applyDocumentMeta(code)
}

applyDocumentMeta(i18n.global.locale.value as LocaleCode)
