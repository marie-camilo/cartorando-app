import { useState, useEffect } from "react";
import { collection, onSnapshot, DocumentData, QuerySnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import HikeCard from "../components/hikes/HikeCard";
import CardStacking from '../components/animations/CardStacking';
import MountainLine from "../components/animations/MountainLine";
import SwipeSection from '../components/SwipeSection';
import ImageGrid from '../components/ImgGrid';
import ScrollReveal from '../components/animations/ScrollReveal';
import HeroSection from '../components/HeroSection';


export default function Home() {
  const [hikes, setHikes] = useState<
    {
      id: string;
      title: string;
      difficulty: 'easy' | 'moderate' | 'hard';
      region: string;
      image: string;
    }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'hikes'), (snap: QuerySnapshot<DocumentData>) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        title: d.data().title,
        difficulty: d.data().difficulty,
        region: d.data().region,
        image: d.data().image,
      }));
      setHikes(data);
    });
    return () => unsub();
  }, []);

  // Filtrage des randonnées selon la recherche de l'utilisateur
  const filteredHikes = hikes.filter(
    (hike) =>
      hike.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hike.region.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const hikesData = [
    { id: 1, title: 'Randonnée 1', image: '/images/hikeur.JPG' },
    { id: 2, title: 'Randonnée 2', image: '/images/mountains.JPG' },
    { id: 3, title: 'Randonnée 3', image: '/images/cerf.JPG' },
  ];

  const hikingImages = [
    "/images/hikeur.JPG",
    "/images/mountains.JPG",
    "/images/cerf.JPG",
  ];

  return (
    <div className="w-full overflow-hidden">
      <HeroSection />

      <MountainLine images={hikingImages} />

      <ImageGrid
        images={[
          "/images/cerf.JPG",
          "/images/mountains.JPG",
          "/images/hikeur.JPG"
        ]}
        fromColor="#F5F3EF"
        toColor="#000000"
      />

      <section className="relative min-h-screen bg-black text-white py-20 md:py-40">
        <div className="pin-container">
          <ScrollReveal
            baseOpacity={0}
            enableBlur={true}
            baseRotation={0}
            blurStrength={10}
            containerClassName="mx-auto px-6 text-left"
          >
            Adventure is not found on maps.
            Adventure is shared between those who wander.
            Hikee lets you discover trails,
            deposit your own paths,
            and explore the unseen corners of nature.
          </ScrollReveal>
        </div>
      </section>

      <div className="w-full overflow-hidden">
        <section className="relative bg-gradient-to-b from-slate-50 to-slate-100">
          <CardStacking cards={hikesData} />
        </section>
        {/* Section HikeCards */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-8 text-center">Découvrez les randos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredHikes.slice(0, 3).map(hike => (
                <HikeCard key={hike.id} id={hike.id} title={hike.title} difficulty={hike.difficulty as 'easy'|'moderate'|'hard'} region={hike.region} image={hike.image}/>
              ))}
            </div>
          </div>
        </section>

        {/*<section>*/}
        {/*  <SwipeSection />*/}
        {/*</section>*/}
      </div>
    </div>
  );
};