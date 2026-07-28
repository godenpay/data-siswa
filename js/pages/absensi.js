let absensiData = [];
let siswaList = [];

router.register('absensi', async () => {
  const role = auth.getRole();
  const relatedId = auth.getRelatedId();

  let params = {};
  if (role === 'siswa') params.nis = relatedId;
  if (role === 'orang_tua') params.nis = relatedId;

  const [resAbsensi, resSiswa] = await Promise.all([
    api.getAbsensi(params),
    api.getSiswa(),
  ]);
  absensiData = resAbsensi.data || [];
  siswaList = resSiswa.data || [];

  renderAbsensiPage(role);
});

function renderAbsensiPage(role) {
  const el = document.getElementById('page-content');
  const isAdmin = role === 'admin';

  let rows = '';
  absensiData.forEach(a => {
    const badgeClass = { hadir: 'badge-success', sakit: 'badge-warning', izin: 'badge-info', alpha: 'badge-danger' }[a.status] || 'badge-secondary';
    rows += `<tr>
      <td>${escapeHtml(a.nis)}</td>
      <td>${escapeHtml(a.nama || '-')}</td>
      <td>${formatDate(a.tanggal)}</td>
      <td><span class="badge ${badgeClass}">${escapeHtml(a.status.charAt(0).toUpperCase() + a.status.slice(1))}</span></td>
      <td>${escapeHtml(a.keterangan || '-')}</td>
      ${isAdmin ? `<td><div class="action-btns">
        <button class="btn btn-sm btn-warning" onclick="editAbsensi('${escapeHtml(a.id)}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteAbsensi('${escapeHtml(a.id)}')">Hapus</button>
      </div></td>` : ''}
    </tr>`;
  });

  el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Absensi Siswa</div>
        ${isAdmin ? '<button class="btn btn-primary" onclick="showAddAbsensi()">+ Tambah Absensi</button>' : ''}
      </div>
      ${isAdmin ? `
      <div class="filter-bar">
        <input type="date" class="form-control" id="filterTanggal" onchange="filterAbsensi()">
        <select class="form-control" id="filterStatus" onchange="filterAbsensi()">
          <option value="">Semua Status</option>
          <option value="hadir">Hadir</option>
          <option value="sakit">Sakit</option>
          <option value="izin">Izin</option>
          <option value="alpha">Alpha</option>
        </select>
        <input type="text" class="form-control" id="filterSiswa" placeholder="Cari NIS/Nama..." oninput="filterAbsensi()">
      </div>` : ''}
      <div class="table-container">
        <table>
          <thead><tr>
            <th>NIS</th><th>Nama</th><th>Tanggal</th><th>Status</th><th>Keterangan</th>
            ${isAdmin ? '<th>Aksi</th>' : ''}
          </tr></thead>
          <tbody id="absensiTableBody">${rows || '<tr><td colspan="6" style="text-align:center">Belum ada data</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
}

function filterAbsensi() {
  const tanggal = document.getElementById('filterTanggal')?.value || '';
  const status = document.getElementById('filterStatus')?.value || '';
  const q = document.getElementById('filterSiswa')?.value.toLowerCase() || '';
  const tbody = document.getElementById('absensiTableBody');
  if (!tbody) return;

  const filtered = absensiData.filter(a => {
    if (tanggal && a.tanggal !== tanggal) return false;
    if (status && a.status !== status) return false;
    if (q && !a.nis.toLowerCase().includes(q) && !(a.nama || '').toLowerCase().includes(q)) return false;
    return true;
  });

  const isAdmin = auth.getRole() === 'admin';
  tbody.innerHTML = filtered.map(a => {
    const badgeClass = { hadir: 'badge-success', sakit: 'badge-warning', izin: 'badge-info', alpha: 'badge-danger' }[a.status] || 'badge-secondary';
    return `<tr>
      <td>${escapeHtml(a.nis)}</td>
      <td>${escapeHtml(a.nama || '-')}</td>
      <td>${formatDate(a.tanggal)}</td>
      <td><span class="badge ${badgeClass}">${escapeHtml(a.status.charAt(0).toUpperCase() + a.status.slice(1))}</span></td>
      <td>${escapeHtml(a.keterangan || '-')}</td>
      ${isAdmin ? `<td><div class="action-btns">
        <button class="btn btn-sm btn-warning" onclick="editAbsensi('${escapeHtml(a.id)}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteAbsensi('${escapeHtml(a.id)}')">Hapus</button>
      </div></td>` : ''}
    </tr>`;
  }).join('');
}

function showAddAbsensi() {
  showAbsensiForm('Tambah Absensi', { tanggal: new Date().toISOString().split('T')[0], status: 'hadir' });
}

function editAbsensi(id) {
  const a = absensiData.find(x => x.id === id);
  if (a) showAbsensiForm('Edit Absensi', a);
}

function showAbsensiForm(title, data) {
  const isEdit = !!data.id;
  const siswaOpts = siswaList.map(s => `<option value="${escapeHtml(s.nis)}" ${s.nis === data.nis ? 'selected' : ''}>${escapeHtml(s.nis)} - ${escapeHtml(s.nama)}</option>`).join('');

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">${title}</div>
      <form id="absensiForm">
        <div class="form-group">
          <label>Siswa</label>
          <select class="form-control" id="f_nis" required>${siswaOpts}</select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Tanggal</label>
            <input type="date" class="form-control" id="f_tanggal" value="${data.tanggal || ''}" required>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select class="form-control" id="f_status" required>
              <option value="hadir" ${data.status === 'hadir' ? 'selected' : ''}>Hadir</option>
              <option value="sakit" ${data.status === 'sakit' ? 'selected' : ''}>Sakit</option>
              <option value="izin" ${data.status === 'izin' ? 'selected' : ''}>Izin</option>
              <option value="alpha" ${data.status === 'alpha' ? 'selected' : ''}>Alpha</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Keterangan</label>
          <textarea class="form-control" id="f_keterangan" rows="2">${escapeHtml(data.keterangan || '')}</textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById('absensiForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      nis: document.getElementById('f_nis').value,
      tanggal: document.getElementById('f_tanggal').value,
      status: document.getElementById('f_status').value,
      keterangan: document.getElementById('f_keterangan').value.trim(),
    };
    if (isEdit) payload.id = data.id;

    const res = isEdit ? await api.updateAbsensi(payload) : await api.addAbsensi(payload);
    if (res.success) { overlay.remove(); router.navigate('absensi'); }
    else alert('Gagal: ' + (res.message || 'Terjadi kesalahan'));
  });
}

async function deleteAbsensi(id) {
  if (!confirm('Yakin hapus data absensi ini?')) return;
  const res = await api.deleteAbsensi(id);
  if (res.success) router.navigate('absensi');
  else alert('Gagal: ' + (res.message || 'Terjadi kesalahan'));
}
