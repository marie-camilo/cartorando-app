import {
  collection, query, where, getDocs, getDoc, doc
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../firebase/auth'
import { useEffect, useState } from 'react'
import HikeCard from '../hikes/HikeCard'

export default function Favorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    async function fetchFavorites() {
      try {
        const q = query(
          collection(db, 'favorites'),
          where('userId', '==', user.uid)
        )

        const snap = await getDocs(q)
        const hikes: any[] = []

        for (const fav of snap.docs) {
          const { hikeId } = fav.data()
          if (!hikeId) continue
          const hikeDoc = await getDoc(doc(db, 'hikes', hikeId))
          if (hikeDoc.exists()) {
            hikes.push({ id: hikeDoc.id, ...hikeDoc.data() })
          }
        }

        setFavorites(hikes)
      } catch (err) {
        console.error('Erreur lors de la récupération des favoris :', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [user])

  if (!user) return <p className="p-6">Connectez-vous pour voir vos favoris.</p>
  if (loading) return <p className="p-6">Chargement…</p>
  if (favorites.length === 0) return <p className="p-6">Aucun favori pour l’instant.</p>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {favorites.map(h => (
        <HikeCard key={h.id} {...h} />
      ))}
    </div>
  )
}
