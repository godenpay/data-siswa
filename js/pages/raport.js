let raportDT = null;
let raportData = [];
let raportSiswaList = [];

router.register('raport', async () => {
  const role = auth.getRole();
  const relatedId = auth.getRelatedId();

  const params = {};
  if (role === 'siswa') params.nis = relatedId;
  if (role === 'orang_tua') params.nis = relatedId;

  const [resNilai, resSiswa] = await Promise.all([
    nilaiService.getAll(params),
    siswaService.getAll(),
  ]);
  raportData = resNilai.data || [];
  raportSiswaList = resSiswa.data || [];

  const isAdmin = role === 'admin';

  const el = document.getElementById('page-content');
  el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Raport / Nilai Siswa</div>
        ${isAdmin ? '<button class="btn btn-primary" onclick="raportAdd()">+ Tambah Nilai</button>' : ''}
      </div>
      <div id="raportTableContainer"></div>
    </div>`;

  const container = document.getElementById('raportTableContainer');
  raportDT = new DataTable({
    id: 'dt_raport',
    container,
    data: raportData,
    pageSize: 25,
    exportable: true,
    filters: isAdmin ? [
      { key: 'mata_pelajaran', label: 'Mapel', type: 'text' },
      { key: 'semester', label: 'Semester', type: 'select', options: [
        { value: 'Ganjil', label: 'Ganjil' }, { value: 'Genap', label: 'Genap' },
      ]},
    ] : null,
    columns: [
      { key: 'nis', label: 'NIS', width: '100px' },
      { key: 'nama', label: 'Nama' },
      { key: 'mata_pelajaran', label: 'Mata Pelajaran' },
      { key: 'nilai_tugas', label: 'Tugas', width: '70px', render: (v) => v || '-' },
      { key: 'nilai_uts', label: 'UTS', width: '70px', render: (v) => v || '-' },
      { key: 'nilai_uas', label: 'UAS', width: '70px', render: (v) => v || '-' },
      { key: 'nilai_akhir', label: 'N. Akhir', width: '80px', render: (v) => `<strong>${v || '-'}</strong>` },
      { key: 'semester', label: 'Semester', width: '80px' },
      { key: 'tahun_ajaran', label: 'Tahun' },
    ],
    actions: isAdmin ? [
      { key: 'edit', label: 'Edit', cls: 'btn-warning', handler: (row) => raportEdit(row.id) },
      { key: 'del', label: 'Hapus', cls: 'btn-danger', handler: async (row) => {
        if (await Modal.confirm('Yakin hapus nilai ini?')) {
          const r = await nilaiService.remove(row.id);
          if (r.success) { showToast('Nilai dihapus', 'success'); raportReload(); }
          else showToast('Gagal: ' + (r.message || ''), 'error');
        }
      }},
    ] : null,
  });
});

async function raportReload() {
  const res = await nilaiService.getAll();
  raportData = res.data || [];
  if (raportDT) raportDT.setData(raportData);
}

function raportAdd() {
  raportForm('Tambah Nilai', {});
}

function raportEdit(id) {
  const data = raportData.find(r => r.id === id);
  if (data) raportForm('Edit Nilai', data);
}

function raportForm(title, data) {
  const isEdit = !!data.id;

  const mapelList = ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 'PKN', 'PAI', 'Penjaskes', 'Seni Budaya', 'Prakarya', 'Informatika'];

  const fields = [
    {
      key: 'nis', label: 'Siswa', type: 'select', required: true,
      options: raportSiswaList.map(s => ({ value: s.nis, label: s.nis + ' - ' + s.nama })),
      value: data.nis || '',
    },
    {
      key: 'mata_pelajaran', label: 'Mata Pelajaran', type: 'select', required: true,
      options: mapelList.map(m => ({ value: m, label: m })),
      value: data.mata_pelajaran || '',
    },
    { key: 'nilai_tugas', label: 'Nilai Tugas', type: 'number', value: data.nilai_tugas || '', placeholder: '0-100' },
    { key: 'nilai_uts', label: 'Nilai UTS', type: 'number', value: data.nilai_uts || '', placeholder: '0-100' },
    { key: 'nilai_uas', label: 'Nilai UAS', type: 'number', value: data.nilai_uas || '', placeholder: '0-100' },
    { key: 'nilai_akhir', label: 'Nilai Akhir (biarkan kosong untuk hitung otomatis)', type: 'number', value: data.nilai_akhir || '', placeholder: 'Otomatis dari Tugas*30% + UTS*30% + UAS*40%' },
    {
      key: 'semester', label: 'Semester', type: 'select', required: true,
      options: [{ value: 'Ganjil', label: 'Ganjil' }, { value: 'Genap', label: 'Genap' }],
      value: data.semester || 'Ganjil',
    },
    { key: 'tahun_ajaran', label: 'Tahun Ajaran', type: 'text', value: data.tahun_ajaran || getCurrentYear(), placeholder: 'Contoh: 2024/2025' },
  ];

  if (isEdit) fields[0].readonly = true;

  Modal.form(title, fields, async (formData) => {
    if (!formData.nilai_akhir) {
      const tugas = parseFloat(formData.nilai_tugas) || 0;
      const uts = parseFloat(formData.nilai_uts) || 0;
      const uas = parseFloat(formData.nilai_uas) || 0;
      formData.nilai_akhir = (tugas * 0.3 + uts * 0.3 + uas * 0.4).toFixed(2);
    }
    if (isEdit) formData.id = data.id;

    const r = isEdit ? await nilaiService.update(formData) : await nilaiService.create(formData);
    if (r.success) { showToast('Nilai ' + (isEdit ? 'diupdate' : 'ditambahkan'), 'success'); raportReload(); return true; }
    else { showToast('Gagal: ' + (r.message || ''), 'error'); return false; }
  });
}
