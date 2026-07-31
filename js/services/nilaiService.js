const nilaiService = {
  async getAll(params) {
    return baseService.fetch('nilai', 'getNilai', params);
  },

  async create(data) {
    return baseService.create('nilai', 'addNilai', data);
  },

  async update(data) {
    return baseService.update('nilai', 'updateNilai', data);
  },

  async remove(id) {
    return baseService.remove('nilai', 'deleteNilai', id);
  },

  invalidate() { baseService.invalidate('nilai'); }
};
