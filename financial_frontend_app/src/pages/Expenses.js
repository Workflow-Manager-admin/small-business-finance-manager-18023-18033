import React, { useContext, useEffect, useState } from "react";
import api from "../utils/api";
import { AuthContext } from "../contexts/AuthContext";

const PAGE_SIZE = 25;

function ExpenseForm({ open, onClose, onSubmit, initial }) {
  // PUBLIC_INTERFACE
  /**
   * Modal form for adding or editing an expense record.
   */
  const { accessToken } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [fields, setFields] = useState(
    initial || {
      title: "",
      amount: "",
      category_id: "",
      date: "",
      description: "",
      department: "",
      file: null
    }
  );
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/categories/").then(setCategories);
  }, []);

  // always update fields on new initial
  useEffect(() => {
    if (initial) setFields(initial);
  }, [initial]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields(f => ({ ...f, [name]: value }));
  }
  // Handles file input for expense proof upload
  function handleFile(e) {
    setFile(e.target.files[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      let expense;
      if (fields.id) {
        // Updating
        expense = await api.put(
          `/expenses/${fields.id}`,
          {
            ...fields,
            amount: parseFloat(fields.amount),
          },
          { token: accessToken }
        );
      } else {
        // Creating
        expense = await api.post(
          "/expenses/",
          {
            ...fields,
            amount: parseFloat(fields.amount),
          },
          { token: accessToken }
        );
      }
      if (file) {
        // upload file for this expense
        await api.uploadFile("/files/", file, { expense_id: expense.id }, { token: accessToken });
      }
      setSaving(false); onSubmit(expense);
    } catch {
      setError("Failed to save expense.");
      setSaving(false);
    }
  }

  if (!open) return null;
  return (
    <div className="modal-overlay">
      <form className="modal" onSubmit={handleSubmit}>
        <h3>{fields.id ? "Edit Expense" : "Add Expense"}</h3>
        <input
          name="title"
          required
          placeholder="Title"
          value={fields.title}
          onChange={handleChange}
        />
        <input
          name="amount"
          type="number"
          min={0}
          step="0.01"
          required
          placeholder="Amount"
          value={fields.amount}
          onChange={handleChange}
        />
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
          name="date"
          type="date"
          required
          value={fields.date ? fields.date.substring(0,10) : ""}
          onChange={handleChange}
        />
        <input
          name="department"
          placeholder="Department"
          value={fields.department}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={fields.description}
          onChange={handleChange}
          rows={2}
        />
        <div>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFile}
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : (fields.id ? "Update" : "Add")}
          </button>
        </div>
        {error && <div className="modal-error">{error}</div>}
      </form>
    </div>
  );
}

function ExpenseFilters({ filters, setFilters }) {
  // PUBLIC_INTERFACE
  /**
   * Filter controls for expense list (category, date, department).
   */
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/categories/").then(setCategories);
  }, []);
  return (
    <form
      className="filter-bar"
      onSubmit={e => {
        e.preventDefault();
      }}
    >
      <select
        value={filters.category_id || ""}
        onChange={e =>
          setFilters(f => ({ ...f, category_id: e.target.value || undefined }))
        }
      >
        <option value="">All Categories</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <input
        type="date"
        placeholder="From"
        value={filters.start_date || ""}
        onChange={e =>
          setFilters(f => ({ ...f, start_date: e.target.value || undefined }))
        }
      />
      <input
        type="date"
        placeholder="To"
        value={filters.end_date || ""}
        onChange={e =>
          setFilters(f => ({ ...f, end_date: e.target.value || undefined }))
        }
      />
      <input
        placeholder="Department"
        value={filters.department || ""}
        onChange={e =>
          setFilters(f => ({
            ...f,
            department: e.target.value || undefined,
          }))
        }
      />
    </form>
  );
}

function ExpenseRow({ expense, onEdit, onDelete }) {
  // PUBLIC_INTERFACE
  /**
   * Renders an expense in the data table.
   */
  return (
    <tr>
      <td>{expense.title}</td>
      <td>{expense.amount.toFixed(2)}</td>
      <td>{expense.category_id}</td>
      <td>{expense.date}</td>
      <td>{expense.department}</td>
      <td>
        {expense.file_url && (
          <a href={expense.file_url} target="_blank" rel="noopener noreferrer">
            View
          </a>
        )}
      </td>
      <td>
        <button onClick={() => onEdit(expense)} className="btn btn-small">
          ✏️
        </button>
        <button onClick={() => onDelete(expense.id)} className="btn btn-small btn-danger">
          🗑️
        </button>
      </td>
    </tr>
  );
}

// PUBLIC_INTERFACE
function Expenses() {
  /**
   * Expenses page: list, filter, add/edit/delete, file upload.
   */
  const { accessToken } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [formExpense, setFormExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      let q = { ...filters };
      Object.keys(q).forEach(k => (q[k] === "" || q[k] == null) && delete q[k]);
      const result = await api.get("/expenses/", { token: accessToken, params: q });
      setExpenses(result || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line
  }, [filters]);

  function handleEdit(expense) {
    setFormExpense(expense);
    setShowForm(true);
  }
  function handleAdd() {
    setFormExpense(null);
    setShowForm(true);
  }
  async function handleDelete(id) {
    if (!window.confirm("Delete this expense?")) return;
    await api.delete(`/expenses/${id}`, { token: accessToken });
    refresh();
  }

  return (
    <div className="content-container">
      <h1>Expenses</h1>
      <button className="btn btn-accent" style={{margin:'8px 0px 10px'}} onClick={handleAdd}>
        Add Expense
      </button>
      <ExpenseFilters filters={filters} setFilters={setFilters} />
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
              <th>Department</th>
              <th>File</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <ExpenseRow
                key={exp.id}
                expense={exp}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
      <ExpenseForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={() => { setShowForm(false); refresh(); }}
        initial={formExpense}
      />
      {loading && <div className="app-centered"><div className="loader"/></div>}
    </div>
  );
}
export default Expenses;
