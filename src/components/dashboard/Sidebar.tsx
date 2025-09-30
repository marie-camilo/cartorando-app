import {NavLink} from "react-router-dom";
import {useAuth} from "../../firebase/auth";
import defaultAvatar from '../../assets/default_user.png';

const links = [
    {to: "/dashboard", label: "Mon Profil"},
    {to: "/dashboard/hikes", label: "Mes Randos"},
    {to: "/dashboard/favorites", label: "Mes Favoris"},
];

export default function Sidebar() {
    const {user} = useAuth();

    return (
        <aside className="w-72 bg-white shadow-md p-6 rounded-xl flex flex-col">
            <div className="flex-col items-center gap-3 mb-6">
                <img
                    src={defaultAvatar}
                    alt="avatar"
                    className="w-30 h-30 rounded-full object-cover"
                />
                <span className="font-medium text-xl">{user?.displayName || user?.email?.split("@")[0]}</span>
            </div>

            <nav className="flex flex-col gap-3 mt-6">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end
                        className={({isActive}) =>
                            `block px-4 py-2 rounded-lg transition ${
                                isActive
                                    ? "bg-[var(--orange)] text-white"
                                    : "hover:bg-gray-100"
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
