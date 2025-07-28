import React, { useContext, useEffect, useState } from "react";
import api from "../utils/api";
import { AuthContext } from "../contexts/AuthContext";

function IncomeForm({ open, onClose, onSubmit, initial }) {
  /**
   * Modal form for add/edit income record.
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
      status: "unpaid"
    }
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/categories/").then(setCategories);
  }, []);

  useEffect(() => {
    if (initial) setFields(initial);
  }, [initial]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    let income;
    if (fields.id) {
      // Update
      income = await api.put(`/income/${fields.id}`, fields, { token: accessToken });
    } else {
      // Create
      income = await api.post("/income/", fields, { token: accessToken });
    }
    setSaving(false);
    onSubmit(income);
  }

  if (!open) return null;
  return (
    <div className="modal-overlay">
      <form className="modal" onSubmit={handleSubmit}>
        <h3>{fields.id ? "Edit Income" : "Add Income"}</h3>
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
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
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
        <select
          name="status"
          value={fields.status}
          onChange={handleChange}
        >
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
        </select>
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

function IncomeFilters({ filters, setFilters }) {
  /**
   * Filters for income records.
   */
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    api.get("/categories/").then(setCategories);
  }, []);
  return (
    <form className="filter-bar" onSubmit={e => e.preventDefault()}>
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

function IncomeRow({ income, onEdit, onDelete }) {
  return (
    <tr>
      <td>{income.title}</td>
      <td>{income.amount}</td>
      <td>{income.category_id}</td>
      <td>{income.date}</td>
      <td>{income.department}</td>
      <td>{income.status}</td>
      <td>
        <button onClick={() => onEdit(income)} className="btn btn-small">
          ✏️
        </button>
        <button onClick={() => onDelete(income.id)} className="btn btn-small btn-danger">
          🗑️
        </button>
      </td>
    </tr>
  );
}

function Income() {
  /**
   * Income list, filter, add/edit/delete, status management.
   */
  const { accessToken } = useContext(AuthContext);

  const [incomeList, setIncomeList] = useState([]);
  const [filters, setFilters] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [formIncome, setFormIncome] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    let q = { ...filters };
    Object.keys(q).forEach(k => (q[k] === "" || q[k] == null) && delete q[k]);
    const result = await api.get("/income/", { token: accessToken, params: q });
    setIncomeList(result || []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line
  }, [filters]);

  function handleEdit(income) {
    setFormIncome(income);
    setShowForm(true);
  }
  function handleAdd() {
    setFormIncome(null);
    setShowForm(true);
  }
  async function handleDelete(id) {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/income/${id}`, { token: accessToken });
    refresh();
  }

  return (
    <div className="content-container">
      <h1>Income</h1>
      <button className="btn btn-accent" style={{margin:'8px 0px 10px'}} onClick={handleAdd}>
        Add Income
      </button>
      <IncomeFilters filters={filters} setFilters={setFilters} />
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
              <th>Dept</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {incomeList.map(inc => (
              <IncomeRow
                key={inc.id}
                income={inc}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
      <IncomeForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={() => { setShowForm(false); refresh(); }}
        initial={formIncome}
      />
      {loading && <div className="app-centered"><div className="loader"/></div>}
    </div>
  );
}

export default Income;
