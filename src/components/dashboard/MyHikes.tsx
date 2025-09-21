import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {HiPlus} from "react-icons/hi";
import {db} from "../../lib/firebase"
import {
    collection,
    onSnapshot,
    query,
    where,
    deleteDoc,
    doc,
    orderBy,
    DocumentData,
    QuerySnapshot,
} from 'firebase/firestore'
import {useAuth} from '../../firebase/auth'
import Button from '../Button'

export default function MyHikes() {
    const {user} = useAuth()
    const navigate = useNavigate()
    const [hikes, setHikes] = useState<
        { id: string; title: string; region: string; createdAt?: Date }[]
    >([])

    // Charger uniquement les randos de l'utilisateur connecté
    useEffect(() => {
        if (!user) return
        const q = query(
            collection(db, 'hikes'),
            where('createdBy', '==', user.uid),
            orderBy('createdAt', 'desc')
        )
        const unsub = onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
            const data = snap.docs.map((d) => ({
                id: d.id,
                title: d.data().title,
                region: d.data().region,
                createdAt: d.data().createdAt?.toDate(),
            }))
            setHikes(data)
        })
        return () => unsub()
    }, [user])

    // Suppression d'une rando
    const handleDelete = async (id: string) => {
        if (!window.confirm('Supprimer cette rando ?')) return
        try {
            await deleteDoc(doc(db, 'hikes', id))
            alert('Randonnée supprimée !')
        } catch (e) {
            console.error(e)
            alert('Erreur lors de la suppression')
        }
    }

    if (!user) {
        return <p>Vous devez être connecté pour voir vos randonnées.</p>
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Mes randonnées</h1>
                <Button
                    onClick={() => navigate('/hikes/new')}
                    className="flex items-center gap-2"
                >
                    <HiPlus className="w-5 h-5"/>
                    Ajouter une rando
                </Button>
            </div>

            {hikes.length === 0 ? (
                <p className="text-gray-500">Vous n’avez encore créé aucune randonnée.</p>
            ) : (
                <ul className="space-y-4">
                    {hikes.map((h) => (
                        <li
                            key={h.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between bg-white shadow rounded-lg p-4 border"
                        >
                            <div className="mb-2 sm:mb-0">
                                <h2 className="font-semibold text-lg">{h.title}</h2>
                                <p className="text-sm text-gray-500">
                                    {h.region} •{' '}
                                    {h.createdAt
                                        ? h.createdAt.toLocaleDateString()
                                        : 'Date inconnue'}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => navigate(`/hikes/edit/${h.id}`)}
                                >
                                    Modifier
                                </Button>

                                <Button
                                    onClick={() => handleDelete(h.id)} variant="orange"
                                >
                                    Supprimer
                                </Button>
                            </div>

                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
