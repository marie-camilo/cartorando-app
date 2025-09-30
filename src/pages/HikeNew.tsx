import { useForm, useFieldArray } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore'
import { db, storage } from '../lib/firebase'
import { useAuth } from '../firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useState, useRef, useEffect } from 'react'
import toast from "react-hot-toast"
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { FiTrash } from 'react-icons/fi'
import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// === Schema Zod ===
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
          title: z.string().min(1, "Le titre de l'étape est obligatoire"),
          description: z.string().min(1, "La description de l'étape est obligatoire")
      })
    )
})

type HikeFormData = z.infer<typeof schema>;

export default function HikeNew() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [gpxFile, setGpxFile] = useState<File | null>(null)
    const [gpxPolyline, setGpxPolyline] = useState<[number, number][]>([])

    const gpxInputRef = useRef<HTMLInputElement>(null)
    const imageInputRef = useRef<HTMLInputElement>(null)

    const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<HikeFormData>({
        resolver: zodResolver(schema),
        defaultValues: { itinerary: [''], distanceKm: 0, elevationGainM: 0 }
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'itinerary' });

    // ----------------- Gestion Images -----------------
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        const files = Array.from(e.target.files)
        const newFiles = [...imageFiles, ...files]
        setImageFiles(newFiles)
        setImagePreviews(newFiles.map(f => URL.createObjectURL(f)))
        setValue('images', newFiles)
    }

    const removeImage = (index: number) => {
        const newFiles = imageFiles.filter((_, i) => i !== index)
        setImageFiles(newFiles)
        setImagePreviews(newFiles.map(f => URL.createObjectURL(f)))
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

    // ----------------- Submit -----------------
    const onSubmit: SubmitHandler<HikeFormData> = async (data) => {
        if (!user) return toast.error('Vous devez être connecté !')
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
                itinerary: data.itinerary,
                createdBy: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                favoritesCount: 0
            })

            // Upload GPX
            if (gpxFile) {
                const gpxPath = `uploads/gpx/${user.uid}/${hikeRef.id}.gpx`
                const gpxRef = ref(storage, gpxPath)
                await uploadBytes(gpxRef, gpxFile)
                await updateDoc(doc(db, 'hikes', hikeRef.id), { gpxPath, updatedAt: serverTimestamp() })
            }

            // Upload Images
            const imageUrls: string[] = []
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i]
                const path = `uploads/images/${user.uid}/${hikeRef.id}/${file.name}`
                const imageRef = ref(storage, path)
                await uploadBytes(imageRef, file)
                const url = await getDownloadURL(imageRef)
                imageUrls.push(url)
            }
            if (imageUrls.length) await updateDoc(doc(db, 'hikes', hikeRef.id), { imageUrls, updatedAt: serverTimestamp() })

            toast.success("Votre randonnée a bien été ajoutée !")
            navigate("/dashboard/hikes")
        } catch (err) {
            console.error(err)
            toast.error("Une erreur est survenue pendant l'ajout de la randonnée'")
        } finally {
            setLoading(false)
        }
    }
    const autoResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const el = e.currentTarget;
        el.style.height = "auto"; // reset
        el.style.height = el.scrollHeight + "px";
    };

    return (
    <div className="min-h-screen bg-gray-100 flex justify-center pt-32 pb-12">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-5xl p-6 space-y-6 bg-white rounded-xl shadow-md">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Créer une nouvelle randonnée</h2>

          {/* Titre */}
          <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-700">Titre</label>
              <input
                {...register('title')}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 transition"
                placeholder="Nom de la randonnée"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-700">Description</label>
              <textarea
                {...register('description')}
                placeholder="Décrivez la randonnée..."
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none overflow-hidden transition"
                onInput={autoResize}
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
          </div>

          {/* Région et Difficulté */}
          <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                  <label className="mb-2 font-semibold text-gray-700">Région</label>
                  <input
                    {...register('region')}
                    placeholder="Ex: Alpes, Pyrénées"
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 transition"
                  />
                  {errors.region && <p className="text-red-600 text-sm mt-1">{errors.region.message}</p>}
              </div>
              <div className="flex flex-col">
                  <label className="mb-2 font-semibold text-gray-700">Difficulté</label>
                  <select
                    {...register('difficulty')}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 transition"
                  >
                      <option value="easy">Facile</option>
                      <option value="moderate">Modérée</option>
                      <option value="hard">Difficile</option>
                  </select>
                  {errors.difficulty && <p className="text-red-600 text-sm mt-1">{errors.difficulty.message}</p>}
              </div>
          </div>

          {/* Distance & Dénivelé */}
          <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                  <label className="mb-2 font-semibold text-gray-700">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('distanceKm', { valueAsNumber: true })}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 transition"
                  />
                  {errors.distanceKm && <p className="text-red-600 text-sm mt-1">{errors.distanceKm.message}</p>}
              </div>
              <div className="flex flex-col">
                  <label className="mb-2 font-semibold text-gray-700">Dénivelé (m)</label>
                  <input
                    type="number"
                    step="1"
                    {...register('elevationGainM', { valueAsNumber: true })}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 transition"
                  />
                  {errors.elevationGainM && <p className="text-red-600 text-sm mt-1">{errors.elevationGainM.message}</p>}
              </div>
          </div>

          {/* Itinéraire */}
          <div className="flex flex-col space-y-4">
              <label className="font-semibold text-gray-700 flex items-center gap-2 mb-1">
                  Itinéraire & étapes
              </label>
              <p className="text-gray-500 text-sm mb-3">
                  Décrivez chaque étape de votre randonnée. Vous pouvez ajouter un titre et une description détaillée pour chaque étape.
              </p>
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col md:flex-row gap-2 mb-2 p-4 border rounded-lg shadow-sm bg-gray-50 items-center">

                    {/* Titre de l'étape en textarea autoresize */}
                    <textarea
                      {...register(`itinerary.${index}.title` as const)}
                      placeholder="Titre de l'étape"
                      className="flex-1 px-3 py-2 border rounded-lg resize-none overflow-hidden focus:outline-none focus:ring-1 focus:ring-gray-400 transition"
                      onInput={autoResize}
                    />

                    {/* Description de l'étape */}
                    <textarea
                      {...register(`itinerary.${index}.description` as const)}
                      placeholder="Description de l'étape"
                      className="flex-1 px-3 py-2 border rounded-lg resize-none overflow-hidden focus:outline-none focus:ring-1 focus:ring-gray-400 transition"
                      onInput={autoResize}
                    />

                    {/* Bouton supprimer */}
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700 transition p-2 rounded-full cursor-pointer"
                      title="Supprimer cette étape"
                    >
                        <FiTrash size={20} />
                    </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => append({ title: '', description: '' })}
                className="self-start bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer"
              >
                  Ajouter étape
              </button>
          </div>

          {/* GPX & Map */}
          <div className="flex flex-col space-y-2">
              <label className="font-semibold text-gray-700">Fichier GPX</label>
              <div className="flex gap-2">
                  <button type="button" onClick={() => gpxInputRef.current?.click()} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition cursor-pointer">
                      {gpxFile ? `Sélectionné : ${gpxFile.name}` : 'Choisir un fichier GPX'}
                  </button>
                  {gpxFile && <button type="button" onClick={removeGpx} className="text-red-500">Supprimer</button>}
                  <input type="file" accept=".gpx" className="hidden" ref={gpxInputRef} onChange={handleGpxChange}/>
              </div>
              {gpxPolyline.length > 0 && (
                <div className="mt-2 h-48 rounded-lg overflow-hidden shadow-sm">
                    <MapContainer center={gpxPolyline[0]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                        <Polyline positions={gpxPolyline} pathOptions={{ color: 'blue' }}/>
                    </MapContainer>
                </div>
              )}
          </div>

          {/* Images */}
          <div className="flex flex-col space-y-2">
              <label className="font-semibold text-gray-700">Images</label>
              <div className="flex gap-2">
                  <button type="button" onClick={() => imageInputRef.current?.click()} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition cursor-pointer">
                      Ajouter des images
                  </button>
                  <input type="file" accept="image/*" multiple className="hidden" ref={imageInputRef} onChange={handleImageChange}/>
              </div>
              <div className="flex gap-2 overflow-x-auto py-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative group">
                        <img src={src} alt={`preview-${i}`} className="w-24 h-24 object-cover rounded-lg"/>
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition"
                        >
                            ×
                        </button>
                    </div>
                  ))}
              </div>
          </div>

          <Button type="submit" disabled={loading || Object.keys(errors).length > 0}>
              {loading ? 'En cours...' : 'Créer la randonnée'}
          </Button>
      </form>
    </div>
    )
}
