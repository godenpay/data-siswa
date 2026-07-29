let absensiDT = null;
let absensiData = [];
let absensiSiswaList = [];

router.register('absensi', async () => {
  const role = auth.getRole();
  const relatedId = auth.getRelatedId();

  const params = {};
  if (role === 'siswa') params.nis = relatedId;
  if (role === 'orang_tua') params.nis = relatedId;

  const [resAbsensi, resSiswa] = await Promise.all([
    absensiService.getAll(params),
    siswaService.getAll(),
  ]);
  absensiData = resAbsensi.data || [];
  absensiSiswaList = resSiswa.data || [];

  const isAdmin = role === 'admin';

  const el = document.getElementById('page-content');
  el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Absensi Siswa</div>
        <div class="btn-group">
          ${isAdmin ? '<button class="btn btn-primary" onclick="absensiAdd()">+ Tambah</button><button class="btn btn-success" onclick="absensiBulk()">&#9745; Absensi Massal</button>' : '<button class="btn btn-primary" onclick="absensiAdd()">+ Ajukan Absensi</button>'}
        </div>
      </div>
      <div id="absensiTableContainer"></div>
    </div>`;

  const container = document.getElementById('absensiTableContainer');
  absensiDT = new DataTable({
    id: 'dt_absensi',
    container,
    data: absensiData,
    pageSize: 25,
    exportable: true,
    filters: isAdmin ? [
      { key: 'tanggal', label: 'Tanggal', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: [
        { value: 'hadir', label: 'Hadir' }, { value: 'sakit', label: 'Sakit' },
        { value: 'izin', label: 'Izin' }, { value: 'alpha', label: 'Alpha' },
      ]},
    ] : null,
    columns: [
      { key: 'nis', label: 'NIS', width: '100px' },
      { key: 'nama', label: 'Nama' },
      { key: 'tanggal', label: 'Tanggal', render: (v) => formatDate(v) },
      { key: 'status', label: 'Status', render: (v) => {
        const cls = { hadir: 'badge-success', sakit: 'badge-warning', izin: 'badge-info', alpha: 'badge-danger' }[v] || 'badge-secondary';
        const label = v ? v.charAt(0).toUpperCase() + v.slice(1) : '-';
        return `<span class="badge ${cls}">${label}</span>`;
      }},
      { key: 'keterangan', label: 'Keterangan', render: (v) => v || '-' },
    ],
    actions: isAdmin ? [
      { key: 'edit', label: 'Edit', cls: 'btn-warning', handler: (row) => absensiEdit(row.id) },
      { key: 'del', label: 'Hapus', cls: 'btn-danger', handler: async (row) => {
        if (await Modal.confirm('Yakin hapus absensi ini?')) {
          const r = await absensiService.remove(row.id);
          if (r.success) { showToast('Absensi dihapus', 'success'); absensiReload(); }
          else showToast('Gagal: ' + (r.message || ''), 'error');
        }
      }},
    ] : null,
  });
});

async function absensiReload() {
  const res = await absensiService.getAll();
  absensiData = res.data || [];
  if (absensiDT) absensiDT.setData(absensiData);
}

function absensiAdd() {
  absensiForm('Tambah Absensi', { tanggal: getToday(), status: 'hadir' });
}

function absensiEdit(id) {
  const data = absensiData.find(r => r.id === id);
  if (data) absensiForm('Edit Absensi', data);
}

async function absensiForm(title, data) {
  const isEdit = !!data.id;
  const isAdmin = auth.getRole() === 'admin';

  let fields = [];

  if (isAdmin) {
    fields.push({
      key: 'nis', label: 'Siswa', type: 'select', required: true,
      options: absensiSiswaList.map(s => ({ value: s.nis, label: s.nis + ' - ' + s.nama })),
      value: data.nis || '',
    });
  }

  fields.push(
    { key: 'tanggal', label: 'Tanggal', type: 'date', value: data.tanggal || getToday(), required: true },
    {
      key: 'status', label: 'Status', type: 'select', required: true,
      options: [
        { value: 'hadir', label: 'Hadir' }, { value: 'sakit', label: 'Sakit' },
        { value: 'izin', label: 'Izin' }, { value: 'alpha', label: 'Alpha' },
      ],
      value: data.status || 'hadir',
    },
    { key: 'keterangan', label: 'Keterangan', type: 'textarea', value: data.keterangan || '', placeholder: 'Keterangan (opsional)' },
  );

  Modal.form(title, fields, async (formData) => {
    if (!isAdmin) formData.nis = auth.getRelatedId();
    if (isEdit) formData.id = data.id;

    const r = isEdit ? await absensiService.update(formData) : await absensiService.create(formData);
    if (r.success) { showToast('Absensi ' + (isEdit ? 'diupdate' : 'ditambahkan'), 'success'); absensiReload(); return true; }
    else { showToast('Gagal: ' + (r.message || ''), 'error'); return false; }
  });
}

async function absensiBulk() {
  if (absensiSiswaList.length === 0) {
    showToast('Tidak ada data siswa', 'warning');
    return;
  }

  const fields = [
    {
      key: 'tanggal', label: 'Tanggal', type: 'date', value: getToday(), required: true,
    },
    {
      key: 'status', label: 'Status Default', type: 'select', required: true,
      options: [
        { value: 'hadir', label: 'Hadir' }, { value: 'sakit', label: 'Sakit' },
        { value: 'izin', label: 'Izin' }, { value: 'alpha', label: 'Alpha' },
      ],
      value: 'hadir',
    },
  ];

  Modal.form('Absensi Massal', fields, async (formData) => {
    const entries = absensiSiswaList.map(s => ({
      nis: s.nis,
      tanggal: formData.tanggal,
      status: formData.status,
      keterangan: 'Absensi massal',
    }));

    const r = await absensiService.bulkCreate(entries);
    if (r.success) {
      showToast('Absensi massal selesai: ' + r.data.ok + ' berhasil' + (r.data.fail > 0 ? ', ' + r.data.fail + ' gagal' : ''), r.data.fail > 0 ? 'warning' : 'success');
      absensiReload();
      return true;
    } else {
      showToast('Gagal: ' + (r.message || ''), 'error');
      return false;
    }
  });
}
