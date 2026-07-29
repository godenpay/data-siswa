router.register('dashboard', async () => {
  const user = auth.getUser();
  const role = auth.getRole();
  const isAdmin = role === 'admin';
  const isSiswa = role === 'siswa';
  const isOrtu = role === 'orang_tua';

  let statsHtml = '';

  if (isAdmin) {
    const res = await api.getDashboardStats();
    const stats = res.data || {};
    statsHtml = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background:#dbeafe;color:#1d4ed8">👥</div>
          <div><div class="stat-value">${stats.totalSiswa || 0}</div><div class="stat-label">Total Siswa</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#dcfce7;color:#15803d">✅</div>
          <div><div class="stat-value">${stats.hadirHariIni || 0}</div><div class="stat-label">Hadir Hari Ini</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fef3c7;color:#b45309">📋</div>
          <div><div class="stat-value">${stats.izinPending || 0}</div><div class="stat-label">Izin Pending</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#f1f5f9;color:#475569">📚</div>
          <div><div class="stat-value">${stats.totalKelas || 0}</div><div class="stat-label">Total Kelas</div></div>
        </div>
      </div>`;
  }

  let content = '';
  if (isAdmin) {
    content = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Selamat Datang, ${escapeHtml(user.nama)}</div>
          <span class="badge badge-info">Admin</span>
        </div>
        <p>Kelola seluruh data siswa, absensi, raport, dan izin dari menu di atas.</p>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">Akses Cepat</div>
        </div>
        <div class="quick-actions">
          <a href="#" onclick="router.navigate('siswa')" class="btn btn-primary">Kelola Siswa</a>
          <a href="#" onclick="router.navigate('absensi')" class="btn btn-success">Absensi</a>
          <a href="#" onclick="router.navigate('raport')" class="btn btn-warning">Raport</a>
          <a href="#" onclick="router.navigate('ijin')" class="btn btn-outline">Izin/Sakit</a>
        </div>
      </div>`;
  } else if (isSiswa) {
    content = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Selamat Datang, ${escapeHtml(user.nama)}</div>
          <span class="badge badge-info">Siswa</span>
        </div>
        <p>Lihat data diri, absensi, raport, dan izin kamu.</p>
      </div>
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
        <a href="#" onclick="router.navigate('absensi')" class="btn btn-success">Absensi Saya</a>
        <a href="#" onclick="router.navigate('raport')" class="btn btn-warning">Raport Saya</a>
        <a href="#" onclick="router.navigate('ijin')" class="btn btn-outline">Izin/Sakit Saya</a>
      </div>`;
  } else if (isOrtu) {
    content = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Selamat Datang, ${escapeHtml(user.nama)}</div>
          <span class="badge badge-info">Orang Tua</span>
        </div>
        <p>Pantau data anak, absensi, raport, dan izin.</p>
      </div>
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
        <a href="#" onclick="router.navigate('absensi')" class="btn btn-success">Absensi Anak</a>
        <a href="#" onclick="router.navigate('raport')" class="btn btn-warning">Raport Anak</a>
        <a href="#" onclick="router.navigate('ijin')" class="btn btn-outline">Izin/Sakit Anak</a>
      </div>`;
  }

  document.getElementById('page-content').innerHTML = statsHtml + content;
});
