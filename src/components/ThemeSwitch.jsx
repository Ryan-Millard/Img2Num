import { Moon, Sun } from "lucide-react";
import GlassSwitch from "./GlassSwitch";
import { useTheme } from "@hooks/useTheme";

/*
 * ThemeSwitch
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
  const isDark = theme === "dark";

  return <GlassSwitch isOn={isDark} onChange={toggleTheme} thumbContent={isDark ? <Sun /> : <Moon />} ariaLabel={`switch to ${isDark ? "light" : "dark"} mode`} />;
}
