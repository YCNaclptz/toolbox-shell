import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/login', 
      name: 'Login', 
      component: () => import('../views/LoginView.vue') 
    },
    { 
      path: '/', 
      name: 'Home', 
      component: () => import('../views/HomeView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/profile', 
      name: 'Profile', 
      component: () => import('../views/UserProfileView.vue'), 
      meta: { requiresAuth: true, title: '使用者資訊設定' } 
    },
    { 
      path: '/change-password', 
      name: 'ChangePassword', 
      component: () => import('../views/ChangePasswordView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/admin/users', 
      name: 'UserManagement', 
      component: () => import('../views/UserManagementView.vue'), 
      meta: { requiresAuth: true, requiresAdmin: true } 
    },
    { 
      path: '/swear-jar/:pathMatch(.*)*', 
      name: 'SwearJar',
      component: () => import('../views/RemoteAppView.vue'),
      meta: { requiresAuth: true, appId: 'swear-jar' }
    },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const mustChangePassword = localStorage.getItem('mustChangePassword') === 'true'

  if (to.meta.requiresAuth && !token) return '/login'
  if (to.path === '/login' && token) return '/'
  if (to.meta.requiresAdmin && role !== 'Admin') return '/'

  if (mustChangePassword && token && to.path !== '/change-password' && to.path !== '/login') {
    return '/change-password'
  }
})

export default router