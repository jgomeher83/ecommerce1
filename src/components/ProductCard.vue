<template>
  <div class="product-card">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" />
      <button v-if="showAddToCart" @click="addToCart" class="add-to-cart" :disabled="isAdding">
        {{ isAdding ? 'Adding...' : 'Add to Cart' }}
      </button>
    </div>
    <div class="product-details">
      <h3 class="product-title">{{ product.name }}</h3>
      <p class="product-price">${{ product.price.toFixed(2) }}</p>
      <p class="product-description">{{ product.description }}</p>
      <div v-if="showQuantity && isInCart" class="quantity-controls">
        <button @click="decreaseQuantity" :disabled="isAdding">-</button>
        <span>{{ cartItem.quantity }}</span>
        <button @click="increaseQuantity" :disabled="isAdding">+</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from '@/store'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  showAddToCart: {
    type: Boolean,
    default: true
  },
  showQuantity: {
    type: Boolean,
    default: false
  }
})

const store = useStore()
const isAdding = ref(false)

const cartItem = computed(() => {
  return store.cart.find(item => item.id === props.product.id) || { quantity: 0 }
})

const isInCart = computed(() => {
  return cartItem.value.quantity > 0
})

const addToCart = async () => {
  isAdding.value = true
  try {
    store.addToCart(props.product)
  } finally {
    isAdding.value = false
  }
}

const increaseQuantity = () => {
  store.updateQuantity(props.product.id, cartItem.value.quantity + 1)
}

const decreaseQuantity = () => {
  if (cartItem.value.quantity > 1) {
    store.updateQuantity(props.product.id, cartItem.value.quantity - 1)
  } else {
    store.removeFromCart(props.product.id)
  }
}
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  padding-top: 100%;
  overflow: hidden;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.add-to-cart {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.3s ease;
}

.product-card:hover .add-to-cart {
  opacity: 1;
  transform: translateY(0);
}

.add-to-cart:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.product-details {
  padding: 1.25rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 1.1rem;
  margin: 0 0 0.5rem;
  color: var(--dark-color);
}

.product-price {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--primary-color);
  margin: 0 0 0.75rem;
}

.product-description {
  color: var(--secondary-color);
  font-size: 0.9rem;
  margin: 0 0 1rem;
  flex-grow: 1;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: auto;
}

.quantity-controls button {
  background: var(--light-color);
  border: 1px solid #ddd;
  width: 2rem;
  height: 2rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.quantity-controls button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quantity-controls button:hover:not(:disabled) {
  background: #e9ecef;
}

.quantity-controls span {
  min-width: 1.5rem;
  text-align: center;
  font-weight: 500;
}
</style>
