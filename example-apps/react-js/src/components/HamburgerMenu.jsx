import React, { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import Tooltip from "@components/Tooltip";
import styles from "./HamburgerMenu.module.css";

export default function HamburgerMenu({
  children,
  className = "",
  style = {},
  OpenMenuIcon = <X size={20} />,
  CloseMenuIcon = <Menu size={20} />,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const toggle = () => setIsOpen((v) => !v);
  const close = () => setIsOpen(false);

  // close on escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        close();
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen]);

  // close on navigation (optional): when any link inside menu is clicked, close it.
  useEffect(() => {
    const node = menuRef.current;
    if (!node) return;
    const onClick = (e) => {
      const a = e.target.closest("a");
      if (a && node.contains(a)) close();
    };
    node.addEventListener("click", onClick);
    return () => node.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <Tooltip content={isOpen ? "Close menu" : "Open menu"}>
        <button
          className={styles.menuToggle}
          onClick={toggle}
          aria-expanded={isOpen}
          aria-controls="nav-menu"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          type="button"
        >
          {isOpen ? OpenMenuIcon : CloseMenuIcon}
        </button>
      </Tooltip>

      {/* The list — desktop: visible inline; mobile: dropdown controlled by `.open` */}
      <ul
        id="nav-menu"
        ref={menuRef}
        className={`${styles.navList} ${isOpen ? styles.open : ""} ${className}`}
        style={style}
        role="menubar"
      >
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            className: "button"
          })
        )}
      </ul>
    </>
  );
}
