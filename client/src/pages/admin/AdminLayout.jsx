import { Link, Outlet } from 'react-router-dom';
import './Admin.css';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-title">Admin Panel</h2>
        <nav className="admin-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/bookings">Bookings</Link>
          <Link to="/admin/stylists">Stylists</Link>
          <Link to="/admin/services">Services</Link>
          <hr />
          <Link to="/">Back to Site</Link>
        </nav>
      </aside>
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
}
