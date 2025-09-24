import React, { useEffect, useState, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import {
    doc,
    onSnapshot,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy,
    DocumentData,
    DocumentSnapshot,
    QuerySnapshot,
    Timestamp,
} from 'firebase/firestore';
import { useAuth } from '../firebase/auth';
import Button from '../components/Button';

interface Hike {
    id: string;
    title: string;
    description: string;
    region: string;
    difficulty: 'easy' | 'moderate' | 'hard';
    distanceKm: number;
    elevationGainM: number;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

interface Comment {
    id: string;
    text: string;
    authorUid: string;
    authorName: string;
    createdAt: Timestamp;
}

export default function HikeView() {
    const { id } = useParams<{ id: string }>();
    const [hike, setHike] = useState<Hike | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (!id) {
            setError('ID de randonnée manquant');
            setLoading(false);
            return;
        }

        const unsubHike = onSnapshot(
          doc(db, 'hikes', id),
          (d: DocumentSnapshot<DocumentData>) => {
              if (d.exists()) setHike({ id: d.id, ...(d.data() as Omit<Hike, 'id'>) });
              else setError('Randonnée introuvable');
              setLoading(false);
          },
          err => {
              console.error(err);
              setError('Erreur lors du chargement de la randonnée');
              setLoading(false);
          }
        );

        const q = query(
          collection(db, 'hikes', id, 'comments'),
          orderBy('createdAt', 'asc')
        );
        const unsubComments = onSnapshot(
          q,
          (snap: QuerySnapshot<DocumentData>) => {
              setComments(
                snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Comment, 'id'>) }))
              );
          },
          err => console.error(err)
        );

        return () => {
            unsubHike();
            unsubComments();
        };
    }, [id]);

    const addComment = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user || !id) return;
        const text = new FormData(e.currentTarget).get('text')?.toString()?.trim();
        if (!text) return;
        try {
            await addDoc(collection(db, 'hikes', id, 'comments'), {
                text,
                authorUid: user.uid,
                authorName: user.displayName || 'Anonyme',
                createdAt: serverTimestamp(),
            });
            e.currentTarget.reset();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <p className="p-6 text-center">Chargement…</p>;
    if (error) return <p className="p-6 text-center text-red-500">{error}</p>;
    if (!hike) return <p className="p-6 text-center">Randonnée introuvable</p>;

    const difficultyColors: Record<Hike['difficulty'], string> = {
        easy: 'bg-[var(--green)]',
        moderate: 'bg-[var(--yellow)]',
        hard: 'bg-[var(--red)]',
    };

    const defaultImage =
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=60';

    function formatDate(ts: Timestamp) {
        return ts.toDate().toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
    }

    return (
      <div className="container mx-auto max-w-10xl p-6">
          <div className="overflow-hidden rounded-xl shadow">
              <img src={defaultImage} alt="Vue de montagne" className="w-full h-85 object-cover" />
          </div>

          <div className="bg-white shadow rounded-xl p-6 space-y-4 mt-6">
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

          { id && (
            <CommentsSection
              comments={comments}
              canComment={!!user}
              hikeId={id}
              userUid={user?.uid || ''}
              addComment={addComment}
            />
          )}

      </div>
    );
}

interface CommentsSectionProps {
    comments: Comment[];
    canComment: boolean;
    hikeId: string;
    userUid: string;
    addComment: (e: FormEvent<HTMLFormElement>) => void;
}

function CommentsSection({ comments, canComment, hikeId, userUid, addComment }: CommentsSectionProps) {
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState<string>('');

    const startEditing = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditingText(comment.text || '');
    };

    const cancelEditing = () => {
        setEditingCommentId(null);
        setEditingText('');
    };

    const saveEdit = async () => {
        if (!editingCommentId) return;
        const trimmedText = editingText.trim();
        if (!trimmedText) return;

        try {
            const docRef = doc(db, 'hikes', hikeId, 'comments', editingCommentId);
            await updateDoc(docRef, {
                text: trimmedText,
                updatedAt: serverTimestamp(),
            });
            cancelEditing();
        } catch (err) {
            console.error("Erreur lors de la sauvegarde :", err);
        }
    };

    const deleteComment = async (commentId: string) => {
        try {
            await deleteDoc(doc(db, 'hikes', hikeId, 'comments', commentId));
        } catch (err) {
            console.error(err);
        }
    };

    return (
      <div className="mt-8 bg-white shadow rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-semibold">Commentaires</h3>

          {comments.length > 0 ? (
            <ul className="space-y-3">
                {comments.map(c => (
                  <li key={c.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex justify-between items-start">
                      <div className="flex-1">
                          {editingCommentId === c.id ? (
                            <textarea
                              className="w-full border border-gray-300 rounded-lg p-2"
                              value={editingText}
                              onChange={e => setEditingText(e.target.value)}
                            />
                          ) : (
                            <p className="text-gray-800">{c.text}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                              par {c.authorName} •{' '}
                              {c.createdAt
                                ? c.createdAt.toDate().toLocaleDateString('fr-FR', { dateStyle: 'medium' })
                                : ''}
                          </p>
                      </div>

                      {userUid === c.authorUid && (
                        <div className="flex gap-2 ml-4 items-center">
                            {editingCommentId === c.id ? (
                              <>
                                  <button onClick={saveEdit} className="text-green-600 hover:text-green-800">💾</button>
                                  <button onClick={cancelEditing} className="text-gray-600 hover:text-gray-800">❌</button>
                              </>
                            ) : (
                              <>
                                  <button onClick={() => startEditing(c)} className="text-blue-600 hover:text-blue-800">✏️</button>
                                  <button onClick={() => deleteComment(c.id)} className="text-red-600 hover:text-red-800">❌</button>
                              </>
                            )}
                        </div>
                      )}
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Aucun commentaire pour le moment</p>
          )}

          {canComment && (
            <form onSubmit={addComment} className="flex gap-2 mt-2">
                <input
                  name="text"
                  placeholder="Ajouter un commentaire…"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                  minLength={1}
                  maxLength={500}
                />
                <Button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                    Envoyer
                </Button>
            </form>
          )}
      </div>
    );
}
