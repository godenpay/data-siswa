const auth = {
  TOKEN_KEY: 'ds_token',
  USER_KEY: 'ds_user',

  login(user) {
    const token = btoa(JSON.stringify({ id: user.id, username: user.username, role: user.role, time: Date.now() }));
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.renderNav(user.role);
  },

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
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

  renderNav(role) {
    const navbar = document.getElementById('navbar');
    const links = document.querySelectorAll('.nav-menu a[data-role]');
    if (!navbar) return;

    navbar.classList.remove('hidden');
    links.forEach(link => {
      const allowed = link.getAttribute('data-role');
      if (!role) { link.classList.add('hidden'); return; }
      if (allowed === 'all' || allowed.split(',').includes(role)) {
        link.classList.remove('hidden');
      } else {
        link.classList.add('hidden');
      }
    });
  },

  hideNav() {
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.add('hidden');
  },
};
