// src/pages/HikeListTest.tsx
import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {db} from '../lib/firebase'
import {collection, onSnapshot, DocumentData, QuerySnapshot} from 'firebase/firestore'

export default function HikeList() {
    const [hikes, setHikes] = useState<{ id: string; title: string }[]>([])

    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, 'hikes'),
            (snap: QuerySnapshot<DocumentData>) => {
                const data = snap.docs.map(d => ({id: d.id, title: d.data().title}))
                setHikes(data)
            }
        )
        return () => unsub()
    }, [])

    return (
        <div>
            <h1 className="text-3xl font-medium mb-8">Des <span
                className="text-[var(--orange)]">randonnées</span> autour de chez vous !
            </h1>
            <ul>
                {hikes.map(h => (
                    <li key={h.id}>
                        <Link to={`/hikes/${h.id}`}>{h.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
