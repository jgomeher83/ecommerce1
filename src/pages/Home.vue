<template>
  <div class="home">
    <main class="container">
      <section class="hero">
        <h1>Welcome to Our Store</h1>
        <p class="subtitle">Discover amazing products at great prices</p>
      </section>
      
      <section class="featured-products">
        <h2>Featured Products</h2>
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
                  <p class="price">${{ product.price.toFixed(2) }}</p>
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
import { ref, onMounted } from 'vue'
import { useStore } from '@/store'
import ProductCard from '@/components/ProductCard.vue'

const store = useStore()
const isLoading = ref(true)
const products = ref([])

// Sample product data - replace with your actual data fetching logic
const baseProducts = [
  {
    id: 1,
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation.',
    price: 199.99,
    category: 'audio',
    rating: 4.5,
    image: 'https://placehold.co/300x300/png?text=Wireless+Headphones'
  },
  {
    id: 2,
    name: 'Smartphone',
    description: 'Latest model smartphone with advanced camera features.',
    price: 899.99,
    category: 'phones',
    rating: 4.8,
    image: 'https://placehold.co/300x300/png?text=Smartphone'
  },
  {
    id: 3,
    name: 'Laptop',
    description: 'Powerful laptop for work and entertainment.',
    price: 1299.99,
    category: 'computers',
    rating: 4.7,
    image: 'https://placehold.co/300x300/png?text=Laptop'
  },
  {
    id: 4,
    name: 'Smart Watch',
    description: 'Track your fitness and stay connected.',
    price: 249.99,
    category: 'wearables',
    rating: 4.3,
    image: 'https://placehold.co/300x300/png?text=Smart+Watch'
  },
  {
    id: 5,
    name: 'Wireless Earbuds',
    description: 'Compact wireless earbuds with great sound quality.',
    price: 129.99,
    category: 'audio',
    rating: 4.4,
    image: 'https://placehold.co/300x300/png?text=Earbuds'
  },
  {
    id: 6,
    name: 'Tablet',
    description: 'Portable tablet for work and play.',
    price: 349.99,
    category: 'tablets',
    rating: 4.2,
    image: 'https://placehold.co/300x300/png?text=Tablet'
  }
]

// Generate more products by duplicating and modifying the base products
const sampleProducts = []
const categories = ['audio', 'phones', 'computers', 'wearables', 'tablets', 'accessories']

for (let i = 0; i < 50; i++) {
  const baseProduct = baseProducts[Math.floor(Math.random() * baseProducts.length)]
  const newProduct = {
    ...baseProduct,
    id: i + 1,
    price: Math.round((baseProduct.price * (0.8 + Math.random() * 0.4)) * 100) / 100, // Random price ±20%
    rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10, // Random rating between 3.5 and 5.0
    category: categories[Math.floor(Math.random() * categories.length)]
  }
  sampleProducts.push(newProduct)
}

onMounted(async () => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In a real app, you would fetch products from your API
    // await store.fetchProducts()
    // products.value = store.products
    
    // For now, use sample data but only take the first 5 products
    products.value = sampleProducts.slice(0, 4)
    store.products = sampleProducts // Still store all products in the store
  } catch (error) {
    console.error('Failed to load products:', error)
  } finally {
    isLoading.value = false
  }
})

const addToCart = (product) => {
  store.addToCart({ ...product, quantity: 1 })
}
</script>

<style scoped>
.home {
  padding: 2rem 0;
}

.hero {
  text-align: center;
  margin-bottom: 3rem;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  border-radius: 12px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.subtitle {
  font-size: 1.2rem;
  color: var(--secondary-color);
  margin-bottom: 1.5rem;
}

.featured-products {
  margin-top: 3rem;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: var(--dark-color);
  text-align: center;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 1.5rem;
}

.loading {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
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
  margin-bottom: 0.5rem;
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.product-info {
  padding: 0.5rem 0;
}

.product-info h3 {
  margin: 0.25rem 0;
  color: #1f2937;
}

.price {
  font-weight: bold;
  color: #3b82f6;
  margin: 0.5rem 0;
}

.add-to-cart {
  width: 100%;
  padding: 0.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.add-to-cart:hover {
  background: #2563eb;
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
  
  .hero {
    padding: 2rem 1rem;
  }
  
  h1 {
    font-size: 1.75rem;
  }
}
</style>
