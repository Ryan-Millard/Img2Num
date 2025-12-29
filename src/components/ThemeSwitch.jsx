import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@hooks/useTheme';
import styles from './ThemeSwitch.module.css';
import Tooltip from '@components/Tooltip';

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
    <Tooltip content={`Switch to ${ theme === 'dark' ? "Light" : "Dark" } Mode`}>
      {/* Added sliding toggle effect to change theme mode which enhances ui  */}
      <button aria-label={`Switch to ${ theme === 'dark' ? "Light" : "Dark" } Mode`} type="button" className={`glass ${styles.themeButton} ${theme === 'light' ? styles.themeButtonLight : styles.themeButtonDark}`} onClick={toggleTheme}>
        {/* Show Sun icon in dark mode, Moon icon in light mode */}
        {theme === 'dark' ? <Sun className={styles.icon} /> : <Moon className={styles.icondark} />}
      </button>
    </Tooltip>
  );
}
