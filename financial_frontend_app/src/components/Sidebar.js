import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { ThemeContext } from "../contexts/ThemeContext";
import api from "../utils/api";

const SIDEBAR_ROUTES_FALLBACK = [
  { path: "/dashboard", label: "Dashboard", icon: "🏠" },
  { path: "/expenses", label: "Expenses", icon: "💸" },
  { path: "/income", label: "Income", icon: "💰" },
  { path: "/budgets", label: "Budgets", icon: "📊" },
  { path: "/reports", label: "Reports", icon: "📑" },
];

function Sidebar() {
  // PUBLIC_INTERFACE
  /**
   * Sidebar navigation, populated from backend-provided routes. 
   * Includes theme toggle and logout actions.
   */
  const { user, logout, accessToken } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();

  const [routes, setRoutes] = useState(SIDEBAR_ROUTES_FALLBACK);

  useEffect(() => {
    if (accessToken) {
      api.get('/sidebar/routes', { token: accessToken })
        .then(data => {
          // The backend provides a string array, so map to sidebar structure
          if (Array.isArray(data)) {
            const m = {
              dashboard: { icon: "🏠" },
              expenses: { icon: "💸" },
              income: { icon: "💰" },
              budgets: { icon: "📊" },
              reports: { icon: "📑" },
              settings: { icon: "⚙️" }
            }
            setRoutes(
              data.map(key => ({
                path: `/${key}`,
                label: key.charAt(0).toUpperCase() + key.slice(1),
                icon: m[key]?.icon || "•"
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [accessToken]);

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <span style={{ color: "var(--sidebar-accent, #43a047)", fontWeight: "bold" }}>
          💼 Finance
        </span>
      </div>
      <ul className="sidebar-list">
        {routes.map(route => (
          <li key={route.path} className={location.pathname.startsWith(route.path) ? "active" : ""}>
            <Link to={route.path}>
              <span className="sidebar-icon">{route.icon}</span>
              {route.label}
            </Link>
          </li>
        ))}
        {user && user.role === "admin" && (
          <li className={location.pathname === "/settings" ? "active" : ""}>
            <Link to="/settings"><span className="sidebar-icon">⚙️</span>Settings</Link>
          </li>
        )}
        <li>
          <button className="sidebar-theme-btn" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </li>
        <li>
          <button className="sidebar-logout-btn" onClick={logout} title="Logout">
            🚪 Logout
          </button>
        </li>
      </ul>
      <div className="sidebar-footer">
        <span className="sidebar-user">{user && user.full_name}</span>
        <small className="sidebar-role">{user && user.role}</small>
      </div>
    </nav>
  );
}

export default Sidebar;
