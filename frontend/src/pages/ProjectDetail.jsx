import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Modal from '../components/Modal';
import KanbanBoard from '../components/KanbanBoard';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import { projectsAPI, tasksAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import { formatDate, projectStatusColors } from '../utils/helpers';

export default function ProjectDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assignedTo: '',
  });

  const load = () => {
    projectsAPI
      .get(id)
      .then((res) => {
        setProject(res.data.data);
        setTasks(res.data.data.tasks || []);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (isAdmin) usersAPI.list().then((res) => setUsers(res.data.data));
    const socket = getSocket();
    socket.emit('join:project', id);
    socket.on('task:created', (t) => {
      const pid = t.project?._id || t.project;
      if (String(pid) === id) setTasks((prev) => [...prev, t]);
    });
    socket.on('task:updated', (t) => setTasks((prev) => prev.map((x) => (x._id === t._id ? t : x))));
    socket.on('task:deleted', ({ id: tid }) => setTasks((prev) => prev.filter((x) => x._id !== tid)));
    return () => {
      socket.emit('leave:project', id);
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
    };
  }, [id, isAdmin]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const { data } = await tasksAPI.create({ ...taskForm, project: id });
      setTasks((prev) => [...prev, data.data]);
      toast.success('Task created');
      setTaskModal(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this project?')) return;
    try {
      await projectsAPI.delete(id);
      toast.success('Project deleted');
      window.location.href = '/projects';
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (!project) return null;

  return (
    <>
      <Link to="/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
        <ArrowLeft size={16} /> Back to projects
      </Link>
      <Header title={project.name} subtitle={project.description} />
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <span className={`rounded-lg px-3 py-1 text-sm capitalize ${projectStatusColors[project.status]}`}>
          {project.status?.replace('_', ' ')}
        </span>
        {project.deadline && <span className="text-sm text-slate-500">Due {formatDate(project.deadline)}</span>}
        <span className="text-sm text-slate-500">{project.progress}% complete</span>
        {isAdmin && (
          <>
            <button className="btn-primary ml-auto" onClick={() => setTaskModal(true)}>
              <Plus size={18} /> Add Task
            </button>
            <button className="btn-secondary text-rose-600" onClick={handleDelete}>
              <Trash2 size={16} /> Delete
            </button>
          </>
        )}
      </div>

      <div className="card p-6 mb-6">
        <h3 className="font-bold mb-3">Team Members</h3>
        <div className="flex flex-wrap gap-2">
          {project.members?.map((m) => (
            <span key={m._id} className="rounded-full bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800">
              {m.name}
            </span>
          ))}
        </div>
      </div>

      <h3 className="font-bold mb-4">Kanban Board</h3>
      <KanbanBoard
        tasks={tasks}
        canDrag
        onUpdate={(updated) => setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))}
      />

      <Modal open={taskModal} onClose={() => setTaskModal(false)} title="Create Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <input className="input" placeholder="Title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
          <textarea className="input" placeholder="Description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
          <select className="input" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input className="input" type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
          <select className="input" value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary w-full">Create Task</button>
        </form>
      </Modal>
    </>
  );
}
