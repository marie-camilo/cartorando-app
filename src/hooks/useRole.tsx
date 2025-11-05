import { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '../firebase/auth'

export function useRole() {
  const { user } = useAuth()
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null)
        setLoading(false)
        return
      }

      const ref = doc(db, 'users', user.uid)
      const snap = await getDoc(ref)

      if (snap.exists()) {
        setRole(snap.data().role || 'user')
      } else {
        setRole('user')
      }

      setLoading(false)
    }

    fetchRole()
  }, [user])

  return { role, loading, isAdmin: role === 'admin' }
}
