<script setup lang="ts">
export type IconName =
  | 'trash'
  | 'copy'
  | 'download'
  | 'plus'
  | 'arrow-left'
  | 'image'
  | 'check'
  | 'grip'
  | 'spinner'
  | 'undo'
  | 'sun'
  | 'moon'
  | 'monitor'
  | 'globe'

const PATHS: Record<IconName, string> = {
  trash: 'M4 7h16 M10 11v6 M14 11v6 M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12 M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2',
  copy: 'M9 9h9a1.5 1.5 0 0 1 1.5 1.5V20a1.5 1.5 0 0 1-1.5 1.5H9A1.5 1.5 0 0 1 7.5 20v-9.5A1.5 1.5 0 0 1 9 9Z M4.5 15H4A1.5 1.5 0 0 1 2.5 13.5V4A1.5 1.5 0 0 1 4 2.5h9.5A1.5 1.5 0 0 1 15 4v.5',
  download: 'M12 3v12 M7 10l5 5 5-5 M4 20h16',
  plus: 'M12 5v14 M5 12h14',
  'arrow-left': 'M19 12H5 M11 6l-6 6 6 6',
  image: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z M3 15l4.6-4.6a1.4 1.4 0 0 1 2 0L13.5 14 M13.6 13.4l1.8-1.8a1.4 1.4 0 0 1 2 0L21 15.2 M16 9.2h.01',
  check: 'M4.5 12.5l5 5 10-11',
  grip: 'M9 5.5h.01 M9 12h.01 M9 18.5h.01 M15 5.5h.01 M15 12h.01 M15 18.5h.01',
  spinner: 'M12 3a9 9 0 1 0 9 9',
  undo: 'M4 10h11a5 5 0 0 1 0 10h-3 M4 10l4-4 M4 10l4 4',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M12 2.5v2 M12 19.5v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2.5 12h2 M19.5 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
  moon: 'M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z',
  monitor: 'M3 5h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z M8 21h8 M12 17v4',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3 12h18 M12 3a13.5 13.5 0 0 1 0 18 M12 3a13.5 13.5 0 0 0 0 18',
}

withDefaults(defineProps<{ name: IconName; size?: number }>(), { size: 16 })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="name === 'spinner' ? 2.4 : 1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="{ spin: name === 'spinner' }"
    aria-hidden="true"
  >
    <path :d="PATHS[name]" />
  </svg>
</template>

<style scoped>
.spin {
  animation: rotate 0.8s linear infinite;
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
