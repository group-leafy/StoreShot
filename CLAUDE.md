# StoreShot

App Store 商店图生成器：纯前端静态工具，选布局 → 填文字 → 传截图 → 导出原生分辨率 PNG。面向用户的功能介绍见 `README.md`，本文件是仓库的开发工作指南。

## 技术栈与硬性约束

- Vue 3（`<script setup>` + TS）+ Pinia + Vue Router（**hash 模式**）+ vue-i18n；构建 Vite，包管理 **pnpm**（Node ≥ 22.18 / ≥ 24.12）
- **纯客户端运行**：无后端、不上传图片；产物为纯静态站点，部署在 GitHub Pages（`vite.config.ts` 的 `base: './'`）
- 导出用 html-to-image；画布字体只用系统内置字体（导出时 `skipFonts: true`），不得引入 Web 字体
- 导出分辨率必须严格等于设备原生规格（App Store 要求），唯一事实源是 `src/constants/devices.ts`

## 常用命令

```bash
pnpm dev          # 本地开发
pnpm build        # 类型检查 + 构建（本地发布前跑这个）
pnpm build-only   # 仅构建（CI 用的是它）
pnpm type-check   # vue-tsc
pnpm format       # prettier 格式化 src/
```

## 目录导览

```
src/
  constants/    所有排版参数集中地：devices.ts 设备规格比例、
                templates.ts 模板解析/过滤、presets.ts 渐变/字体/字号预设
  utils/
    layout.ts   核心：computeLayout 把页面配置算成绝对像素布局
    export.ts   html-to-image 导出 PNG（pixelRatio=1，强制清 transform）
    image.ts    图片读取/解析
  components/
    PageCanvas.vue    单页画布，预览与导出共用同一节点
    PageCard.vue      工作区页面卡片（复制/删除/下载 + 拖拽排序）
    PropertyPanel.vue 左侧属性面板
    AppIcon.vue       图标组件（内置 path 表，全站图标统一走它）
  stores/project.ts   全局状态：设备 id、pages、选中/拖拽 id
  locales/            8 个语言包
  assets/main.css     设计令牌（CSS 变量，含深色模式）
```

## 布局系统（最重要的不变量）

- `computeLayout` 输出**原生导出坐标系**（如 iPhone 1290×2796）下的绝对 px 矩形；预览仅由外层 `.scaler` 做 `transform: scale`，被导出的 `.page` 节点本身不带 transform（`export.ts` 另有清 transform 兜底）——预览与导出因此严格一致。**改布局只改 `layout.ts` 的数学，不要在组件里补像素**
- 排版沿主轴分区：文字在 上/下 时主轴为纵轴，在 左/右 时为横轴；分区比例常量（`textZoneRatio`、`SIDE_MARGIN_RATIO` 等）在 `devices.ts` 与 `layout.ts` 顶部
- 溢出模板：截图 20%（`OVERFLOW_RATIO`）冲出页面被裁，方向永远背离文字侧
- 伪真机边框：厚度 `framePadRatio`，**边框自截图四边向外扩张、不侵占图片内容**（截图尺寸与无边框时完全一致）；外圆角 `frameRadiusRatio`，图片圆角 = 外圆角 − 边框厚
- iPad 横竖屏是**页面级**属性：`resolveDeviceSpec` 按方向换宽高；竖屏下 左/右 模板经 `coerceTemplate` 自动映射为 上/下

## 约定与注意事项

- **i18n**：`zh-CN.ts` 是基准语言包（`Messages` 类型源），其它 7 个语言文件必须满足同一结构——新增文案先加 zh-CN，再同步其余全部。语言包含大量 CJK 多字节文本，编辑时用整串替换，不要用字节级的 sed/perl
- **颜色**：一律使用 `main.css` 的 CSS 变量令牌（`--accent` 等），禁止在组件里硬编码色值；深色模式经 `html.dark` 切换令牌，组件无需自己适配。当前主色为暖橙（浅色 `#ea580c` / 深色 `#fb923c`）
- **视觉基调**：中性面板 + 单一 accent，避免渐变按钮、彩色辉光、emoji 装饰（用户明确要求去"AI 模板味"）
- 主题与语言选择持久化在 localStorage（`storeshot-theme` / `storeshot-locale`）；页面数据只在内存中，离开工作区时路由守卫二次确认后清空——当前为有意设计，勿加持久化
- CI（`.github/workflows/deploy.yml`）push master 自动部署 Pages；所用 actions 需保持 node24 版本（checkout@v5、setup-node@v5、pnpm/action-setup@v6 等），否则 runner 会报 Node 20 弃用警告
- `public/` 下的 favicon.svg / favicon.ico / apple-touch-icon.png 与首页 logo 同源（橙色照片图标），改 logo 时三件套要同步重新生成
