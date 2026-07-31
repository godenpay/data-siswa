const siswaService = {
  async getAll(params) {
    return baseService.fetch('siswa', 'getSiswa', params);
  },

  async getById(nis) {
    const res = await this.getAll({ nis });
    if (res.success) res.data = res.data[0] || null;
    return res;
  },

  async create(data) {
    return baseService.create('siswa', 'addSiswa', data);
  },

  async update(data) {
    return baseService.update('siswa', 'updateSiswa', data);
  },

  async remove(nis) {
    return baseService.remove('siswa', 'deleteSiswa', nis);
  },

  invalidate() { baseService.invalidate('siswa'); }
};
