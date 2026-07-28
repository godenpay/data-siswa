/**
 * Data Siswa - Google Apps Script Backend
 * Deploy sebagai Web App untuk melayani API frontend
 */

// ========== KONFIGURASI ==========
var CONFIG = {
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID', // Ganti dengan ID spreadsheet kamu
  SHEETS: {
    USERS: 'Users',
    SISWA: 'Siswa',
    KELAS: 'Kelas',
    ABSENSI: 'Absensi',
    NILAI: 'Nilai',
    IJIN: 'Ijin',
  },
};

// ========== HELPER ==========
function getSheet(name) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange('1:1').setFontWeight('bold');
  }
  return sheet;
}

function getData(sheetName) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    result.push(row);
  }
  return result;
}

function addRow(sheetName, data) {
  var sheet = getSheet(sheetName);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = [];
  headers.forEach(function(h) { row.push(data[h] || ''); });
  sheet.appendRow(row);
  return { success: true, message: 'Data berhasil ditambahkan' };
}

function updateRow(sheetName, id, data) {
  var sheet = getSheet(sheetName);
  var range = sheet.getDataRange();
  var values = range.getValues();
  if (values.length < 2) return { success: false, message: 'Data tidak ditemukan' };

  var headers = values[0];
  var idCol = headers.indexOf('id');
  if (idCol === -1) return { success: false, message: 'Kolom ID tidak ditemukan' };

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(id)) {
      var rowData = values[i];
      for (var j = 0; j < headers.length; j++) {
        if (data.hasOwnProperty(headers[j])) {
          rowData[j] = data[headers[j]];
        }
      }
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([rowData]);
      return { success: true, message: 'Data berhasil diupdate' };
    }
  }
  return { success: false, message: 'Data tidak ditemukan' };
}

function deleteRow(sheetName, id) {
  var sheet = getSheet(sheetName);
  var range = sheet.getDataRange();
  var values = range.getValues();
  if (values.length < 2) return { success: false, message: 'Data tidak ditemukan' };

  var headers = values[0];
  var idCol = headers.indexOf('id');
  if (idCol === -1) return { success: false, message: 'Kolom ID tidak ditemukan' };

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Data berhasil dihapus' };
    }
  }
  return { success: false, message: 'Data tidak ditemukan' };
}

function getNextId(sheetName) {
  var data = getData(sheetName);
  var maxId = 0;
  data.forEach(function(row) {
    var id = parseInt(row.id) || 0;
    if (id > maxId) maxId = id;
  });
  return maxId + 1;
}

// ========== AUTHENTIKASI ==========
function handleLogin(payload) {
  var users = getData(CONFIG.SHEETS.USERS);
  var user = users.find(function(u) {
    return u.username === payload.username && u.password === payload.password;
  });
  if (user) {
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        related_id: user.related_id,
        nama: user.nama,
      },
    };
  }
  return { success: false, message: 'Username atau password salah' };
}

// ========== SISWA ==========
function handleGetSiswa(payload) {
  var data = getData(CONFIG.SHEETS.SISWA);
  if (payload.nis) data = data.filter(function(s) { return s.nis === payload.nis; });
  return { success: true, data: data };
}

function handleAddSiswa(payload) {
  var data = { id: getNextId(CONFIG.SHEETS.SISWA), nis: payload.nis, nama: payload.nama, kelas: payload.kelas, tempat_lahir: payload.tempat_lahir || '', tanggal_lahir: payload.tanggal_lahir || '', alamat: payload.alamat || '', nama_ayah: payload.nama_ayah || '', nama_ibu: payload.nama_ibu || '', no_telp: payload.no_telp || '', tahun_ajaran: payload.tahun_ajaran || '' };
  return addRow(CONFIG.SHEETS.SISWA, data);
}

function handleUpdateSiswa(payload) {
  return updateRow(CONFIG.SHEETS.SISWA, payload.nis, payload);
}

function handleDeleteSiswa(payload) {
  return deleteRow(CONFIG.SHEETS.SISWA, payload.nis);
}

// ========== ABSENSI ==========
function handleGetAbsensi(payload) {
  var data = getData(CONFIG.SHEETS.ABSENSI);
  if (payload.nis) data = data.filter(function(a) { return a.nis === payload.nis; });
  // Gabung nama siswa
  var siswa = getData(CONFIG.SHEETS.SISWA);
  data.forEach(function(a) {
    var s = siswa.find(function(x) { return x.nis === a.nis; });
    if (s) a.nama = s.nama;
  });
  return { success: true, data: data };
}

