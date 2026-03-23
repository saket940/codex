import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function LoginPage({ auth }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const user = await api.login(form);
      auth.setSession(user);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="auth-layout">
      <section className="card auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Login to InternHub</h1>
        <p>Use the seeded admin account <strong>admin@internhub.dev</strong> / <strong>admin123</strong> to manage internships.</p>
        <form onSubmit={onSubmit} className="form-grid">
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </label>
          {message && <p className="status-message error">{message}</p>}
          <button className="primary-btn" type="submit">Login</button>
        </form>
      </section>
    </main>
  );
}
