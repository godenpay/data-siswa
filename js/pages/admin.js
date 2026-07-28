let usersData = [];
let kelasData = [];

router.register('admin', async () => {
  if (!auth.hasRole('admin')) { router.navigate('dashboard'); return; }

  const [resUsers, resKelas] = await Promise.all([
    api.getUsers(),
    api.getKelas(),
  ]);
  usersData = resUsers.data || [];
  kelasData = resKelas.data || [];

  renderAdminPage();
});

function renderAdminPage() {
  const el = document.getElementById('page-content');

  const userRows = usersData.map(u => `<tr>
    <td>${escapeHtml(u.username)}</td>
    <td>${escapeHtml(u.nama)}</td>
    <td><span class="badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'siswa' ? 'badge-info' : 'badge-success'}">${escapeHtml(u.role.replace('_', ' '))}</span></td>
    <td>${escapeHtml(u.related_id || '-')}</td>
    <td>
      <div class="action-btns">
        <button class="btn btn-sm btn-warning" onclick="editUser('${escapeHtml(u.id)}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteUser('${escapeHtml(u.id)}')">Hapus</button>
      </div>
    </td>
  </tr>`).join('');

  const kelasRows = kelasData.map(k => `<tr>
    <td>${escapeHtml(k.nama_kelas)}</td>
    <td>Kelas ${escapeHtml(k.tingkat)}</td>
    <td>${escapeHtml(k.wali_kelas || '-')}</td>
    <td>
      <div class="action-btns">
        <button class="btn btn-sm btn-warning" onclick="editKelas('${escapeHtml(k.id)}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteKelas('${escapeHtml(k.id)}')">Hapus</button>
      </div>
    </td>
  </tr>`).join('');

  el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Manajemen Pengguna</div>
        <button class="btn btn-primary" onclick="showAddUser()">+ Tambah Pengguna</button>
      </div>
      <div class="table-container">
        <table>
          <thead><tr>
            <th>Username</th><th>Nama</th><th>Role</th><th>Related ID</th><th>Aksi</th>
          </tr></thead>
          <tbody>${userRows || '<tr><td colspan="5" style="text-align:center">Belum ada data</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Manajemen Kelas</div>
        <button class="btn btn-primary" onclick="showAddKelas()">+ Tambah Kelas</button>
      </div>
      <div class="table-container">
        <table>
          <thead><tr>
            <th>Nama Kelas</th><th>Tingkat</th><th>Wali Kelas</th><th>Aksi</th>
          </tr></thead>
          <tbody>${kelasRows || '<tr><td colspan="4" style="text-align:center">Belum ada data</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
}

/* User CRUD */
function showAddUser() {
  showUserForm('Tambah Pengguna', {});
}

function editUser(id) {
  const u = usersData.find(x => x.id === id);
  if (u) showUserForm('Edit Pengguna', u);
}

function showUserForm(title, data) {
  const isEdit = !!data.id;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">${title}</div>
      <form id="userForm">
        <div class="form-row">
          <div class="form-group">
            <label>Username</label>
            <input type="text" class="form-control" id="f_username" value="${escapeHtml(data.username || '')}" ${isEdit ? 'readonly' : ''} required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" class="form-control" id="f_password" placeholder="${isEdit ? 'Kosongkan jika tidak diubah' : 'Password'}" ${isEdit ? '' : 'required'}>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Nama Lengkap</label>
            <input type="text" class="form-control" id="f_nama" value="${escapeHtml(data.nama || '')}" required>
          </div>
          <div class="form-group">
            <label>Role</label>
            <select class="form-control" id="f_role" required>
              <option value="admin" ${data.role === 'admin' ? 'selected' : ''}>Admin</option>
              <option value="siswa" ${data.role === 'siswa' ? 'selected' : ''}>Siswa</option>
              <option value="orang_tua" ${data.role === 'orang_tua' ? 'selected' : ''}>Orang Tua</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Related ID (NIS untuk siswa / NIS anak untuk orang tua)</label>
          <input type="text" class="form-control" id="f_related" value="${escapeHtml(data.related_id || '')}">
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      username: document.getElementById('f_username').value.trim(),
      password: document.getElementById('f_password').value,
      nama: document.getElementById('f_nama').value.trim(),
      role: document.getElementById('f_role').value,
      related_id: document.getElementById('f_related').value.trim(),
    };
    if (isEdit) payload.id = data.id;
    if (isEdit && !payload.password) delete payload.password;

    const res = isEdit ? await api.updateUser(payload) : await api.addUser(payload);
    if (res.success) { overlay.remove(); router.navigate('admin'); }
    else alert('Gagal: ' + (res.message || 'Terjadi kesalahan'));
  });
}

async function deleteUser(id) {
  if (!confirm('Yakin hapus pengguna ini?')) return;
  const res = await api.deleteUser(id);
  if (res.success) router.navigate('admin');
  else alert('Gagal: ' + (res.message || 'Terjadi kesalahan'));
}

/* Kelas CRUD */
function showAddKelas() {
  showKelasForm('Tambah Kelas', {});
}

function editKelas(id) {
  const k = kelasData.find(x => x.id === id);
  if (k) showKelasForm('Edit Kelas', k);
}

function showKelasForm(title, data) {
  const isEdit = !!data.id;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">${title}</div>
      <form id="kelasForm">
        <div class="form-group">
          <label>Nama Kelas</label>
          <input type="text" class="form-control" id="f_nama_kelas" value="${escapeHtml(data.nama_kelas || '')}" placeholder="Contoh: 7A" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Tingkat</label>
            <select class="form-control" id="f_tingkat" required>
              <option value="7" ${data.tingkat === '7' ? 'selected' : ''}>Kelas 7</option>
              <option value="8" ${data.tingkat === '8' ? 'selected' : ''}>Kelas 8</option>
              <option value="9" ${data.tingkat === '9' ? 'selected' : ''}>Kelas 9</option>
            </select>
          </div>
          <div class="form-group">
            <label>Wali Kelas</label>
            <input type="text" class="form-control" id="f_wali" value="${escapeHtml(data.wali_kelas || '')}">
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById('kelasForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      nama_kelas: document.getElementById('f_nama_kelas').value.trim(),
      tingkat: document.getElementById('f_tingkat').value,
      wali_kelas: document.getElementById('f_wali').value.trim(),
    };
    if (isEdit) payload.id = data.id;

    const res = isEdit ? await api.updateKelas(payload) : await api.addKelas(payload);
    if (res.success) { overlay.remove(); router.navigate('admin'); }
    else alert('Gagal: ' + (res.message || 'Terjadi kesalahan'));
  });
}

async function deleteKelas(id) {
  if (!confirm('Yakin hapus kelas ini?')) return;
  const res = await api.deleteKelas(id);
  if (res.success) router.navigate('admin');
  else alert('Gagal: ' + (res.message || 'Terjadi kesalahan'));
}
