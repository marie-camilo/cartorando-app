import React, { useEffect, useState, FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../lib/firebase'
import FavoriteButton from '../components/ButtonFav'
import Button from '../components/Button'
import HikeMap from '../components/HikeMap'
import CommentsSection, { Comment } from '../components/CommentsSection'
import { doc, onSnapshot, collection, addDoc, query, orderBy, DocumentData, DocumentSnapshot, QuerySnapshot, Timestamp } from 'firebase/firestore'
import { useAuth } from '../firebase/auth'

interface Hike {
  id: string
  title: string
  description: string
  region: string
  difficulty: 'easy' | 'moderate' | 'hard'
  distanceKm: number
  elevationGainM: number
  createdAt?: Timestamp
  updatedAt?: Timestamp
  polyline?: [number, number][]
  itinerary?: { title: string; description: string }[]
}

export default function HikeView() {
  const { id } = useParams<{ id: string }>()
  const [hike, setHike] = useState<Hike | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // --- Charger la randonnée et les commentaires ---
  useEffect(() => {
    if (!id) return

    const unsubHike = onSnapshot(
      doc(db, 'hikes', id),
      (d: DocumentSnapshot<DocumentData>) => {
        if (d.exists()) setHike({ id: d.id, ...(d.data() as Omit<Hike, 'id'>) })
        else setError('Randonnée introuvable')
        setLoading(false)
      },
      (err) => {
        console.error(err)
        setError('Erreur lors du chargement de la randonnée')
        setLoading(false)
      }
    )

    const q = query(collection(db, 'hikes', id, 'comments'), orderBy('createdAt', 'asc'))
    const unsubComments = onSnapshot(
      q,
      (snap: QuerySnapshot<DocumentData>) =>
        setComments(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Comment, 'id'>) }))),
      (err) => console.error(err)
    )

    return () => {
      unsubHike()
      unsubComments()
    }
  }, [id])

  // --- Ajouter un commentaire ---
  const addComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !id) return
    const text = new FormData(e.currentTarget).get('text')?.toString()?.trim()
    if (!text) return
    try {
      await addDoc(collection(db, 'hikes', id, 'comments'), {
        text,
        authorUid: user.uid,
        authorName: user.displayName || 'Anonyme',
        createdAt: serverTimestamp(),
      })
      e.currentTarget.reset()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <p className="p-6 text-center">Chargement…</p>
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>
  if (!hike) return <p className="p-6 text-center">Randonnée introuvable</p>

  const difficultyColors: Record<Hike['difficulty'], string> = {
    easy: 'bg-[var(--green)]',
    moderate: 'bg-[var(--yellow)]',
    hard: 'bg-[var(--red)]',
  }

  const defaultImage =
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=60'
  const formatDate = (ts: Timestamp) =>
    ts.toDate().toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })

  const userName = user?.displayName?.trim() || user?.email?.split('@')[0] || 'Anonyme'

  return (
    <div className="container mx-auto max-w-10xl p-6 mt-25 space-y-6">
      {/* Header Image + Favorite */}
      <div className="relative overflow-hidden rounded-xl shadow">
        <img src={defaultImage} alt="Vue de montagne" className="w-full h-80 object-cover" />
        {user && id && (
          <div className="absolute top-3 right-3">
            <FavoriteButton user={user} hikeId={id} />
          </div>
        )}
      </div>

      {/* Hike Info */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h1 className="text-3xl font-bold">{hike.title}</h1>
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          <span>{hike.region}</span>
          <span>• {hike.distanceKm} km</span>
          <span>• +{hike.elevationGainM} m</span>
          <span
            className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${difficultyColors[hike.difficulty]}`}
          >
            {hike.difficulty === 'easy'
              ? 'Facile'
              : hike.difficulty === 'moderate'
                ? 'Modérée'
                : 'Difficile'}
          </span>
        </div>
        <p className="text-gray-700 leading-relaxed">{hike.description}</p>
        <div className="text-xs text-gray-500 space-y-1">
          {hike.createdAt && <p>Créée le {formatDate(hike.createdAt)}</p>}
          {hike.updatedAt && <p>Dernière mise à jour le {formatDate(hike.updatedAt)}</p>}
        </div>
      </div>

      {/* Carte + Itinéraire */}
      <div className="bg-white shadow rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Carte */}
          <div className="w-full h-80 md:h-[500px] overflow-hidden rounded-lg">
            <HikeMap hikeId={id!} polyline={hike.polyline} editable={!!user} />
          </div>

          {/* Itinéraire */}
          {hike.itinerary && hike.itinerary.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Itinéraire</h2>
              <ul className="list-none space-y-4 text-gray-700">
                {hike.itinerary.map((step, i) => (
                  <li key={i} className="leading-relaxed">
                    <p className="font-semibold">{step.title}</p>
                    <p className="text-gray-600">{step.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <CommentsSection
        comments={comments}
        canComment={!!user}
        hikeId={id!}
        userUid={user?.uid || ''}
        userName={userName}
      />
    </div>
  )
}
