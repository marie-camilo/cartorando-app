import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--dark)] text-[var(--white)]">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand Section */}
          <div className="flex flex-col space-y-4 md:col-span-2 lg:col-span-1">
            <h1
              className="text-3xl md:text-4xl font-bold text-[var(--white)]"
              style={{ fontFamily: 'NoeDisplay' }}
            >
              Hikee
            </h1>
            <p className="text-[var(--lavander)] text-sm leading-relaxed">
              Explorez la nature avec style et sécurité. Votre partenaire de randonnée pour toutes les aventures.
            </p>
            {/* Newsletter */}
            <div className="pt-2">
              <input
                type="email"
                placeholder="Votre email"
                className="w-full px-4 py-2 rounded-lg bg-[var(--green-moss)] bg-opacity-20 border border-[var(--green-moss)] text-[var(--white)] placeholder-[var(--white)] focus:outline-none focus:border-[var(--corail)] transition-colors text-sm"
              />
              <button className="mt-2 w-full px-4 py-2 bg-[var(--corail)] hover:bg-[var(--orange)] text-[var(--white)] rounded-lg transition-colors text-sm font-medium">
                S'abonner
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-3">
            <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: 'NoeDisplay' }}>
              Navigation
            </h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-[var(--lavander)] hover:text-[var(--corail)] transition-colors text-sm inline-block"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/hikes/list"
                  className="text-[var(--lavander)] hover:text-[var(--corail)] transition-colors text-sm inline-block"
                >
                  Hikes
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="text-[var(--lavander)] hover:text-[var(--corail)] transition-colors text-sm inline-block"
                >
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="flex flex-col space-y-3">
            <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: 'NoeDisplay' }}>
              Ressources
            </h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="/guide"
                  className="text-[var(--lavander)] hover:text-[var(--corail)] transition-colors text-sm inline-block"
                >
                  Guide du randonneur
                </a>
              </li>
              <li>
                <a
                  href="/equipment"
                  className="text-[var(--lavander)] hover:text-[var(--corail)] transition-colors text-sm inline-block"
                >
                  Équipement
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="text-[var(--lavander)] hover:text-[var(--corail)] transition-colors text-sm inline-block"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="text-[var(--lavander)] hover:text-[var(--corail)] transition-colors text-sm inline-block"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Social & Legal */}
          <div className="flex flex-col space-y-3">
            <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: 'NoeDisplay' }}>
              Suivez-nous
            </h2>
            <div className="flex flex-wrap gap-3">
              <a
                href="#"
                className="text-[var(--lavander)] hover:text-[var(--corail)] transition-colors text-sm"
                aria-label="Facebook"
              >
                Facebook
              </a>
              <a
                href="#"
                className="text-[var(--lavander)] hover:text-[var(--corail)] transition-colors text-sm"
                aria-label="Instagram"
              >
                Instagram
              </a>
              <a
                href="#"
                className="text-[var(--lavander)] hover:text-[var(--corail)] transition-colors text-sm"
                aria-label="Twitter"
              >
                Twitter
              </a>
            </div>
            <div className="pt-4 space-y-2">
              <a
                href="/privacy"
                className="text-[var(--lavander)] hover:text-[var(--corail)] transition-colors text-xs block"
              >
                Politique de confidentialité
              </a>
              <a
                href="/terms"
                className="text-[var(--lavander)] hover:text-[var(--corail)] transition-colors text-xs block"
              >
                Conditions d'utilisation
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[var(--green-moss)] border-opacity-30">
        <div className="max-w-7xl mx-auto px-6 py-6 lg:px-20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[var(--lavander)] text-sm text-center md:text-left">
              © {new Date().getFullYear()} Hikee. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2 text-sm text-[var(--lavander)]">
              <span>Fait avec</span>
              <span className="text-[var(--corail)]">♥</span>
              <span>pour les amoureux de la nature - Marie CAMILO-MARCHAL & Charlotte DUVERGER</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;