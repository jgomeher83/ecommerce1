<template>
  <div class="profile-page">
    <div class="container">
      <h1>Administración de Productos</h1>

      <div v-if="!isAdmin" class="not-logged-in">
        <p>No tienes permisos para acceder a esta sección.</p>
        <router-link to="/" class="btn btn-primary">Volver al inicio</router-link>
      </div>

      <div v-else class="profile-container">
        <div class="admin-tabs">
          <button :class="['admin-tab', { active: viewMode === 'new' }]" @click="viewMode = 'new'">
            Nuevo Producto
          </button>
          <button :class="['admin-tab', { active: viewMode === 'existing' }]" @click="viewMode = 'existing'">
            Productos Existentes
          </button>
          <button :class="['admin-tab', { active: viewMode === 'orders' }]" @click="viewMode = 'orders'">
            Todos los Pedidos
          </button>
        </div>

        <div class="admin-section">
          <div v-if="viewMode === 'new'">
            <h4>{{ isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto' }}</h4>
            <form @submit.prevent="addProduct" class="product-form">
              <div class="form-group">
                <label for="productName">Nombre del Producto</label>
                <input type="text" id="productName" v-model="newProduct.name" required
                  placeholder="Nombre del producto" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="productPrice">Precio</label>
                  <input type="number" id="productPrice" v-model.number="newProduct.price" required min="0" step="0.01"
                    placeholder="0.00" />
                </div>

                <div class="form-group">
                  <label for="productStock">Stock</label>
                  <input type="number" id="productStock" v-model.number="newProduct.stock" required min="0"
                    placeholder="0" />
                </div>
              </div>

              <div class="form-group">
                <label for="productCategory">Categoría</label>
                <input type="text" id="productCategory" v-model="newProduct.category" required
                  placeholder="Categoría del producto" />
              </div>

              <div class="form-group">
                <label for="productDescription">Descripción</label>
                <textarea id="productDescription" v-model="newProduct.description" rows="3" required
                  placeholder="Descripción detallada del producto"></textarea>
              </div>

              <div class="form-group">
                <label for="productImage">Imagen del producto (URL o ID de Google Drive)</label>
                <input type="text" id="productImage" v-model="imageInput" @input="updateImagePreview"
                  class="form-control" required />
                <small class="text-muted">Para Google Drive, usa el enlace de compartir</small>
                <div v-if="newProduct.image" class="mt-2">
                  <p>Vista previa:</p>
                  <img :src="newProduct.image" :alt="'Imagen de ' + newProduct.name" class="img-preview"
                    @error="handleImageError" />
                </div>
              </div>

              <button type="submit" class="btn btn-primary">
                {{ isEditing ? 'Actualizar Producto' : 'Agregar Producto' }}
              </button>
            </form>
          </div>

          <div v-else-if="viewMode === 'existing'">
            <h4>Productos Existentes</h4>
            <div class="products-list" v-if="products.length > 0">
              <div class="product-grid">
                <div v-for="product in products" :key="product.id" class="product-card">
                  <img :src="convertDriveUrl(product.image)" :alt="product.name" class="product-image" />
                  <div class="product-details">
                    <h5>{{ product.name }}</h5>
                    <p class="product-price">${{ formatPrice(product.price) }}</p>
                    <p class="product-stock">Stock: {{ product.stock }}</p>
                    <p class="product-category">{{ product.category }}</p>
                    <div class="product-actions">
                      <button @click="editProduct(product)" class="btn btn-primary btn-sm">
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
          <div v-else-if="viewMode === 'orders'">
            <h3>Todos los Pedidos</h3>
            <div class="filters">
              <select v-model="searchEmail">
                <option value="">Todos los correos</option>
                <option v-for="email in uniqueEmails" :key="email" :value="email">
                  {{ email }}
                </option>
              </select>

              <select v-model="searchOrderId">
                <option value="">Todos los pedidos</option>
                <option v-for="id in uniqueOrderIds" :key="id" :value="id">
                  {{ id }}
                </option>
              </select>

              <select v-model="searchItemName">
                <option value="">Todos los productos</option>
                <option v-for="name in uniqueItemNames" :key="name" :value="name">
                  {{ name }}
                </option>
              </select>

              <select v-model="selectedStatus">
                <option value="">Todos los estados</option>
                <option value="pending">Pending</option>
                <option value="Enviado">Enviado</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>

              <label>
                Desde:
                <input v-model="startDate" type="date" />
              </label>
              <label>
                Hasta:
                <input v-model="endDate" type="date" />
              </label>

              <select v-model="sortBy">
                <option value="fecha-desc">Fecha (más reciente)</option>
                <option value="fecha-asc">Fecha (más antigua)</option>
                <option value="total-desc">Total (mayor primero)</option>
                <option value="total-asc">Total (menor primero)</option>
              </select>
            </div>



            <div v-if="filteredOrders.length > 0" class="orders-list">
              <div v-for="order in filteredOrders" :key="order.id" class="order-card">
                <div class="order-header">
                  <div>
                    <p><strong>Compra del Usuario:</strong> {{ order.userEmail }}</p>
                    <h5>Pedido #{{ order.id }}</h5>
                    <p class="order-date">{{ formatDate(order.createdAt?.toDate?.() || order.createdAt) }}</p>
                  </div>
                  <div class="order-meta">
                    <span :class="['order-status', order.status.toLowerCase()]">{{ order.status }}</span>
                    <p><strong>Unidades:</strong> {{ totalItems(order) }}</p>
                    <p><strong>Total:</strong> ${{ formatPrice(order.total) }}</p>
                  </div>
                </div>

                <div class="order-items">
                  <div v-for="(item, itemIdx) in order.items" :key="item.id" class="order-item">
                    <img :src="item.image || 'https://via.placeholder.com/80'" :alt="item.name" class="item-image" />
                    <div class="item-details">
                      <h5>{{ item.name }}</h5>
                      <p>Precio unitario: ${{ formatPrice(item.price) }}</p>
                      <p>Cantidad: {{ item.recipients?.length || 1 }}</p>
                      <p>Subtotal: ${{ formatPrice(item.price * (item.recipients?.length || 1)) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Botón para mostrar/ocultar destinatarios -->
                <button class="btn btn-sm toggle-recipients" @click="toggleRecipients(order.id)">
                  {{ showRecipients[order.id] ? 'Ocultar' : 'Mostrar' }} destinatarios
                </button>

                <!-- Sección editable de destinatarios -->
                <div v-if="showRecipients[order.id]" class="recipients-list">
                  <template v-for="(item, itemIdx) in order.items" :key="item.id">
                    <div v-if="(item.recipients?.length || 0) > 0" class="recipient-block">
                      <h5>📦 {{ item.name }} ({{ item.recipients.length }} destinatario{{ item.recipients.length > 1 ?
                        's' : '' }})</h5>
                      <!-- {{db}} -->
                      <div v-for="(recipient, idx) in item.recipients" :key="idx" class="recipient-entry">
                        <input v-model="recipient.name" :placeholder="`Nombre ${idx + 1}`" />
                        <input v-model="recipient.id" :placeholder="`CC ${idx + 1}`" />
                        <!-- <button class="btn btn-danger btn-sm"
                          @click="removeRecipient(order.id, itemIdx, idx)">❌</button> -->
                      </div>
                      <button class="btn btn-success btn-sm"
                        @click="updateItemRecipients(order.userId,order.id, itemIdx, item.recipients)">
                        💾 Guardar destinatarios
                      </button>
                    </div>
                  </template>
                </div>
              </div>
            </div>


            <div v-else class="empty-state">
              <p>No hay pedidos registrados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>
<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { db } from '@/services/firebase'
import { useStore } from '@/store'
// import { allOrders } from '@/stores/orders' // si lo usas desde store
import { collection, getDocs, addDoc, updateDoc, doc, collectionGroup } from 'firebase/firestore'
const searchEmail = ref('')
const searchOrderId = ref('')
const selectedStatus = ref('')
const startDate = ref('')
const endDate = ref('')
const sortBy = ref('fecha-desc')
const allOrders = ref([])

const filteredOrders = computed(() => {
  return allOrders.value
    .filter(order => {
      const matchesEmail = !searchEmail.value || order.userEmail?.toLowerCase().includes(searchEmail.value.toLowerCase())
      const matchesStatus = !selectedStatus.value || order.status === selectedStatus.value
      const matchesOrderId = !searchOrderId.value || order.id?.toLowerCase().includes(searchOrderId.value.toLowerCase())

      const orderDate = order.createdAt?.toDate?.() || order.createdAt
      const afterStart = !startDate.value || new Date(startDate.value) <= orderDate
      const beforeEnd = !endDate.value || new Date(endDate.value) >= orderDate
      const matchesItemName = !searchItemName.value || order.items?.some(item => item.name?.toLowerCase().includes(searchItemName.value.toLowerCase()))

      return matchesEmail && matchesStatus && matchesOrderId && afterStart && beforeEnd && matchesItemName
    })
    .sort((a, b) => {
      if (sortBy.value === 'fecha-desc') return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      if (sortBy.value === 'fecha-asc') return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
      if (sortBy.value === 'total-desc') return b.total - a.total
      if (sortBy.value === 'total-asc') return a.total - b.total
      return 0
    })
})
const store = useStore()
const isAdmin = computed(() => store.user?.isAdmin)

const viewMode = ref('new')
const isEditing = ref(false)
const currentProductId = ref(null)

const newProduct = ref({
  name: '',
  price: 0,
  stock: 0,
  category: '',
  description: '',
  image: ''
})

const imageInput = ref('')
const products = ref([])

const loadProducts = async () => {
  const snapshot = await getDocs(collection(db, 'products'))
  products.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}
const formatDate = (dateString) => {
  if (!dateString) return ''
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('es-ES', options)
}
const formatPrice = (p) =>
  Number(p).toLocaleString('es-CO', { minimumFractionDigits: 2 })

const convertDriveUrl = (url) => {
  if (url.includes('drive.google.com/uc?')) return url
  const match = url.match(/[\/=]([a-zA-Z0-9_-]{25,})/)
  const id = match?.[1]
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : url
}

const updateImagePreview = () => {
  newProduct.value.image = convertDriveUrl(imageInput.value)
}
const totalItems = (order) =>
  order.items.reduce((sum, item) => sum + item.quantity, 0)

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/300'
}

const editProduct = (product) => {
  isEditing.value = true
  currentProductId.value = product.id
  newProduct.value = { ...product }
  imageInput.value = product.image
  viewMode.value = 'new'
}

const addProduct = async () => {
  const data = { ...newProduct.value }

  if (isEditing.value) {
    await updateDoc(doc(db, 'products', currentProductId.value), data)
    alert('Producto actualizado')
  } else {
    await addDoc(collection(db, 'products'), data)
    alert('Producto creado')
  }

  resetForm()
  await loadProducts()
}

const resetForm = () => {
  isEditing.value = false
  currentProductId.value = null
  newProduct.value = {
    name: '',
    price: 0,
    stock: 0,
    category: '',
    description: '',
    image: ''
  }
  imageInput.value = ''
}



const loadAllOrders = async () => {
  const snapshot = await getDocs(collectionGroup(db, 'orders'))
  allOrders.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}


const uniqueEmails = computed(() => [...new Set(allOrders.value.map(o => o.userEmail).filter(Boolean))])
const uniqueOrderIds = computed(() => [...new Set(allOrders.value.map(o => o.id).filter(Boolean))])
const uniqueItemNames = computed(() => {
  const allNames = allOrders.value.flatMap(o => o.items?.map(i => i.name) || [])
  return [...new Set(allNames)]
})
const searchItemName = ref('')


onMounted(() => {
  if (isAdmin.value) {
    loadProducts()
    loadAllOrders()
  }
})


const showRecipients = reactive({})

function toggleRecipients(orderId) {
  showRecipients[orderId] = !showRecipients[orderId]
}

async function removeRecipient(orderId, itemIdx, recipientIdx) {
  const orderRef = doc(db, 'users', userId, 'orders', orderId)
  const order = allOrders.value.find(o => o.id === orderId)
  if (!order || !order.items[itemIdx]) return

  order.items[itemIdx].recipients.splice(recipientIdx, 1)

  await updateDoc(orderRef, {
    items: order.items
  })
}

async function updateItemRecipients(userId,orderId, itemIdx, recipients) {
  try {
    const orderRef = doc(db, 'users', userId, 'orders', orderId)
    const order = allOrders.value.find(o => o.id === orderId)
    if (!order || !order.items[itemIdx]) return

    // 🔧 Convertir los recipients en una copia pura (sin reactividad)
    const plainRecipients = recipients.map(r => ({
      name: r.name || '',
      id: r.id || '',
    }))

    // 🔧 Crear copia limpia de todos los items
    const plainItems = order.items.map((item, idx) => {
      return {
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        category: item.category,
        quantity: item.quantity,
        recipients: idx === itemIdx ? plainRecipients : item.recipients?.map(r => ({ ...r })) || []
      }
    })

    await updateDoc(orderRef, {
      items: plainItems
    })

    alert('✅ Destinatarios actualizados correctamente.')
  } catch (error) {
    console.error('Error al actualizar destinatarios:', error)
    alert('❌ Error al guardar destinatarios. Revisa consola.')
  }
}



</script>

<style scoped>
.recipients-list {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border: 1px dashed #ccc;
  border-radius: 8px;
}

.recipient-block {
  margin-bottom: 1.5rem;
}

.recipient-entry {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.recipient-entry input {
  flex: 1 1 150px;
  padding: 0.4rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.filters input[type="text"],
.filters input[type="date"],
.filters select {
  padding: 0.5rem 0.75rem;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: white;
  min-width: 200px;
  transition: border-color 0.3s ease;
}

.filters input:focus,
.filters select:focus {
  outline: none;
  border-color: #007bff;
}

.filters label {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: #333;
}

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
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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

.item-quantity,
.item-price {
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

input:checked+.slider {
  background-color: #3182ce;
}

input:focus+.slider {
  box-shadow: 0 0 1px #3182ce;
}

input:checked+.slider:before {
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