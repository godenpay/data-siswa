let usersDT = null;
let kelasDT = null;
let adminUsersData = [];
let adminKelasData = [];

router.register('admin', async () => {
  if (!auth.hasRole('admin')) { router.navigate('dashboard'); return; }

  const [resUsers, resKelas] = await Promise.all([
    userService.getAll(),
    kelasService.getAll(),
  ]);
  adminUsersData = resUsers.data || [];
  adminKelasData = resKelas.data || [];

  const el = document.getElementById('page-content');
  el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Manajemen Pengguna</div>
        <button class="btn btn-primary" onclick="adminAddUser()">+ Tambah Pengguna</button>
      </div>
      <div id="usersTableContainer"></div>
    </div>
    <div class="card">
      <div class="card-header">
        <div class="card-title">Manajemen Kelas</div>
        <button class="btn btn-primary" onclick="adminAddKelas()">+ Tambah Kelas</button>
      </div>
      <div id="kelasTableContainer"></div>
    </div>`;

  // Users table
  const usersContainer = document.getElementById('usersTableContainer');
  usersDT = new DataTable({
    id: 'dt_users',
    container: usersContainer,
    data: adminUsersData,
    pageSize: 25,
    exportable: false,
    columns: [
      { key: 'username', label: 'Username' },
      { key: 'nama', label: 'Nama' },
      { key: 'role', label: 'Role', render: (v) => {
        const cls = { admin: 'badge-danger', siswa: 'badge-info', orang_tua: 'badge-success' }[v] || 'badge-secondary';
        return `<span class="badge ${cls}">${v ? v.replace('_', ' ') : '-'}</span>`;
      }},
      { key: 'related_id', label: 'Related ID', render: (v) => v || '-' },
    ],
    actions: [
      { key: 'edit', label: 'Edit', cls: 'btn-warning', handler: (row) => adminEditUser(row.id) },
      { key: 'del', label: 'Hapus', cls: 'btn-danger', handler: async (row) => {
        if (await Modal.confirm('Yakin hapus pengguna <b>' + escapeHtml(row.nama) + '</b>?')) {
          const r = await userService.remove(row.id);
          if (r.success) { showToast('Pengguna dihapus', 'success'); adminReloadUsers(); }
          else showToast('Gagal: ' + (r.message || ''), 'error');
        }
      }},
    ],
  });

  // Kelas table
  const kelasContainer = document.getElementById('kelasTableContainer');
  kelasDT = new DataTable({
    id: 'dt_kelas',
    container: kelasContainer,
    data: adminKelasData,
    pageSize: 25,
    exportable: false,
    columns: [
      { key: 'nama_kelas', label: 'Nama Kelas' },
      { key: 'tingkat', label: 'Tingkat', render: (v) => 'Kelas ' + v },
      { key: 'wali_kelas', label: 'Wali Kelas', render: (v) => v || '-' },
    ],
    actions: [
      { key: 'edit', label: 'Edit', cls: 'btn-warning', handler: (row) => adminEditKelas(row.id) },
      { key: 'del', label: 'Hapus', cls: 'btn-danger', handler: async (row) => {
        if (await Modal.confirm('Yakin hapus kelas <b>' + escapeHtml(row.nama_kelas) + '</b>?')) {
          const r = await kelasService.remove(row.id);
          if (r.success) { showToast('Kelas dihapus', 'success'); adminReloadKelas(); }
          else showToast('Gagal: ' + (r.message || ''), 'error');
        }
      }},
    ],
  });
});

async function adminReloadUsers() {
  const res = await userService.getAll();
  adminUsersData = res.data || [];
  if (usersDT) usersDT.setData(adminUsersData);
}

async function adminReloadKelas() {
  const res = await kelasService.getAll();
  adminKelasData = res.data || [];
  if (kelasDT) kelasDT.setData(adminKelasData);
}

/* User CRUD */
function adminAddUser() {
  adminUserForm('Tambah Pengguna', {});
}

function adminEditUser(id) {
  const data = adminUsersData.find(r => r.id === id);
  if (data) adminUserForm('Edit Pengguna', data);
}

function adminUserForm(title, data) {
  const isEdit = !!data.id;

  const fields = [
    { key: 'username', label: 'Username', type: 'text', value: data.username || '', required: true, placeholder: 'Username login' },
    { key: 'password', label: 'Password', type: 'password', value: '', required: !isEdit, placeholder: isEdit ? 'Kosongkan jika tidak diubah' : 'Password' },
    { key: 'nama', label: 'Nama Lengkap', type: 'text', value: data.nama || '', required: true, placeholder: 'Nama pengguna' },
    {
      key: 'role', label: 'Role', type: 'select', required: true,
      options: [
        { value: 'admin', label: 'Admin' }, { value: 'siswa', label: 'Siswa' },
        { value: 'orang_tua', label: 'Orang Tua' },
      ],
      value: data.role || 'siswa',
    },
    { key: 'related_id', label: 'Related ID (NIS siswa / NIS anak untuk ortu)', type: 'text', value: data.related_id || '', placeholder: 'NIS' },
  ];

  if (isEdit) fields[0].readonly = true;

  Modal.form(title, fields, async (formData) => {
    if (isEdit && !formData.password) delete formData.password;
    if (isEdit) formData.id = data.id;

    const r = isEdit ? await userService.update(formData) : await userService.create(formData);
    if (r.success) { showToast('Pengguna ' + (isEdit ? 'diupdate' : 'ditambahkan'), 'success'); adminReloadUsers(); return true; }
    else { showToast('Gagal: ' + (r.message || ''), 'error'); return false; }
  });
}

/* Kelas CRUD */
function adminAddKelas() {
  adminKelasForm('Tambah Kelas', {});
}

function adminEditKelas(id) {
  const data = adminKelasData.find(r => r.id === id);
  if (data) adminKelasForm('Edit Kelas', data);
}

function adminKelasForm(title, data) {
  const isEdit = !!data.id;

  const fields = [
    { key: 'nama_kelas', label: 'Nama Kelas', type: 'text', value: data.nama_kelas || '', required: true, placeholder: 'Contoh: 7A' },
    {
      key: 'tingkat', label: 'Tingkat', type: 'select', required: true,
      options: [
        { value: '7', label: 'Kelas 7' }, { value: '8', label: 'Kelas 8' },
        { value: '9', label: 'Kelas 9' },
      ],
      value: data.tingkat || '7',
    },
    { key: 'wali_kelas', label: 'Wali Kelas', type: 'text', value: data.wali_kelas || '', placeholder: 'Nama wali kelas' },
  ];

  Modal.form(title, fields, async (formData) => {
    if (isEdit) formData.id = data.id;
    const r = isEdit ? await kelasService.update(formData) : await kelasService.create(formData);
    if (r.success) { showToast('Kelas ' + (isEdit ? 'diupdate' : 'ditambahkan'), 'success'); adminReloadKelas(); return true; }
    else { showToast('Gagal: ' + (r.message || ''), 'error'); return false; }
  });
}
