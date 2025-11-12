import { NavLink } from "react-router-dom";
import { useAuth } from "../../firebase/auth";
import defaultAvatar from '../../assets/default_user.png';

const links = [
  { to: "/dashboard", label: "Mon Profil" },
  { to: "/dashboard/hikes", label: "Mes Randos" },
  { to: "/dashboard/favorites", label: "Mes Favoris" },
  { to: "/dashboard/preferences", label: "Préférences" },
];

interface Props {
  className?: string;
}

export default function Sidebar({ className = "" }: Props) {
  const { user } = useAuth();

  return (
    <aside className={`flex flex-col h-full ${className}`}>
      <div className="flex flex-col items-center gap-3 mb-6">
        <img
          src={user?.photoURL || defaultAvatar}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover"
        />
        <span className="font-medium text-xl text-center">
          {user?.displayName || user?.email?.split("@")[0]}
        </span>
      </div>

      <nav className="flex flex-col gap-3 mt-6">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-[var(--orange)] text-white" : "hover:bg-gray-100"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
