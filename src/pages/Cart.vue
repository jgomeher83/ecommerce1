<template>
  <div class="cart-page">
    <div class="container">
      <h1>Tu Carrito de Compras</h1>
      
      <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-cart-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="empty-cart-icon">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h2>Tu carrito está vacío</h2>
          <p>¡Aún no has agregado productos a tu carrito!</p>
          <router-link to="/products" class="btn-primary">
            Continuar comprando
          </router-link>
        </div>
      </div>

      <div v-else class="cart-container">
        <div class="cart-items">
          <div class="cart-item" v-for="item in cartItems" :key="item.id">
            <div class="item-image">
              <router-link :to="`/products/${item.id}`">
       
                <img :src="item.image" :alt="item.name" @error="handleImageError">
              </router-link>
            </div>
            <div class="item-details">
              <div class="item-header">
                <h3>
                  <router-link :to="`/products/${item.id}`" class="product-title-link">
                    {{ item.name }}
                  </router-link>
                </h3>
                <button @click="removeItem(item.id)" class="remove-item" aria-label="Eliminar producto">
                  &times;
                </button>
              </div>
              <p class="item-category">{{ formatCategory(item.category) }}</p>
              
              <div class="item-price">
                ${{ formatPrice(item.price) }}
                <span v-if="item.originalPrice" class="original-price">
                  ${{ formatPrice(item.originalPrice) }}
                </span>
              </div>
              
              <div class="item-quantity">
                <button 
                  @click="updateQuantity(item.id, item.quantity - 1)" 
                  :disabled="item.quantity <= 1"
                  class="quantity-btn"
                >
                  −
                </button>
                <span class="quantity">{{ item.quantity }}</span>
                <button 
                  @click="updateQuantity(item.id, item.quantity + 1)" 
                  class="quantity-btn"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="order-summary">
          <h2>Resumen del pedido</h2>
          
          <div class="summary-row">
            <span>Subtotal ({{ totalItems }} {{ totalItems === 1 ? 'producto' : 'productos' }})</span>
            <span>${{ formatPrice(subtotal) }}</span>
          </div>
          
          <div class="summary-row">
            <span>Envío</span>
            <span>{{ shippingCost === 0 ? 'Gratis' : `$${formatPrice(shippingCost)}` }}</span>
          </div>
          
          <div v-if="discount > 0" class="summary-row discount">
            <span>Descuento</span>
            <span>-${{ formatPrice(discount) }}</span>
          </div>
          
          <div class="summary-row total">
            <span>Total</span>
            <span>${{ formatPrice(total) }}</span>
          </div>
          
          <button 
            @click="proceedToCheckout" 
            class="checkout-btn"
            :disabled="isProcessing"
          >
            {{ isProcessing ? 'Procesando...' : 'Proceder al pago' }}
          </button>
          
          <div class="payment-methods">
            <p>Métodos de pago aceptados:</p>
            <div class="payment-icons">
              <span class="payment-icon">💳</span>
              <span class="payment-icon">📱</span>
              <span class="payment-icon">🏦</span>
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

const store = useStore()
const router = useRouter()
const isProcessing = ref(false)

// Obtener items del carrito del store
const cartItems = computed(() => store.cart)

// Calcular totales
const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const totalItems = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const shippingCost = computed(() => {
  // Envío gratis para compras mayores a $1000
  return subtotal.value >= 1000 ? 0 : 15.99
})

const discount = computed(() => {
  // 10% de descuento para compras mayores a $500
  return subtotal.value >= 500 ? subtotal.value * 0.1 : 0
})

const total = computed(() => {
  return subtotal.value + shippingCost.value - discount.value
})

// Price formatting function
const formatPrice = (price) => {
  const number = Number(price);
  return number.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Métodos
const updateQuantity = (productId, newQuantity) => {
  if (newQuantity < 1) return
  store.updateQuantity(productId, newQuantity)
}

const removeItem = (productId) => {
  store.removeFromCart(productId)
}

const proceedToCheckout = async () => {
  isProcessing.value = true
  try {
    // Aquí iría la lógica para procesar el pago
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/checkout')
  } catch (error) {
    console.error('Error al procesar el pago:', error)
  } finally {
    isProcessing.value = false
  }
}

const formatCategory = (category) => {
  if (!category) return ''
  return category.charAt(0).toUpperCase() + category.slice(1)
}

const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/300x300/png?text=Imagen+no+disponible'
}
</script>

<style scoped>
.cart-page {
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
  text-align: center;
}

/* Carrito vacío */
.empty-cart {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  text-align: center;
}

.empty-cart-content {
  max-width: 400px;
  padding: 2rem;
}

.empty-cart-icon {
  color: #cbd5e0;
  margin-bottom: 1.5rem;
}

.empty-cart h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.empty-cart p {
  color: #718096;
  margin-bottom: 1.5rem;
}

.btn-primary {
  display: inline-block;
  background-color: #4CAF50;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #3d8b40;
}

/* Contenedor del carrito */
.cart-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  margin-top: 2rem;
}

/* Lista de productos */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cart-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.item-header h3 {
  font-size: 1.1rem;
  margin: 0;
  color: #2d3748;
}

.product-title-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.product-title-link:hover {
  color: #4f46e5; /* Or your primary color */
  text-decoration: underline;
}

.remove-item {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #a0aec0;
  cursor: pointer;
  padding: 0 0.5rem;
  line-height: 1;
  transition: color 0.2s;
}

.remove-item:hover {
  color: #e53e3e;
}

.item-category {
  font-size: 0.85rem;
  color: #718096;
  margin: 0 0 0.75rem 0;
}

.item-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0.5rem 0;
}

.original-price {
  text-decoration: line-through;
  color: #a0aec0;
  font-size: 0.9rem;
  margin-left: 0.5rem;
  font-weight: normal;
}

.item-quantity {
  display: flex;
  align-items: center;
  margin-top: auto;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-btn:not(:disabled):hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.quantity {
  width: 40px;
  text-align: center;
  font-size: 1rem;
  font-weight: 500;
}

/* Resumen del pedido */
.order-summary {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.order-summary h2 {
  font-size: 1.25rem;
  margin: 0 0 1.5rem 0;
  text-align: left;
  color: #2d3748;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #edf2f7;
}

.summary-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.summary-row.total {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 2px solid #e2e8f0;
}

.summary-row.discount {
  color: #38a169;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: background-color 0.2s;
}

.checkout-btn:hover:not(:disabled) {
  background: #3d8b40;
}

.checkout-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.payment-methods {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #edf2f7;
  text-align: center;
}

.payment-methods p {
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 0.75rem;
}

.payment-icons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.payment-icon {
  font-size: 1.5rem;
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 1024px) {
  .cart-container {
    grid-template-columns: 1fr 300px;
  }
}

@media (max-width: 768px) {
  .cart-container {
    grid-template-columns: 1fr;
  }
  
  .order-summary {
    position: static;
    margin-top: 2rem;
  }
}

@media (max-width: 576px) {
  .cart-item {
    flex-direction: column;
    padding: 1rem;
  }
  
  .item-image {
    width: 100%;
    height: 200px;
    margin-bottom: 1rem;
  }
  
  .item-quantity {
    margin-top: 1rem;
  }
  
  .btn-primary,
  .checkout-btn {
    padding: 0.75rem 1rem;
  }
}
</style>
