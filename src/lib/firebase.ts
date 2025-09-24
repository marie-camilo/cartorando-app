import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Configurer Firebase à partir des variables d'environnement
const firebaseConfig = {
    apiKey: "AIzaSyDVKAzBs_9Gp31ZnpaEM3b99XdMGOu9A3Q",
    authDomain: "cartorando-98fd5.firebaseapp.com",
    projectId: "cartorando-98fd5",
    storageBucket: "cartorando-98fd5.firebasestorage.app",
    messagingSenderId: "198397907457",
    appId: "1:198397907457:web:04aedbde8a85d76dc92600"
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig)

// Export des services Firebase
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
export const storage = getStorage(app)
