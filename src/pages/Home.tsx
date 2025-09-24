import { useAuth } from "../firebase/auth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative w-full bg-cover bg-center pt-16" style={{ backgroundImage: "url('public/images/home-bg.jpg')" }}>
      <div className="absolute inset-0 bg-black opacity-30"></div>

      <div className="relative z-10 flex items-center justify-center w-full h-screen text-center">
        <div className="text-white">
          <h1 className="text-6xl font-bold">The outdoors, <br/>crowdsourced.</h1>
        </div>
      </div>
    </div>
  );
}
