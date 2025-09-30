import { Link } from "react-router-dom";
import Button from '../components/Button';
import HikeCard from "../components/hikes/HikeCard"

export default function Home() {
  const hikes = [
    { id: "1", title: "Montagne du Soleil", difficulty: "easy", region: "Alpes", image: "/images/hike1.jpg" },
    { id: "2", title: "Forêt Enchantée", difficulty: "moderate", region: "Jura", image: "/images/hike2.jpg" },
    { id: "3", title: "Canyon Sauvage", difficulty: "hard", region: "Pyrénées", image: "/images/hike3.jpg" },
  ]

  return (
    <div className="w-full overflow-hidden">
      {/* Hero vidéo */}
      <div className="relative w-full h-screen overflow-hidden">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/images/home-bg-video.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black opacity-30"></div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center px-4">
          <h1 className="text-6xl font-bold text-white mb-6">The outdoors,<br />crowdsourced.</h1>
          <Link to="/hikes/list">
            <Button variant="orange">
              Découvrir les randos
            </Button>
          </Link>
        </div>
      </div>

      {/* Section HikeCards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-8 text-center">Découvrez les randos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {hikes.map((hike) => (
              <HikeCard
                key={hike.id}
                id={hike.id}
                title={hike.title}
                difficulty={hike.difficulty as "easy" | "moderate" | "hard"}
                region={hike.region}
                image={hike.image}
              />
            ))}
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
    </div>
  )
}
