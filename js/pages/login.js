router.register('login', async () => {
  if (auth.isLoggedIn()) {
    router.navigate('dashboard');
    return;
  }
  auth.hideNav();

  const el = document.getElementById('page-content');
  el.innerHTML = `
    <div class="login-page">
      <div class="login-card">
        <div class="login-logo">
          <img src="logo/logo.png" alt="Logo" onerror="this.style.display='none'">
        </div>
        <h1>${APP_CONFIG.APP_NAME}</h1>
        <p>Sistem Informasi Data Siswa</p>
        <div id="loginAlert"></div>
        <form id="loginForm">
          <div class="form-group">
            <label>Username</label>
            <input type="text" class="form-control" id="loginUsername" placeholder="Masukkan username" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" class="form-control" id="loginPassword" placeholder="Masukkan password" required>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%">Masuk</button>
        </form>
      </div>
    </div>`;

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const alertDiv = document.getElementById('loginAlert');

    const res = await api.login(username, password);
    if (res.success) {
      auth.login(res.user);
      router.navigate('dashboard');
    } else {
      alertDiv.innerHTML = `<div class="alert alert-danger">${res.message || 'Login gagal'}</div>`;
    }
  });
});
