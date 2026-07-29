const baseService = {
  cache: new Map(),
  pendingRequests: new Map(),

  _cacheKey(entity, params) {
    return entity + '::' + JSON.stringify(params || {});
  },

  _getCached(key, ttlMs = 30000) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.ts < ttlMs) return cached.data;
    this.cache.delete(key);
    return null;
  },

  _setCache(key, data) {
    this.cache.set(key, { data, ts: Date.now() });
    if (this.cache.size > 100) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }
  },

  _dedupe(key, promiseFn) {
    if (this.pendingRequests.has(key)) return this.pendingRequests.get(key);
    const promise = promiseFn().finally(() => this.pendingRequests.delete(key));
    this.pendingRequests.set(key, promise);
    return promise;
  },

  invalidate(entity) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(entity + '::')) this.cache.delete(key);
    }
  },

  invalidateAll() { this.cache.clear(); },

  async fetch(entity, action, params = {}, useCache = true) {
    const key = this._cacheKey(entity, params);
    if (useCache) {
      const cached = this._getCached(key);
      if (cached) return cached;
    }

    return this._dedupe(key, async () => {
      const res = await api[action](params);
      if (res.success && res.data) this._setCache(key, res);
      return res;
    });
  },

  async mutate(action, data, invalidateEntities = []) {
    const res = await api[action](data);
    if (res.success) {
      invalidateEntities.forEach(e => this.invalidate(e));
    }
    return res;
  },

  async get(entity, action, params) {
    return this.fetch(entity, action, params);
  },

  async create(entity, addAction, data) {
    return this.mutate(addAction, data, [entity]);
  },

  async update(entity, updateAction, data) {
    return this.mutate(updateAction, data, [entity]);
  },

  async remove(entity, deleteAction, id) {
    return this.mutate(deleteAction, id, [entity]);
  }
};
