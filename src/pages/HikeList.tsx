import { useEffect, useState } from 'react'
import { collection, onSnapshot, DocumentData, QuerySnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import HikeCard from '../components/hikes/HikeCard'

export default function HikeList() {
  const [hikes, setHikes] = useState<{ id: string; title: string; difficulty: 'easy' | 'moderate' | 'hard'; region: string }[]>([])

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'hikes'),
      (snap: QuerySnapshot<DocumentData>) => {
        const data = snap.docs.map(d => ({
          id: d.id,
          title: d.data().title,
          difficulty: d.data().difficulty,
          region: d.data().region
        }))
        setHikes(data)
      }
    )
    return () => unsub()
  }, [])

  return (
    <div className="px-4 py-8 bg-[var(--white)] min-h-screen max-w-7xl mx-auto content-center">
      <h1 className="text-3xl font-medium mb-8 text-[var(--dark)] text-center">
        Des <span className="text-[var(--orange)]">randonnées</span> autour de chez vous !
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {hikes.map(h => (
          <HikeCard
            key={h.id}
            id={h.id}
            title={h.title}
            difficulty={h.difficulty}
            region={h.region}
          />
        ))}
      </div>
    </div>
  )
}
