import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react'
import type { ReactNode } from 'react'
import { auth, googleProvider } from '../lib/firebase'
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    signInWithPopup,
    updateProfile,
} from 'firebase/auth'
import type { User } from 'firebase/auth'

export interface AuthContextType {
    user: User | null
    signInEmail: (email: string, password: string) => Promise<unknown>
    signUpEmail: (
        email: string,
        password: string,
        displayName?: string
    ) => Promise<User>
    signInGoogle: () => Promise<unknown>
    signOutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
    return ctx
}

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u)
            setLoading(false)
        })
        return unsub
    }, [])

    const signInEmail = (email: string, password: string) =>
        signInWithEmailAndPassword(auth, email, password)

    const signUpEmail = async (
        email: string,
        password: string,
        displayName?: string
    ) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (displayName) await updateProfile(cred.user, { displayName })
        return cred.user
    }

    const signInGoogle = () => signInWithPopup(auth, googleProvider)
    const signOutUser = () => signOut(auth)

    const value: AuthContextType = {
        user,
        signInEmail,
        signUpEmail,
        signInGoogle,
        signOutUser,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
