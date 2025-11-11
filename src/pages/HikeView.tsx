import React, { useEffect, useState, FormEvent } from 'react'
import { MapPin, Route, Mountain, Calendar } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { db, storage } from '../lib/firebase'
import { ref, getDownloadURL } from 'firebase/storage'
import FavoriteButton from '../components/ButtonFav'
import HikeMap from '../components/HikeMap'
import CommentsSection, { Comment } from '../components/CommentsSection'
import { doc, onSnapshot, collection, addDoc, query, orderBy, DocumentData, DocumentSnapshot, QuerySnapshot, Timestamp, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '../firebase/auth'
import WeatherBanner from '../components/hikes/WeatherBanner'

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
  imageUrls?: string[]
  gpxPath?: string
}

export default function HikeView() {
  const { id } = useParams<{ id: string }>()
  const [hike, setHike] = useState<Hike | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gpxPolyline, setGpxPolyline] = useState<[number, number][]>([])
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

  // --- Charger GPX si disponible ---
  useEffect(() => {
    const loadGpx = async () => {
      if (!hike) return
      try {
        if (hike.gpxPath) {
          const url = await getDownloadURL(ref(storage, hike.gpxPath))
          const res = await fetch(url)
          const text = await res.text()
          const parser = new DOMParser()
          const xml = parser.parseFromString(text, 'application/xml')
          const coords: [number, number][] = Array.from(xml.getElementsByTagName('trkpt')).map(pt => [
            parseFloat(pt.getAttribute('lat') || '0'),
            parseFloat(pt.getAttribute('lon') || '0')
          ])
          if (coords.length) setGpxPolyline(coords)
        }
      } catch (err) {
        console.error('Impossible de charger le GPX', err)
      }
    }
    loadGpx()
  }, [hike])

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
  const mainImage = hike.imageUrls && hike.imageUrls.length > 0
    ? hike.imageUrls[0]
    : defaultImage

  const formatDate = (ts: Timestamp) =>
    ts.toDate().toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })

  const userName = user?.displayName?.trim() || user?.email?.split('@')[0] || 'Anonyme'

  return (
    <div className="container mx-auto max-w-10xl p-6 mt-25 space-y-6">
      {/* Header Image + Favorite */}
      <div className="relative overflow-hidden rounded-xl shadow">
        <div className="absolute top-3 right-3">
          {id && <FavoriteButton user={user} hikeId={id} />}
        </div>
        {hike.imageUrls && hike.imageUrls.length > 0 && (
          <>
            {/* Image principale */}
            <div className="relative overflow-hidden rounded-xl shadow">
              <img
                src={hike.imageUrls[0]}
                alt="Vue principale"
                className="w-full h-80 md:h-[450px] object-cover"
              />
              <div className="absolute top-3 right-3">
                {id && <FavoriteButton user={user} hikeId={id} />}
              </div>
            </div>

            {/* Galerie sous l’image principale */}
            {hike.imageUrls.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                {hike.imageUrls.slice(1).map((url, i) => (
                  <div
                    key={i}
                    className="relative overflow-hidden rounded-lg group"
                  >
                    <img
                      src={url}
                      alt={`photo-${i + 1}`}
                      className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Hike Info */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">{hike.title}</h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[var(--corail)]" />
            <span>{hike.region}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Route className="w-4 h-4 text-[var(--orange)]" />
            <span>{hike.distanceKm} km</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mountain className="w-4 h-4 text-[var(--green-moss)]" />
            <span>+{hike.elevationGainM} m</span>
          </div>
          <div className="flex items-center gap-1.5">
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
        </div>

        <p className="text-gray-700 leading-relaxed">{hike.description}</p>

        <div className="text-xs text-gray-500 space-y-1 mt-3">
          {hike.createdAt && (
            <p className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-gray-400" />
              Créée le {formatDate(hike.createdAt)}
            </p>
          )}
          {hike.updatedAt && (
            <p className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-gray-400" />
              Dernière mise à jour le {formatDate(hike.updatedAt)}
            </p>
          )}
        </div>
      </div>

      {/* Carte + Itinéraire */}
      <div className="bg-white shadow rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Carte */}
          <div className="w-full h-80 md:h-[500px] overflow-hidden rounded-lg md:z-30">
            <HikeMap
              hikeId={id!}
              editable={!!user}
              gpxPath={hike.gpxPath || null} // <- toujours prioritaire
            />
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
          <div>
            <WeatherBanner city="Chamonix" />
          </div>
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