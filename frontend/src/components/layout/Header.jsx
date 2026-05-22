import { Moon, Sun, LogOut, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Header({ title, subtitle }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <Link
          to="/notifications"
          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Bell size={18} />
        </Link>
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-slate-200 p-2.5 dark:border-slate-700"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="hidden items-center gap-2 sm:flex">
          <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm dark:bg-brand-900 dark:text-brand-300">
            {user?.name?.charAt(0)}
          </div>
          <div className="text-sm">
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={logout} className="btn-secondary py-2">
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
