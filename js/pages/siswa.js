let siswaData = [];

router.register('siswa', async () => {
  if (!auth.hasRole('admin')) { router.navigate('dashboard'); return; }

  const res = await api.getSiswa();
  siswaData = res.data || [];

  renderSiswaPage();
});

function renderSiswaPage() {
  const el = document.getElementById('page-content');
  let rows = '';
  siswaData.forEach(s => {
    rows += `<tr>
      <td>${escapeHtml(s.nis)}</td>
      <td>${escapeHtml(s.nama)}</td>
      <td>${escapeHtml(s.kelas)}</td>
      <td>${escapeHtml(s.tempat_lahir)}</td>
      <td>${formatDate(s.tanggal_lahir)}</td>
      <td>${escapeHtml(s.no_telp || '-')}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-warning" onclick="editSiswa('${escapeHtml(s.nis)}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteSiswa('${escapeHtml(s.nis)}')">Hapus</button>
        </div>
      </td>
    </tr>`;
  });

  el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Data Siswa</div>
        <button class="btn btn-primary" onclick="showAddSiswa()">+ Tambah Siswa</button>
      </div>
      <div class="search-box">
        <input type="text" class="form-control" id="siswaSearch" placeholder="Cari NIS atau Nama..." oninput="filterSiswa()">
      </div>
      <div class="table-container">
        <table>
          <thead><tr>
            <th>NIS</th><th>Nama</th><th>Kelas</th><th>Tempat Lahir</th><th>Tgl Lahir</th><th>No Telp</th><th>Aksi</th>
          </tr></thead>
          <tbody id="siswaTableBody">${rows || '<tr><td colspan="7" style="text-align:center">Belum ada data</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
}

function filterSiswa() {
  const q = document.getElementById('siswaSearch').value.toLowerCase();
  const filtered = siswaData.filter(s =>
    s.nis.toLowerCase().includes(q) || s.nama.toLowerCase().includes(q)
  );
  const tbody = document.getElementById('siswaTableBody');
  if (!tbody) return;
  tbody.innerHTML = filtered.map(s => `<tr>
    <td>${escapeHtml(s.nis)}</td>
    <td>${escapeHtml(s.nama)}</td>
    <td>${escapeHtml(s.kelas)}</td>
    <td>${escapeHtml(s.tempat_lahir)}</td>
    <td>${formatDate(s.tanggal_lahir)}</td>
    <td>${escapeHtml(s.no_telp || '-')}</td>
    <td>
      <div class="action-btns">
        <button class="btn btn-sm btn-warning" onclick="editSiswa('${escapeHtml(s.nis)}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteSiswa('${escapeHtml(s.nis)}')">Hapus</button>
      </div>
    </td>
  </tr>`).join('');
}

function showAddSiswa() {
  showSiswaForm('Tambah Siswa', {});
}

function editSiswa(nis) {
  const s = siswaData.find(x => x.nis === nis);
  if (s) showSiswaForm('Edit Siswa', s);
}

function showSiswaForm(title, data) {
  const isEdit = !!data.nis;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">${title}</div>
      <form id="siswaForm">
        <div class="form-row">
          <div class="form-group">
            <label>NIS</label>
            <input type="text" class="form-control" id="f_nis" value="${escapeHtml(data.nis || '')}" ${isEdit ? 'readonly' : ''} required>
          </div>
          <div class="form-group">
            <label>Nama Lengkap</label>
            <input type="text" class="form-control" id="f_nama" value="${escapeHtml(data.nama || '')}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Kelas</label>
            <input type="text" class="form-control" id="f_kelas" value="${escapeHtml(data.kelas || '')}" placeholder="Contoh: 7A" required>
          </div>
          <div class="form-group">
            <label>Tahun Ajaran</label>
            <input type="text" class="form-control" id="f_tahun" value="${escapeHtml(data.tahun_ajaran || new Date().getFullYear() + '/' + (new Date().getFullYear()+1))}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Tempat Lahir</label>
            <input type="text" class="form-control" id="f_tempat" value="${escapeHtml(data.tempat_lahir || '')}">
          </div>
          <div class="form-group">
            <label>Tanggal Lahir</label>
            <input type="date" class="form-control" id="f_tgl_lahir" value="${formatDateShort(data.tanggal_lahir) || ''}">
          </div>
        </div>
        <div class="form-group">
          <label>Alamat</label>
          <textarea class="form-control" id="f_alamat" rows="2">${escapeHtml(data.alamat || '')}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Nama Ayah</label>
            <input type="text" class="form-control" id="f_ayah" value="${escapeHtml(data.nama_ayah || '')}">
          </div>
          <div class="form-group">
            <label>Nama Ibu</label>
            <input type="text" class="form-control" id="f_ibu" value="${escapeHtml(data.nama_ibu || '')}">
          </div>
        </div>
        <div class="form-group">
          <label>No Telepon</label>
          <input type="text" class="form-control" id="f_notelp" value="${escapeHtml(data.no_telp || '')}">
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById('siswaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      nis: document.getElementById('f_nis').value.trim(),
      nama: document.getElementById('f_nama').value.trim(),
      kelas: document.getElementById('f_kelas').value.trim(),
      tempat_lahir: document.getElementById('f_tempat').value.trim(),
      tanggal_lahir: document.getElementById('f_tgl_lahir').value,
      alamat: document.getElementById('f_alamat').value.trim(),
      nama_ayah: document.getElementById('f_ayah').value.trim(),
      nama_ibu: document.getElementById('f_ibu').value.trim(),
      no_telp: document.getElementById('f_notelp').value.trim(),
      tahun_ajaran: document.getElementById('f_tahun').value.trim(),
    };

    const res = isEdit ? await api.updateSiswa(payload) : await api.addSiswa(payload);
    if (res.success) {
      overlay.remove();
      router.navigate('siswa');
    } else {
      alert('Gagal: ' + (res.message || 'Terjadi kesalahan'));
    }
  });
}

async function deleteSiswa(nis) {
  if (!confirm('Yakin hapus siswa dengan NIS ' + nis + '?')) return;
  const res = await api.deleteSiswa(nis);
  if (res.success) router.navigate('siswa');
  else alert('Gagal: ' + (res.message || 'Terjadi kesalahan'));
}
