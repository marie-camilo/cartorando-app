import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/auth";
import defaultAvatar from '../assets/default_user.png';
import { HiMenu, HiX } from "react-icons/hi";
import { useRole } from "../hooks/useRole";

import StaggeredMenu, { StaggeredMenuItem } from './StaggeredMenu';

export default function Header() {
  const { user, signOutUser } = useAuth();
  const { isAdmin } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const isHome = location.pathname === "/";

  const menuItems: StaggeredMenuItem[] = [
    { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
    { label: 'Hikes', ariaLabel: 'View hikes', link: '/hikes/list' },
    ...(user
        ? [
          { label: 'Profile', ariaLabel: 'Go to dashboard', link: '/dashboard' },
          ...(isAdmin ? [{ label: 'Admin', ariaLabel: 'Go to admin panel', link: '/admin' }] : []),
          { label: 'Logout', ariaLabel: 'Logout', action: 'logout' as const }
        ]
        : [{ label: 'Login', ariaLabel: 'Login', link: '/login' }]
    )
  ];

  const socialItems = [
    { label: 'Twitter', link: 'https://twitter.com' },
    { label: 'GitHub', link: 'https://github.com' },
    { label: 'LinkedIn', link: 'https://linkedin.com' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isTransparent = isHome && !scrolled;
  const buttonColor = isTransparent ? "text-white hover:bg-white/20" : "text-black hover:bg-gray-100";

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300`}>
      <StaggeredMenu
        position="right"
        items={menuItems}
        socialItems={socialItems}
        displaySocials={true}
        displayItemNumbering={true}
        menuButtonColor={isTransparent ? "#fff" : "#000"}
        openMenuButtonColor="#ff6b6b"
        changeMenuColorOnOpen={true}
        colors={['#353326', '#897E45']}
        logoUrl="/src/assets/logos/reactbits-gh-white.svg"
        accentColor="#ff6b6b"
        isFixed={true}
        onItemClick={async (item) => {
          if (item.action === 'logout') {
            await signOutUser();
            navigate('/login');
          } else if (item.link) {
            navigate(item.link);
          }
        }}
      />
    </header>
  );
}
