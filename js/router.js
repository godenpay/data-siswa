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
  document.getElementById('navMenu').classList.toggle('show');
}

function showLoading(show) {
  const el = document.getElementById('loading');
  if (el) {
    if (show) el.classList.remove('hidden');
    else el.classList.add('hidden');
  }
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
