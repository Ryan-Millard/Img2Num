import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@hooks/useTheme';
import styles from './ThemeSwitch.module.css';

/**
 * ThemeSwitch component
 *
 * A toggle button that allows users to switch between light and dark themes.
 * The button displays a moon icon in light mode and a sun icon in dark mode.
 * Theme preference is persisted in localStorage via the useTheme hook.
 *
 * @returns {JSX.Element} A button that toggles between light and dark themes
 */
export default function ThemeSwitch() {
  // Get current theme and toggle function from the theme hook
  const { theme, toggleTheme } = useTheme();

  return (
    <button aria-label="Toggle Dark Mode" type="button" className={styles.themeButton} onClick={toggleTheme}>
      {/* Show Sun icon in dark mode, Moon icon in light mode */}
      {theme === 'dark' ? <Sun className={styles.icon} /> : <Moon className={styles.icon} />}
    </button>
  );
}
