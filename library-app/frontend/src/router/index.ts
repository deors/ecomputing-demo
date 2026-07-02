import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.ts'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/catalog' },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/catalog',
      name: 'catalog',
      component: () => import('../views/public/CatalogView.vue'),
    },
    {
      path: '/catalog/:id',
      name: 'book-detail',
      component: () => import('../views/public/BookDetailView.vue'),
    },
    {
      path: '/my-loans',
      name: 'my-loans',
      meta: { requiresAuth: true },
      component: () => import('../views/member/MyLoansView.vue'),
    },
    {
      path: '/admin',
      redirect: '/admin/books',
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/books',
      name: 'admin-books',
      meta: { requiresAuth: true, requiresAdmin: true },
      component: () => import('../views/admin/AdminBooksView.vue'),
    },
    {
      path: '/admin/members',
      name: 'admin-members',
      meta: { requiresAuth: true, requiresAdmin: true },
      component: () => import('../views/admin/AdminMembersView.vue'),
    },
    {
      path: '/admin/loans',
      name: 'admin-loans',
      meta: { requiresAuth: true, requiresAdmin: true },
      component: () => import('../views/admin/AdminLoansView.vue'),
    },
    {
      path: '/admin/reports',
      name: 'admin-reports',
      meta: { requiresAuth: true, requiresAdmin: true },
      component: () => import('../views/admin/AdminReportsView.vue'),
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      meta: { requiresAuth: true, requiresAdmin: true },
      component: () => import('../views/admin/AdminSettingsView.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return

  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    try {
      await auth.refresh()
    } catch {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  }

  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'login' }
  }
})

export default router
