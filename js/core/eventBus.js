const eventBus = {
  _events: {},

  on(event, fn) {
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(fn);
    return () => this.off(event, fn);
  },

  off(event, fn) {
    if (!this._events[event]) return;
    this._events[event] = this._events[event].filter(f => f !== fn);
  },

  emit(event, data) {
    if (!this._events[event]) return;
    this._events[event].forEach(fn => fn(data));
  },

  clear(event) {
    if (event) delete this._events[event];
    else this._events = {};
  }
};
