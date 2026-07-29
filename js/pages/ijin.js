let ijinDT = null;
let ijinData = [];
let ijinSiswaList = [];

router.register('ijin', async () => {
  const role = auth.getRole();
  const relatedId = auth.getRelatedId();

  const params = {};
  if (role === 'siswa') params.nis = relatedId;
  if (role === 'orang_tua') params.nis = relatedId;

  const [resIjin, resSiswa] = await Promise.all([
    ijinService.getAll(params),
    siswaService.getAll(),
  ]);
  ijinData = resIjin.data || [];
  ijinSiswaList = resSiswa.data || [];

  const isAdmin = role === 'admin';

  const el = document.getElementById('page-content');
  el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Izin / Sakit Siswa</div>
        <button class="btn btn-primary" onclick="ijinAdd()">+ Tambah Izin</button>
      </div>
      <div id="ijinTableContainer"></div>
    </div>`;

  const container = document.getElementById('ijinTableContainer');
  ijinDT = new DataTable({
    id: 'dt_ijin',
    container,
    data: ijinData,
    pageSize: 25,
    exportable: true,
    filters: isAdmin ? [
      { key: 'jenis', label: 'Jenis', type: 'select', options: [
        { value: 'sakit', label: 'Sakit' }, { value: 'izin', label: 'Izin' },
        { value: 'keperluan_lain', label: 'Keperluan Lain' },
      ]},
      { key: 'status', label: 'Status', type: 'select', options: [
        { value: 'pending', label: 'Pending' }, { value: 'disetujui', label: 'Disetujui' },
        { value: 'ditolak', label: 'Ditolak' },
      ]},
    ] : null,
    columns: [
      { key: 'nis', label: 'NIS', width: '100px' },
      { key: 'nama', label: 'Nama' },
      { key: 'tanggal', label: 'Tanggal', render: (v) => formatDate(v) },
      { key: 'jenis', label: 'Jenis', render: (v) => {
        const labels = { sakit: 'Sakit', izin: 'Izin', keperluan_lain: 'Keperluan Lain' };
        return `<span class="badge badge-info">${labels[v] || v}</span>`;
      }},
      { key: 'keterangan', label: 'Keterangan', render: (v) => v || '-' },
      { key: 'status', label: 'Status', render: (v) => {
        const cls = { pending: 'badge-warning', disetujui: 'badge-success', ditolak: 'badge-danger' }[v] || 'badge-secondary';
        return `<span class="badge ${cls}">${v ? v.charAt(0).toUpperCase() + v.slice(1) : 'Pending'}</span>`;
      }},
      { key: 'approved_by', label: 'Disetujui Oleh', render: (v) => v || '-' },
    ],
    actions: isAdmin ? [
      { key: 'approve', label: 'Setujui', cls: 'btn-success', show: (r) => r.status === 'pending', handler: async (row) => {
        const r = await ijinService.approve(row.id, auth.getNama());
        if (r.success) { showToast('Izin disetujui', 'success'); ijinReload(); }
        else showToast('Gagal', 'error');
      }},
      { key: 'reject', label: 'Tolak', cls: 'btn-danger', show: (r) => r.status === 'pending', handler: async (row) => {
        if (await Modal.confirm('Tolak izin ini?')) {
          const r = await ijinService.reject(row.id, auth.getNama());
          if (r.success) { showToast('Izin ditolak', 'warning'); ijinReload(); }
          else showToast('Gagal', 'error');
        }
      }},
      { key: 'edit', label: 'Edit', cls: 'btn-warning', handler: (row) => ijinEdit(row.id) },
      { key: 'del', label: 'Hapus', cls: 'btn-danger', handler: async (row) => {
        if (await Modal.confirm('Yakin hapus izin ini?')) {
          const r = await ijinService.remove(row.id);
          if (r.success) { showToast('Izin dihapus', 'success'); ijinReload(); }
          else showToast('Gagal: ' + (r.message || ''), 'error');
        }
      }},
    ] : null,
  });
});

async function ijinReload() {
  const res = await ijinService.getAll();
  ijinData = res.data || [];
  if (ijinDT) ijinDT.setData(ijinData);
}

function ijinAdd() {
  ijinForm('Tambah Izin', { tanggal: getToday(), status: 'pending' });
}

function ijinEdit(id) {
  const data = ijinData.find(r => r.id === id);
  if (data) ijinForm('Edit Izin', data);
}

function ijinForm(title, data) {
  const isEdit = !!data.id;
  const isAdmin = auth.getRole() === 'admin';

  let fields = [];

  if (isAdmin) {
    fields.push({
      key: 'nis', label: 'Siswa', type: 'select', required: true,
      options: ijinSiswaList.map(s => ({ value: s.nis, label: s.nis + ' - ' + s.nama })),
      value: data.nis || '',
    });
  }

  fields.push(
    { key: 'tanggal', label: 'Tanggal', type: 'date', value: data.tanggal || getToday(), required: true },
    {
      key: 'jenis', label: 'Jenis', type: 'select', required: true,
      options: [
        { value: 'sakit', label: 'Sakit' }, { value: 'izin', label: 'Izin' },
        { value: 'keperluan_lain', label: 'Keperluan Lain' },
      ],
      value: data.jenis || 'sakit',
    },
    { key: 'keterangan', label: 'Keterangan', type: 'textarea', value: data.keterangan || '', required: true, placeholder: 'Jelaskan alasan izin/sakit' },
  );

  Modal.form(title, fields, async (formData) => {
    if (!isAdmin) formData.nis = auth.getRelatedId();
    formData.status = data.status || 'pending';
    if (isEdit) formData.id = data.id;

    const r = isEdit ? await ijinService.update(formData) : await ijinService.create(formData);
    if (r.success) { showToast('Izin ' + (isEdit ? 'diupdate' : 'diajukan'), 'success'); ijinReload(); return true; }
    else { showToast('Gagal: ' + (r.message || ''), 'error'); return false; }
  });
}
