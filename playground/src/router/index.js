import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/posts',
    name: 'posts',
    component: () => import('../views/Posts.vue')
  },
  {
    path: '/post-auto/:id',
    name: 'postAuto',
    component: () => import('../views/PostAuto.vue')
  },
  {
    path: '/post/:id',
    name: 'post',
    component: () => import('../views/Post.vue')
  },
  {
    path: '/no-api',
    name: 'noapi',
    component: () => import('../views/NoApi.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
