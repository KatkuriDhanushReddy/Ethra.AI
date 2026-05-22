import { Link } from 'react-router-dom';
import { CheckCircle, Users, BarChart3, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const features = [
  { icon: Users, title: 'Team Collaboration', desc: 'Manage projects and assign tasks across your team.' },
  { icon: CheckCircle, title: 'Kanban Boards', desc: 'Drag-and-drop task boards with real-time updates.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track productivity, deadlines, and project progress.' },
];

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white font-bold">
            T
          </div>
          <span className="text-xl font-bold">Team Task Manager</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link to="/login" className="btn-secondary">Log in</Link>
          <Link to="/signup" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      <section className="px-6 py-20 text-center lg:px-12 lg:py-32">
        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight lg:text-6xl animate-fade-in">
          Manage team projects with{' '}
          <span className="bg-gradient-to-r from-brand-600 to-indigo-400 bg-clip-text text-transparent">
            clarity
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          A modern SaaS task manager with role-based access, Kanban boards, real-time notifications,
          and powerful analytics for growing teams.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/signup" className="btn-primary px-8 py-3 text-base">Start Free</Link>
          <Link to="/login" className="btn-secondary px-8 py-3 text-base">View Demo</Link>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Demo: admin@demo.com / Admin123! · member@demo.com / Member123!
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 lg:px-12">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-8 text-left transition hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/40">
                <Icon size={24} />
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
