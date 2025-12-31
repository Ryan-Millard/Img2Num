import { Moon, Sun } from 'lucide-react';
import GlassSwitch from './GlassSwitch';
import { useTheme } from '@hooks/useTheme';

export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <GlassSwitch
      isOn={isDark}
      onChange={toggleTheme}
      thumbContent={isDark ? <Moon /> : <Sun />}
      ariaLabel={`switch to ${isDark ? 'light' : 'dark'} mode`}
    />
  );
}