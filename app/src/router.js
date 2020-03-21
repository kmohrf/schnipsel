import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "home" */ './views/HomePage.vue')
  },
  {
    path: '/hello',
    name: 'hello',
    component: () => import(/* webpackChunkName: "hello" */ './views/HelloPage.vue')
  },
  {
    path: '/boards/:token',
    name: 'board-detail',
    component: () => import(/* webpackChunkName: "board-detail" */ './views/BoardPage.vue')
  },
  {
    path: '/boards/:token/settings',
    name: 'board-settings',
    component: () => import(/* webpackChunkName: "board-settings" */ './views/BoardSettingsPage.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import(/* webpackChunkName: "profile" */ './views/ProfilePage.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior (to, from) {
    return {
      x: 0,
      y: from.name === to.name ? document.scrollingElement.scrollTop : 0
    }
  },
  routes
})

export default router
