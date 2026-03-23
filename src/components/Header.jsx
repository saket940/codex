import { Link, NavLink } from 'react-router-dom';

export default function Header({ session, onLogout }) {
  return (
    <header className="topbar">
      <Link to="/" className="brand">InternHub</Link>
      <nav>
        <NavLink to="/">Home</NavLink>
        {!session && <NavLink to="/register">Register</NavLink>}
        {!session && <NavLink to="/login">Login</NavLink>}
        {session?.role === 'intern' && <NavLink to="/dashboard">Dashboard</NavLink>}
        {session?.role === 'admin' && <NavLink to="/admin">Admin Panel</NavLink>}
      </nav>
      {session && (
        <button type="button" className="ghost-btn" onClick={onLogout}>
          Logout
        </button>
      )}
    </header>
  );
}
