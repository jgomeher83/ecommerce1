import { defineStore } from 'pinia'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'

export const useStore = defineStore('main', {
  state: () => ({
    isLoading: false,
    cart: [],
    user: null,
    products: []
  }),
  getters: {
    cartCount: (state) => state.cart.reduce((count, item) => count + item.quantity, 0),
    cartTotal: (state) => state.cart.reduce((total, item) => total + (item.price * item.quantity), 0),
    isAdmin: (state) => state.user?.isAdmin || false
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
    async setUser(userData) {
      if (userData) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', userData.uid))
        this.user = {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          isAdmin: userDoc.exists() ? userDoc.data().isAdmin || false : false,
          ...userData
        }
      } else {
        this.user = null
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
    },
    // Initialize auth state listener
    initAuth() {
      const auth = getAuth()
      onAuthStateChanged(auth, async (user) => {
        await this.setUser(user)
      })
    }
  },
  // Habilitar persistencia para todo el store
  persist: true
})