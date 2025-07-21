import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

// Auth functions
export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password)
}

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password)
}

export const logoutUser = () => {
  return signOut(auth)
}

export const updateUserProfile = async (userData) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay usuario autenticado');
  
  try {
    await updateProfile(user, userData);
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    throw error;
  }
}

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe()
        resolve(user)
      },
      reject
    )
  })
}

export { auth }
