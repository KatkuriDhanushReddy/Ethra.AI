import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@demo.com');
      setPassword('Admin123!');
    } else {
      setEmail('member@demo.com');
      setPassword('Member123!');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md p-8 animate-slide-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white font-bold text-xl">
            T
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-slate-500">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="mt-4 flex gap-2">
          <button type="button" className="btn-secondary flex-1 text-xs" onClick={() => fillDemo('admin')}>
            Admin demo
          </button>
          <button type="button" className="btn-secondary flex-1 text-xs" onClick={() => fillDemo('member')}>
            Member demo
          </button>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          No account? <Link to="/signup" className="text-brand-600 font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
