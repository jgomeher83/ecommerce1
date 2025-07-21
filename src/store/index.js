import { defineStore } from 'pinia'

export const useStore = defineStore('main', {
  state: () => ({
    isLoading: false,
    cart: [],
    user: null,
    products: []
  }),
  getters: {
    cartCount: (state) => state.cart.reduce((count, item) => count + item.quantity, 0),
    cartTotal: (state) => state.cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  },
  actions: {
    async fetchProducts() {
      this.isLoading = true
      try {
        // Fetch products from API or service
        // this.products = await productService.getAll()
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        this.isLoading = false
      }
    },
    addToCart(product) {
      const existingItem = this.cart.find(item => item.id === product.id)
      if (existingItem) {
        existingItem.quantity += product.quantity  // Add the selected quantity
      } else {
        this.cart.push({ ...product })  // Product already has the correct quantity
      }
    },
    removeFromCart(productId) {
      const index = this.cart.findIndex(item => item.id === productId)
      if (index !== -1) {
        this.cart.splice(index, 1)
      }
    },
    updateQuantity(productId, quantity) {
      const item = this.cart.find(item => item.id === productId)
      if (item) {
        item.quantity = quantity
      }
    },
    clearCart() {
      this.cart = []
    }
  },
  // Habilitar persistencia para todo el store
  persist: true
})