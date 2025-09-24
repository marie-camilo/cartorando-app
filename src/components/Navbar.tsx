import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import { useAuth } from "../firebase/auth";
import defaultAvatar from '../assets/default_user.png';

export default function Header() {
  const { user, signOutUser } = useAuth();
  const [open, setOpen] = useState(false);

  // Fonction pour récupérer le nom à partir de l'email
  const getUserNameFromEmail = (email: string) => {
    return email.split("@")[0]; // Découpe l'email avant le '@'
  };

  return (
    <header className="app-header flex justify-between items-center px-6 py-2">
      <h1 className="logo font-bold text-sm">
        <Link to="/">hikee.</Link>
      </h1>

      <div className="header-right flex items-center gap-4">
        <nav className="nav-links flex gap-4">
          <Link to="/">accueil</Link>
          <Link to="/hikes/list">randos</Link>
        </nav>

        {!user ? (
          <Link to="/login">
            <Button>Se connecter</Button>
          </Link>
        ) : (
          <div className="relative">
            <Button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <img
                src={defaultAvatar}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span>{getUserNameFromEmail(user.email || "")}</span>
            </Button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20">
                <Link
                  to="/dashboard"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  Mon profil
                </Link>
                <button
                  onClick={() => {
                    signOutUser();
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50"
                >
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
