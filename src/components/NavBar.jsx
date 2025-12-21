import { useState } from 'react';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import styles from './NavBar.module.css';
import GlassCard from '@components/GlassCard';
import Tooltip from '@components/Tooltip';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { path: '/', label: 'Home', tooltip: 'Go to the home page' },
    { path: '/credits', label: 'Credits', tooltip: 'View project credits' },
    { path: '/about', label: 'About', tooltip: 'Learn more about Img2Num' },
    { path: 'https://github.com/Ryan-Millard/Img2Num', label: 'GitHub', tooltip: 'Open the project on GitHub', external: true },
  ];


  const renderLinks = links.map((link) => {
    const isActive = !link.external && location.pathname === link.path;
    return (
      <li key={link.label}>
        {link.external ? (
          <Tooltip content={`${link.tooltip} (opens in a new tab)`}>
            <a
              href={link.path}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalLink}
            >
              {link.label}
              <SquareArrowOutUpRight size="1.25em" className={styles.externalLinkIcon} />
            </a>
          </Tooltip>
        ) : (
          <Tooltip content={link.tooltip}>
            <Link to={link.path} className={isActive ? styles.activeLink : ''}>
              {link.label}
            </Link>
          </Tooltip>
        )}
      </li>

    );
  });


  return (
    <GlassCard as="nav" className={styles.navbar}>
      <div className={styles.logo}>
        <Tooltip content="Go to home page">
          <Link to="/">Img2Num</Link>
        </Tooltip>
      </div>

      <Tooltip content="Toggle navigation menu">
        <button className={styles.hamburger} onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          <span className={isOpen ? styles.barActive : styles.bar}></span>
          <span className={isOpen ? styles.barActive : styles.bar}></span>
          <span className={isOpen ? styles.barActive : styles.bar}></span>
        </button>
      </Tooltip>


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
