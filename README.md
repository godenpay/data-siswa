# 📚 Data Siswa - Sistem Informasi Sekolah

Sistem manajemen data siswa untuk kelas 7-9 dengan frontend **GitHub Pages** dan backend **Google Sheets + Apps Script**.

## Fitur

- **CRUD Siswa** - Kelola data siswa lengkap
- **Absensi** - Catat kehadiran siswa (Hadir/Sakit/Izin/Alpha)
- **Raport** - Input dan lihat nilai siswa per semester
- **Izin/Sakit** - Manajemen perizinan siswa
- **Role System** - Admin, Siswa (lihat data sendiri), Orang Tua (lihat data anak)

## Tech Stack

| Layer       | Teknologi                           |
|-------------|--------------------------------------|
| Frontend    | HTML, CSS, JavaScript (Vanilla SPA)  |
| Hosting     | GitHub Pages                         |
| CI/CD       | GitHub Actions                       |
| Backend     | Google Apps Script (Web App)         |
| Database    | Google Sheets                        |

---

## 🚀 Cara Deploy

### 1. Clone & Push ke GitHub

```bash
git init
git add .
git commit -m "init: data siswa"
git remote add origin https://github.com/godenpay/data-siswa.git
git branch -M main
git push -u origin main
```

### 2. Aktifkan GitHub Pages

- Masuk ke repo → **Settings** → **Pages**
- Source: **GitHub Actions**

Push ke `main` otomatis trigger Actions → deploy ke Pages.

### 3. Setup Backend Google Sheets

#### a. Buat Google Sheets

Buat spreadsheet baru dengan nama **Data Siswa**, buat sheet-sheet berikut:

| Sheet Name   | Fungsi                          |
|-------------|---------------------------------|
| `Users`     | Data pengguna (admin, siswa, ortu) |
| `Siswa`     | Data siswa                       |
| `Kelas`     | Data kelas                       |
| `Absensi`   | Catatan absensi                  |
| `Nilai`     | Nilai / raport siswa             |
| `Ijin`      | Data izin / sakit                |
| `Config`    | Konfigurasi (token, dll)        |

#### b. Kolom setiap sheet

**Users** — `id`, `username`, `password`, `role`, `related_id`, `nama`

**Siswa** — `nis`, `nama`, `kelas`, `tempat_lahir`, `tanggal_lahir`, `alamat`, `nama_ayah`, `nama_ibu`, `no_telp`, `tahun_ajaran`

**Kelas** — `id`, `nama_kelas`, `tingkat`, `wali_kelas`

**Absensi** — `id`, `nis`, `tanggal`, `status`, `keterangan`

**Nilai** — `id`, `nis`, `mata_pelajaran`, `nilai_tugas`, `nilai_uts`, `nilai_uas`, `nilai_akhir`, `semester`, `tahun_ajaran`

**Ijin** — `id`, `nis`, `tanggal`, `jenis`, `keterangan`, `status`, `approved_by`

**Config** — `key`, `value`

#### c. Deploy Apps Script

1. Buka **Extensions → Apps Script**
2. Hapus kode default, copy-paste dari `backend/Code.gs`
3. Set `SCRIPT_ID` di `backend/Code.gs` sesuai file spreadsheet-mu
4. Deploy → **New deployment** → Type: **Web app**
   - Execute as: **Me**
   - Access: **Anyone**
5. Copy URL web app → paste ke `js/config.js`

### 4. Konfigurasi Frontend

### 5. Logo

Letakkan file logo `logo.png` di folder `logo/`. Ukuran推荐: 64x64 px (format PNG). Logo akan tampil di navbar dan halaman login.

### 6. Konfigurasi Frontend

Edit `js/config.js`:

```js
const APP_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
  APP_NAME: 'Data Siswa',
};
```

### 7. Selesai!

Akses `https://username.github.io/data-siswa`

---

## 📦 Struktur Proyek

```
├── index.html              # Halaman utama SPA
├── README.md
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions deploy
├── css/
│   └── style.css           # Styling
├── logo/
│   └── logo.png            ✏️ Tempat upload logo kamu
├── js/
│   ├── config.js           # Konfigurasi API URL
│   ├── api.js              # Wrapper fetch API
│   ├── auth.js             # Auth & role management
│   ├── router.js           # SPA router
│   ├── app.js              # Entry point
│   └── pages/
│       ├── login.js        # Login page
│       ├── dashboard.js    # Dashboard
│       ├── siswa.js        # CRUD siswa
│       ├── absensi.js      # Absensi
│       ├── raport.js       # Raport / nilai
│       ├── ijin.js         # Izin / sakit
│       └── admin.js        # Admin panel
├── backend/
│   ├── Code.gs             # Apps Script backend
│   └── sheets_structure.txt
└── assets/
```

## 👥 Role & Hak Akses

| Role        | Akses                                                 |
|-------------|-------------------------------------------------------|
| **Admin**   | Full CRUD semua data                                  |
| **Siswa**   | Lihat data diri, absensi, raport, izin sendiri        |
| **Orang Tua** | Lihat data anak, absensi, raport, izin anak         |

## 🔐 Default Login

Setelah menjalankan script `seedDefaultUsers()` di Apps Script:

| Role        | Username       | Password   |
|-------------|----------------|------------|
| Admin       | admin          | admin123   |
| Siswa       | (nis siswa)    | siswa123   |
| Orang Tua   | (username ort) | ortu123    |

---

Dibuat dengan ❤️ untuk dunia pendidikan.
