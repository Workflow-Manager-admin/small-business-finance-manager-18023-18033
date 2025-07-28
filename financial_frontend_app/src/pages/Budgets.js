import React, { useContext, useEffect, useState } from "react";
import api from "../utils/api";
import { AuthContext } from "../contexts/AuthContext";

function BudgetForm({ open, onClose, onSubmit, initial }) {
  // PUBLIC_INTERFACE
  /**
   * Add/Edit a budget plan for a category.
   */
  const { accessToken } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [fields, setFields] = useState(initial || { category_id: "", monthly_limit: "", alert_threshold: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/categories/").then(setCategories);
  }, []);
  useEffect(() => {
    setFields(initial || { category_id: "", monthly_limit: "", alert_threshold: "" });
  }, [initial]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields(f => ({ ...f, [name]: value }));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    let budget;
    if (fields.id) {
      budget = await api.put(
        `/budgets/${fields.id}`,
        {
          ...fields,
          monthly_limit: parseFloat(fields.monthly_limit),
          alert_threshold: parseFloat(fields.alert_threshold),
        },
        { token: accessToken }
      );
    } else {
      budget = await api.post(
        "/budgets/",
        {
          ...fields,
          monthly_limit: parseFloat(fields.monthly_limit),
          alert_threshold: parseFloat(fields.alert_threshold),
        },
        { token: accessToken }
      );
    }
    setSaving(false);
    onSubmit(budget);
  }
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <form className="modal" onSubmit={handleSubmit}>
        <h3>{fields.id ? "Edit Budget" : "Add Budget"}</h3>
        <select
          name="category_id"
          required
          value={fields.category_id}
          onChange={handleChange}
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input
          name="monthly_limit"
          type="number"
          required
          min={0}
          step="0.01"
          placeholder="Monthly Limit"
          value={fields.monthly_limit}
          onChange={handleChange}
        />
        <input
          name="alert_threshold"
          type="number"
          required
          min={0}
          max={fields.monthly_limit}
          step="0.01"
          placeholder="Alert Threshold"
          value={fields.alert_threshold}
          onChange={handleChange}
        />
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : fields.id ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Budgets() {
  // PUBLIC_INTERFACE
  /**
   * Budgets page: list, add/edit/delete budgets, alert if limit near.
   */
  const { accessToken, user } = useContext(AuthContext);
  const [budgets, setBudgets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formBudget, setFormBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const result = await api.get("/budgets/", { token: accessToken });
    setBudgets(result || []);
    setLoading(false);
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line
  }, []);

  function handleEdit(budget) {
    setFormBudget(budget);
    setShowForm(true);
  }
  function handleAdd() {
    setFormBudget(null);
    setShowForm(true);
  }
  async function handleDelete(id) {
    if (!window.confirm("Delete this budget?")) return;
    await api.delete(`/budgets/${id}`, { token: accessToken });
    refresh();
  }
  return (
    <div className="content-container">
      <h1>Budgets</h1>
      <button className="btn btn-accent" style={{margin:'8px 0px 10px'}} onClick={handleAdd}>
        Add Budget
      </button>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Monthly Limit</th>
              <th>Alert Threshold</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map(budget => (
              <tr key={budget.id}>
                <td>{budget.category_id}</td>
                <td>{budget.monthly_limit}</td>
                <td>{budget.alert_threshold}</td>
                <td>
                  <button onClick={() => handleEdit(budget)} className="btn btn-small">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(budget.id)} className="btn btn-small btn-danger">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BudgetForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={() => { setShowForm(false); refresh(); }}
        initial={formBudget}
      />
      {loading && <div className="app-centered"><div className="loader"/></div>}
    </div>
  );
}
export default Budgets;
