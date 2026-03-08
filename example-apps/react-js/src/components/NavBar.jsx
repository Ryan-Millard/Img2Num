import React from "react";
import { Home, Users, Info, Github, SquareArrowOutUpRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import styles from "./NavBar.module.css";
import GlassCard from "@components/GlassCard";
import ThemeSwitch from "@components/ThemeSwitch";
import Tooltip from "@components/Tooltip";
import HamburgerMenu from "@components/HamburgerMenu";

const INTERNAL_LINKS = [
  { path: "/", label: "Home", icon: Home, tooltip: "Go to the home page" },
  { path: "/credits", label: "Credits", icon: Users, tooltip: "View project credits" },
  { path: "/about", label: "About", icon: Info, tooltip: "Learn more about Img2Num" },
];

const EXTERNAL_LINKS = [
  { href: "https://ryan-millard.github.io/Img2Num/info/", label: "Docs", icon: Info, tooltip: "View documentation" },
  {
    href: "https://github.com/Ryan-Millard/Img2Num",
    label: "GitHub",
    icon: Github,
    tooltip: "Open the project on GitHub",
  },
];

export default function NavBar() {
  const { pathname } = useLocation();

  return (
    <GlassCard as="nav" className={styles.navbar}>
      {/* Logo */}
      <Tooltip content="Go to home page">
        <Link to="/" className={styles.logo}>
          <img src="/Img2Num/favicon.svg" alt="" className={styles.logoIcon} />
          <span>Img2Num</span>
        </Link>
      </Tooltip>

      {/* Nav links are provided as children — HamburgerMenu will handle responsive behavior */}
      <HamburgerMenu>
        {INTERNAL_LINKS.map(({ path, label, icon, tooltip }) => (
          <li key={path} role="none">
            <Tooltip content={tooltip}>
              <Link
                to={path}
                role="menuitem"
                className={`${styles.navLink} ${pathname === path ? styles.active : ""}`}
              >
                {React.createElement(icon, { size: 16 })}
                <span>{label}</span>
              </Link>
            </Tooltip>
          </li>
        ))}

        {EXTERNAL_LINKS.map(({ href, label, icon, tooltip }) => (
          <li key={href} role="none">
            <Tooltip content={`${tooltip} (opens in a new tab)`}>
              <a href={href} target="_blank" rel="noopener noreferrer" role="menuitem" className={styles.navLink}>
                {React.createElement(icon, { size: 16 })}
                <span>{label}</span>
                <SquareArrowOutUpRight size={12} className={styles.externalIcon} />
              </a>
            </Tooltip>
          </li>
        ))}

        <li role="none" className={styles.themeToggle}>
          <ThemeSwitch />
        </li>
      </HamburgerMenu>
    </GlassCard>
  );
}
