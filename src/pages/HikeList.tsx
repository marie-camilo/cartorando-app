import { useEffect, useState } from 'react'
import { collection, onSnapshot, DocumentData, QuerySnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import HikeCard from '../components/hikes/HikeCard'

interface Hike {
  id: string
  title: string
  difficulty: 'easy' | 'moderate' | 'hard'
  region: string
  imageUrls: string[]
}
export default function HikeList() {
  const [hikes, setHikes] = useState<{
    id: string
    title: string
    difficulty: 'easy' | 'moderate' | 'hard'
    region: string
    images?: string[]
  }[]>([])
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [regionFilter, setRegionFilter] = useState<string>('all')

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'hikes'),
      (snap: QuerySnapshot<DocumentData>) => {
        const data = snap.docs.map(d => {
          const docData = d.data()
          return {
            id: d.id,
            title: docData.title,
            difficulty: docData.difficulty,
            region: docData.region,
            images: docData.imageUrls || [],
          }
        })
        setHikes(data)
      }
    )
    return () => unsub()
  }, [])


  // Applique les filtres
  const filteredHikes = hikes.filter(h =>
    (difficultyFilter === 'all' || h.difficulty === difficultyFilter) &&
    (regionFilter === 'all' || h.region === regionFilter)
  )

  // Extraire les régions uniques
  const regions = Array.from(new Set(hikes.map(h => h.region)))

  return (
    <div className="px-4 py-8 bg-[var(--white)] min-h-screen max-w-7xl mx-auto mt-24">
      <h1 className="text-3xl font-medium mb-8 text-[var(--dark)] text-center">
        Des <span className="text-[var(--orange)]">randonnées</span> autour de chez vous !
      </h1>

      {/* Barre de filtres */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8">
        <select
          value={difficultyFilter}
          onChange={e => setDifficultyFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-[var(--orange)] focus:outline-none"
        >
          <option value="all">Toutes les difficultés</option>
          <option value="easy">Facile</option>
          <option value="moderate">Modérée</option>
          <option value="hard">Difficile</option>
        </select>

        <select
          value={regionFilter}
          onChange={e => setRegionFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-[var(--orange)] focus:outline-none"
        >
          <option value="all">Toutes les régions</option>
          {regions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Liste de randonnées */}
      {filteredHikes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {filteredHikes.map(h => (
            <div className="w-full max-w-m h-100">
            <HikeCard
              key={h.id}
              id={h.id}
              title={h.title}
              image={h.images?.[0]}
              difficulty={h.difficulty}
              region={h.region}
            />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">Aucune randonnée ne correspond à vos filtres.</p>
      )}
    </div>
  )
}
