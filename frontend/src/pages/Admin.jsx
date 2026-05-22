import { useEffect, useState } from 'react';
import { Users, FolderKanban, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import { usersAPI, projectsAPI, tasksAPI } from '../services/api';

export default function Admin() {
  const [stats, setStats] = useState({ users: 0, projects: 0, tasks: 0 });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    Promise.all([usersAPI.list(), projectsAPI.list({ limit: 100 }), tasksAPI.list({ limit: 100 })])
      .then(([u, p, t]) => {
        setUsers(u.data.data);
        setStats({
          users: u.data.pagination?.total || u.data.data.length,
          projects: p.data.pagination?.total || p.data.data.length,
          tasks: t.data.pagination?.total || t.data.data.length,
        });
      })
      .catch((e) => toast.error(e.message));
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.users, icon: Users },
    { label: 'Total Projects', value: stats.projects, icon: FolderKanban },
    { label: 'Total Tasks', value: stats.tasks, icon: CheckSquare },
  ];

  return (
    <>
      <Header title="Admin Panel" subtitle="System overview and user management" />
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-6 flex items-center gap-4">
            <div className="rounded-xl bg-brand-100 p-3 text-brand-600 dark:bg-brand-900/40">
              <Icon size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h3 className="font-bold">All Users</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-6 py-3 font-medium">{u.name}</td>
                <td className="px-6 py-3 text-slate-500">{u.email}</td>
                <td className="px-6 py-3 capitalize">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
