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

  renderUI(role) {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    navbar.classList.remove('hidden');

    document.querySelectorAll('.nav-menu a[data-role]').forEach(link => {
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
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.add('hidden');
  },

  highlightNav(page) {
    document.querySelectorAll('.nav-menu a').forEach(l => l.classList.remove('active'));
    const link = document.querySelector('.nav-menu a[data-page="' + page + '"]');
    if (link) link.classList.add('active');
    closeSidebar();
  },
};

function toggleSidebar() {
  const menu = document.getElementById('navMenu');
  if (menu) menu.classList.toggle('show');
}

function closeSidebar() {
  const menu = document.getElementById('navMenu');
  if (menu) menu.classList.remove('show');
}
