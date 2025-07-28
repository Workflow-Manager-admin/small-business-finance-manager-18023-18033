import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

// PUBLIC_INTERFACE
function Register() {
  /**
   * Registration form for users.
   */
  const { register, user, loading } = useContext(AuthContext);
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    role: "user",
    password: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError("Registration failed.");
    }
  }

  if (user) {
    navigate("/");
    return null;
  }
  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        <input
          type="email"
          name="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="text"
          name="full_name"
          required
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
        />
        <select
          name="role"
          required
          value={form.role}
          onChange={handleChange}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <input
          type="password"
          name="password"
          required
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>
        {error && <div className="auth-error">{error}</div>}
        <div style={{ marginTop: 10 }}>
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;
