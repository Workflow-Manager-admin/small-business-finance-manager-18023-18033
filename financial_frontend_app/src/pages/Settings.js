import React, { useContext, useEffect, useState } from "react";
import api from "../utils/api";
import { AuthContext } from "../contexts/AuthContext";

function CategoryForm({ open, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(name);
      setName(""); setSaving(false); onClose();
    } catch {
      setSaving(false);
    }
  }

  if (!open) return null;
  return (
    <div className="modal-overlay">
      <form className="modal" onSubmit={handleSubmit}>
        <h3>Add Category</h3>
        <input
          name="name"
          required
          placeholder="Category Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}

function UserRoleForm({ open, onClose, onSubmit, user, roles }) {
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setRole(user.role); }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSubmit(role);
    setSaving(false);
    onClose();
  }

  if (!open || !user) return null;
  return (
    <div className="modal-overlay">
      <form className="modal" onSubmit={handleSubmit}>
        <h3>Update Role for {user.full_name}</h3>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          required
        >
          {roles.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
}

// PUBLIC_INTERFACE
function Settings() {
  /**
   * Settings page for managing users/roles and categories.
   */
  const { accessToken } = useContext(AuthContext);

  // categories
  const [categories, setCategories] = useState([]);
  const [showCatForm, setShowCatForm] = useState(false);
  // users/roles
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState(["user", "admin"]);
  const [userToEdit, setUserToEdit] = useState(null);
  const [showRoleForm, setShowRoleForm] = useState(false);

  useEffect(() => {
    api.get("/categories/").then(setCategories);
    api.get("/users/", { token: accessToken }).then(setUsers);
    api.get("/roles/").then(setRoles);
  }, [accessToken]);

  async function addCategory(name) {
    await api.post("/categories/", { name }, { token: accessToken });
    setCategories(await api.get("/categories/"));
  }
  async function deleteCategory(id) {
    if (!window.confirm("Delete this category?")) return;
    await api.delete(`/categories/${id}`, { token: accessToken });
    setCategories(await api.get("/categories/"));
  }
  async function handleRoleChange(role) {
    await api.put(`/users/${userToEdit.id}/role?new_role=${role}`, {}, { token: accessToken });
    setUsers(await api.get("/users/", { token: accessToken }));
  }

  return (
    <div className="content-container">
      <h1>Settings</h1>
      <div className="settings-section">
        <h2>Categories</h2>
        <ul className="list-group">
          {categories.map(cat => (
            <li key={cat.id} className="list-group-item">
              {cat.name}
              <button
                className="btn btn-small btn-danger"
                onClick={() => deleteCategory(cat.id)}
                style={{marginLeft:8}}
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
        <button className="btn btn-accent" onClick={() => setShowCatForm(true)}>
          Add Category
        </button>
        <CategoryForm open={showCatForm} onClose={() => setShowCatForm(false)} onSubmit={addCategory}/>
      </div>
      <div className="settings-section">
        <h2>User Roles</h2>
        <ul className="list-group">
          {users.map(user => (
            <li key={user.id} className="list-group-item">
              {user.full_name} ({user.email}) - <b>{user.role}</b>
              <button
                className="btn btn-small"
                onClick={() => { setUserToEdit(user); setShowRoleForm(true); }}
                style={{marginLeft:8}}
              >
                ✏️
              </button>
            </li>
          ))}
        </ul>
        <UserRoleForm open={showRoleForm} onClose={() => setShowRoleForm(false)} onSubmit={handleRoleChange} user={userToEdit || {}} roles={roles}/>
      </div>
    </div>
  );
}

export default Settings;
