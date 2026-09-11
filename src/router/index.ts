import { createRouter, createWebHashHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import { i18n } from '@/locales'
import { useProjectStore } from '@/stores/project'

// 使用 hash 模式：纯静态部署（如 GitHub Pages）下无需服务端路由重写
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/workspace',
      name: 'workspace',
      component: () => import('@/views/WorkspaceView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

/**
 * 离开工作区（无论点击应用内返回还是浏览器返回/前进）统一拦截：
 * 有页面数据时二次确认，确认后清空数据，取消则留在工作区。
 */
router.beforeEach((to, from) => {
  if (from.name === 'workspace' && to.name !== 'workspace') {
    const store = useProjectStore()
    if (store.pages.length === 0) return true
    if (!window.confirm(i18n.global.t('workspace.leaveConfirm'))) return false
    store.$reset()
  }
  return true
})

export default router
