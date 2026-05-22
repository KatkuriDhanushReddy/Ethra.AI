import { useState } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile({ name });
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Settings" subtitle="Manage your profile" />
      <div className="card max-w-lg p-8 animate-fade-in">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input className="input bg-slate-50 dark:bg-slate-800" value={user?.email} disabled />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Role</label>
            <input className="input bg-slate-50 dark:bg-slate-800 capitalize" value={user?.role} disabled />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </>
  );
}
