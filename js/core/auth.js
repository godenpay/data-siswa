const auth = {
  TOKEN_KEY: 'ds_token',
  USER_KEY: 'ds_user',

  login(user) {
    const token = btoa(JSON.stringify({ id: user.id, username: user.username, role: user.role, time: Date.now() }));
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.renderUI(user.role);
  },

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.hideAll();
    router.navigate('login');
  },

  getUser() {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  getRole() {
    const user = this.getUser();
    return user ? user.role : null;
  },

  getRelatedId() {
    const user = this.getUser();
    return user ? user.related_id : null;
  },

  getNama() {
    const user = this.getUser();
    return user ? user.nama : '';
  },

  hasRole(...roles) {
    const role = this.getRole();
    return roles.includes(role) || roles.includes('all');
  },

  getRoleLabel(role) {
    const labels = { admin: 'Administrator', siswa: 'Siswa', orang_tua: 'Orang Tua' };
    return labels[role] || role;
  },

  getInitials(name) {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    return name[0].toUpperCase();
  },

  renderUI(role) {
    const user = this.getUser();
    const sidebar = document.getElementById('sidebar');
    const navbar = document.getElementById('navbar');
    const bottomNav = document.getElementById('bottomNav');

    if (!sidebar) return;

    sidebar.classList.remove('hidden');
    navbar.classList.remove('hidden');
    if (bottomNav) bottomNav.classList.remove('hidden');

    const initials = this.getInitials(user?.nama);
    const name = user?.nama || 'User';
    const roleLabel = this.getRoleLabel(role);

    const els = ['sidebarAvatar', 'navUserAvatar'];
    els.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = initials; });

    ['sidebarUserName', 'navUserName'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = name; });
    ['sidebarUserRole', 'navUserRole'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = roleLabel; });

    document.querySelectorAll('.nav-link[data-role], .bottom-nav-link[data-role]').forEach(link => {
      const allowed = link.getAttribute('data-role');
      if (!role) { link.classList.add('hidden'); return; }
      if (allowed === 'all' || allowed.split(',').includes(role)) {
        link.classList.remove('hidden');
      } else {
        link.classList.add('hidden');
      }
    });
  },

  hideAll() {
    const ids = ['sidebar', 'navbar', 'bottomNav'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); });
  },

  highlightNav(page) {
    document.querySelectorAll('.nav-link, .bottom-nav-link').forEach(l => l.classList.remove('active'));
    const sel = `.nav-link[data-page="${page}"], .bottom-nav-link[data-bn-page="${page}"]`;
    document.querySelectorAll(sel).forEach(l => l.classList.add('active'));

    const bc = document.getElementById('breadcrumbCurrent');
    if (bc) {
      const labels = { dashboard: 'Dashboard', siswa: 'Data Siswa', absensi: 'Absensi', raport: 'Raport', ijin: 'Izin / Sakit', admin: 'Admin Panel' };
      bc.textContent = labels[page] || page.charAt(0).toUpperCase() + page.slice(1);
    }

    closeSidebar();
  },
};

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('hidden');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.add('hidden');
}
