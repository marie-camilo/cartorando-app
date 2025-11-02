import { useEffect, useState } from "react"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuth } from "../../firebase/auth"
import Button from "../Button"
import { useNavigate } from "react-router-dom"

export default function Overview() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [myHikes, setMyHikes] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalKm, setTotalKm] = useState(0)

  useEffect(() => {
    if (!user) return

    async function fetchData() {
      setLoading(true)
      try {
        // Mes randonnées
        const hikesQ = query(
          collection(db, "hikes"),
          where("createdBy", "==", user.uid),
          orderBy("createdAt", "desc")
        )
        const hikesSnap = await getDocs(hikesQ)
        const hikesData = hikesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        setMyHikes(hikesData)

        // Total km
        const kmSum = hikesData.reduce((acc, h) => acc + (h.distanceKm || 0), 0)
        setTotalKm(kmSum)

        // Mes favoris
        const favQ = query(collection(db, "favorites"), where("userId", "==", user.uid))
        const favSnap = await getDocs(favQ)
        const favHikes: any[] = []
        for (const fav of favSnap.docs) {
          const { hikeId } = fav.data()
          if (!hikeId) continue
          const hikeDoc = await getDocs(query(collection(db, "hikes"), where("__name__", "==", hikeId)))
          if (!hikeDoc.empty) favHikes.push({ id: hikeDoc.docs[0].id, ...hikeDoc.docs[0].data() })
        }
        setFavorites(favHikes)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (!user) return <p className="p-6">Connectez-vous pour voir votre dashboard.</p>
  if (loading) return <p className="p-6">Chargement…</p>

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Bienvenue sur votre Dashboard</h1>
      <p className="text-gray-600">
        Retrouvez ici un aperçu de vos randonnées, favoris et dernières activités.
      </p>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500">Mes randonnées</p>
          <p className="text-2xl font-bold">{myHikes.length}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500">Mes favoris</p>
          <p className="text-2xl font-bold">{favorites.length}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500">Total km</p>
          <p className="text-2xl font-bold">{totalKm} km</p>
        </div>
      </div>

      {/* Dernières randonnées */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Dernières randonnées</h2>
        <ul className="space-y-3">
          {myHikes.slice(0, 3).map(hike => (
            <li key={hike.id} className="bg-white p-4 shadow rounded-xl">
              {hike.title} ({hike.distanceKm || 0} km)
            </li>
          ))}
          {myHikes.length === 0 && <li className="text-gray-500">Aucune randonnée créée pour l’instant.</li>}
        </ul>
      </div>

      {/* Actions rapides */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="green" onClick={() => navigate("/hikes/new")}>
          Ajouter une rando
        </Button>
        <Button variant="orange" onClick={() => navigate("/dashboard/hikes")}>
          Voir mes randos
        </Button>
      </div>
    </div>
  )
}
