import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Modal from '../components/Modal';
import KanbanBoard from '../components/KanbanBoard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { tasksAPI, projectsAPI, commentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, priorityColors } from '../utils/helpers';

export default function Tasks() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('board');
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', project: '', sort: '-createdAt' });
  const [selectedTask, setSelectedTask] = useState(null);

  const load = () => {
    setLoading(true);
    tasksAPI
      .list({ ...filters, search: filters.search || undefined, status: filters.status || undefined, priority: filters.priority || undefined, project: filters.project || undefined })
      .then((res) => setTasks(res.data.data))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    projectsAPI.list().then((res) => setProjects(res.data.data));
  }, [filters.status, filters.priority, filters.project, filters.sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const openTask = async (id) => {
    try {
      const { data } = await tasksAPI.get(id);
      setSelectedTask(data.data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <Header title="Tasks" subtitle="View and manage all tasks" />
      <form onSubmit={handleSearch} className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="input pl-10"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select className="input lg:w-40" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select className="input lg:w-40" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select className="input lg:w-48" value={filters.project} onChange={(e) => setFilters({ ...filters, project: e.target.value })}>
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
        <select className="input lg:w-40" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
          <option value="-createdAt">Newest</option>
          <option value="priority">Priority</option>
          <option value="dueDate">Due date</option>
        </select>
        <button type="submit" className="btn-primary"><Filter size={16} /> Apply</button>
        <div className="flex gap-2">
          <button type="button" className={`btn-secondary ${view === 'board' ? 'ring-2 ring-brand-500' : ''}`} onClick={() => setView('board')}>Board</button>
          <button type="button" className={`btn-secondary ${view === 'list' ? 'ring-2 ring-brand-500' : ''}`} onClick={() => setView('list')}>List</button>
        </div>
      </form>

      {loading ? (
        <CardSkeleton />
      ) : view === 'board' ? (
        <KanbanBoard
          tasks={tasks}
          onUpdate={(t) => setTasks((prev) => prev.map((x) => (x._id === t._id ? t : x)))}
        />
      ) : (
        <div className="card overflow-hidden animate-fade-in">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Project</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Due</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr
                  key={t._id}
                  className="border-t border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  onClick={() => openTask(t._id)}
                >
                  <td className="px-4 py-3 font-medium">{t.title}</td>
                  <td className="px-4 py-3 text-slate-500">{t.project?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-lg px-2 py-0.5 text-xs capitalize ${priorityColors[t.priority]}`}>{t.priority}</span>
                  </td>
                  <td className="px-4 py-3 capitalize">{t.status?.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(t.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!selectedTask} onClose={() => setSelectedTask(null)} title={selectedTask?.title} size="lg">
        {selectedTask && (
          <TaskDetailContent task={selectedTask} onClose={() => { setSelectedTask(null); load(); }} isAdmin={isAdmin} />
        )}
      </Modal>
    </>
  );
}

function TaskDetailContent({ task }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    commentsAPI.list(task._id).then((res) => setComments(res.data.data));
  }, [task._id]);

  const addComment = async (e) => {
    e.preventDefault();
    try {
      const { data } = await commentsAPI.create(task._id, content);
      setComments((prev) => [data.data, ...prev]);
      setContent('');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-600 dark:text-slate-400">{task.description}</p>
      <div className="flex gap-2 flex-wrap">
        <span className={`rounded-lg px-2 py-1 text-xs capitalize ${priorityColors[task.priority]}`}>{task.priority}</span>
        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs capitalize dark:bg-slate-800">{task.status?.replace('_', ' ')}</span>
      </div>
      {task.activity?.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2">Activity</h4>
          <ul className="text-sm space-y-1 text-slate-500">
            {[...task.activity].reverse().slice(0, 5).map((a, i) => (
              <li key={i}>{a.action} — {a.details}</li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <h4 className="font-semibold text-sm mb-2">Comments</h4>
        <form onSubmit={addComment} className="flex gap-2 mb-3">
          <input className="input flex-1" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Add a comment..." required />
          <button type="submit" className="btn-primary">Post</button>
        </form>
        <ul className="space-y-2 max-h-40 overflow-y-auto">
          {comments.map((c) => (
            <li key={c._id} className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
              <span className="font-medium">{c.user?.name}</span>
              <p className="mt-1">{c.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
