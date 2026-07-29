let siswaDT = null;

router.register('siswa', async () => {
  if (!auth.hasRole('admin')) { router.navigate('dashboard'); return; }

  const res = await siswaService.getAll();
  const data = res.data || [];

  const el = document.getElementById('page-content');
  el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Data Siswa</div>
        <button class="btn btn-primary" onclick="siswaAdd()">+ Tambah Siswa</button>
      </div>
      <div id="siswaTableContainer"></div>
    </div>`;

  const container = document.getElementById('siswaTableContainer');
  siswaDT = new DataTable({
    id: 'dt_siswa',
    container,
    data,
    pageSize: 25,
    selectable: true,
    exportable: true,
    columns: [
      { key: 'nis', label: 'NIS', width: '100px', sortable: true },
      { key: 'nama', label: 'Nama', sortable: true },
      { key: 'kelas', label: 'Kelas', width: '80px', sortable: true },
      { key: 'tempat_lahir', label: 'Tempat Lahir' },
      { key: 'tanggal_lahir', label: 'Tgl Lahir', render: (v) => formatDate(v) },
      { key: 'no_telp', label: 'No Telp' },
      { key: 'tahun_ajaran', label: 'Thn Ajaran' },
    ],
    actions: [
      { key: 'edit', label: 'Edit', cls: 'btn-warning', handler: (row) => siswaEdit(row.nis) },
      { key: 'del', label: 'Hapus', cls: 'btn-danger', handler: async (row) => {
        if (await Modal.confirm('Yakin hapus siswa <b>' + escapeHtml(row.nama) + '</b> (NIS: ' + row.nis + ')?')) {
          const r = await siswaService.remove(row.nis);
          if (r.success) { showToast('Siswa berhasil dihapus', 'success'); await siswaReload(); }
          else showToast('Gagal: ' + (r.message || ''), 'error');
        }
      }},
    ],
    bulkActions: [
      { key: 'export_selected', label: 'Export Terpilih', cls: 'btn-outline', handler: (rows) => {
        exportCSV(rows, [
          { key: 'nis', label: 'NIS' }, { key: 'nama', label: 'Nama' },
          { key: 'kelas', label: 'Kelas' }, { key: 'tempat_lahir', label: 'Tempat Lahir' },
          { key: 'tanggal_lahir', label: 'Tgl Lahir' }, { key: 'no_telp', label: 'No Telp' },
        ], 'siswa_terpilih');
      }},
    ],
    onRowClick: (row) => siswaEdit(row.nis),
  });
});

async function siswaReload() {
  const res = await siswaService.getAll();
  if (siswaDT) siswaDT.setData(res.data || []);
}

function siswaAdd() {
  siswaForm('Tambah Siswa', {});
}

function siswaEdit(nis) {
  const data = siswaDT ? siswaDT.filteredData.find(r => r.nis === nis) : null;
  if (data) siswaForm('Edit Siswa', data);
}

async function siswaForm(title, data) {
  const isEdit = !!data.nis;
  const fields = [
    { key: 'nis', label: 'NIS', type: 'text', value: data.nis || '', required: true, placeholder: 'Nomor Induk Siswa' },
    { key: 'nama', label: 'Nama Lengkap', type: 'text', value: data.nama || '', required: true, placeholder: 'Nama lengkap siswa' },
    { key: 'kelas', label: 'Kelas', type: 'text', value: data.kelas || '', required: true, placeholder: 'Contoh: 7A' },
    { key: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', value: data.tempat_lahir || '', placeholder: 'Kota kelahiran' },
    { key: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', value: formatDateShort(data.tanggal_lahir), placeholder: '' },
    { key: 'alamat', label: 'Alamat', type: 'textarea', value: data.alamat || '', placeholder: 'Alamat lengkap' },
    { key: 'nama_ayah', label: 'Nama Ayah', type: 'text', value: data.nama_ayah || '', placeholder: 'Nama ayah' },
    { key: 'nama_ibu', label: 'Nama Ibu', type: 'text', value: data.nama_ibu || '', placeholder: 'Nama ibu' },
    { key: 'no_telp', label: 'No Telepon', type: 'text', value: data.no_telp || '', placeholder: 'Nomor telepon' },
    { key: 'tahun_ajaran', label: 'Tahun Ajaran', type: 'text', value: data.tahun_ajaran || getCurrentYear(), placeholder: 'Contoh: 2024/2025' },
  ];

  if (isEdit) fields[0].readonly = true;

  Modal.form(title, fields, async (formData) => {
    const payload = { ...formData };
    if (isEdit) {
      const r = await siswaService.update(payload);
      if (r.success) { showToast('Siswa berhasil diupdate', 'success'); siswaReload(); return true; }
      else { showToast('Gagal: ' + (r.message || ''), 'error'); return false; }
    } else {
      const r = await siswaService.create(payload);
      if (r.success) { showToast('Siswa berhasil ditambahkan', 'success'); siswaReload(); return true; }
      else { showToast('Gagal: ' + (r.message || ''), 'error'); return false; }
    }
  });
}
