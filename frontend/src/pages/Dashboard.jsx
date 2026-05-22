import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { CheckCircle, Clock, AlertTriangle, ListTodo } from 'lucide-react';
import Header from '../components/layout/Header';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import { dashboardAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b'];

const statCards = [
  { key: 'total', label: 'Total Tasks', icon: ListTodo, color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/30' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' },
  { key: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
  { key: 'overdue', label: 'Overdue', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30' },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI
      .get()
      .then((res) => setData(res.data.data))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><Header title="Dashboard" /><DashboardSkeleton /></>;

  const { stats, projectStats, productivity, activityTimeline, notifications } = data;
  const pieData = [
    { name: 'To Do', value: stats.byStatus.todo },
    { name: 'In Progress', value: stats.byStatus.in_progress },
    { name: 'Done', value: stats.byStatus.completed },
  ];

  return (
    <>
      <Header title="Dashboard" subtitle="Overview of your team's work" />
      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-1 text-3xl font-bold">{stats[key]}</p>
                </div>
                <div className={`rounded-xl p-3 ${color}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h3 className="font-bold mb-4">Team Productivity (7 days)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={productivity}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-6">
            <h3 className="font-bold mb-4">Tasks by Status</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h3 className="font-bold mb-4">Project Progress</h3>
            <div className="space-y-4">
              {projectStats.map((p) => (
                <div key={p.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-slate-500">{p.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-600 transition-all"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-bold mb-4">Recent Activity</h3>
            <ul className="space-y-3 max-h-64 overflow-y-auto">
              {activityTimeline.length ? (
                activityTimeline.map((a, i) => (
                  <li key={i} className="text-sm border-b border-slate-100 pb-2 dark:border-slate-800">
                    <span className="font-medium">{a.taskTitle}</span>
                    <span className="text-slate-500"> — {a.action}</span>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(a.createdAt)}</p>
                  </li>
                ))
              ) : (
                <p className="text-slate-500 text-sm">No recent activity</p>
              )}
            </ul>
          </div>
        </div>

        {notifications?.length > 0 && (
          <div className="card p-6">
            <h3 className="font-bold mb-4">Unread Notifications</h3>
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li key={n._id} className="text-sm text-slate-600 dark:text-slate-400">
                  {n.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
