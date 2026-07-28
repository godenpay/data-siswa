const api = {
  requestId: 0,

  async request(action, data = {}) {
    showLoading(true);
    const payload = { action, ...data };
    if (auth.getToken()) payload.token = auth.getToken();

    return new Promise(resolve => {
      const id = ++this.requestId;
      const callbackName = 'api_cb_' + id;

      window[callbackName] = function(result) {
        delete window[callbackName];
        showLoading(false);
        resolve(result);
      };

      const params = new URLSearchParams();
      params.set('callback', callbackName);
      params.set('payload', JSON.stringify(payload));

      const script = document.createElement('script');
      script.src = APP_CONFIG.API_URL + '?' + params.toString();

      script.onerror = () => {
        delete window[callbackName];
        showLoading(false);
        resolve({ success: false, message: 'Gagal terhubung ke server' });
      };

      document.head.appendChild(script);
      document.head.removeChild(script);

      setTimeout(() => {
        if (window[callbackName]) {
          delete window[callbackName];
          showLoading(false);
          resolve({ success: false, message: 'Request timeout' });
        }
      }, 30000);
    });
  },

  async login(username, password) {
    return this.request('login', { username, password });
  },

  async getSiswa(params = {}) { return this.request('getSiswa', params); },
  async addSiswa(data) { return this.request('addSiswa', data); },
  async updateSiswa(data) { return this.request('updateSiswa', data); },
  async deleteSiswa(nis) { return this.request('deleteSiswa', { nis }); },

  async getAbsensi(params = {}) { return this.request('getAbsensi', params); },
  async addAbsensi(data) { return this.request('addAbsensi', data); },
  async updateAbsensi(data) { return this.request('updateAbsensi', data); },
  async deleteAbsensi(id) { return this.request('deleteAbsensi', { id }); },

  async getNilai(params = {}) { return this.request('getNilai', params); },
  async addNilai(data) { return this.request('addNilai', data); },
  async updateNilai(data) { return this.request('updateNilai', data); },
  async deleteNilai(id) { return this.request('deleteNilai', { id }); },

  async getIjin(params = {}) { return this.request('getIjin', params); },
  async addIjin(data) { return this.request('addIjin', data); },
  async updateIjin(data) { return this.request('updateIjin', data); },
  async deleteIjin(id) { return this.request('deleteIjin', { id }); },

  async getUsers(params = {}) { return this.request('getUsers', params); },
  async addUser(data) { return this.request('addUser', data); },
  async updateUser(data) { return this.request('updateUser', data); },
  async deleteUser(id) { return this.request('deleteUser', { id }); },

  async getKelas(params = {}) { return this.request('getKelas', params); },
  async addKelas(data) { return this.request('addKelas', data); },
  async updateKelas(data) { return this.request('updateKelas', data); },
  async deleteKelas(id) { return this.request('deleteKelas', { id }); },

  async getDashboardStats() { return this.request('getDashboardStats'); },
};
