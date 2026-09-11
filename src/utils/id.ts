let counter = 0

/** 生成短随机 id（仅客户端使用，无需加密强度） */
export function uid(prefix = 'p'): string {
  counter += 1
  return `${prefix}${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`
}
