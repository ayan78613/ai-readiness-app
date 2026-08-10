import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ClipboardList, History, LayoutDashboard, Moon, Sun } from 'lucide-react';
import { getStoredTheme, setTheme, type Theme } from '../lib/theme';
import { KestraLogo } from './KestraLogo';

export function Nav() {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    setThemeState(getStoredTheme());
  }, []);

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemeState(next);
  }

  return (
    <nav className="nav">
      <div className="nav-left">
        <span className="nav-product-name">AI Readiness Benchmark</span>
      </div>

      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <ClipboardList size={15} /> New Assessment
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <History size={15} /> My History
        </NavLink>
        <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <LayoutDashboard size={15} /> Admin Dashboard
        </NavLink>
      </div>

      <div className="nav-right">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <span className="nav-divider" />
        <KestraLogo />
      </div>
    </nav>
  );
}
