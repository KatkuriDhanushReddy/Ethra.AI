import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Modal from '../components/Modal';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { projectsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, projectStatusColors } from '../utils/helpers';

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', deadline: '', status: 'active', members: [] });

  const load = () => {
    projectsAPI
      .list({ search: search || undefined })
      .then((res) => setProjects(res.data.data))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [search]);

  useEffect(() => {
    if (isAdmin) usersAPI.list().then((res) => setUsers(res.data.data));
  }, [isAdmin]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.create(form);
      toast.success('Project created');
      setModalOpen(false);
      setForm({ name: '', description: '', deadline: '', status: 'active', members: [] });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <Header title="Projects" subtitle="Manage your team projects" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="input pl-10"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {projects.map((p) => (
            <Link key={p._id} to={`/projects/${p._id}`} className="card p-6 transition hover:shadow-md hover:border-brand-300">
              <div className="flex items-start justify-between">
                <h3 className="font-bold">{p.name}</h3>
                <span className={`rounded-lg px-2 py-0.5 text-xs capitalize ${projectStatusColors[p.status]}`}>
                  {p.status?.replace('_', ' ')}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500 line-clamp-2">{p.description || 'No description'}</p>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{p.completedCount}/{p.taskCount} tasks</span>
                  <span>{p.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
              {p.deadline && (
                <p className="mt-3 text-xs text-slate-500">Due {formatDate(p.deadline)}</p>
              )}
            </Link>
          ))}
          {!projects.length && (
            <p className="col-span-full text-center text-slate-500 py-12">No projects found</p>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <input className="input" placeholder="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <textarea className="input min-h-[80px]" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
          <select
            className="input"
            multiple
            value={form.members}
            onChange={(e) => setForm({ ...form, members: [...e.target.selectedOptions].map((o) => o.value) })}
          >
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
            ))}
          </select>
          <p className="text-xs text-slate-500">Hold Ctrl/Cmd to select multiple members</p>
          <button type="submit" className="btn-primary w-full">Create</button>
        </form>
      </Modal>
    </>
  );
}
