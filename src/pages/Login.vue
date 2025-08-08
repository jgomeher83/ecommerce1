<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-tabs">
        <button 
          class="tab" 
          :class="{ 'active': isLogin }"
          @click="isLogin = true"
        >
          Iniciar Sesión
        </button>
        <button 
          class="tab" 
          :class="{ 'active': !isLogin }"
          @click="isLogin = false"
        >
          Registrarse
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <h2>{{ isLogin ? 'Iniciar Sesión' : 'Crear Cuenta' }}</h2>
        
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            required
            placeholder="tucorreo@ejemplo.com"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            type="password"
            id="password"
            v-model="formData.password"
            :minlength="isLogin ? 6 : 8"
            required
            placeholder="••••••••"
          />
          <small v-if="!isLogin">Mínimo 8 caracteres</small>
        </div>

        <div v-if="!isLogin" class="form-group">
          <label for="confirmPassword">Confirmar Contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="formData.confirmPassword"
            :minlength="8"
            required
            placeholder="••••••••"
          />
        </div>


        <button type="submit" class="auth-button" :disabled="isLoading">
          <span v-if="isLoading">Procesando...</span>
          <span v-else>{{ isLogin ? 'Iniciar Sesión' : 'Registrarse' }}</span>
        </button>


        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="auth-footer">
          <p v-if="isLogin">
            ¿No tienes una cuenta? 
            <a href="#" @click.prevent="isLogin = false">Regístrate aquí</a>
          </p>
          <p v-else>
            ¿Ya tienes una cuenta? 
            <a href="#" @click.prevent="isLogin = true">Inicia sesión aquí</a>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/store'
import { registerUser, loginUser } from '@/services/firebase'
import { syncUserWithBackend } from '@/services/backend'


const router = useRouter()
const store = useStore()

const isLogin = ref(true)
const isLoading = ref(false)
const error = ref('')

const formData = ref({
  email: '',
  password: '',
  confirmPassword: ''
})

const handleSubmit = async () => {
  if (!isLogin.value && formData.value.password !== formData.value.confirmPassword) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  if (!isLogin.value && formData.value.password.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }

  try {
    isLoading.value = true
    error.value = ''

    if (isLogin.value) {
      // Iniciar sesión
      const userCredential = await loginUser(formData.value.email, formData.value.password)
      await syncUserWithBackend(userCredential.user)
      store.user = userCredential.user
      
      router.push('/')
    } else {
      // Registrarse
      const additionalData = {
        displayName: formData.value.email.split('@')[0], // Default username from email
        isAdmin: false // Explicitly set admin to false for new users
      }
      const userCredential = await registerUser(formData.value.email, formData.value.password, additionalData)
      store.user = userCredential.user
      await syncUserWithBackend(userCredential.user)
      router.push('/')
    }
  } catch (err) {
    console.error('Error de autenticación:', err)
    switch (err.code) {
      case 'auth/email-already-in-use':
        error.value = 'Este correo ya está registrado. Por favor inicia sesión.'
        break
      case 'auth/user-not-found':
        error.value = 'No se encontró una cuenta con este correo'
        break
      case 'auth/wrong-password':
        error.value = 'Contraseña incorrecta'
        break
      case 'auth/too-many-requests':
        error.value = 'Demasiados intentos. Por favor intente más tarde.'
        break
      default:
        error.value = 'Ocurrió un error. Por favor intente de nuevo.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>


<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
  background-color: #f5f5f5;
}

.auth-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  overflow: hidden;
}

.auth-tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.tab {
  flex: 1;
  padding: 1rem;
  border: none;
  background: none;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab.active {
  color: #4CAF50;
  border-bottom: 2px solid #4CAF50;
}

.auth-form {
  padding: 2rem;
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
}

.form-group {
  margin-bottom: 1.25rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

small {
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.8rem;
}

.auth-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.auth-button:hover {
  background-color: #45a049;
}

.auth-button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: center;
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  color: #666;
}

a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 500;
}

a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-page {
    padding: 1rem;
  }
  
  .auth-form {
    padding: 1.5rem;
  }
}
</style>
