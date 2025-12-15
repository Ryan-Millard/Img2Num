import { useState } from 'react';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import styles from './NavBar.module.css';
import GlassCard from '@components/GlassCard';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { path: '/', label: 'Home' },
    { path: '/credits', label: 'Credits' },
    { path: '/about', label: 'About' },
    { path: 'https://github.com/Ryan-Millard/Img2Num', label: 'GitHub', external: true },
  ];

  const renderLinks = links.map((link) => {
    const isActive = !link.external && location.pathname === link.path; // active if route matches
    return (
      <li key={link.label}>
        {link.external ? (
          <a href={link.path} target="_blank" rel="noopener noreferrer" className={styles.externalLink}>
            {link.label}
            <SquareArrowOutUpRight size={'1.25em'} className={styles.externalLinkIcon} />
          </a>
        ) : (
          <Link to={link.path} className={isActive ? styles.activeLink : ''}>
            {link.label}
          </Link>
        )}
      </li>
    );
  });

  return (
    <GlassCard as="nav" className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">Img2Num</Link>
      </div>

      <button className={styles.hamburger} onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
        <span className={isOpen ? styles.barActive : styles.bar}></span>
        <span className={isOpen ? styles.barActive : styles.bar}></span>
        <span className={isOpen ? styles.barActive : styles.bar}></span>
      </button>

      {isOpen ? (
        <GlassCard as="ul" className={`${styles.navLinks} ${isOpen ? styles.active : ''} ${isOpen ? 'stacked' : ''}`}>
          {renderLinks}
        </GlassCard>
      ) : (
        <ul className={styles.navLinks}>{renderLinks}</ul>
      )}
    </GlassCard>
  );
}
