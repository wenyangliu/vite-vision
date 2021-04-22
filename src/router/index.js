import {createRouter, createWebHistory} from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/screen'
    },
    {
      path: '/screen',
      component: () => import('@/views/ScreenPage.vue')
    }
  ]
})