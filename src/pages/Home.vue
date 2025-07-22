<template>
  <div class="home">
    <main class="container">
      <section class="hero">
        <h1>Apúntate el Paseo</h1>
        <p class="subtitle">Viaja, vive, recuerda!</p>
      </section>
      
      <section class="featured-products">
        <h2>Destinos</h2>
        <div class="product-grid">
          <div v-if="isLoading" class="loading">
            <div v-for="n in 4" :key="n" class="product-card loading">
              <div class="product-image skeleton"></div>
              <div class="skeleton-text" style="width: 80%;"></div>
              <div class="skeleton-text" style="width: 60%;"></div>
            </div>
          </div>
          
          <template v-else>
            <div v-for="product in products" :key="product.id" class="product-card">
              <router-link :to="'/products/' + product.id" class="product-link">
                <img :src="product.image" :alt="product.name" class="product-image" />
                <div class="product-info">
                  <h3>{{ product.name }}</h3>
                  <p class="price">${{ formatPrice(product.price) }}</p>
                </div>
              </router-link>
              <button @click.stop="addToCart(product)" class="add-to-cart">
                <i class="fas fa-shopping-cart"></i> Añadir al carrito
              </button>
            </div>
          </template>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from '@/store'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/services/firebase'

const store = useStore()
const isLoading = ref(true)
const products = ref([])

// Price formatting function
const formatPrice = (price) => {
  const number = Number(price);
  return number.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Fetch products from Firestore
const fetchProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'))
    products.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    // Store products in the store for later use
    store.products = products.value
  } catch (error) {
    console.error('Error fetching products:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchProducts()
})

const addToCart = (product) => {
  store.addToCart({ ...product, quantity: 1 })
}
</script>

<style scoped>
.home {
  padding: 1rem 0;
  max-width: 100%;
  overflow-x: hidden;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.hero {
  text-align: center;
  margin: 1rem 0 2rem;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  margin-bottom: 0.5rem;
  color: var(--primary-color);
  line-height: 1.2;
}

.subtitle {
  font-size: clamp(1rem, 3vw, 1.2rem);
  color: var(--secondary-color);
  margin: 0;
}

.featured-products {
  margin: 2rem 0;
}

h2 {
  font-size: clamp(1.5rem, 4vw, 1.8rem);
  margin-bottom: 1.5rem;
  color: var(--dark-color);
  text-align: center;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.loading {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

.skeleton {
  background-color: #e0e0e0;
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-text {
  height: 1rem;
  margin: 0.5rem 0;
  background-color: #e0e0e0;
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}

.product-link {
  text-decoration: none;
  color: inherit;
  display: block;
  margin-bottom: 0.75rem;
  transition: transform 0.2s ease;
}

.product-link:active {
  transform: scale(0.98);
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.product-card:hover .product-image {
  transform: translateY(-4px);
}

.product-info {
  padding: 0.5rem 0.25rem;
}

.product-info h3 {
  margin: 0.25rem 0;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price {
  font-weight: bold;
  color: #3b82f6;
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.add-to-cart {
  width: 100%;
  padding: 0.6rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  transition: background-color 0.2s ease, transform 0.1s ease;
  -webkit-tap-highlight-color: transparent;
}

.add-to-cart:active {
  transform: scale(0.97);
}

.add-to-cart:hover {
  background: #2563eb;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .home {
    padding: 0.5rem 0;
  }
  
  .hero {
    padding: 1.5rem 1rem;
    margin: 0.5rem 0 1.5rem;
  }
  
  .product-grid,
  .loading {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.25rem;
  }
  
  .product-image {
    height: 160px;
  }
}

@media (max-width: 480px) {
  .product-grid,
  .loading {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
  
  .product-image {
    height: 140px;
  }
  
  .add-to-cart {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
}

/* Small devices (landscape phones, 576px and up) */
@media (max-width: 360px) {
  .product-grid,
  .loading {
    grid-template-columns: 1fr 1fr;
  }
  
  .product-image {
    height: 130px;
  }
  
  .product-info h3 {
    font-size: 0.9rem;
  }
  
  .price {
    font-size: 1rem;
  }
}
</style>
