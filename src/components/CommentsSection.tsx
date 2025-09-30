import React, { useState, useRef, useEffect, FormEvent } from 'react'
import { db } from '../lib/firebase'
import { doc, addDoc, updateDoc, deleteDoc, serverTimestamp, collection } from 'firebase/firestore'
import Button from './Button'
import { FiTrash } from 'react-icons/fi';

export interface Comment {
  id: string
  text: string
  authorUid: string
  authorName: string
  createdAt: any
  updatedAt?: any
}

interface CommentsSectionProps {
  comments: Comment[]
  canComment: boolean
  hikeId: string
  userUid: string
  userName: string
}

export default function CommentsSection({ comments, hikeId, userUid, userName, canComment }: CommentsSectionProps) {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingTexts, setEditingTexts] = useState<{ [key: string]: string }>({})
  const [newComment, setNewComment] = useState<string>('')

  const editRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editingCommentId && editRef.current) {
      editRef.current.focus()
      editRef.current.selectionStart = editRef.current.value.length
    }
  }, [editingCommentId])

  const handleAddComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const text = newComment.trim()
    if (!text) return
    try {
      await addDoc(collection(db, 'hikes', hikeId, 'comments'), {
        text,
        authorUid: userUid,
        authorName: userName,
        createdAt: serverTimestamp(),
      })
      setNewComment('')
    } catch (err) {
      console.error(err)
    }
  }

  const startEditing = (c: Comment) => {
    setEditingCommentId(c.id)
    setEditingTexts(prev => ({ ...prev, [c.id]: c.text }))
  }

  const cancelEditing = () => {
    if (editingCommentId) {
      setEditingTexts(prev => {
        const copy = { ...prev }
        delete copy[editingCommentId]
        return copy
      })
    }
    setEditingCommentId(null)
  }

  const saveEdit = async (commentId: string) => {
    const trimmed = editingTexts[commentId]?.trim()
    if (!trimmed) return
    try {
      await updateDoc(doc(db, 'hikes', hikeId, 'comments', commentId), {
        text: trimmed,
        updatedAt: serverTimestamp(),
      })
      cancelEditing()
    } catch (err) {
      console.error(err)
    }
  }

  const deleteComment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'hikes', hikeId, 'comments', id))
    } catch (err) {
      console.error(err)
    }
  }

  console.log("Editing comment", editingCommentId, "for hike", hikeId);

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
                    ref={editRef}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    value={editingTexts[c.id]}
                    onChange={e => setEditingTexts(prev => ({ ...prev, [c.id]: e.target.value }))}
                    rows={2}
                  />
                ) : (
                  <p className="text-gray-800">{c.text}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  par {c.authorName} •{' '}
                  {c.createdAt?.toDate().toLocaleDateString('fr-FR', { dateStyle: 'medium' })}
                  {c.updatedAt && ' (édité)'}
                </p>
              </div>

              {userUid === c.authorUid && (
                <div className="flex gap-2 ml-4 items-center">
                  {editingCommentId === c.id ? (
                    <>
                      <Button
                        type="button"
                        onClick={() => saveEdit(c.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Sauvegarder
                      </Button>
                      <Button
                        type="button"
                        onClick={cancelEditing}
                        className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded"
                      >
                        Annuler
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => startEditing(c)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Modifier
                      </Button>
                      <button
                        onClick={() => deleteComment(c.id)}
                        className="text-red-500 hover:text-red-700 transition p-2 rounded-full cursor-pointer"
                        title="Supprimer cette étape"
                      >
                        <FiTrash size={20} />
                      </button>
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
        <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
          <input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire…"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            minLength={1}
            maxLength={500}
          />
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Envoyer
          </Button>
        </form>
      )}
    </div>
  )
}
