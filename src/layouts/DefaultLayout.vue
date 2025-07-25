<template>
  <div class="layout">
    <header class="header">
      <div class="container">
        <div class="logo">
          <router-link to="/">Apúntate el Paseo</router-link>
        </div>
        
        <!-- Mobile menu button -->
        <button class="mobile-menu-button" @click="toggleMobileMenu" aria-label="Toggle menu">
          <span class="menu-icon" :class="{ 'open': isMobileMenuOpen }">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <!-- Navigation -->
        <nav class="nav" :class="{ 'mobile-open': isMobileMenuOpen }" @click="closeMobileMenu">
          <router-link to="/" class="nav-link" @click="closeMobileMenu">Inicio</router-link>
          <router-link to="/products" class="nav-link" @click="closeMobileMenu">Destinos</router-link>
          <router-link to="/cart" class="nav-link" @click="closeMobileMenu">
            Carrito
            <span v-if="cartCount > 0" class="cart-count">{{ cartCount }}</span>
          </router-link>
          <router-link to="/myprofile" class="nav-link" @click="closeMobileMenu">Mi Perfil</router-link>
          <router-link v-if="user && user.isAdmin" to="/admin" class="nav-link" @click="closeMobileMenu">Admin</router-link>
          <router-link v-if="!user" to="/login" class="nav-link" @click="closeMobileMenu">Iniciar sesión</router-link>
          <a v-else href="#" @click.prevent="logout" class="nav-link">Cerrar sesión</a>
        </nav>
      </div>
    </header>

    <main class="main">
      <slot></slot>
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} Apúntate el Paseo. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'
import { logoutUser } from '@/services/firebase'

const store = useStore()
const router = useRouter()
const isMobileMenuOpen = ref(false)
const isMobileView = ref(false)

const cartCount = computed(() => store.cartCount)
const user = computed(() => store.user)

const checkScreenSize = () => {
  isMobileView.value = window.innerWidth < 768
  if (!isMobileView.value) {
    isMobileMenuOpen.value = false
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  if (isMobileView.value) {
    isMobileMenuOpen.value = false
  }
}

const logout = async () => {
  try {
    await logoutUser()
    store.clearCart() // <-- esta línea
    store.user = null
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenSize)
})
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
  flex-wrap: wrap;
  padding: 0 1rem;
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.logo a {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  text-decoration: none;
  z-index: 1001;
}

/* Mobile menu button */
.mobile-menu-button {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 1001;
}

.menu-icon {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 20px;
  position: relative;
}

.menu-icon span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: var(--dark-color);
  transition: all 0.3s ease;
}

.menu-icon.open span:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}

.menu-icon.open span:nth-child(2) {
  opacity: 0;
}

.menu-icon.open span:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}

.nav {
  display: flex;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

.nav-link {
  color: var(--dark-color);
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s ease;
  white-space: nowrap;
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

/* Responsive styles */
@media (max-width: 768px) {
  .mobile-menu-button {
    display: block;
  }

  .nav {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: white;
    flex-direction: column;
    gap: 0;
    max-height: 0;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
  }

  .nav.mobile-open {
    max-height: 400px;
    padding: 1rem 0;
  }

  .nav-link {
    padding: 0.75rem 1.5rem;
    border-bottom: 1px solid #f0f0f0;
    width: 100%;
    box-sizing: border-box;
  }

  .nav-link:last-child {
    border-bottom: none;
  }
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
