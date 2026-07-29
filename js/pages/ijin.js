let ijinData = [];
let siswaListIjin = [];

router.register('ijin', async () => {
  const role = auth.getRole();
  const relatedId = auth.getRelatedId();

  let params = {};
  if (role === 'siswa') params.nis = relatedId;
  if (role === 'orang_tua') params.nis = relatedId;

  const [resIjin, resSiswa] = await Promise.all([
    api.getIjin(params),
    api.getSiswa(),
  ]);
  ijinData = resIjin.data || [];
  siswaListIjin = resSiswa.data || [];

  renderIjinPage(role);
});

function renderIjinPage(role) {
  const el = document.getElementById('page-content');
  const isAdmin = role === 'admin';

  let rows = '';
  ijinData.forEach(i => {
    const badgeClass = {
      pending: 'badge-warning', disetujui: 'badge-success', ditolak: 'badge-danger',
    }[i.status] || 'badge-secondary';
    const jenisLabel = { sakit: 'Sakit', izin: 'Izin', keperluan_lain: 'Keperluan Lain' }[i.jenis] || i.jenis;

    rows += `<tr>
      <td>${escapeHtml(i.nis)}</td>
      <td>${escapeHtml(i.nama || '-')}</td>
      <td>${formatDate(i.tanggal)}</td>
      <td><span class="badge badge-info">${escapeHtml(jenisLabel)}</span></td>
      <td>${escapeHtml(i.keterangan || '-')}</td>
      <td><span class="badge ${badgeClass}">${escapeHtml(i.status ? i.status.charAt(0).toUpperCase() + i.status.slice(1) : 'Pending')}</span></td>
      ${isAdmin ? `<td><div class="action-btns">
        <button class="btn btn-sm btn-success" onclick="setujuiIjin('${escapeHtml(i.id)}')">Setujui</button>
        <button class="btn btn-sm btn-danger" onclick="tolakIjin('${escapeHtml(i.id)}')">Tolak</button>
        <button class="btn btn-sm btn-warning" onclick="editIjin('${escapeHtml(i.id)}')">Edit</button>
        <button class="btn btn-sm btn-outline" onclick="deleteIjin('${escapeHtml(i.id)}')">Hapus</button>
      </div></td>` : ''}
    </tr>`;
  });

  el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Izin / Sakit Siswa</div>
        <button class="btn btn-primary" onclick="showAddIjin()">+ Tambah Izin</button>
      </div>
      ${isAdmin ? `
      <div class="filter-bar">
        <select class="form-control" id="filterStatusIjin" onchange="filterIjin()">
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="disetujui">Disetujui</option>
          <option value="ditolak">Ditolak</option>
        </select>
        <select class="form-control" id="filterJenis" onchange="filterIjin()">
          <option value="">Semua Jenis</option>
          <option value="sakit">Sakit</option>
          <option value="izin">Izin</option>
          <option value="keperluan_lain">Keperluan Lain</option>
        </select>
      </div>` : ''}
      <div class="table-container">
        <table>
          <thead><tr>
            <th>NIS</th><th>Nama</th><th>Tanggal</th><th>Jenis</th><th>Keterangan</th><th>Status</th>
            ${isAdmin ? '<th>Aksi</th>' : ''}
          </tr></thead>
          <tbody id="ijinTableBody">${rows || '<tr><td colspan="7" style="text-align:center">Belum ada data</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
}

function filterIjin() {
  const status = document.getElementById('filterStatusIjin')?.value || '';
  const jenis = document.getElementById('filterJenis')?.value || '';
  const tbody = document.getElementById('ijinTableBody');
  if (!tbody) return;

  const isAdmin = auth.getRole() === 'admin';
  const filtered = ijinData.filter(i => {
    if (status && i.status !== status) return false;
    if (jenis && i.jenis !== jenis) return false;
    return true;
  });

  tbody.innerHTML = filtered.map(i => {
    const badgeClass = { pending: 'badge-warning', disetujui: 'badge-success', ditolak: 'badge-danger' }[i.status] || 'badge-secondary';
    const jenisLabel = { sakit: 'Sakit', izin: 'Izin', keperluan_lain: 'Keperluan Lain' }[i.jenis] || i.jenis;
    return `<tr>
      <td>${escapeHtml(i.nis)}</td>
      <td>${escapeHtml(i.nama || '-')}</td>
      <td>${formatDate(i.tanggal)}</td>
      <td><span class="badge badge-info">${escapeHtml(jenisLabel)}</span></td>
      <td>${escapeHtml(i.keterangan || '-')}</td>
      <td><span class="badge ${badgeClass}">${escapeHtml(i.status ? i.status.charAt(0).toUpperCase() + i.status.slice(1) : 'Pending')}</span></td>
      ${isAdmin ? `<td><div class="action-btns">
        <button class="btn btn-sm btn-success" onclick="setujuiIjin('${escapeHtml(i.id)}')">Setujui</button>
        <button class="btn btn-sm btn-danger" onclick="tolakIjin('${escapeHtml(i.id)}')">Tolak</button>
        <button class="btn btn-sm btn-warning" onclick="editIjin('${escapeHtml(i.id)}')">Edit</button>
        <button class="btn btn-sm btn-outline" onclick="deleteIjin('${escapeHtml(i.id)}')">Hapus</button>
      </div></td>` : ''}
    </tr>`;
  }).join('');
}

function showAddIjin() {
  showIjinForm('Tambah Izin / Sakit', { tanggal: new Date().toISOString().split('T')[0], status: 'pending' });
}

function editIjin(id) {
  const i = ijinData.find(x => x.id === id);
  if (i) showIjinForm('Edit Izin', i);
}

function showIjinForm(title, data) {
  const isEdit = !!data.id;
  const role = auth.getRole();
  const isAdmin = role === 'admin';

  let siswaOpts = '';
  if (isAdmin) {
    siswaOpts = siswaListIjin.map(s =>
      `<option value="${escapeHtml(s.nis)}" ${s.nis === data.nis ? 'selected' : ''}>${escapeHtml(s.nis)} - ${escapeHtml(s.nama)}</option>`
    ).join('');
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">${title}</div>
      <form id="ijinForm">
        ${isAdmin ? `<div class="form-group">
          <label>Siswa</label>
          <select class="form-control" id="f_nis" required>${siswaOpts}</select>
        </div>` : ''}
        <div class="form-row">
          <div class="form-group">
            <label>Tanggal</label>
            <input type="date" class="form-control" id="f_tanggal" value="${data.tanggal || ''}" required>
          </div>
          <div class="form-group">
            <label>Jenis</label>
            <select class="form-control" id="f_jenis" required>
              <option value="sakit" ${data.jenis === 'sakit' ? 'selected' : ''}>Sakit</option>
              <option value="izin" ${data.jenis === 'izin' ? 'selected' : ''}>Izin</option>
              <option value="keperluan_lain" ${data.jenis === 'keperluan_lain' ? 'selected' : ''}>Keperluan Lain</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Keterangan</label>
          <textarea class="form-control" id="f_keterangan" rows="3" required>${escapeHtml(data.keterangan || '')}</textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById('ijinForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      nis: isAdmin ? document.getElementById('f_nis').value : auth.getRelatedId(),
      tanggal: document.getElementById('f_tanggal').value,
      jenis: document.getElementById('f_jenis').value,
      keterangan: document.getElementById('f_keterangan').value.trim(),
      status: 'pending',
    };
    if (isEdit) payload.id = data.id;

    const res = isEdit ? await api.updateIjin(payload) : await api.addIjin(payload);
    if (res.success) { overlay.remove(); router.navigate('ijin'); }
    else showToast('Gagal: ' + (res.message || 'Terjadi kesalahan'), 'error');
  });
}

async function setujuiIjin(id) {
  if (!confirm('Setujui izin ini?')) return;
  const res = await api.updateIjin({ id, status: 'disetujui', approved_by: auth.getUser()?.nama || 'Admin' });
  if (res.success) router.navigate('ijin');
  else showToast('Gagal: ' + (res.message || 'Terjadi kesalahan'), 'error');
}

async function tolakIjin(id) {
  if (!confirm('Tolak izin ini?')) return;
  const res = await api.updateIjin({ id, status: 'ditolak', approved_by: auth.getUser()?.nama || 'Admin' });
  if (res.success) router.navigate('ijin');
  else showToast('Gagal: ' + (res.message || 'Terjadi kesalahan'), 'error');
}

async function deleteIjin(id) {
  if (!confirm('Yakin hapus izin ini?')) return;
  const res = await api.deleteIjin(id);
  if (res.success) router.navigate('ijin');
  else showToast('Gagal: ' + (res.message || 'Terjadi kesalahan'), 'error');
}
