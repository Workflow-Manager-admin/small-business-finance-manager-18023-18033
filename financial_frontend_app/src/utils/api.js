const API_BASE = process.env.REACT_APP_BACKEND_URL || "https://vscode-internal-112-beta.beta01.cloud.kavia.ai:3001";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// PUBLIC_INTERFACE
const api = {
  // Traditional GET with optional auth
  async get(path, { token, params={} } = {}) {
    let url = new URL(API_BASE + path);
    Object.entries(params).forEach(([k,v]) => {
      if (v !== undefined && v !== null) url.searchParams.append(k, v);
    });
    const res = await fetch(url, {
      headers: { ...authHeaders(token) },
    });
    if (!res.ok) throw new Error(await res.text());
    try { return await res.json(); }
    catch { return {}; }
  },
  // Traditional POST with JSON
  async post(path, body, { token } = {}) {
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    try { return await res.json(); }
    catch { return {}; }
  },
  // For x-www-form-urlencoded POST (login)
  async postForm(path, bodyObj) {
    const formData = new URLSearchParams();
    for (const k in bodyObj) formData.append(k, bodyObj[k]);
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  },
  async put(path, body, { token } = {}) {
    const res = await fetch(API_BASE + path, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    try { return await res.json(); }
    catch { return {}; }
  },
  async delete(path, { token } = {}) {
    const res = await fetch(API_BASE + path, {
      method: "DELETE",
      headers: { ...authHeaders(token) },
    });
    if (!res.ok) throw new Error(await res.text());
    try { return await res.json(); }
    catch { return {}; }
  },
  async uploadFile(path, file, fields, { token } = {}) {
    // fields: {expense_id}, etc
    const formData = new FormData();
    Object.entries(fields || {}).forEach(([k, v]) => formData.append(k, v));
    formData.append("file", file);
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: { ...authHeaders(token) },
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  }
};

export default api;
