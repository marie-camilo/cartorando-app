import React, { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { db } from '../lib/firebase';
import {
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface FavoriteButtonSmartProps {
  user: { uid: string } | null;
  hikeId: string;
  className?: string;
}

export default function FavoriteButton ({ user, hikeId, className = '', }: FavoriteButtonSmartProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  // Vérifier si la rando est dans les favoris
  useEffect(() => {
    if (!user || !hikeId) return;
    const favRef = doc(db, 'favorites', `${user.uid}_${hikeId}`);
    const unsub = onSnapshot(favRef, (snap) => {
      setIsFavorite(snap.exists());
    });
    return () => unsub();
  }, [user, hikeId]);

  // Ajouter ou retirer la rando des favoris, rediriger si pas connecté
  const handleClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const favRef = doc(db, 'favorites', `${user.uid}_${hikeId}`);
    if (isFavorite) {
      await deleteDoc(favRef);
    } else {
      await setDoc(favRef, {
        userId: user.uid,
        hikeId,
        addedAt: serverTimestamp(),
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={`p-2 rounded-full bg-gray-100 cursor-pointer
                  transition-colors duration-200
                  hover:bg-gray-200
                  ${className}`}
    >
      <FaStar
        className={`w-6 h-6 transition-colors duration-200 ${
          isFavorite ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    </button>
  );
}
