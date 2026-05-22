import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import { notificationsAPI } from '../services/api';
import { getSocket } from '../services/socket';
import { formatDate } from '../utils/helpers';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    notificationsAPI
      .list()
      .then((res) => setNotifications(res.data.data))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    socket.on('notification', (n) => setNotifications((prev) => [n, ...prev]));
    return () => socket.off('notification');
  }, []);

  const markAll = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const markOne = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <Header title="Notifications" subtitle="Stay updated on team activity" />
      <div className="mb-4 flex justify-end">
        <button className="btn-secondary" onClick={markAll}>Mark all as read</button>
      </div>
      <div className="card divide-y divide-slate-100 dark:divide-slate-800 animate-fade-in">
        {loading ? (
          <p className="p-8 text-center text-slate-500">Loading...</p>
        ) : notifications.length ? (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`flex items-start justify-between gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                !n.read ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''
              }`}
              onClick={() => !n.read && markOne(n._id)}
            >
              <div>
                <p className="text-sm font-medium">{n.message}</p>
                <p className="text-xs text-slate-500 mt-1 capitalize">{n.type?.replace('_', ' ')} · {formatDate(n.createdAt)}</p>
              </div>
              {!n.read && <span className="h-2 w-2 rounded-full bg-brand-600 shrink-0 mt-2" />}
            </div>
          ))
        ) : (
          <p className="p-8 text-center text-slate-500">No notifications</p>
        )}
      </div>
    </>
  );
}
