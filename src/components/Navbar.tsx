import { NavLink } from 'react-router-dom';
import { useMeditation } from '../context/MeditationContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/meditate', label: 'Medita' },
  { to: '/learn', label: 'Scopri' },
];

export function Navbar() {
  const { theme, toggleTheme } = useMeditation();

  return (
    <header className="sticky top-0 z-10 border-b border-sage-100 bg-sand-50/80 backdrop-blur dark:border-sage-800 dark:bg-sage-900/80">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-sage-700 dark:text-sage-100">
          <span aria-hidden="true">🌿</span>
          Quiet Mind
        </NavLink>

        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 ${
                  isActive
                    ? 'bg-sage-500 text-white'
                    : 'text-sage-600 hover:bg-sage-100 dark:text-sage-200 dark:hover:bg-sage-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Cambia tema"
            className="ml-1 rounded-full p-2 text-sage-600 hover:bg-sage-100 dark:text-sage-200 dark:hover:bg-sage-800"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </nav>
    </header>
  );
}
