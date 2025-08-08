<template>
  <div class="products-page">
    <div class="container">
      <div class="products-header">
        <h1>Nuestros Destinos</h1>
        <div class="products-count">{{ filteredProducts.length }} productos encontrados</div>
      </div>

      <div class="products-container">
        <!-- Filtros -->
        <aside class="filters">
          <div class="filter-section">
            <h3>Categorías</h3>
            <div class="filter-options">
              <label v-for="(count, category) in categoryCounts" :key="category" class="filter-option">
                <input 
                  type="checkbox" 
                  :value="category" 
                  v-model="selectedCategories"
                  class="mr-2"
                >
                {{ formatCategory(category) }} ({{ count }})
              </label>
            </div>
          </div>


          <!-- <div class="filter-section">
            <h3>Rango de precios</h3>
            <div class="price-range">
              <input 
                type="range" 
                v-model="priceRange[1]" 
                :min="priceRange[0]" 
                :max="maxPrice" 
                step="50"
                class="w-full"
              >
              <div class="price-labels">
                <span>${{ priceRange[0] }}</span>
                <span>Hasta ${{ priceRange[1] }}</span>
              </div>
            </div>
          </div> -->


          <!-- <div class="filter-section">
            <h3>Calificación</h3>
            <div class="filter-options">
              <label v-for="rating in [4, 3, 2, 1]" :key="rating" class="filter-option">
                <input 
                  type="radio" 
                  :value="rating" 
                  v-model="minRating"
                  name="rating"
                  class="mr-2"
                >
                <span class="rating-stars">
                  <span v-for="i in 5" :key="i" :class="{'text-yellow-400': i <= rating}">★</span>
                </span>
                <span class="text-sm text-gray-500 ml-1">y más</span>
              </label>
            </div>
          </div> -->


          <button 
            @click="resetFilters" 
            class="reset-filters"
          >
            Limpiar filtros
          </button>
        </aside>


        <!-- Lista de productos -->
        <div class="products-grid">
          <div class="sort-options">
            <div class="sort-by">
              <label for="sort" class="mr-2">Ordenar por:</label>
              <select id="sort" v-model="sortBy" class="sort-select">
                <option value="featured">Destacados</option>
                <option value="price-asc">Precio: Menor a mayor</option>
                <option value="price-desc">Precio: Mayor a menor</option>
                <option value="rating">Mejor valorados</option>
                <option value="newest">Más recientes</option>
              </select>
            </div>
            <div class="view-options">
              <button 
                @click="viewMode = 'grid'" 
                :class="{'active': viewMode === 'grid'}"
                class="view-btn"
                aria-label="Vista de cuadrícula"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button 
                @click="viewMode = 'list'" 
                :class="{'active': viewMode === 'list'}"
                class="view-btn"
                aria-label="Vista de lista"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <div v-if="filteredProducts.length === 0" class="no-results">
            <p>No se encontraron productos que coincidan con los filtros seleccionados.</p>
            <button @click="resetFilters" class="btn-primary mt-4">
              Limpiar filtros
            </button>
          </div>

          <div v-else :class="['products-list', viewMode === 'grid' ? 'grid-view' : 'list-view']">
            <div v-for="product in paginatedProducts" :key="product.id" class="product-card">
              <router-link 
                :to="{ name: 'product', params: { id: product.id } }" 
                class="product-link"
              >
                <div class="product-image">
                  <img :src="product.image" :alt="product.name" />
                  <span v-if="product.discount" class="discount-badge">-{{ product.discount }}%</span>
                </div>
                <div class="product-info">
                  <h3>{{ product.name }}</h3>
                  <p class="category">{{ product.category }}</p>
                  <div class="price-container">
                    <span class="price">${{ formatPrice(product.price) }}</span>
                    <span v-if="product.originalPrice" class="original-price">${{ formatPrice(product.originalPrice) }}</span>
                  </div>
                  <div class="rating">
                    <i v-for="i in 5" :key="i" :class="i <= Math.round(product.rating) ? 'fas fa-star' : 'far fa-star'"></i>
                  </div>
                </div>
              </router-link>
              <button @click.stop="addToCart(product)" class="add-to-cart">
                <i class="fas fa-shopping-cart"></i> Añadir al carrito
              </button>
            </div>
          </div>

          <!-- Paginación -->
          <div v-if="filteredProducts.length > itemsPerPage" class="pagination">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              Anterior
            </button>
            
            <div class="page-numbers">
              <button 
                v-for="page in totalPages" 
                :key="page"
                @click="currentPage = page"
                :class="{'active': currentPage === page}"
                class="page-number"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              @click="currentPage++" 
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from '@/store'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/services/firebase'

const store = useStore()
const products = ref([])
const isLoading = ref(true)
const API_BASE_URL = "https://api.apuntatealpaseo.com.co"
const API_BASE_URLdev = "http://localhost:5000"
// Filtros
const selectedCategories = ref([])
const priceRange = ref([0, 2000])
const minRating = ref(0)
const sortBy = ref('featured')
const viewMode = ref('grid')

// Paginación
const currentPage = ref(1)
const itemsPerPage = 12

