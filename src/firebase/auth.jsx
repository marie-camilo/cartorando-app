// Permet aux utilisateurs de se connecter avec Google

import { createContext, useContext, useEffect, useState } from 'react'
import { auth, googleProvider } from '../lib/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, updateProfile } from 'firebase/auth'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        return onAuthStateChanged(auth, (u) => {
            setUser(u)
            setLoading(false)
        })
    }, [])

    const value = {
        user,
        signInEmail: (email, password) => signInWithEmailAndPassword(auth, email, password),
        signUpEmail: (email, password, displayName) =>
            createUserWithEmailAndPassword(auth, email, password).then(async ({ user }) => {
                if (displayName) await updateProfile(user, { displayName })
                return user
            }),
        signInGoogle: () => signInWithPopup(auth, googleProvider),
        signOutUser: () => signOut(auth)
    }

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
