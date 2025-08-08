<template>
  <div class="product-page">
    <div v-if="loading" class="loading">Cargando producto...</div>
    
    <div v-else-if="product" class="product-container">
      <!-- Botón de volver -->
      <button @click="$router.go(-1)" class="back-button">
        <i class="fas fa-arrow-left"></i> Volver
      </button>
      
      <div class="product-content">
        <!-- Imagen del producto -->
        <div class="product-image">
          <img :src="product.image" :alt="product.name" />
        </div>
        
        <!-- Información del producto -->
        <div class="product-info">
          <h1>{{ product.name }}</h1>
          
          <div class="price-container">
            <span class="price">${{ formatPrice(product.price) }}</span>
            <span v-if="product.originalPrice" class="original-price">${{ formatPrice(product.originalPrice) }}</span>
          </div>
          
          <p class="description">{{ product.description || 'No hay descripción disponible para este producto.' }}</p>
          
          <div class="product-actions">
            <div class="quantity-selector">
              <button @click="quantity > 1 ? quantity-- : null">-</button>
              <span>{{ quantity }}</span>
              <button @click="quantity++">+</button>
            </div>
            
            <button @click="addToCart" class="add-to-cart">
              <i class="fas fa-shopping-cart"></i> Añadir al carrito
            </button>
          </div>
          
          <div class="product-meta">
            <div class="meta-item">
              <span class="label">Categoría:</span>
              <span class="value">{{ product.category || 'Sin categoría' }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Disponibilidad:</span>
              <span class="value in-stock">En stock</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="not-found">
      <h2>Producto no encontrado</h2>
      <p>El producto que buscas no está disponible en este momento.</p>
      <router-link to="/products" class="btn btn-primary">Ver productos</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '@/store'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'

const API_BASE_URL = "https://api.apuntatealpaseo.com.co"
const API_BASE_URLdev = "http://localhost:5000"

const route = useRoute()
const store = useStore()

const productId = route.params.id
const product = ref(null)
const loading = ref(true)
const quantity = ref(1)

// Price formatting function
const formatPrice = (price) => {
  const number = Number(price);
  return number.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Fetch product from Firestore
const fetchProduct = async () => {
  try {
    loading.value = true
    const res = await fetch(`${API_BASE_URL}/api/products/${productId}`)
    if (!res.ok) throw new Error('Producto no encontrado')

    const data = await res.json()
    product.value = {
      ...data,
      rating: data.rating || 0,
      discount: data.discount || 0,
      originalPrice: data.originalPrice || null
    }

  } catch (error) {
    console.error('❌ Error al cargar producto:', error)
    product.value = null
  } finally {
    loading.value = false
  }
}


// Set document title based on product
const updatePageTitle = () => {
  if (product.value) {
    document.title = `${product.value.name} | ${product.value.category ? product.value.category + ' | ' : ''}${import.meta.env.VITE_APP_NAME || 'Tienda'}`
  } else {
    document.title = 'Producto no encontrado | Tienda'
  }
}

// Watch for route changes to load new product
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchProduct()
  }
}, { immediate: true })

// Watch for product changes to update title
watch(product, updatePageTitle, { immediate: true })

const addToCart = () => {
  if (product.value) {
    store.addToCart({
      ...product.value,
      quantity: quantity.value
    })
    quantity.value = 1
  }
}
</script>

<style scoped>
.product-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: none;
  border: none;
  color: #4b5563;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 0;
}

.back-button:hover {
  color: #3b82f6;
}

.product-container {
  margin-top: 1rem;
}

.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.product-image {
  background: #f9fafb;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.product-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-info {
  padding: 1rem 0;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #1f2937;
}

.price-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
}

.price {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
}

.original-price {
  text-decoration: line-through;
  color: #9ca3af;
  font-size: 1.25rem;
}

.description {
  color: #4b5563;
  line-height: 1.6;
  margin: 1.5rem 0;
}

.product-actions {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  align-items: center;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
}

.quantity-selector button {
  width: 40px;
  height: 40px;
  background: #f9fafb;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
}

.quantity-selector button:hover {
  background: #f3f4f6;
}

.quantity-selector span {
  width: 40px;
  text-align: center;
  font-weight: 600;
}

.add-to-cart {
  flex: 1;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0 1.5rem;
  height: 40px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.add-to-cart:hover {
  background: #2563eb;
}

.product-meta {
  margin-top: 2rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}

.meta-item {
  display: flex;
  margin-bottom: 0.75rem;
  font-size: 0.9375rem;
}

.meta-item .label {
  font-weight: 500;
  color: #4b5563;
  min-width: 120px;
}

.meta-item .value {
  color: #1f2937;
}

.in-stock {
  color: #10b981;
  font-weight: 500;
}

.not-found {
  text-align: center;
  padding: 4rem 1rem;
}

.not-found h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #1f2937;
}

.not-found p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .product-content {
    grid-template-columns: 1fr;
  }
  
  .product-actions {
    flex-direction: column;
  }
  
  .quantity-selector,
  .add-to-cart {
    width: 100%;
  }
}
</style>
