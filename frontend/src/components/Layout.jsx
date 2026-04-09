import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>POS System</h2>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            <span>📊</span> Dashboard
          </NavLink>
          <NavLink to="/pos" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>🛒</span> POS
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>📦</span> Products
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>📁</span> Categories
          </NavLink>
          <NavLink to="/sales" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>💰</span> Sales
          </NavLink>
          {isManager && (
            <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>
              <span>👥</span> Users
            </NavLink>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
