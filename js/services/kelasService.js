const kelasService = {
  async getAll(params) {
    return baseService.fetch('kelas', 'getKelas', params);
  },

  async create(data) {
    return baseService.create('kelas', 'addKelas', data);
  },

  async update(data) {
    return baseService.update('kelas', 'updateKelas', data);
  },

  async remove(id) {
    return baseService.remove('kelas', 'deleteKelas', { id });
  },

  invalidate() { baseService.invalidate('kelas'); }
};