function handleAddAbsensi(payload) {
  var data = { id: getNextId(CONFIG.SHEETS.ABSENSI), nis: payload.nis, tanggal: payload.tanggal, status: payload.status, keterangan: payload.keterangan || '' };
  return addRow(CONFIG.SHEETS.ABSENSI, data);
}

function handleUpdateAbsensi(payload) {
  return updateRow(CONFIG.SHEETS.ABSENSI, payload.id, payload);
}

function handleDeleteAbsensi(payload) {
  return deleteRow(CONFIG.SHEETS.ABSENSI, payload.id);
}

// ========== NILAI ==========
function handleGetNilai(payload) {
  var data = getData(CONFIG.SHEETS.NILAI);
  if (payload.nis) data = data.filter(function(n) { return n.nis === payload.nis; });
  var siswa = getData(CONFIG.SHEETS.SISWA);
  data.forEach(function(n) {
    var s = siswa.find(function(x) { return x.nis === n.nis; });
    if (s) n.nama = s.nama;
  });
  return { success: true, data: data };
}

function handleAddNilai(payload) {
  var data = { id: getNextId(CONFIG.SHEETS.NILAI), nis: payload.nis, mata_pelajaran: payload.mata_pelajaran, nilai_tugas: payload.nilai_tugas || '', nilai_uts: payload.nilai_uts || '', nilai_uas: payload.nilai_uas || '', nilai_akhir: payload.nilai_akhir || '', semester: payload.semester || 'Ganjil', tahun_ajaran: payload.tahun_ajaran || '' };
  if (!data.nilai_akhir) {
    var tugas = parseFloat(data.nilai_tugas) || 0;
    var uts = parseFloat(data.nilai_uts) || 0;
    var uas = parseFloat(data.nilai_uas) || 0;
    data.nilai_akhir = (tugas * 0.3 + uts * 0.3 + uas * 0.4).toFixed(2);
  }
  return addRow(CONFIG.SHEETS.NILAI, data);
}

function handleUpdateNilai(payload) {
  return updateRow(CONFIG.SHEETS.NILAI, payload.id, payload);
}

function handleDeleteNilai(payload) {
  return deleteRow(CONFIG.SHEETS.NILAI, payload.id);
}

// ========== IJIN ==========
function handleGetIjin(payload) {
  var data = getData(CONFIG.SHEETS.IJIN);
  if (payload.nis) data = data.filter(function(i) { return i.nis === payload.nis; });
  var siswa = getData(CONFIG.SHEETS.SISWA);
  data.forEach(function(i) {
    var s = siswa.find(function(x) { return x.nis === i.nis; });
    if (s) i.nama = s.nama;
  });
  return { success: true, data: data };
}

function handleAddIjin(payload) {
  var data = { id: getNextId(CONFIG.SHEETS.IJIN), nis: payload.nis, tanggal: payload.tanggal, jenis: payload.jenis, keterangan: payload.keterangan || '', status: payload.status || 'pending', approved_by: '' };
  return addRow(CONFIG.SHEETS.IJIN, data);
}

function handleUpdateIjin(payload) {
  return updateRow(CONFIG.SHEETS.IJIN, payload.id, payload);
}

function handleDeleteIjin(payload) {
  return deleteRow(CONFIG.SHEETS.IJIN, payload.id);
}

// ========== USERS ==========
function handleGetUsers(payload) {
  var data = getData(CONFIG.SHEETS.USERS);
  // Hide passwords
  data.forEach(function(u) { u.password = undefined; });
  return { success: true, data: data };
}

function handleAddUser(payload) {
  var data = { id: getNextId(CONFIG.SHEETS.USERS), username: payload.username, password: payload.password, role: payload.role, related_id: payload.related_id || '', nama: payload.nama };
  return addRow(CONFIG.SHEETS.USERS, data);
}

function handleUpdateUser(payload) {
  var updateData = {};
  if (payload.nama) updateData.nama = payload.nama;
  if (payload.password) updateData.password = payload.password;
  if (payload.role) updateData.role = payload.role;
  if (payload.related_id !== undefined) updateData.related_id = payload.related_id;
  return updateRow(CONFIG.SHEETS.USERS, payload.id, updateData);
}

function handleDeleteUser(payload) {
  return deleteRow(CONFIG.SHEETS.USERS, payload.id);
}

// ========== KELAS ==========
function handleGetKelas(payload) {
  var data = getData(CONFIG.SHEETS.KELAS);
  return { success: true, data: data };
}

