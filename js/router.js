const router = {
  current: null,
  routes: {},

  register(name, handler) {
    this.routes[name] = handler;
  },

  async navigate(name, params = {}) {
    if (!auth.isLoggedIn() && name !== 'login') {
      name = 'login';
    }

    const pageContent = document.getElementById('page-content');
    this.current = name;

    if (this.routes[name]) {
      pageContent.innerHTML = '<div class="loading"><div class="spinner"></div><p>Memuat...</p></div>';
      try {
        await this.routes[name](params);
        if (name !== 'login') auth.highlightNav(name);
      } catch (err) {
        pageContent.innerHTML = `<div class="alert alert-danger">Terjadi kesalahan: ${err.message}</div>`;
      }
    } else {
      pageContent.innerHTML = '<div class="alert alert-danger">Halaman tidak ditemukan</div>';
    }
  },

  init() {
    const hash = window.location.hash.slice(1) || 'login';
    this.navigate(hash);

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1) || 'login';
      this.navigate(hash);
    });
  },
};

function toggleNav() {
  document.getElementById('navMenu')?.classList.toggle('show');
}

function showLoading(show) {
  const el = document.getElementById('loading');
  if (el) {
    if (show) el.classList.remove('hidden');
    else el.classList.add('hidden');
  }
}

/* Toast notification */
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '&#10003;', error: '&#10007;', warning: '&#9888;', info: '&#8505;' };

  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-content">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toISOString().split('T')[0];
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
