import { defineStore } from 'pinia'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'
const API_BASE_URL = "https://api.apuntatealpaseo.com.co"
const API_BASE_URLdev = "http://localhost:5000"
export const useStore = defineStore('main', {
  state: () => ({
    isLoading: false,
    cart: [],
    user: null,
    products: [],
    priceRange: [],
    sortBy: null
  }),
  getters: {
    cartCount: (state) => state.cart.reduce((count, item) => count + item.quantity, 0),
    cartTotal: (state) => state.cart.reduce((total, item) => total + (item.price * item.quantity), 0),
    isAdmin: (state) => state.user?.isAdmin || false
  },
  actions: {
    async fetchProducts() {
      try {
        this.isLoading = true;

        let url = `${API_BASE_URL}/api/products`;

        // Add sorting query params if needed
        if (this.sortBy === 'price-asc') {
          url += '?sort=price_asc';
        } else if (this.sortBy === 'price-desc') {
          url += '?sort=price_desc';
        } else if (this.sortBy === 'newest') {
          url += '?sort=newest';
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch products');

        const data = await res.json();

        this.products = data.map(p => ({
          ...p,
          rating: p.rating || 0,
          originalPrice: p.originalPrice || null,
          discount: p.discount || 0
        }));

        if (this.products.length > 0) {
          const prices = this.products.map(p => p.price);
          const maxPrice = Math.max(...prices);
          this.priceRange = [0, Math.ceil(maxPrice / 100) * 100];
        }

      } catch (error) {
        console.error('❌ Error fetching products:', error);
        alert('Failed to fetch products');
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