function handleAddKelas(payload) {
  var data = { id: getNextId(CONFIG.SHEETS.KELAS), nama_kelas: payload.nama_kelas, tingkat: payload.tingkat, wali_kelas: payload.wali_kelas || '' };
  return addRow(CONFIG.SHEETS.KELAS, data);
}

function handleUpdateKelas(payload) {
  return updateRow(CONFIG.SHEETS.KELAS, payload.id, payload);
}

function handleDeleteKelas(payload) {
  return deleteRow(CONFIG.SHEETS.KELAS, payload.id);
}

// ========== DASHBOARD STATS ==========
function handleGetDashboardStats() {
  var siswa = getData(CONFIG.SHEETS.SISWA);
  var absensi = getData(CONFIG.SHEETS.ABSENSI);
  var ijin = getData(CONFIG.SHEETS.IJIN);
  var kelas = getData(CONFIG.SHEETS.KELAS);

  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var hadirHariIni = absensi.filter(function(a) { return a.tanggal === today && a.status === 'hadir'; }).length;
  var izinPending = ijin.filter(function(i) { return i.status === 'pending'; }).length;

  return {
    success: true,
    data: {
      totalSiswa: siswa.length,
      hadirHariIni: hadirHariIni,
      izinPending: izinPending,
      totalKelas: kelas.length,
    },
  };
}

// ========== SEED DEFAULT USERS ==========
function seedDefaultUsers() {
  var existing = getData(CONFIG.SHEETS.USERS);
  if (existing.length > 0) {
    return 'Data pengguna sudah ada, seed dibatalkan';
  }

  addRow(CONFIG.SHEETS.USERS, { id: 1, username: 'admin', password: 'admin123', role: 'admin', related_id: '', nama: 'Administrator' });
  return 'Default users berhasil dibuat. Login: admin / admin123';
}

// ========== ACTION ROUTER ==========
function routeAction(action, payload) {
  switch (action) {
    case 'login': return handleLogin(payload);
    case 'getSiswa': return handleGetSiswa(payload);
    case 'addSiswa': return handleAddSiswa(payload);
    case 'updateSiswa': return handleUpdateSiswa(payload);
    case 'deleteSiswa': return handleDeleteSiswa(payload);
    case 'getAbsensi': return handleGetAbsensi(payload);
    case 'addAbsensi': return handleAddAbsensi(payload);
    case 'updateAbsensi': return handleUpdateAbsensi(payload);
    case 'deleteAbsensi': return handleDeleteAbsensi(payload);
    case 'getNilai': return handleGetNilai(payload);
    case 'addNilai': return handleAddNilai(payload);
    case 'updateNilai': return handleUpdateNilai(payload);
    case 'deleteNilai': return handleDeleteNilai(payload);
    case 'getIjin': return handleGetIjin(payload);
    case 'addIjin': return handleAddIjin(payload);
    case 'updateIjin': return handleUpdateIjin(payload);
    case 'deleteIjin': return handleDeleteIjin(payload);
    case 'getUsers': return handleGetUsers(payload);
    case 'addUser': return handleAddUser(payload);
    case 'updateUser': return handleUpdateUser(payload);
    case 'deleteUser': return handleDeleteUser(payload);
    case 'getKelas': return handleGetKelas(payload);
    case 'addKelas': return handleAddKelas(payload);
    case 'updateKelas': return handleUpdateKelas(payload);
    case 'deleteKelas': return handleDeleteKelas(payload);
    case 'getDashboardStats': return handleGetDashboardStats();
    default: return { success: false, message: 'Action tidak dikenal: ' + action };
  }
}

// ========== JSONP (via doGet) ==========
function doGet(e) {
  var callback = e.parameter.callback || '';
  var payload = {};

  try {
    payload = JSON.parse(e.parameter.payload || '{}');
  } catch (err) {
    payload = {};
  }

  var result = { success: false, message: 'Invalid request' };
  try {
    var action = payload.action || '';
    result = routeAction(action, payload);
  } catch (err) {
    result = { success: false, message: 'Server error: ' + err.message };
  }

  var output = JSON.stringify(result);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + output + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
}

// ========== POST fallback (via doPost) ==========
function doPost(e) {
  var result = { success: false, message: 'Invalid request' };
  try {
    var payload = JSON.parse(e.parameter.payload || '{}');
    var action = payload.action || e.parameter.action || '';

    if (!action && e.postData && e.postData.contents) {
      var params = JSON.parse(e.postData.contents);
      action = params.action || '';
      payload = params;
    }

    result = routeAction(action, payload);
  } catch (err) {
    result = { success: false, message: 'Server error: ' + err.message };
  }

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
