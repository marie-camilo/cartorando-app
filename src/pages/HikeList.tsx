import { useEffect, useState } from 'react'
import { collection, onSnapshot, DocumentData, QuerySnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import HikeCard from '../components/hikes/HikeCard'
import SplitText from '../components/animations/SplitText';

interface Hike {
  id: string
  title: string
  difficulty: 'easy' | 'moderate' | 'hard'
  region: string
  imageUrls: string[]
}

export default function HikeList() {
  const [hikes, setHikes] = useState<Hike[]>([])
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
            imageUrls: docData.imageUrls || [],
          }
        })
        setHikes(data)
      }
    )
    return () => unsub()
  }, [])

  const filteredHikes = hikes.filter(h =>
    (difficultyFilter === 'all' || h.difficulty === difficultyFilter) &&
    (regionFilter === 'all' || h.region === regionFilter)
  )

  const regions = Array.from(new Set(hikes.map(h => h.region)))

  return (
    <div className="w-full overflow-hidden">
      <section
        className="relative w-full h-[80vh] md:h-[100vh] flex items-center justify-center text-stone black-section"
        style={{
          backgroundImage: "url('/images/cerf.JPG')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="w-full px-8 text-slate-50 font-bold uppercase tracking-tight z-10">
          <div className="text-[9vw] leading-none pr-8 md:pr-16">
            <SplitText
              text="discover new"
              tag="span"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              duration={0.6}
              delay={50}
              ease="power2.out"
              textAlign="left"
            />
          </div>
          <div className="text-[9vw] leading-none pl-8 md:pl-16">
            <SplitText
              text="viewpoints & hikes."
              tag="span"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              duration={0.6}
              delay={50}
              ease="power2.out"
              textAlign="right"
            />
          </div>
        </div>
        {/* Overlay sombre pour améliorer lisibilité */}
        <div className="absolute inset-0 bg-black/40"></div>
      </section>

      <div className="px-8 py-8 bg-[var(--white)] min-h-screen mx-auto mt-24">
        {/* Barre de filtres brutaliste */}
        <div className="mb-8">
          <h2 className="font-bold text-2xl md:text-3xl mb-4 uppercase tracking-tight">
            browse by
          </h2>

          {/* Difficultés */}
          <ul className="flex flex-wrap gap-4 mb-4">
            {['all', 'easy', 'moderate', 'hard'].map(diff => (
              <li
                key={diff}
                className={`cursor-pointer px-4 py-2 border border-black uppercase font-bold ${
                  difficultyFilter === diff ? 'bg-black text-white' : 'bg-white text-black'
                }`}
                onClick={() => setDifficultyFilter(diff)}
              >
                {diff === 'all' ? 'All' : diff.charAt(0).toUpperCase() + diff.slice(1)}
              </li>
            ))}
          </ul>

          {/* Régions */}
          <ul className="flex flex-wrap gap-4">
            <li
              className={`cursor-pointer px-4 py-2 border border-black uppercase font-bold ${
                regionFilter === 'all' ? 'bg-black text-white' : 'bg-white text-black'
              }`}
              onClick={() => setRegionFilter('all')}
            >
              All regions
            </li>
            {regions.map(r => (
              <li
                key={r}
                className={`cursor-pointer px-4 py-2 border border-black uppercase font-bold ${
                  regionFilter === r ? 'bg-black text-white' : 'bg-white text-black'
                }`}
                onClick={() => setRegionFilter(r)}
              >
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Liste de randonnées */}
        {filteredHikes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {filteredHikes.map(h => (
              <div className="w-full max-w-m h-100" key={h.id}>
                <HikeCard
                  id={h.id}
                  title={h.title}
                  image={h.imageUrls?.[0]}
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
    </div>
  )
}