// Fetch products from Firestore
const fetchProducts = async () => {
  try {
    isLoading.value = true

    let url = `${API_BASE_URL}/api/products`

    // Add sorting query params if needed
    if (sortBy.value === 'price-asc') {
      url += '?sort=price_asc'
    } else if (sortBy.value === 'price-desc') {
      url += '?sort=price_desc'
    } else if (sortBy.value === 'newest') {
      url += '?sort=newest'
    }

    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch products')

    const data = await res.json()

    products.value = data.map(p => ({
      ...p,
      rating: p.rating || 0,
      originalPrice: p.originalPrice || null,
      discount: p.discount || 0
    }))

    if (products.value.length > 0) {
      const prices = products.value.map(p => p.price)
      const maxPrice = Math.max(...prices)
      priceRange.value = [0, Math.ceil(maxPrice / 100) * 100]
    }

  } catch (error) {
    console.error('❌ Error fetching products:', error)
    alert('Failed to fetch products')
  } finally {
    isLoading.value = false
  }
}


// Computed properties for filtering and sorting
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    // Filter by category
    if (selectedCategories.value.length > 0 && !selectedCategories.value.includes(product.category)) {
      return false
    }
    
    // Filter by price range
    if (product.price < priceRange.value[0] || product.price > priceRange.value[1]) {
      return false
    }
    
    // Filter by minimum rating
    if (product.rating < minRating.value) {
      return false
    }
    
    return true
  })
})

// Sort products
const sortedProducts = computed(() => {
  const sorted = [...filteredProducts.value]
  
  switch (sortBy.value) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    default: // 'featured'
      return sorted
  }
})

// Update products when sort changes
watch(sortBy, () => {
  fetchProducts()
})

// Pagination
const totalPages = computed(() => {
  return Math.ceil(sortedProducts.value.length / itemsPerPage)
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedProducts.value.slice(start, end)
})

// Category counts for filters
const categoryCounts = computed(() => {
  const counts = {}
  products.value.forEach(product => {
    if (product.category) {
      counts[product.category] = (counts[product.category] || 0) + 1
    }
  })
  return counts
})

// Initialize
onMounted(() => {
  fetchProducts()
})

// Resetear todos los filtros
const resetFilters = async () => {
  selectedCategories.value = []
  priceRange.value = [0, 2000]
  minRating.value = 0
  sortBy.value = 'featured'
  currentPage.value = 1
  await fetchProducts() // Recargar productos después de reiniciar filtros
}


// Formatear categorías para mostrar
const formatCategory = (category) => {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

// Price formatting function
const formatPrice = (price) => {
  const number = Number(price);
  return number.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Agregar al carrito
const addToCart = (product) => {
  store.addToCart({ ...product, quantity: 1 })
}
</script>


<style scoped>
.products-page {
  padding: 2rem 0;
  min-height: 80vh;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.products-count {
  color: #666;
  font-size: 0.9rem;
}

.products-container {
  display: flex;
  gap: 2rem;
}

/* Filtros */
.filters {
  width: 250px;
  flex-shrink: 0;
}

.filter-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.filter-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #333;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-option {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  cursor: pointer;
  color: #444;
  transition: color 0.2s;
}

.filter-option:hover {
  color: #000;
}

.filter-option input[type="checkbox"],
.filter-option input[type="radio"] {
  margin-right: 0.5rem;
}

.price-range {
  padding: 0 0.5rem;
}

.price-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}

.rating-stars {
  color: #e2e8f0;
  font-size: 0.9rem;
  letter-spacing: 2px;
}

.reset-filters {
  width: 100%;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #555;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-filters:hover {
  background-color: #e9ecef;
}

/* Lista de productos */
.products-grid {
  flex: 1;
}

.sort-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.sort-by {
  display: flex;
  align-items: center;
}

.sort-select {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.view-options {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.5rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.view-btn:hover,
.view-btn.active {
  background-color: #f0f0f0;
  border-color: #999;
}

.products-list {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.grid-view {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.list-view {
  grid-template-columns: 1fr;
}

.no-results {
  text-align: center;
  padding: 3rem 0;
  color: #666;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
  background-color: #f0f0f0;
  border-color: #999;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-number:hover,
.page-number.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

/* Responsive */
@media (max-width: 1024px) {
  .products-container {
    flex-direction: column;
  }
  
  .filters {
    width: 100%;
    margin-bottom: 2rem;
  }
  
  .filter-section {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1rem;
    align-items: start;
  }
  
  .filter-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.5rem 1.5rem;
  }
}

@media (max-width: 768px) {
  .products-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .filter-section {
    grid-template-columns: 1fr;
  }
  
  .filter-options {
    grid-template-columns: 1fr 1fr;
  }
  
  .sort-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .view-options {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .filter-options {
    grid-template-columns: 1fr;
  }
  
  .page-numbers {
    display: none;
  }
  
  .pagination {
    gap: 0.5rem;
  }
  
  .pagination-btn {
    padding: 0.5rem;
  }
}

.product-link {
  text-decoration: none;
  color: inherit;
  display: block;
  margin-bottom: 0.5rem;
}

.product-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-link:hover .product-image img {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #ef4444;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.product-info {
  padding: 0.5rem 0;
}

.product-info h3 {
  margin: 0.25rem 0;
  color: #1f2937;
  font-size: 1.1rem;
}

.category {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0.25rem 0;
}

.price-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.price {
  font-weight: bold;
  color: #3b82f6;
  font-size: 1.1rem;
}

.original-price {
  text-decoration: line-through;
  color: #9ca3af;
  font-size: 0.9rem;
}

.rating {
  color: #f59e0b;
  font-size: 0.9rem;
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
  transition: background-color 0.2s;
}

.add-to-cart:hover {
  background: #2563eb;
}
</style>
