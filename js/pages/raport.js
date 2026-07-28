let nilaiData = [];
let siswaListRaport = [];

router.register('raport', async () => {
  const role = auth.getRole();
  const relatedId = auth.getRelatedId();

  let params = {};
  if (role === 'siswa') params.nis = relatedId;
  if (role === 'orang_tua') params.nis = relatedId;

  const [resNilai, resSiswa] = await Promise.all([
    api.getNilai(params),
    api.getSiswa(),
  ]);
  nilaiData = resNilai.data || [];
  siswaListRaport = resSiswa.data || [];

  renderRaportPage(role);
});

function renderRaportPage(role) {
  const el = document.getElementById('page-content');
  const isAdmin = role === 'admin';

  let rows = '';
  nilaiData.forEach(n => {
    const akhir = n.nilai_akhir || (parseFloat(n.nilai_tugas || 0) * 0.3 + parseFloat(n.nilai_uts || 0) * 0.3 + parseFloat(n.nilai_uas || 0) * 0.4).toFixed(2);
    rows += `<tr>
      <td>${escapeHtml(n.nis)}</td>
      <td>${escapeHtml(n.nama || '-')}</td>
      <td>${escapeHtml(n.mata_pelajaran)}</td>
      <td>${escapeHtml(n.nilai_tugas || '-')}</td>
      <td>${escapeHtml(n.nilai_uts || '-')}</td>
      <td>${escapeHtml(n.nilai_uas || '-')}</td>
      <td><strong>${akhir}</strong></td>
      <td>${escapeHtml(n.semester || '-')}</td>
      <td>${escapeHtml(n.tahun_ajaran || '-')}</td>
      ${isAdmin ? `<td><div class="action-btns">
        <button class="btn btn-sm btn-warning" onclick="editNilai('${escapeHtml(n.id)}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteNilai('${escapeHtml(n.id)}')">Hapus</button>
      </div></td>` : ''}
    </tr>`;
  });

  el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Raport / Nilai Siswa</div>
        ${isAdmin ? '<button class="btn btn-primary" onclick="showAddNilai()">+ Tambah Nilai</button>' : ''}
      </div>
      ${isAdmin ? `
      <div class="filter-bar">
        <input type="text" class="form-control" id="filterMapel" placeholder="Cari Mata Pelajaran..." oninput="filterNilai()">
        <input type="text" class="form-control" id="filterNis" placeholder="Cari NIS..." oninput="filterNilai()">
        <select class="form-control" id="filterSemester" onchange="filterNilai()">
          <option value="">Semua Semester</option>
          <option value="Ganjil">Ganjil</option>
          <option value="Genap">Genap</option>
        </select>
      </div>` : ''}
      <div class="table-container">
        <table>
          <thead><tr>
            <th>NIS</th><th>Nama</th><th>Mapel</th><th>Tugas</th><th>UTS</th><th>UAS</th><th>N. Akhir</th><th>Semester</th><th>Tahun</th>
            ${isAdmin ? '<th>Aksi</th>' : ''}
          </tr></thead>
          <tbody id="nilaiTableBody">${rows || '<tr><td colspan="10" style="text-align:center">Belum ada data</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
}

function filterNilai() {
  const mapel = document.getElementById('filterMapel')?.value.toLowerCase() || '';
  const nis = document.getElementById('filterNis')?.value.toLowerCase() || '';
  const semester = document.getElementById('filterSemester')?.value || '';
  const tbody = document.getElementById('nilaiTableBody');
  if (!tbody) return;

  const isAdmin = auth.getRole() === 'admin';
  const filtered = nilaiData.filter(n => {
    if (mapel && !n.mata_pelajaran.toLowerCase().includes(mapel)) return false;
    if (nis && !n.nis.toLowerCase().includes(nis)) return false;
    if (semester && n.semester !== semester) return false;
    return true;
  });

  tbody.innerHTML = filtered.map(n => {
    const akhir = n.nilai_akhir || (parseFloat(n.nilai_tugas || 0) * 0.3 + parseFloat(n.nilai_uts || 0) * 0.3 + parseFloat(n.nilai_uas || 0) * 0.4).toFixed(2);
    return `<tr>
      <td>${escapeHtml(n.nis)}</td>
      <td>${escapeHtml(n.nama || '-')}</td>
      <td>${escapeHtml(n.mata_pelajaran)}</td>
      <td>${escapeHtml(n.nilai_tugas || '-')}</td>
      <td>${escapeHtml(n.nilai_uts || '-')}</td>
      <td>${escapeHtml(n.nilai_uas || '-')}</td>
      <td><strong>${akhir}</strong></td>
      <td>${escapeHtml(n.semester || '-')}</td>
      <td>${escapeHtml(n.tahun_ajaran || '-')}</td>
      ${isAdmin ? `<td><div class="action-btns">
        <button class="btn btn-sm btn-warning" onclick="editNilai('${escapeHtml(n.id)}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteNilai('${escapeHtml(n.id)}')">Hapus</button>
      </div></td>` : ''}
    </tr>`;
  }).join('');
}

function showAddNilai() {
  showNilaiForm('Tambah Nilai', {});
}

function editNilai(id) {
  const n = nilaiData.find(x => x.id === id);
  if (n) showNilaiForm('Edit Nilai', n);
}

function showNilaiForm(title, data) {
  const isEdit = !!data.id;
  const siswaOpts = siswaListRaport.map(s =>
    `<option value="${escapeHtml(s.nis)}" ${s.nis === data.nis ? 'selected' : ''}>${escapeHtml(s.nis)} - ${escapeHtml(s.nama)}</option>`
  ).join('');

  const mapelList = ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 'PKN', 'PAI', 'Penjaskes', 'Seni Budaya', 'Prakarya'];

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">${title}</div>
      <form id="nilaiForm">
        <div class="form-group">
          <label>Siswa</label>
          <select class="form-control" id="f_nis" required>${siswaOpts}</select>
        </div>
        <div class="form-group">
          <label>Mata Pelajaran</label>
          <select class="form-control" id="f_mapel" required>
            <option value="">Pilih Mapel</option>
            ${mapelList.map(m => `<option value="${m}" ${data.mata_pelajaran === m ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Nilai Tugas</label>
            <input type="number" class="form-control" id="f_tugas" value="${data.nilai_tugas || ''}" min="0" max="100" step="0.01">
          </div>
          <div class="form-group">
            <label>Nilai UTS</label>
            <input type="number" class="form-control" id="f_uts" value="${data.nilai_uts || ''}" min="0" max="100" step="0.01">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Nilai UAS</label>
            <input type="number" class="form-control" id="f_uas" value="${data.nilai_uas || ''}" min="0" max="100" step="0.01">
          </div>
          <div class="form-group">
            <label>Nilai Akhir</label>
            <input type="number" class="form-control" id="f_akhir" value="${data.nilai_akhir || ''}" min="0" max="100" step="0.01">
            <small style="color:var(--text-light)">Kosongkan untuk hitung otomatis</small>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Semester</label>
            <select class="form-control" id="f_semester" required>
              <option value="Ganjil" ${data.semester === 'Ganjil' ? 'selected' : ''}>Ganjil</option>
              <option value="Genap" ${data.semester === 'Genap' ? 'selected' : ''}>Genap</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tahun Ajaran</label>
            <input type="text" class="form-control" id="f_tahun" value="${escapeHtml(data.tahun_ajaran || new Date().getFullYear() + '/' + (new Date().getFullYear()+1))}">
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById('nilaiForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const tugas = parseFloat(document.getElementById('f_tugas').value) || 0;
    const uts = parseFloat(document.getElementById('f_uts').value) || 0;
    const uas = parseFloat(document.getElementById('f_uas').value) || 0;
    let akhir = document.getElementById('f_akhir').value;
    if (!akhir) akhir = (tugas * 0.3 + uts * 0.3 + uas * 0.4).toFixed(2);

    const payload = {
      nis: document.getElementById('f_nis').value,
      mata_pelajaran: document.getElementById('f_mapel').value,
      nilai_tugas: tugas,
      nilai_uts: uts,
      nilai_uas: uas,
      nilai_akhir: parseFloat(akhir),
      semester: document.getElementById('f_semester').value,
      tahun_ajaran: document.getElementById('f_tahun').value.trim(),
    };
    if (isEdit) payload.id = data.id;

    const res = isEdit ? await api.updateNilai(payload) : await api.addNilai(payload);
    if (res.success) { overlay.remove(); router.navigate('raport'); }
    else alert('Gagal: ' + (res.message || 'Terjadi kesalahan'));
  });
}

async function deleteNilai(id) {
  if (!confirm('Yakin hapus nilai ini?')) return;
  const res = await api.deleteNilai(id);
  if (res.success) router.navigate('raport');
  else alert('Gagal: ' + (res.message || 'Terjadi kesalahan'));
}
