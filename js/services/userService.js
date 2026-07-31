const userService = {
  async getAll(params) {
    return baseService.fetch('user', 'getUsers', params, false);
  },

  async create(data) {
    return baseService.create('user', 'addUser', data);
  },

  async update(data) {
    return baseService.update('user', 'updateUser', data);
  },

  async remove(id) {
    return baseService.remove('user', 'deleteUser', id);
  },

  invalidate() { baseService.invalidate('user'); }
};
