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
import HikeCard from '../hikes/HikeCard'

export default function MyHikes() {
    const {user} = useAuth()
    const navigate = useNavigate()
    const [hikes, setHikes] = useState<
      {
          id: string
          title: string
          region: string
          difficulty?: 'easy' | 'moderate' | 'hard'
          image?: string
          createdAt?: Date
      }[]
    >([])

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
                image: d.data().image || undefined,
                difficulty: d.data().difficulty || 'easy',
                createdAt: d.data().createdAt?.toDate(),
            }))
            setHikes(data)
        })
        return () => unsub()
    }, [user])

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hikes.map((h) => (
                  <div key={h.id} className="flex flex-col bg-white rounded-2xl shadow-md">
                      {/* Carte de la rando */}
                      <HikeCard
                        id={h.id}
                        title={h.title}
                        image={h.image}
                        difficulty={h.difficulty || 'easy'}
                        region={h.region}
                      />

                      <div className="flex p-4 gap-2">
                          <Button
                            onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                navigate(`/hikes/edit/${h.id}`)
                            }}
                            className="flex-1"
                          >
                              Modifier
                          </Button>
                          <Button
                            onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                handleDelete(h.id)
                            }}
                            variant="orange"
                            className="flex-1"
                          >
                              Supprimer
                          </Button>
                      </div>
                  </div>
                ))}
            </div>
          )}
      </div>
    );
}
