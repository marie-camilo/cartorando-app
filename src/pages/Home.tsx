import { useState, useEffect } from "react";
import { collection, onSnapshot, DocumentData, QuerySnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import Button from "../components/Button";
import HikeCard from "../components/hikes/HikeCard";
import { Link } from "react-router-dom";

export default function Home() {
  const [hikes, setHikes] = useState<{ id: string; title: string; difficulty: "easy" | "moderate" | "hard"; region: string, image: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "hikes"),
      (snap: QuerySnapshot<DocumentData>) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          title: d.data().title,
          difficulty: d.data().difficulty,
          region: d.data().region,
          image: d.data().image,
        }));
        setHikes(data);
      }
    );
    return () => unsub();
  }, []);

  // Filtrage des randonnées selon la recherche de l'utilisateur
  const filteredHikes = hikes.filter(
    (hike) =>
      hike.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hike.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full overflow-hidden">
      <div className="relative w-full h-[100dvh] overflow-hidden">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover" autoPlay muted loop playsInline>
          <source src="/images/home-bg-video.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60"></div>

        <div className="absolute bottom-0 left-0 z-20 px-4 pb-12 sm:px-8 sm:pb-16 md:px-16 md:pb-24 max-w-5xl">
          <div className="space-y-6 sm:space-y-8">
            <Button variant="lavender" arrow>
              Next-gen outdoor platform
            </Button>

            <h1
              className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold leading-tight tracking-tight uppercase"
              style={{ color: "var(--white, #fafafa)" }}
            >
              The outdoors,<br />
              <span style={{ color: "var(--corail, #EF955F)" }}>crowdsourced.</span>
            </h1>

            <p
              className="text-sm sm:text-base md:text-lg max-w-md sm:max-w-xl md:max-w-2xl leading-relaxed"
              style={{ color: "var(--white, #ada3b1)" }}
            >
              Discover, share, live. A collaborative adventure where every explorer becomes a
              contributor, and every piece of nature is a treasure to share. Join a community
              that’s always innovating, in search of the best outdoor destinations.
            </p>
          </div>
        </div>
      </div>

      {/* Section HikeCards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-8 text-center">Découvrez les randos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredHikes.slice(0, 3).length > 0 ? (
              filteredHikes.slice(0, 3).map((hike) => (
                <HikeCard
                  key={hike.id}
                  id={hike.id}
                  title={hike.title}
                  difficulty={hike.difficulty as "easy" | "moderate" | "hard"}
                  region={hike.region}
                  image={hike.image} // Passer l'image de Firebase ici
                />
              ))
            ) : (
              <p className="text-center text-gray-500 mt-10">Aucune randonnée ne correspond à votre recherche.</p>
            )}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-8">Nos Aventuriers parlent de nous</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <p className="text-lg italic mb-4">"Une randonnée inoubliable à travers les Alpes, la vue est incroyable!"</p>
              <p className="font-semibold">Alice Dupont</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <p className="text-lg italic mb-4">"La forêt enchantée est mon endroit préféré pour se reconnecter à la nature!"</p>
              <p className="font-semibold">Marc Lemoine</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <p className="text-lg italic mb-4">"Un défi mais tellement gratifiant au sommet du Canyon Sauvage!"</p>
              <p className="font-semibold">Clara Martin</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section À propos */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">À propos de Hikee</h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Hikee est la plateforme qui vous permet de découvrir et partager les meilleures randonnées en plein air, crowdsourcées par notre communauté passionnée.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-gray-50 rounded-xl shadow">
            <h3 className="font-semibold text-xl mb-2">Communauté</h3>
            <p className="text-gray-600">Rejoignez une communauté de passionnés et partagez vos expériences.</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-xl shadow">
            <h3 className="font-semibold text-xl mb-2">Découverte</h3>
            <p className="text-gray-600">Trouvez des randos adaptées à tous les niveaux et toutes les régions.</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-xl shadow">
            <h3 className="font-semibold text-xl mb-2">Facile à utiliser</h3>
            <p className="text-gray-600">Une interface simple et intuitive pour consulter et partager des randonnées.</p>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-16 bg-[var(--lavander)] text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8">Nos statistiques</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-800 rounded-xl">
              <h3 className="text-2xl font-bold mb-2">Randonnées Partagées</h3>
              <p className="text-xl">1200+</p>
            </div>
            <div className="p-6 bg-gray-800 rounded-xl">
              <h3 className="text-2xl font-bold mb-2">Km Parcourus</h3>
              <p className="text-xl">15,000+</p>
            </div>
            <div className="p-6 bg-gray-800 rounded-xl">
              <h3 className="text-2xl font-bold mb-2">Avis Utilisateurs</h3>
              <p className="text-xl">4.8/5</p>
            </div>
          </div>
        </div>
      </section>

      {/* Événements à venir */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8">Événements à venir</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-2">Rando Solidaire - Alpes</h3>
              <p className="text-sm mb-4">Participez à notre événement de randonnée solidaire pour soutenir la protection des Alpes.</p>
              <Button variant="orange">Rejoindre</Button>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-2">Défi Montagne du Soleil</h3>
              <p className="text-sm mb-4">Un défi pour gravir la Montagne du Soleil en moins de 5 heures!</p>
              <Button variant="orange">Participer</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
