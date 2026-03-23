import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function RegisterPage({ auth }) {
  const [internships, setInternships] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', internshipId: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getInternships().then(setInternships).catch((error) => setMessage(error.message));
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const user = await api.register(form);
      auth.setSession(user);
      navigate('/dashboard');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="auth-layout">
      <section className="card auth-card">
        <p className="eyebrow">Create account</p>
        <h1>Register for InternHub</h1>
        <p>The internship program field is mandatory, so every user joins a chosen program instead of receiving a random assignment.</p>
        <form onSubmit={onSubmit} className="form-grid">
          <label>
            Full name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </label>
          <label>
            Internship program *
            <select value={form.internshipId} onChange={(event) => setForm({ ...form, internshipId: event.target.value })} required>
              <option value="">Select your internship</option>
              {internships.map((internship) => (
                <option key={internship.id} value={internship.id}>{internship.title}</option>
              ))}
            </select>
          </label>
          {message && <p className="status-message error">{message}</p>}
          <button className="primary-btn" type="submit">Create account</button>
        </form>
      </section>
    </main>
  );
}
