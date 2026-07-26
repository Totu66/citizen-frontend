const API_BASE = (window.API_URL || window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://citizen-backend-ngiq.onrender.com') + '/api';

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function isLoggedIn() {
  return !!getToken();
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/citizen/index.html';
  }
}

function redirectIfLoggedIn() {
  if (isLoggedIn()) {
    const user = getUser();
    if (user.role === 'admin') {
      window.location.href = '/admin/dashboard.html';
    } else {
      window.location.href = '/citizen/submit-complaint.html';
    }
  }
}

async function apiRequest(method, path, data) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (data) opts.body = JSON.stringify(data);
  const token = getToken();
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_BASE + path, opts);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

function showAlert(message, type) {
  const container = document.getElementById('alert-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'alert alert-' + type;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-KE', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function statusBadge(status) {
  const labels = {
    pending: 'Pending',
    under_review: 'Under Review',
    in_progress: 'In Progress',
    resolved: 'Resolved'
  };
  return '<span class="status-badge status-' + status + '">' + (labels[status] || status) + '</span>';
}

function priorityBadge(priority) {
  return '<span class="badge badge-' + priority + '">' + priority.charAt(0).toUpperCase() + priority.slice(1) + '</span>';
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  updateThemeBtns();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeBtns();
}

function updateThemeBtns() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.textContent = dark ? '\u2600\uFE0F' : '\uD83C\uDF19';
  });
}

initTheme();
