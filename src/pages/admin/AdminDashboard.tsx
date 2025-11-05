import { useEffect, useState } from "react"
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore"
import { db } from "../../lib/firebase"
import toast from "react-hot-toast"
import Button from "../../components/Button"

export default function AdminDashboard() {
  const [hikes, setHikes] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Récupérer toutes les randonnées
        const hikesQ = query(collection(db, "hikes"), orderBy("createdAt", "desc"))
        const hikesSnap = await getDocs(hikesQ)
        const hikesData = hikesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        setHikes(hikesData)

        // Récupérer tous les commentaires
        const commentsSnap = await getDocs(collection(db, "comments"))
        const commentsData = commentsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        setComments(commentsData)
      } catch (e) {
        console.error(e)
        toast.error("Erreur lors du chargement des données")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDeleteHike = async (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span>Supprimer cette randonnée ?</span>
        <div className="flex justify-end gap-2 mt-1">
          <button
            className="bg-gray-200 px-3 py-1 rounded"
            onClick={() => toast.dismiss(t.id)}
          >
            Annuler
          </button>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                await deleteDoc(doc(db, "hikes", id))
                setHikes((prev) => prev.filter((h) => h.id !== id))
                toast.success("Randonnée supprimée !")
              } catch (e) {
                console.error(e)
                toast.error("Erreur lors de la suppression")
              }
            }}
          >
            Supprimer
          </button>
        </div>
      </div>
    ), { position: "top-center" })
  }

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteDoc(doc(db, "comments", id))
      setComments(prev => prev.filter(c => c.id !== id))
      toast.success("Commentaire supprimé !")
    } catch (e) {
      console.error(e)
      toast.error("Erreur lors de la suppression du commentaire")
    }
  }

  if (loading) return <p className="p-6">Chargement…</p>

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Espace Administrateur</h1>
      <p className="text-gray-700 mb-4">Gestion des randonnées et des commentaires 🔧</p>

      {/* --- RANDONNÉES --- */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Toutes les randonnées</h2>
        {hikes.length === 0 ? (
          <p className="text-gray-500">Aucune randonnée trouvée.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hikes.map((hike) => (
              <div key={hike.id} className="bg-white shadow rounded-xl p-4 flex flex-col">
                <h3 className="font-semibold mb-2">{hike.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{hike.region}</p>
                <Button
                  onClick={() => handleDeleteHike(hike.id)}
                  variant="orange"
                >
                  Supprimer
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- COMMENTAIRES --- */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Tous les commentaires</h2>
        {comments.length === 0 ? (
          <p className="text-gray-500">Aucun commentaire trouvé.</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li
                key={c.id}
                className="bg-white shadow rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{c.text}</p>
                  <p className="text-gray-500 text-sm">
                    Par : {c.userName || c.userId}
                  </p>
                </div>
                <Button
                  onClick={() => handleDeleteComment(c.id)}
                  variant="orange"
                >
                  Supprimer
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
