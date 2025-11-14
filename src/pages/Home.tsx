import { useState, useEffect } from "react";
import { collection, onSnapshot, DocumentData, QuerySnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import Button from "../components/Button";
import HikeCard from "../components/hikes/HikeCard";
import CardStacking from '../components/animations/CardStacking';
import MountainLine from "../components/animations/MountainLine";
import BackgroundTransition from "../components/animations/BackgroundTransition";
import SwipeSection from '../components/SwipeSection';
import ImageGrid from '../components/ImgGrid';


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
    "/images/hikeur.JPG",
  ];

  return (
    // Hero section
    <div className="w-full overflow-hidden">
      <div className="relative w-full h-[100dvh] overflow-hidden">
        <video className="absolute top-0 left-0 w-full h-full object-cover" autoPlay muted loop playsInline>
          <source src="/images/home-bg-video.mp4" type="video/mp4" />
        </video>

        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center px-8 sm:px-16">
          <div
            className="w-full font-bold uppercase tracking-tight text-[9vw] leading-none"
            style={{ color: 'var(--sand, #E8E4DD)' }}
          >
            <div className="text-left">
              wander
              <br />
              far
            </div>
            <div className="text-right">
              and
              <br />
              wide
            </div>
          </div>
        </div>

      </div>

      {/*Section Hard Work */}
      <section className="relative w-full pt-44 pb-32 bg-sand z-20">
        <div className="w-full text-slate font-bold uppercase tracking-tight">
          <div className="text-[9vw] leading-none text-right pr-8 md:pr-16">
            we’ve done all
          </div>
          <div className="text-[9vw] leading-none pl-8 md:pl-16">
            the hard work
          </div>
          <div className="text-[9vw] leading-none pl-8 md:pl-16 mb-8">
            for you.
          </div>
        </div>

        <p className="text-left text-slate/90 px-8 md:px-16 max-w-2xl text-lg leading-relaxed">
          Explore routes that have been sorted, tested, and carefully selected for you. We've simplified your preparation so you can focus solely on what matters most: enjoying the adventure.
        </p>
      </section>

      <MountainLine images={hikingImages} className="relative z-10 -mt-24" />
      <BackgroundTransition fromColor="#ffffff" toColor="#000000" />

      <section className="h-[100vh] bg-black flex items-center justify-center text-white">
        <ImageGrid
          images={[
            "/images/cerf.JPG",
            "/images/mountains.JPG",
            "/images/hikeur.JPG"
          ]}
        />
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