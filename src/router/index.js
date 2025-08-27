import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Products from '@/pages/Products.vue'
import Login from '@/pages/Login.vue'
import Cart from '@/pages/Cart.vue'
import MyProfile from '@/pages/MyProfile.vue'
import Product from '@/pages/Product.vue'
import Admin from '@/pages/Admin.vue'
import Flights from '@/pages/Flights.vue'
import { useStore } from '@/store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/products',
    name: 'products',
    component: Products
  },
  {
    path: '/products/:id',
    name: 'product',
    component: Product,
    props: true
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/cart',
    name: 'cart',
    component: Cart
  },
  {
    path: '/myprofile',
    name: 'myprofile',
    component: MyProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/flights',
    name: 'flights',
    component: Flights,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const store = useStore()
  
  // Check if the route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Wait for auth to be initialized
    await new Promise(resolve => {
      const unsubscribe = store.$onAction(({ name, after }) => {
        if (name === 'setUser') {
          after(() => {
            unsubscribe()
            resolve()
          })
        }
      })
      // Resolve immediately if user is already loaded
      if (store.user !== undefined) {
        unsubscribe()
        resolve()
      }
    })
    
    if (!store.user) {
      // No user, redirect to login
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
    
    // Check for admin role if required
    if (to.matched.some(record => record.meta.requiresAdmin)) {
      if (!store.user.isAdmin) {
        next({ name: 'home' })
        return
      }
    }
  }
  
  next()
})

export default router
