import React, { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { db } from '../lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';

interface FavoriteButtonSmartProps {
  user: { uid: string } | null;
  hikeId: string;
  className?: string;
}

export default function FavoriteButton ({
                                              user,
                                              hikeId,
                                              className = '',
                                            }: FavoriteButtonSmartProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  // Vérifie si la rando est dans les favoris et écoute les changements
  useEffect(() => {
    if (!user || !hikeId) return;
    const favRef = doc(db, 'favorites', `${user.uid}_${hikeId}`);
    const unsub = onSnapshot(favRef, (snap) => {
      setIsFavorite(snap.exists());
    });
    return () => unsub();
  }, [user, hikeId]);

  // Ajoute ou retire la rando des favoris
  const toggleFavorite = async () => {
    if (!user || !hikeId) return;
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
      onClick={toggleFavorite}
      disabled={!user}
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
