import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// Create Vue app
const app = createApp(App)

// Initialize Pinia
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// Use router
app.use(router)

// Mount the app
app.mount('#app')
