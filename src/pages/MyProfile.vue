<template>
  <div class="profile-page">
    <div class="container">
      <h1>Mi Perfil</h1>
      
      <div v-if="!user" class="not-logged-in">
        <p>Por favor inicia sesión para ver tu perfil.</p>
        <router-link to="/login" class="btn btn-primary">Iniciar sesión</router-link>
      </div>

      <div v-else class="profile-container">
        <div class="profile-header">
          <div class="avatar">
            <img :src="user.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" 
                 :alt="user.displayName || 'Usuario'">
          </div>
          <div class="user-info">
            <h2>{{ user.displayName || 'Usuario' }}</h2>
            <p class="email">{{ user.email }}</p>
            <p class="member-since" v-if="user.metadata">Miembro desde {{ formatDate(user.metadata.creationTime) }}</p>
            <p class="member-since" v-else>Fecha de registro no disponible</p>
          </div>
        </div>

        <div class="tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['tab-button', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <!-- Información Personal -->
          <div v-if="activeTab === 'profile'" class="tab-pane">
            <h3>Información Personal</h3>
            <form @submit.prevent="updateProfile" class="profile-form">
              <div class="form-group">
                <label for="displayName">Nombre completo</label>
                <input 
                  type="text" 
                  id="displayName" 
                  v-model="profileData.displayName" 
                  placeholder="Tu nombre completo"
                >
              </div>
              
              <div class="form-group">
                <label for="phone">Teléfono</label>
                <input 
                  type="tel" 
                  id="phone" 
                  v-model="profileData.phone" 
                  placeholder="Tu número de teléfono"
                >
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn btn-primary" :disabled="isUpdating">
                  {{ isUpdating ? 'Guardando...' : 'Guardar cambios' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Historial de Pedidos -->
          <div v-else-if="activeTab === 'orders'" class="tab-pane">
            <h3>Mis Pedidos</h3>
            <div v-if="orders.length > 0" class="orders-list">
              <div v-for="order in orders" :key="order.id" class="order-card">
                <div class="order-header">
                  <div>
                    <h4>Pedido #{{ order.id }}</h4>
                    <p class="order-date">{{ formatDate(order.date) }}</p>
                  </div>
                  <span :class="['order-status', order.status.toLowerCase()]">
                    {{ order.status }}
                  </span>
                </div>
                <div class="order-summary">
                  <div class="order-items">
                    <div v-for="item in order.items" :key="item.id" class="order-item">
                      <img :src="item.image" :alt="item.name" class="item-image">
                      <div class="item-details">
                        <h5>{{ item.name }}</h5>
                        <p class="item-quantity">Cantidad: {{ item.quantity }}</p>
                        <p class="item-price">${{ formatPrice(item.price) }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="order-total">
                    <p>Total: <strong>${{ formatPrice(order.total) }}</strong></p>
                    <router-link :to="`/orders/${order.id}`" class="btn btn-outline">Ver detalle</router-link>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>No tienes pedidos recientes.</p>
              <router-link to="/products" class="btn btn-primary">Ver productos</router-link>
            </div>
          </div>

          <!-- Configuración -->
          <div v-else-if="activeTab === 'settings'" class="tab-pane">
            <h3>Configuración de la cuenta</h3>
            <div class="settings-section">
              <h4>Preferencias de notificación</h4>
              <div class="setting-item">
                <div>
                  <h5>Promociones por correo</h5>
                  <p>Recibir ofertas y promociones por correo electrónico</p>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="settings.emailNotifications">
                  <span class="slider round"></span>
                </label>
              </div>
              <div class="setting-item">
                <div>
                  <h5>Notificaciones push</h5>
                  <p>Recibir notificaciones en el navegador</p>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="settings.pushNotifications">
                  <span class="slider round"></span>
                </label>
              </div>
            </div>
            
            <div class="settings-section danger-zone">
              <h4>Zona de peligro</h4>
              <div class="danger-actions">
                <button @click="confirmDeleteAccount" class="btn btn-danger">
                  Eliminar cuenta
                </button>
                <button @click="logout" class="btn btn-outline">
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>

          <!-- Admin Panel -->
          <div v-else-if="activeTab === 'admin'" class="tab-pane">
            <h3>Administración de Productos</h3>
            
            <!-- Admin View Tabs -->
            <div class="admin-tabs">
              <button 
                :class="['admin-tab', { 'active': adminViewMode === 'new' }]"
                @click="adminViewMode = 'new'"
              >
                Nuevo Producto
              </button>
              <button 
                :class="['admin-tab', { 'active': adminViewMode === 'existing' }]"
                @click="adminViewMode = 'existing'"
              >
                Productos Existentes
              </button>
            </div>
            
            <div class="admin-section">
              <!-- New Product Form -->
              <div v-if="adminViewMode === 'new'">
                <h4>Agregar Nuevo Producto</h4>
                <form @submit.prevent="addProduct" class="product-form">
                  <div class="form-group">
                    <label for="productName">Nombre del Producto</label>
                    <input 
                      type="text" 
                      id="productName" 
                      v-model="newProduct.name" 
                      required
                      placeholder="Nombre del producto"
                    >
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label for="productPrice">Precio</label>
                      <input 
                        type="number" 
                        id="productPrice" 
                        v-model.number="newProduct.price" 
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      >
                    </div>
                    
                    <div class="form-group">
                      <label for="productStock">Stock</label>
                      <input 
                        type="number" 
                        id="productStock" 
                        v-model.number="newProduct.stock" 
                        required
                        min="0"
                        placeholder="0"
                      >
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="productImage">URL de la Imagen</label>
                    <input 
                      type="url" 
                      id="productImage" 
                      v-model="imageInput"
                      @input="updateImagePreview"
                      placeholder="https://ejemplo.com/imagen.jpg o enlace de Google Drive"
                      class="form-control"
                    >
                    <small class="text-muted">Para Google Drive, usa el enlace de compartir y lo convertiremos automáticamente</small>
                    <div v-if="newProduct.image" class="mt-2">
                      <p>Vista previa:</p>
                      <img :src="newProduct.image" :alt="'Imagen de ' + newProduct.name" class="img-preview" @error="handleImageError">
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="productCategory">Categoría</label>
                    <input 
                      type="text" 
                      id="productCategory" 
                      v-model="newProduct.category" 
                      required
                      placeholder="Categoría del producto"
                    >
                  </div>
                  
                  <div class="form-group">
                    <label for="productDescription">Descripción</label>
                    <textarea 
                      id="productDescription" 
                      v-model="newProduct.description" 
                      rows="3"
                      required
                      placeholder="Descripción detallada del producto"
                    ></textarea>
                  </div>
                  
                  <button type="submit" class="btn btn-primary">
                    {{ isEditing ? 'Actualizar Producto' : 'Agregar Producto' }}
                  </button>
                </form>
              </div>
              
              <!-- Existing Products List -->
              <div v-else-if="adminViewMode === 'existing'">
                <h4>Productos Existentes</h4>
                <div class="products-list" v-if="products.length > 0">
                  <div class="product-grid">
                    <div v-for="product in products" :key="product.id" class="product-card">
                      <img :src="convertDriveUrl(product.image)" :alt="product.name" class="product-image">
                      <div class="product-details">
                        <h5>{{ product.name }}</h5>
                        <p class="product-price">${{ formatPrice(product.price) }}</p>
                        <p class="product-stock">Stock: {{ product.stock }}</p>
                        <p class="product-category">{{ product.category }}</p>
                        <div class="product-actions">
                          <button 
                            @click="editProduct(product)" 
                            class="btn btn-primary btn-sm"
                          >
                            <i class="fas fa-edit"></i> Editar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <p>No hay productos registrados.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'
import { logoutUser, updateUserProfile, db } from '@/services/firebase'
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore'

const store = useStore()
const router = useRouter()

// Datos del usuario
const user = computed(() => store.user)
// console.log(user.value)
const isAdmin = computed(() => store.user?.isAdmin || false)

// Pestañas del perfil
const tabs = computed(() => {
  const baseTabs = [
    { id: 'profile', label: 'Perfil' },
    { id: 'orders', label: 'Mis Pedidos' },
    { id: 'settings', label: 'Configuración' }
  ]
  
  // if (isAdmin.value) {
  //   baseTabs.splice(1, 0, { id: 'admin', label: 'Administración' })
  // }
  
  return baseTabs
})

const activeTab = ref('profile')

// Datos del perfil
const profileData = ref({
  displayName: '',
  phone: ''
})

// Configuración
const settings = ref({
  emailNotifications: true,
  pushNotifications: true
})

// Pedidos de ejemplo (en una app real, esto vendría de una API)
const orders = ref([
  {
    id: 'ORD-12345',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Completado',
    items: [
      { id: 1, name: 'Smartphone X', price: 799.99, quantity: 1, image: 'https://via.placeholder.com/80' },
      { id: 2, name: 'Funda protectora', price: 19.99, quantity: 1, image: 'https://via.placeholder.com/80' }
    ],
    total: 819.98
  },
  {
    id: 'ORD-12344',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Enviado',
    items: [
      { id: 3, name: 'Auriculares inalámbricos', price: 129.99, quantity: 1, image: 'https://via.placeholder.com/80' }
    ],
    total: 129.99
  }
])

// Estados
const isUpdating = ref(false)

// Admin state
const adminViewMode = ref('new') // 'new' or 'existing'
const isEditing = ref(false)
const currentProductId = ref(null)
const products = ref([])
const newProduct = ref({
  name: '',
  price: 0,
  description: '',
  category: '',
  image: 'https://via.placeholder.com/300',
  stock: 0
})
const imageInput = ref('')

// Métodos
const formatDate = (dateString) => {
  if (!dateString) return ''
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('es-ES', options)
}

const formatPrice = (price) => {
  const number = Number(price);
  return number.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const updateProfile = async () => {
  if (!profileData.value.displayName.trim()) return
  
  isUpdating.value = true
  try {
    await updateUserProfile({ displayName: profileData.value.displayName })
    // Actualizar el store con los nuevos datos
    store.user = { ...store.user, displayName: profileData.value.displayName }
    // Mostrar notificación de éxito
    alert('Perfil actualizado correctamente')
  } catch (error) {
    console.error('Error al actualizar el perfil:', error)
    alert('Error al actualizar el perfil. Por favor, inténtalo de nuevo.')
  } finally {
    isUpdating.value = false
  }
}

const confirmDeleteAccount = () => {
  if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
    // Lógica para eliminar la cuenta
    alert('Función de eliminación de cuenta no implementada')
  }
}

const logout = async () => {
  try {
    await logoutUser()
    store.clearCart() // <-- esta línea
    console.log('Carrito limpiado')
    store.user = null
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

const loadProducts = async () => {
  if (!isAdmin.value) return
  
  try {
    const querySnapshot = await getDocs(collection(db, 'products'))
    products.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error loading products:', error)
  }
}

const convertDriveUrl = (url) => {
  // if (!url) return 'https://via.placeholder.com/300';
  
  try {
    // If it's already a direct Google Drive image URL, return as is
    if (url.includes('drive.google.com/uc?')) {
      return url;
    }
    
    // If it's a Google Drive URL
    if (url.includes('drive.google.com') || url.match(/^[a-zA-Z0-9_-]{25,}$/)) {
      let fileId = '';
      
      // Handle full Google Drive URL
      if (url.includes('drive.google.com')) {
        // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
        const fileMatch = url.match(/[\/\=]([a-zA-Z0-9_-]{25,})/);
        if (fileMatch) {
          fileId = fileMatch[1];
        }
      } 
      // Handle case where only the fileId is stored
      else if (url.match(/^[a-zA-Z0-9_-]{25,}$/)) {
        fileId = url;
      }
      
      if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    
    // Return the original URL if it's not a Google Drive URL
    return url;
  } catch (e) {
    console.error('Error converting URL:', e);
    return '';
  }
}

const updateImagePreview = () => {
  const convertedUrl = convertDriveUrl(imageInput.value);
  newProduct.value.image = convertedUrl;
}

const handleImageError = (event) => {
  // Show a placeholder if the image fails to load
  // event.target.src = 'https://via.placeholder.com/300';
  
  // If it was a Google Drive link, try the direct download URL format
  if (imageInput.value) {
    try {
      const directUrl = convertDriveUrl(imageInput.value);
      if (directUrl !== event.target.src) {
        event.target.src = directUrl;
        newProduct.value.image = directUrl;
      }
    } catch (e) {
      console.error('Error handling image URL:', e);
    }
  }
}

const editProduct = (product) => {
  isEditing.value = true;
  currentProductId.value = product.id;
  
  // Switch to the new product tab
  adminViewMode.value = 'new';
  
  // Populate the form with product data
  newProduct.value = {
    name: product.name,
    price: product.price,
    description: product.description || '',
    category: product.category,
    image: convertDriveUrl(product.image),
    stock: product.stock || 0
  }
  
  // Set the image input to the original URL
  imageInput.value = product.image;
  
  // Scroll to the form
  setTimeout(() => {
    const form = document.querySelector('.product-form');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
}

const addProduct = async () => {
  if (!isAdmin.value) return
  
  try {
    const productData = {
      ...newProduct.value,
      price: Number(newProduct.value.price),
      stock: Number(newProduct.value.stock),
      updatedAt: new Date().toISOString()
    }
    
    if (isEditing.value && currentProductId.value) {
      // Update existing product
      await updateDoc(doc(db, 'products', currentProductId.value), productData)
      alert('Producto actualizado correctamente')
    } else {
      // Create new product
      productData.createdAt = new Date().toISOString()
      await addDoc(collection(db, 'products'), productData)
      alert('Producto agregado correctamente')
    }
    
    // Reset form and reload products
    resetProductForm()
    await loadProducts()
  } catch (error) {
    console.error('Error saving product:', error)
    alert('Error al guardar el producto. Por favor, inténtalo de nuevo.')
  }
}

const resetProductForm = () => {
  newProduct.value = {
    name: '',
    price: 0,
    description: '',
    category: '',
    image: '',
    stock: 0
  }
  imageInput.value = ''
  isEditing.value = false
  currentProductId.value = null
}

// Load products when component mounts and user is admin
onMounted(async () => {
  if (store.user) {
    profileData.value.displayName = store.user.displayName || ''
    if (isAdmin.value) {
      await loadProducts()
    }
  }
})
</script>

<style scoped>
.profile-page {
  padding: 2rem 0 4rem;
  min-height: 70vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #2d3748;
}

/* Estilos para usuario no autenticado */
.not-logged-in {
  text-align: center;
  padding: 4rem 1rem;
  background: #f8fafc;
  border-radius: 8px;
  max-width: 500px;
  margin: 0 auto;
}

.not-logged-in p {
  margin-bottom: 1.5rem;
  color: #4a5568;
}

/* Encabezado del perfil */
.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #fff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info h2 {
  font-size: 1.75rem;
  margin: 0 0 0.5rem;
  color: #1a202c;
}

.email {
  color: #4a5568;
  margin: 0 0 0.5rem;
}

.member-since {
  color: #718096;
  font-size: 0.875rem;
  margin: 0;
}

/* Pestañas */
.tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 1rem;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button:hover {
  color: #2d3748;
}

.tab-button.active {
  color: #3182ce;
  border-bottom-color: #3182ce;
}

/* Contenido de las pestañas */
.tab-pane {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Formulario de perfil */
.profile-form {
  max-width: 500px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
}

.form-actions {
  margin-top: 2rem;
}

/* Lista de pedidos */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.order-header h4 {
  font-size: 1rem;
  margin: 0 0 0.25rem;
}

.order-date {
  color: #718096;
  font-size: 0.875rem;
  margin: 0;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.order-status.completado {
  background-color: #ebf8ff;
  color: #2b6cb0;
}

.order-status.enviado {
  background-color: #ebfaf5;
  color: #2c7a7b;
}

.order-summary {
  padding: 1.5rem;
}

.order-items {
  margin-bottom: 1.5rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #edf2f7;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details h5 {
  margin: 0 0 0.25rem;
  font-size: 0.9375rem;
}

.item-quantity, .item-price {
  margin: 0;
  font-size: 0.875rem;
  color: #4a5568;
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

/* Configuración */
.settings-section {
  margin-bottom: 2.5rem;
}

.settings-section h4 {
  margin: 0 0 1.5rem;
  font-size: 1.125rem;
  color: #2d3748;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #edf2f7;
}

.setting-item h5 {
  margin: 0 0 0.25rem;
  font-size: 0.9375rem;
  color: #2d3748;
}

.setting-item p {
  margin: 0;
  font-size: 0.875rem;
  color: #718096;
}

/* Switch toggle */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e0;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #3182ce;
}

input:focus + .slider {
  box-shadow: 0 0 1px #3182ce;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Zona de peligro */
.danger-zone {
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
}

.danger-zone h4 {
  color: #c53030;
}

.danger-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.product-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
  border-radius: 4px;
}

.btn-primary {
  background-color: #3182ce;
  color: white;
  border: 1px solid transparent;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-primary:hover {
  background-color: #2c5282;
  transform: translateY(-1px);
}

.fas {
  margin-right: 0.35rem;
}
/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px dashed #cbd5e0;
}

.empty-state p {
  margin-bottom: 1.5rem;
  color: #4a5568;
}

/* Botones */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.25rem;
  border-radius: 4px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  border: 1px solid transparent;
}

.btn-primary {
  background-color: #3182ce;
  color: white;
}

.btn-primary:hover {
  background-color: #2c5282;
}

.btn-outline {
  background-color: transparent;
  border-color: #e2e8f0;
  color: #4a5568;
}

.btn-outline:hover {
  background-color: #f7fafc;
  border-color: #cbd5e0;
}

.btn-danger {
  background-color: #e53e3e;
  color: white;
}

.btn-danger:hover {
  background-color: #c53030;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .tab-button {
    white-space: nowrap;
  }
  
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .order-status {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .order-total {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .danger-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .danger-actions .btn {
    width: 100%;
  }
}

/* Admin styles */
.admin-section {
  margin-top: 2rem;
}

.product-form {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.product-details {
  padding: 1rem;
}

.product-price {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.1rem;
  margin: 0.5rem 0;
}

.product-stock {
  color: #666;
  font-size: 0.9rem;
  margin: 0.25rem 0;
}

.product-category {
  display: inline-block;
  background: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #555;
  margin-top: 0.5rem;
}

textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  resize: vertical;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 8px;
  color: #666;
}

.admin-tabs {
  display: flex;
  gap: 0.5rem;
  margin: 1.5rem 0;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.admin-tab {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px 6px 0 0;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f8fafc;
  color: #4a5568;
  border: 1px solid transparent;
  border-bottom: none;
  position: relative;
  bottom: -1px;
}

.admin-tab:hover {
  background-color: #edf2f7;
  color: #2d3748;
}

.admin-tab.active {
  background-color: white;
  color: #3182ce;
  border-color: #e2e8f0;
  border-bottom-color: white;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.admin-tab.active:hover {
  background-color: white;
}

.img-preview {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 8px;
  background-color: #f8f9fa;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 4px;
}

.text-muted {
  color: #6c757d;
  font-size: 0.875em;
  display: block;
  margin-top: 0.25rem;
}
</style>
