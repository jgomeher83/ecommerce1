<template>
  <div class="cart-page">
    <div class="container">
      <h1>Tu Carrito de Compras</h1>

      <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-cart-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="empty-cart-icon">
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

              </div>
              <p class="item-category">{{ formatCategory(item.category) }}</p>

              <div class="item-price">
                ${{ formatPrice(item.price) }}
                <span v-if="item.originalPrice" class="original-price">
                  ${{ formatPrice(item.originalPrice) }}
                </span>
              </div>

              <div class="item-quantity">
                <!-- <button @click="updateQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1"
                  class="quantity-btn">
                  −
                </button> -->
                <span class="quantity">
                  {{ item.recipients && item.recipients.length > 1 ? item.recipients.length : 1 }}
                </span>
                <button @click="addRecipient(item)" class="quantity-btn">
                  +
                </button>
              </div>
            </div>

            <div class="recipient-form">
              <h4 v-if="item.recipients && item.recipients.length > 1">Destinatarios</h4>

              <div v-for="(recipient, rIndex) in item.recipients" :key="rIndex" class="recipient-entry">
                <label>
                  Nombre {{ rIndex + 1 }}
                  <input v-model="recipient.name" type="text" placeholder="Nombre" />
                </label>
                <label>
                  Cédula {{ rIndex + 1 }}
                  <input v-model="recipient.id" type="text" placeholder="cc" />
                </label>
                <button class="remove-recipient-btn" @click="removeRecipient(item, rIndex)">×</button>
              </div>

              <!-- <button class="add-recipient-btn" @click="addRecipient(item)">Agregar destinatario</button> -->
            </div>



            <button @click="removeItem(item.id)" class="remove-item" aria-label="Eliminar producto">
              X
            </button>


          </div>
        </div>

        <div class="order-summary">
          <h2>Resumen del pedido</h2>

          <div class="summary-row">
            <span>
              Subtotal ({{ totalRecipientes }} {{ totalRecipientes === 1 ? 'producto' : 'productos' }})
            </span>
            <span>${{ formatPrice(subtotal) }}</span>
          </div>

          <div class="summary-row">
            <span>Envío</span>
            <span>{{ shippingCost === 0 ? 'Por procesar' : `$${formatPrice(shippingCost)}` }}</span>
          </div>

          <!-- <div v-if="discount > 0" class="summary-row discount">
            <span>Descuento</span>
            <span>-${{ formatPrice(discount) }}</span>
          </div> -->

          <div class="summary-row total">
            <span>Total</span>
            <span>${{ formatPrice(total) }}</span>
          </div>

          <button @click="proceedToCheckout" class="checkout-btn" :disabled="isProcessing">
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
const errorMessage = ref('')

// Obtener items del carrito del store
const cartItems = computed(() => store.cart)

// Calcular totales
const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const qty = item.recipients?.length && item.recipients.length > 0 ? item.recipients.length : 1
    return sum + (item.price * qty)
  }, 0)
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
  return subtotal.value + shippingCost.value 
})

// Price formatting function
const formatPrice = (price) => {
  const number = Number(price);
  return number.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const addRecipient = (item) => {
  if (!item.recipients) item.recipients = []
    item.recipients.push({ name: '', identification: '' })

}

const removeRecipient = (item, index) => {
  if (item.recipients && item.recipients.length > index) {
    item.recipients.splice(index, 1)
  }
}

// Métodos
const totalRecipientes = computed(() =>
  cartItems.value.reduce((acc, item) => {
    if (!item.recipients || item.recipients.length === 0) {
      return acc + 1
    }
    return acc + item.recipients.length
  }, 0)
)

const updateQuantity = (productId, newQuantity) => {
  if (newQuantity < 1) return
  store.updateQuantity(productId, newQuantity)
}

const removeItem = (productId) => {
  store.removeFromCart(productId)
}

const API_BASE_URL = "https://api.apuntatealpaseo.com.co"
const API_BASE_URLdev = "http://localhost:5000"
console.log(cartItems.value)
const proceedToCheckout = async () => {
  if (cartItems.value.length === 0) return

  isProcessing.value = true
  errorMessage.value = ''
  console.log('🛒 Iniciando checkout...')

  try {
    
    const orderData = {
      user_id: store.user?.uid || 'anonymous',
      
      products: cartItems.value.map(item => ({
        product_id: item.id,
        qty: item.recipients?.length > 0 ? item.recipients.length : 1,
        recipients: item.recipients || [],
      
      }))
    }

    console.log('📤 Enviando pedido al backend...')

    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`❌ Error ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Pedido enviado correctamente:', result)

    store.clearCart()
    router.push(`/order-confirmation/${result.order_id}`)

  } catch (error) {
    console.error('❌ Error al procesar el pago:', error)
    errorMessage.value = 'Ocurrió un error al procesar tu pedido. Por favor, inténtalo de nuevo.'
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

onMounted(() => {
  cartItems.value.forEach(item => {
    if (!item.recipients) {
      item.recipients = [
        { name: '', id: '' }
      ]
    }
  })
})
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

/* Carrito lleno */
.cart-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  margin-top: 2rem;
}

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
  position: relative;
  flex-wrap: wrap;
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
  flex: 1;
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
  color: #4f46e5;
  text-decoration: underline;
}

.remove-item {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #a0aec0;
  cursor: pointer;
  transition: color 0.2s;
}

.remove-item:hover {
  color: #e53e3e;
}

.item-category {
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 0.75rem;
}

.item-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
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
  gap: 0.5rem;
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

.quantity-btn:hover:not(:disabled) {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.quantity {
  width: 40px;
  text-align: center;
  font-size: 1rem;
  font-weight: 500;
}

/* Formularios de destinatarios */
/* Formularios de destinatarios */
.recipient-form {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: visible;
  overflow-y: visible;
  display: block;
}

/* Para asegurarse de que los formularios no se oculten */
body,
html {
  overflow-x: hidden;
}

.recipient-entry {
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
}

/* .recipient-form {
  border: 2px dashed red !important;
  min-height: 200px;
} */



.recipient-form h4 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: #2d3748;
}

.recipient-entry {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  background: #fff;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.recipient-entry label {
  flex: 1 1 100%;
  min-width: 150px;
  display: flex;
  flex-direction: column;
}

.recipient-entry input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

/* Botón de eliminar (X) */
.remove-recipient-btn {
  background-color: #ff4d4f;
  border: none;
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 16px;
  font-weight: bold;
  line-height: 28px;
  cursor: pointer;
  align-self: center;
  transition: background-color 0.2s;
}

.remove-recipient-btn:hover {
  background-color: #e74c3c;
}

/* Botón agregar más destinatarios */
.add-recipient-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.add-recipient-btn:hover {
  background-color: #0056b3;
}

/* Responsive (mejoras específicas en pantallas pequeñas) */
@media (max-width: 600px) {
  .recipient-entry {
    flex-direction: column;
    gap: 0.5rem;
  }

  .remove-recipient-btn {
    align-self: flex-end;
    margin-top: 0.5rem;
  }

  .add-recipient-btn {
    width: 100%;
  }
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
  margin-bottom: 1.5rem;
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

/* Responsivo */
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

  .cart-item {
    flex-direction: column;
  }

  .item-image {
    width: 100%;
    height: auto;
  }
}

@media (max-width: 576px) {
  .recipient-entry {
    flex-direction: column;
  }

  .cart-item {
    padding: 1rem;
  }

  .btn-primary,
  .checkout-btn {
    padding: 0.75rem 1rem;
  }
}
</style>
