<script setup lang="ts">
import type { TextPos } from '@/types'

defineProps<{
  textPos: TextPos
  /** 图片是否溢出裁切 */
  overflow?: boolean
  /** 画布横屏（示意例外形随之变宽） */
  landscape?: boolean
}>()
</script>

<template>
  <span class="glyph" :class="[landscape ? 'wide' : 'tall']" :data-pos="textPos">
    <span v-if="textPos !== 'none'" class="g-text" />
    <span class="g-img" :class="{ bleed: overflow }" />
  </span>
</template>

<style scoped>
.glyph {
  position: relative;
  display: block;
  border-radius: 4px;
  background: #eef2ff;
  border: 1px solid #dbe1f5;
  overflow: hidden;
  flex: none;
}

/* 画布外形：竖屏瘦高 / 横屏扁宽 */
.glyph.tall {
  width: 30px;
  height: 46px;
}

.glyph.wide {
  width: 46px;
  height: 30px;
}

/* 文字条：上/下为横条，左/右为竖条 */
.g-text {
  position: absolute;
  background: #a5b4fc;
  border-radius: 2px;
}

.glyph[data-pos='top'] .g-text,
.glyph[data-pos='bottom'] .g-text {
  left: 5px;
  right: 5px;
  height: 4px;
}

.glyph[data-pos='top'] .g-text {
  top: 6px;
}

.glyph[data-pos='bottom'] .g-text {
  bottom: 6px;
}

.glyph[data-pos='left'] .g-text,
.glyph[data-pos='right'] .g-text {
  top: 5px;
  bottom: 5px;
  width: 5px;
}

.glyph[data-pos='left'] .g-text {
  left: 6px;
}

.glyph[data-pos='right'] .g-text {
  right: 6px;
}

/* 图片块 */
.g-img {
  position: absolute;
  border-radius: 3px;
  background: linear-gradient(135deg, #818cf8, #6366f1);
}

.glyph[data-pos='none'] .g-img {
  top: 5px;
  bottom: 5px;
  left: 5px;
  right: 5px;
}

.glyph[data-pos='top'] .g-img {
  top: 14px;
  bottom: 4px;
  left: 3px;
  right: 3px;
}

.glyph[data-pos='bottom'] .g-img {
  top: 4px;
  bottom: 14px;
  left: 3px;
  right: 3px;
}

.glyph[data-pos='left'] .g-img {
  top: 3px;
  bottom: 3px;
  left: 14px;
  right: 4px;
}

.glyph[data-pos='right'] .g-img {
  top: 3px;
  bottom: 3px;
  left: 4px;
  right: 14px;
}

/* 溢出：向文字反方向冲出画布边缘 */
.glyph[data-pos='top'] .g-img.bleed {
  bottom: -12px;
}

.glyph[data-pos='bottom'] .g-img.bleed {
  top: -12px;
}

.glyph[data-pos='left'] .g-img.bleed {
  right: -12px;
}

.glyph[data-pos='right'] .g-img.bleed {
  left: -12px;
}
</style>
