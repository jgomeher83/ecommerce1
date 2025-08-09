const API_BASE_URL = "http://api.apuntatealpaseo.com.co"
const API_BASE_URLdev = "http://localhost:5000"
const VITE_API_URL= "https://backendpython1.onrender.com/chat"

export async function fetchProducts() {
    const res = await fetch(`${API_BASE_URL}/api/products`)
    return await res.json()
  }
  
  export async function getProductById(id) {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`)
    return await res.json()
  }
  