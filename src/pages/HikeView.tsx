import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../lib/firebase'
import type { DocumentData, DocumentSnapshot, QuerySnapshot, Timestamp } from 'firebase/firestore'
import { doc, onSnapshot, collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { useAuth } from '../firebase/auth'

interface Hike {
    id: string
    title: string
    description: string
    region: string
    difficulty: 'easy' | 'moderate' | 'hard'
    distanceKm: number
    elevationGainM: number
}

interface Comment {
    id: string
    text: string
    authorUid: string
    authorName: string
    createdAt: Timestamp
}

export default function HikeView() {
    const { id } = useParams<{ id: string }>()
    const [hike, setHike] = useState<Hike | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    // Charger la randonnée et ses commentaires
    useEffect(() => {
        if (!id) {
            setError('ID de randonnée manquant')
            setLoading(false)
            return
        }

        const unsubHike = onSnapshot(
            doc(db, 'hikes', id),
            (d: DocumentSnapshot<DocumentData>) => {
                if (d.exists()) setHike({ id: d.id, ...(d.data() as Omit<Hike, 'id'>) })
                else setError('Randonnée introuvable')
                setLoading(false)
            },
            err => {
                console.error(err)
                setError('Erreur lors du chargement de la randonnée')
                setLoading(false)
            }
        )

        const q = query(collection(db, 'hikes', id, 'comments'), orderBy('createdAt', 'asc'))
        const unsubComments = onSnapshot(
            q,
            (snap: QuerySnapshot<DocumentData>) => {
                setComments(
                    snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Comment, 'id'>) }))
                )
            },
            err => console.error(err)
        )

        return () => {
            unsubHike()
            unsubComments()
        }
    }, [id])

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

    if (loading) return <p>Chargement…</p>
    if (error) return <p className="text-red-500">{error}</p>
    if (!hike) return <p>Randonnée introuvable</p>

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">{hike.title}</h1>
            <p className="text-gray-700">{hike.description}</p>
            <p className="text-sm">
                {hike.region} • {hike.difficulty} • {hike.distanceKm} km • +{hike.elevationGainM} m
            </p>

            <CommentsSection comments={comments} onSubmit={addComment} canComment={!!user} />
        </div>
    )
}

interface CommentsSectionProps {
    comments: Comment[]
    onSubmit: (e: FormEvent<HTMLFormElement>) => void
    canComment: boolean
}

function CommentsSection({ comments, onSubmit, canComment }: CommentsSectionProps) {
    return (
        <div className="space-y-2">
            <h3 className="font-semibold">Commentaires</h3>
            {comments.length > 0 ? (
                <ul className="space-y-1">
                    {comments.map(c => (
                        <li key={c.id} className="border p-2 rounded">
                            <p className="text-sm">{c.text}</p>
                            <p className="text-xs text-gray-500">par {c.authorName}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 text-sm">Aucun commentaire pour le moment</p>
            )}
            {canComment && (
                <form onSubmit={onSubmit} className="flex gap-2">
                    <input
                        name="text"
                        placeholder="Ajouter un commentaire…"
                        className="flex-1 input"
                        required
                        minLength={1}
                        maxLength={500}
                    />
                    <button type="submit" className="btn">Envoyer</button>
                </form>
            )}
        </div>
    )
}