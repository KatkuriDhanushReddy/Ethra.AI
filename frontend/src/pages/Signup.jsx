import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup({ ...form, role: import.meta.env.DEV ? form.role : 'member' });
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md p-8 animate-slide-up">
        <h1 className="text-2xl font-bold text-center mb-6">Create account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
          </div>
          {import.meta.env.DEV && (
            <div>
              <label className="mb-1 block text-sm font-medium">Role (dev only)</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Sign up'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Have an account? <Link to="/login" className="text-brand-600 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
