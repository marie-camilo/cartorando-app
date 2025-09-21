import { useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore'
import { db, storage } from '../lib/firebase'
import { useAuth } from '../firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useState } from 'react'

// === Schema Zod ===
const schema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    region: z.string().min(2),
    difficulty: z.enum(['easy','moderate','hard']),
    distanceKm: z.number().positive(),
    elevationGainM: z.number().nonnegative(),
    gpx: z.any().optional(),
    images: z.any().optional()
})

type HikeFormData = z.infer<typeof schema>

export default function HikeNew() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<HikeFormData>({
        resolver: zodResolver(schema)
    })

    const onSubmit: SubmitHandler<HikeFormData> = async (data) => {
        if (!user) return alert('Vous devez être connecté !')

        setLoading(true)
        try {
            const hikeRef = await addDoc(collection(db, 'hikes'), {
                title: data.title,
                description: data.description,
                region: data.region,
                difficulty: data.difficulty,
                distanceKm: data.distanceKm,
                elevationGainM: data.elevationGainM,
                gpxPath: null,
                imageUrls: [],
                createdBy: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                favoritesCount: 0
            })

            // Upload GPX si présent
            const gpxFile = data.gpx?.[0]
            if (gpxFile) {
                const gpxPath = `uploads/gpx/${user.uid}/${hikeRef.id}.gpx`
                const gpxRef = ref(storage, gpxPath)
                await uploadBytes(gpxRef, gpxFile)
                await updateDoc(doc(db, 'hikes', hikeRef.id), {
                    gpxPath,
                    updatedAt: serverTimestamp()
                })
            }

            // Upload images multiples
            const files = data.images instanceof FileList ? data.images : undefined
            const imageUrls: string[] = []

            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i]
                    const path = `uploads/images/${user.uid}/${hikeRef.id}/${file.name}`
                    const imageRef = ref(storage, path)
                    await uploadBytes(imageRef, file)
                    const url = await getDownloadURL(imageRef)
                    imageUrls.push(url)
                }

                await updateDoc(doc(db, 'hikes', hikeRef.id), {
                    imageUrls,
                    updatedAt: serverTimestamp()
                })
            }

            alert('Randonnée créée avec succès !')
        } catch (e) {
            console.error(e)
            alert('Erreur lors de la création')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-3">
            <input placeholder="Titre" {...register('title')} className="input"/>
            <textarea placeholder="Description" {...register('description')} className="textarea"/>
            <input placeholder="Région" {...register('region')} className="input"/>
            <select {...register('difficulty')} className="select">
                <option value="easy">Facile</option>
                <option value="moderate">Modérée</option>
                <option value="hard">Difficile</option>
            </select>
            <input type="number" step="0.1"
                   placeholder="Distance (km)" {...register('distanceKm', {valueAsNumber: true})} className="input"/>
            <input type="number" step="1"
                   placeholder="Dénivelé (m)" {...register('elevationGainM', {valueAsNumber: true})} className="input"/>

            {/* Upload GPX */}
            <label className="block">Fichier GPX</label>
            <input type="file" accept=".gpx" {...register('gpx')} />

            {/* Upload Images */}
            <label className="block">Images (JPEG, PNG, etc.)</label>
            <input type="file" accept="image/*" multiple {...register('images')} />

            <button disabled={loading} className="btn">
                {loading ? 'En cours...' : 'Créer'}
            </button>

            {Object.entries(errors).map(([field, error]) => (
                <p key={field} className="text-red-600">{error?.message as string}</p>
            ))}
        </form>
    )
}
