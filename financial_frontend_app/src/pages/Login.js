import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

// PUBLIC_INTERFACE
function Login() {
  /**
   * Login form for authentication. Redirects after login.
   */
  const { login, user, loading } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await login(form.username, form.password);
      navigate("/");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  }

  if (user) {
    navigate("/");
    return null;
  }
  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="email"
          name="username"
          required
          placeholder="Email"
          value={form.username}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          required
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <div className="auth-error">{error}</div>}
        <div style={{ marginTop: 10 }}>
          <Link to="/register">No account? Register</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
