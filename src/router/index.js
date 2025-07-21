import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Products from '@/pages/Products.vue'
import Login from '@/pages/Login.vue'
import Cart from '@/pages/Cart.vue'
import MyProfile from '@/pages/MyProfile.vue'
import Product from '@/pages/Product.vue'

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
    component: MyProfile
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
