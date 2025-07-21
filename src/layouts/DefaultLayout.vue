<template>
  <div class="layout">
    <header class="header">
      <div class="container">
        <div class="logo">
          <router-link to="/">E-Commerce</router-link>
        </div>
        <nav class="nav">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/products" class="nav-link">Products</router-link>
          <router-link to="/myprofile" class="nav-link">My Profile</router-link>
          <router-link to="/cart" class="nav-link">
            Cart
            <span v-if="cartCount > 0" class="cart-count">{{ cartCount }}</span>
          </router-link>
          <router-link v-if="!user" to="/login" class="nav-link">Login</router-link>
          <a v-else href="#" @click.prevent="logout" class="nav-link">Logout</a>
        </nav>
      </div>
    </header>

    <main class="main">
      <slot></slot>
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} E-Commerce Store. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>


<script setup>
import { computed } from 'vue'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'
import { logoutUser } from '@/services/firebase'

const store = useStore()
const router = useRouter()

const cartCount = computed(() => store.cartCount)
const user = computed(() => store.user)

const logout = async () => {
  try {
    await logoutUser()
    store.user = null
    router.push('/login')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}
</script>


<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo a {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: var(--dark-color);
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s ease;
}

.nav-link:hover,
.router-link-active {
  color: var(--primary-color);
}

.cart-count {
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.main {
  flex: 1;
  padding: 2rem 0;
}

.footer {
  background-color: var(--dark-color);
  color: white;
  padding: 2rem 0;
  margin-top: auto;
}

.footer p {
  text-align: center;
  margin: 0;
}
</style>
