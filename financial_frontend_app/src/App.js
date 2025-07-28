import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext';
import './App.css';

function PrivateRoute({ element, roles }) {
  // PUBLIC_INTERFACE
  /**
   * v6 version: Protects a route by checking if the user is authenticated or has required role(s).
   * Renders children or redirects to /login.
   */
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="app-centered"><div className="loader"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return element;
}

function AppLayout() {
  // PUBLIC_INTERFACE
  /**
   * App shell layout with sidebar and routed content area. 
   * Respects user's theme setting through ThemeProvider.
   */
  return (
    <div className="app-root">
      <Sidebar />
      <main className="app-main" data-testid="main-content">
        <Routes>
          <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/expenses" element={<PrivateRoute element={<Expenses />} />} />
          <Route path="/income" element={<PrivateRoute element={<Income />} />} />
          <Route path="/budgets" element={<PrivateRoute element={<Budgets />} />} />
          <Route path="/reports" element={<PrivateRoute element={<Reports />} />} />
          <Route path="/settings" element={<PrivateRoute element={<Settings />} roles={["admin"]} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  // PUBLIC_INTERFACE
  /**
   * App entry, provides Auth and Theme context, top-level routing.
   * Shows login/register if not authenticated.
   */
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
