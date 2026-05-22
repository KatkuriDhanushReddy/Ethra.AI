import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Settings,
  Shield,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../store/uiSlice';
import { useAuth } from '../../context/AuthContext';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const open = useSelector((s) => s.ui.sidebarOpen);
  const dispatch = useDispatch();
  const { isAdmin } = useAuth();

  return (
    <>
      <button
        className="fixed left-4 top-4 z-40 rounded-xl bg-white p-2 shadow lg:hidden dark:bg-slate-900"
        onClick={() => dispatch(toggleSidebar())}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white font-bold">
            T
          </div>
          <span className="font-bold text-lg">Task Manager</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                }`
              }
            >
              <Shield size={18} />
              Admin Panel
            </NavLink>
          )}
        </nav>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}
    </>
  );
}
