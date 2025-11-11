import { useForm, useFieldArray } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, storage } from '../lib/firebase'
import { useAuth } from '../firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from "react-hot-toast"
import Button from '../components/Button'
import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// === Schema Zod (identique à la création) ===
const schema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  region: z.string().min(2, "La région doit contenir au moins 2 caractères"),
  difficulty: z.enum(['easy', 'moderate', 'hard']),
  distanceKm: z.number().positive("La distance doit être positive"),
  elevationGainM: z.number().nonnegative("Le dénivelé ne peut pas être négatif"),
  images: z.any().optional(),
  gpx: z.any().optional(),
  itinerary: z.array(
    z.object({
      title: z.string().min(1, "Le titre de l'étape est requis"),
      description: z.string().min(1, "La description de l'étape est requise")
    })
  )
})

type HikeFormData = z.infer<typeof schema>

export default function HikeEdit() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [gpxFile, setGpxFile] = useState<File | null>(null)
  const [gpxPolyline, setGpxPolyline] = useState<[number, number][]>([])

  const gpxInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm<HikeFormData>({
    resolver: zodResolver(schema),
    defaultValues: { itinerary: [''] }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'itinerary' })

  // ----------- Charger la randonnée existante -----------
  useEffect(() => {
    const fetchHike = async () => {
      if (!id) return
      const refDoc = doc(db, "hikes", id)
      const snap = await getDoc(refDoc)
      if (snap.exists()) {
        const data = snap.data()
        reset({
          title: data.title,
          description: data.description,
          region: data.region,
          difficulty: data.difficulty,
          distanceKm: data.distanceKm,
          elevationGainM: data.elevationGainM,
          itinerary: data.itinerary?.length
            ? data.itinerary
            : [{ title: '', description: '' }]
        })
        setImagePreviews(data.imageUrls || [])
        if (data.gpxPath) {
        }
      }
      setInitialLoading(false)
    }
    fetchHike()
  }, [id, reset])

  // ----------------- Gestion Images -----------------
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)

    // Limite à 5 images
    const totalFiles = imageFiles.length + files.length
    if (totalFiles > 5) {
      toast.error("Vous ne pouvez ajouter que 5 images maximum")
      return
    }

    const newFiles = [...imageFiles, ...files]
    setImageFiles(newFiles)
    setImagePreviews(newFiles.map(f => URL.createObjectURL(f)))
    setValue('images', newFiles)
  }

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
    setValue('images', newFiles)
  }

  // ----------------- Gestion GPX -----------------
  const handleGpxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    setGpxFile(file)
    setValue('gpx', [file])

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const coords: [number, number][] = []
      const parser = new DOMParser()
      const xml = parser.parseFromString(text, 'application/xml')
      const trkpts = Array.from(xml.getElementsByTagName('trkpt'))
      trkpts.forEach(pt => {
        const lat = parseFloat(pt.getAttribute('lat') || '0')
        const lon = parseFloat(pt.getAttribute('lon') || '0')
        coords.push([lat, lon])
      })
      setGpxPolyline(coords)
    }
    reader.readAsText(file)
  }

  const removeGpx = () => {
    setGpxFile(null)
    setGpxPolyline([])
    setValue('gpx', undefined)
  }

  // ----------------- Submit (update) -----------------
  const onSubmit: SubmitHandler<HikeFormData> = async (data) => {
    if (!user || !id) return toast.error("Vous devez être connecté !")
    setLoading(true)

    try {
      const hikeRef = doc(db, "hikes", id)

      await updateDoc(hikeRef, {
        title: data.title,
        description: data.description,
        region: data.region,
        difficulty: data.difficulty,
        distanceKm: data.distanceKm,
        elevationGainM: data.elevationGainM,
        itinerary: data.itinerary,
        updatedAt: serverTimestamp(),
      })

      // ------------------ GPX ------------------
      let finalGpxPath: string | null = null

      if (gpxFile) {
        // Nouveau GPX choisi
        finalGpxPath = `uploads/gpx/${user.uid}/${id}.gpx`
        const gpxRef = ref(storage, finalGpxPath)
        await uploadBytes(gpxRef, gpxFile)
      } else {
        // Vérifier si GPX existant dans Firestore
        const hikeSnap = await hikeRef.get()
        const existingGpx = hikeSnap.data()?.gpxPath
        if (!existingGpx) {
          // Upload GPX par défaut
          const defaultGpxUrl = '/default.gpx'
          const response = await fetch(defaultGpxUrl)
          const blob = await response.blob()
          finalGpxPath = `uploads/gpx/${user.uid}/${id}-default.gpx`
          const gpxRef = ref(storage, finalGpxPath)
          await uploadBytes(gpxRef, blob)
        } else {
          finalGpxPath = existingGpx
        }
      }

      if (finalGpxPath) {
        await updateDoc(hikeRef, { gpxPath: finalGpxPath, updatedAt: serverTimestamp() })
      }

      // ------------------ Images ------------------
      const imageUrls: string[] = []
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        const path = `uploads/images/${user.uid}/${id}/${file.name}`
        const imageRef = ref(storage, path)
        await uploadBytes(imageRef, file)
        const url = await getDownloadURL(imageRef)
        imageUrls.push(url)
      }
      if (imageUrls.length) {
        await updateDoc(hikeRef, { imageUrls, updatedAt: serverTimestamp() })
      }

      toast.success("Votre randonnée a bien été mise à jour !")
      navigate("/dashboard/hikes")
    } catch (err) {
      console.error(err)
      toast.error("Une erreur est survenue pendant la mise à jour")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) return <p>Chargement...</p>

  const autoResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="container mx-auto max-w-10xl p-6 mt-25 space-y-6">

      <h2 className="text-2xl font-bold mb-4">Modifier la randonnée</h2>

      {/* Titre */}
      <div>
        <label className="block font-semibold mb-1">Titre</label>
        <input {...register('title')} className="w-full border rounded-lg px-3 py-2"/>
        {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block font-semibold mb-1">Description</label>
        <textarea{...register('description')} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none overflow-hidden" onInput={autoResize} />
        {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
      </div>

      {/* Région */}
      <div>
        <label className="block font-semibold mb-1">Région</label>
        <input {...register('region')} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
        {errors.region && <p className="text-red-600 text-sm mt-1">{errors.region.message}</p>}
      </div>

      {/* Difficulté */}
      <div>
        <label className="block font-semibold mb-1">Difficulté</label>
        <select {...register('difficulty')} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="easy">Facile</option>
          <option value="moderate">Modérée</option>
          <option value="hard">Difficile</option>
        </select>
        {errors.difficulty && <p className="text-red-600 text-sm mt-1">{errors.difficulty.message}</p>}
      </div>

      {/* Distance & Dénivelé */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Distance (km)</label>
          <input type="number" step="0.1" {...register('distanceKm', { valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          {errors.distanceKm && <p className="text-red-600 text-sm mt-1">{errors.distanceKm.message}</p>}
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">Dénivelé (m)</label>
          <input type="number" step="1" {...register('elevationGainM', { valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          {errors.elevationGainM && <p className="text-red-600 text-sm mt-1">{errors.elevationGainM.message}</p>}
        </div>
      </div>

      {/* Itinéraire */}
      {/* Itinéraire & étapes */}
      <div>
        <label className="block font-semibold mb-1">Itinéraire & étapes</label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col md:flex-row gap-2 mb-2">
            <input
              {...register(`itinerary.${index}.title` as const)}
              placeholder="Titre de l'étape"
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <textarea
              {...register(`itinerary.${index}.description` as const)}
              placeholder="Description de l'étape"
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none overflow-hidden"
              onInput={autoResize}
            />
            <button type="button" onClick={() => remove(index)} className="bg-red-500 text-white px-3 py-2 rounded-lg">Supprimer</button>
          </div>
        ))}
        {/* Bouton ajouter étape */}
        <button
          type="button"
          onClick={() => append({ title: '', description: '' })}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Ajouter étape
        </button>
      </div>

      {/* Fichier GPX */}
      <div>
        <label className="block font-semibold mb-1">Fichier GPX</label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => gpxInputRef.current?.click()} className="bg-gray-200 px-3 py-1 rounded">
            {gpxFile ? `Sélectionné : ${gpxFile.name}` : 'Choisir un fichier GPX'}
          </button>
          {gpxFile && <button type="button" onClick={removeGpx} className="text-red-500">Supprimer</button>}
          <input type="file" accept=".gpx" className="hidden" ref={gpxInputRef} onChange={handleGpxChange}/>
        </div>
        {gpxPolyline.length > 0 && (
          <div className="mt-2 h-40">
            <MapContainer center={gpxPolyline[0]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
              <Polyline positions={gpxPolyline} pathOptions={{ color: 'blue' }}/>
            </MapContainer>
          </div>
        )}
      </div>

      {/* Images */}
      <div>
        <label className="block font-semibold mb-1">Images</label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className={`bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition cursor-pointer ${
              imageFiles.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={imageFiles.length >= 5}
          >
            Ajouter des images
          </button>
          <input type="file" accept="image/*" multiple className="hidden" ref={imageInputRef} onChange={handleImageChange}/>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {imagePreviews.map((src, i) => (
            <div key={i} className="relative">
              <img src={src} alt={`preview-${i}`} className="w-20 h-20 object-cover rounded"/>
              <button type="button" onClick={() => removeImage(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs">×</button>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
        {loading ? "Mise à jour..." : "Mettre à jour"}
      </Button>

    </form>
  )
}
