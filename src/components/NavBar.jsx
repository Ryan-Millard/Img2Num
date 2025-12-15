import { useState } from 'react';
import { Home, Users, Info, Github, SquareArrowOutUpRight, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import styles from './NavBar.module.css';

const INTERNAL_LINKS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/credits', label: 'Credits', icon: Users },
  { path: '/about', label: 'About', icon: Info },
];

const EXTERNAL_LINKS = [
  { href: 'https://ryan-millard.github.io/Img2Num/info/', label: 'Docs', icon: Info },
  { href: 'https://github.com/Ryan-Millard/Img2Num', label: 'GitHub', icon: Github },
];

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className={`${styles.navbar} glass`}>
      {/* Logo */}
      <Link to="/" className={styles.logo} onClick={closeMenu}>
        <img src="/Img2Num/favicon.svg" alt="" className={styles.logoIcon} />
        <span>Img2Num</span>
      </Link>

      {/* Mobile Toggle */}
      <button
        className={styles.menuToggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="nav-menu"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Navigation */}
      <ul
        id="nav-menu"
        className={`${styles.navList} ${isOpen ? styles.open : ''}`}
        role="menubar"
      >
        {INTERNAL_LINKS.map(({ path, label, icon: Icon }) => (
          <li key={path} role="none">
            <Link
              to={path}
              role="menuitem"
              className={`${styles.navLink} ${pathname === path ? styles.active : ''}`}
              onClick={closeMenu}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          </li>
        ))}

        {EXTERNAL_LINKS.map(({ href, label, icon: Icon }) => (
          <li key={href} role="none">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              className={styles.navLink}
            >
              <Icon size={16} />
              <span>{label}</span>
              <SquareArrowOutUpRight size={12} className={styles.externalIcon} />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
