const ijinService = {
  async getAll(params) {
    return baseService.fetch('ijin', 'getIjin', params);
  },

  async create(data) {
    return baseService.create('ijin', 'addIjin', data);
  },

  async update(data) {
    return baseService.update('ijin', 'updateIjin', data);
  },

  async remove(id) {
    return baseService.remove('ijin', 'deleteIjin', id);
  },

  async approve(id, adminName) {
    return this.update({ id, status: 'disetujui', approved_by: adminName });
  },

  async reject(id, adminName) {
    return this.update({ id, status: 'ditolak', approved_by: adminName });
  },

  invalidate() { baseService.invalidate('ijin'); }
};
