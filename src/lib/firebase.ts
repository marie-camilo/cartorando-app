import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Configurer Firebase à partir des variables d'environnement
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FB_API_KEY,
    authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FB_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FB_MSG_SENDER_ID,
    appId: import.meta.env.VITE_FB_APP_ID
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig)

// Export des services Firebase
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
export const storage = getStorage(app)
