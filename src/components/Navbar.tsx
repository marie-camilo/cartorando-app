import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "./Button";
import { useAuth } from "../firebase/auth";
import defaultAvatar from '../assets/default_user.png';
import { HiMenu, HiX } from "react-icons/hi";

export default function Header() {
  const { user, signOutUser } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false); // dropdown avatar
  const [mobileOpen, setMobileOpen] = useState(false); // menu mobile
  const [scrolled, setScrolled] = useState(false);

  const getUserNameFromEmail = (email: string) => email.split("@")[0];
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Classes dynamiques selon page et scroll
  const isTransparent = isHome && !scrolled;
  const navbarBg = isTransparent ? "bg-transparent" : "bg-white shadow-md";
  const linkColor = isTransparent ? "text-white hover:text-gray-300" : "text-black hover:text-gray-700";
  const buttonColor = isTransparent ? "text-white hover:bg-white/20" : "text-black hover:bg-gray-100";
  const mobileBg = isTransparent ? "bg-black/70" : "bg-white";

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${navbarBg}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center relative">
        {/* Logo */}
        <h1 className="font-bold text-2xl">
          <Link className={linkColor} to="/">hikee.</Link>
        </h1>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 items-center">
          <Link className={linkColor} to="/">home</Link>
          <Link className={linkColor} to="/hikes/list">hikes</Link>

          {!user ? (
            <Link to="/login">
              <Button className={buttonColor}>Se connecter</Button>
            </Link>
          ) : (
            <div className="relative">
              <Button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${buttonColor}`}
              >
                <img src={defaultAvatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                <span>{getUserNameFromEmail(user.email || "")}</span>
              </Button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-xl shadow-lg overflow-hidden z-50">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-3 hover:bg-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    Mon profil
                  </Link>
                  <button
                    onClick={() => { signOutUser(); setOpen(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100"
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center z-50">
          <button onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? (
              <HiX className={`w-8 h-8 ${isTransparent ? "text-white" : "text-black"}`} />
            ) : (
              <HiMenu className={`w-8 h-8 ${isTransparent ? "text-white" : "text-black"}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu sliding from right */}
      <div className={`fixed top-0 right-0 h-full w-64 shadow-lg transform transition-transform duration-300 z-40 ${mobileBg} ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}>
        <nav className="flex flex-col gap-4 px-6 mt-10">
          <Link onClick={() => setMobileOpen(false)} className={`py-2 ${linkColor}`} to="/">Accueil</Link>
          <Link onClick={() => setMobileOpen(false)} className={`py-2 ${linkColor}`} to="/hikes/list">Randos</Link>

          {!user ? (
            <Link onClick={() => setMobileOpen(false)} className="py-2" to="/login">
              <Button className={buttonColor}>Se connecter</Button>
            </Link>
          ) : (
            <>
              <Link onClick={() => setMobileOpen(false)} className={`py-2 ${linkColor}`} to="/dashboard">Mon profil</Link>
              <button onClick={() => { signOutUser(); setMobileOpen(false); }} className={`py-2 w-full text-left ${linkColor}`}>
                Se déconnecter
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
