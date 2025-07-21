import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'

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
const db = getFirestore(app)

// Auth functions
export const registerUser = async (email, password, additionalData = {}) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Create user document in Firestore
    const userData = {
      uid: user.uid,
      email: user.email,
      createdAt: serverTimestamp(),
      isAdmin: false, // Default admin status
      ...additionalData
    }
    
    // Store user data in Firestore
    await setDoc(doc(db, 'users', user.uid), userData)
    
    return userCredential
  } catch (error) {
    console.error('Error registering user:', error)
    throw error
  }
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
    // Update auth profile
    await updateProfile(user, userData);
    
    // Update Firestore user document
    if (user.uid) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, userData, { merge: true });
    }
    
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

export { auth, db }
