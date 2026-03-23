import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import Header from './components/Header';

const storageKey = 'internhub-session';

export default function App() {
  const [session, setSession] = useState(() => {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (session) {
      window.localStorage.setItem(storageKey, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(storageKey);
    }
  }, [session]);

  const auth = useMemo(() => ({ session, setSession }), [session]);

  return (
    <div className="app-shell">
      <Header session={session} onLogout={() => setSession(null)} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage auth={auth} />} />
        <Route path="/login" element={<LoginPage auth={auth} />} />
        <Route
          path="/dashboard"
          element={session?.role === 'intern' ? <DashboardPage session={session} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin"
          element={session?.role === 'admin' ? <AdminPage /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </div>
  );
}
