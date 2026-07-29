router.register('dashboard', async () => {
  const user = auth.getUser();
  const role = auth.getRole();
  const isAdmin = role === 'admin';
  const isSiswa = role === 'siswa';
  const isOrtu = role === 'orang_tua';

  let statsHtml = '';

  if (isAdmin) {
    const [resSiswa, resAbsensi, resIjin, resKelas] = await Promise.all([
      siswaService.getAll(),
      absensiService.getAll(),
      ijinService.getAll(),
      kelasService.getAll(),
    ]);

    const totalSiswa = (resSiswa.data || []).length;
    const absensi = resAbsensi.data || [];
    const today = getToday();
    const hadirHariIni = absensi.filter(a => a.tanggal === today && a.status === 'hadir').length;
    const izinPending = (resIjin.data || []).filter(i => i.status === 'pending').length;
    const totalKelas = (resKelas.data || []).length;

    statsHtml = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--primary-lighter);color:var(--primary)">&#9783;</div>
          <div class="stat-content">
            <div class="stat-value">${totalSiswa}</div>
            <div class="stat-label">Total Siswa</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--success-light);color:var(--success)">&#9745;</div>
          <div class="stat-content">
            <div class="stat-value">${hadirHariIni}</div>
            <div class="stat-label">Hadir Hari Ini</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--warning-light);color:var(--warning)">&#9888;</div>
          <div class="stat-content">
            <div class="stat-value">${izinPending}</div>
            <div class="stat-label">Izin Pending</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--info-light);color:var(--info)">&#128218;</div>
          <div class="stat-content">
            <div class="stat-value">${totalKelas}</div>
            <div class="stat-label">Total Kelas</div>
          </div>
        </div>
      </div>`;
  }

  let content = '';
  if (isAdmin) {
    content = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Selamat Datang, ${escapeHtml(user.nama)}</div>
          <span class="badge badge-primary">Administrator</span>
        </div>
        <p>Kelola seluruh data siswa, absensi, raport, dan izin melalui menu di sidebar atau quick actions di bawah.</p>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">Akses Cepat</div>
        </div>
        <div class="quick-actions">
          <a href="#" onclick="router.navigate('siswa')" class="btn btn-primary">&#9783; Kelola Siswa</a>
          <a href="#" onclick="router.navigate('absensi')" class="btn btn-success">&#9745; Absensi</a>
          <a href="#" onclick="router.navigate('raport')" class="btn btn-warning">&#128214; Raport</a>
          <a href="#" onclick="router.navigate('ijin')" class="btn btn-outline">&#9997; Izin/Sakit</a>
        </div>
      </div>`;
  } else if (isSiswa) {
    content = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Selamat Datang, ${escapeHtml(user.nama)}</div>
          <span class="badge badge-info">Siswa</span>
        </div>
        <p>Lihat data diri, absensi, raport, dan izin kamu melalui menu di sidebar.</p>
      </div>
      <div class="quick-actions">
        <a href="#" onclick="router.navigate('absensi')" class="btn btn-success">&#9745; Absensi Saya</a>
        <a href="#" onclick="router.navigate('raport')" class="btn btn-warning">&#128214; Raport Saya</a>
        <a href="#" onclick="router.navigate('ijin')" class="btn btn-outline">&#9997; Izin/Sakit Saya</a>
      </div>`;
  } else if (isOrtu) {
    content = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Selamat Datang, ${escapeHtml(user.nama)}</div>
          <span class="badge badge-success">Orang Tua</span>
        </div>
        <p>Pantau perkembangan anak melalui menu di sidebar.</p>
      </div>
      <div class="quick-actions">
        <a href="#" onclick="router.navigate('absensi')" class="btn btn-success">&#9745; Absensi Anak</a>
        <a href="#" onclick="router.navigate('raport')" class="btn btn-warning">&#128214; Raport Anak</a>
        <a href="#" onclick="router.navigate('ijin')" class="btn btn-outline">&#9997; Izin/Sakit Anak</a>
      </div>`;
  }

  document.getElementById('page-content').innerHTML = statsHtml + content;
});
