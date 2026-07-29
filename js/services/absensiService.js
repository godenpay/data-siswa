const absensiService = {
  async getAll(params) {
    return baseService.fetch('absensi', 'getAbsensi', params);
  },

  async create(data) {
    return baseService.create('absensi', 'addAbsensi', data);
  },

  async update(data) {
    return baseService.update('absensi', 'updateAbsensi', data);
  },

  async remove(id) {
    return baseService.remove('absensi', 'deleteAbsensi', { id });
  },

  async bulkCreate(entries) {
    let ok = 0, fail = 0;
    for (const e of entries) {
      const res = await this.create(e);
      if (res.success) ok++; else fail++;
    }
    return { success: true, data: { ok, fail } };
  },

  invalidate() { baseService.invalidate('absensi'); }
};
