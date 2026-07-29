const Modal = {
  _stack: [],

  show(config) {
    const id = 'modal_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = id;
    overlay.innerHTML = `
      <div class="modal">
        ${config.title ? `<div class="modal-title">${config.title}</div>` : ''}
        <div class="modal-body">${config.body || ''}</div>
        ${config.actions !== false ? `<div class="modal-actions">${this._buildActions(config.buttons || [])}</div>` : ''}
      </div>`;
    document.body.appendChild(overlay);

    if (config.width) overlay.querySelector('.modal').style.maxWidth = config.width;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay && config.closable !== false) this.close(id);
    });

    document.addEventListener('keydown', function _keyHandler(e) {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', _keyHandler);
        Modal.close(id);
      }
    });

    this._stack.push(id);

    if (config.onOpen) config.onOpen(overlay.querySelector('.modal-body'), overlay);

    return id;
  },

  close(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.style.animation = 'overlayIn 0.2s reverse';
      setTimeout(() => overlay.remove(), 200);
    }
    this._stack = this._stack.filter(m => m !== id);
  },

  closeAll() {
    [...this._stack].forEach(id => this.close(id));
  },

  alert(message, title = 'Informasi') {
    return this.show({
      title,
      body: `<p>${message}</p>`,
      buttons: [{ label: 'OK', cls: 'btn-primary', close: true }],
    });
  },

  confirm(message, title = 'Konfirmasi') {
    return new Promise(resolve => {
      this.show({
        title,
        body: `<p>${message}</p>`,
        buttons: [
          { label: 'Batal', cls: 'btn-outline', close: true, handler: () => resolve(false) },
          { label: 'Ya', cls: 'btn-primary', close: true, handler: () => resolve(true) },
        ],
      });
    });
  },

  form(title, fields, onSubmit) {
    let body = '';
    fields.forEach(f => {
      body += '<div class="form-group"><label>' + (f.label || '') + '</label>';
      if (f.type === 'select') {
        let opts = f.options.map(o => `<option value="${o.value}" ${o.value === f.value ? 'selected' : ''}>${o.label}</option>`).join('');
        body += `<select class="form-control" id="f_${f.key}" ${f.required ? 'required' : ''}>${opts}</select>`;
      } else if (f.type === 'textarea') {
        body += `<textarea class="form-control" id="f_${f.key}" ${f.required ? 'required' : ''} placeholder="${f.placeholder || ''}">${f.value || ''}</textarea>`;
      } else {
        body += `<input type="${f.type || 'text'}" class="form-control" id="f_${f.key}" value="${f.value || ''}" ${f.required ? 'required' : ''} placeholder="${f.placeholder || ''}" ${f.type === 'number' ? 'min="0"' : ''}>`;
      }
      body += '</div>';
    });

    return this.show({
      title,
      body,
      buttons: [
        { label: 'Batal', cls: 'btn-outline', close: true },
        { label: 'Simpan', cls: 'btn-primary', close: false, handler: (bodyEl, overlayId) => {
          const data = {};
          fields.forEach(f => {
            const el = document.getElementById('f_' + f.key);
            if (el) data[f.key] = el.value;
          });
          if (onSubmit(data, overlayId) !== false) Modal.close(overlayId);
        }},
      ],
    });
  },

  _buildActions(buttons) {
    return buttons.map(b => {
      let html = `<button class="btn ${b.cls || 'btn-outline'}"`;
      if (b.close) html += ` onclick="Modal.close(this.closest('.modal-overlay').id)"`;
      else if (b.handler) {
        const overlayId = this._stack.length > 0 ? this._stack[this._stack.length - 1] : 'unknown';
        html += ` onclick="(function(){var m=document.querySelector('.modal-overlay:last-child');if(m)Modal._execHandler('${overlayId}')})()"`;
      }
      html += `>${b.label}</button>`;
      return html;
    }).join('');
  },

  _execHandler(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    const bodyEl = overlay.querySelector('.modal-body');
    // Find the last button with a handler and call it
    // This requires the button to be stored, so we use a different approach
  }
};

/* Patch the button handler approach - store handlers on the overlay */
Modal.show = (function(original) {
  return function(config) {
    config.buttons = (config.buttons || []).map(b => {
      const handler = b.handler;
      if (handler) {
        const overlayId = 'modal_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        setTimeout(() => {
          const overlay = document.getElementById(overlayId);
          if (overlay) overlay._handler = handler;
        }, 0);
        return { ...b, handler: null, _origHandler: handler, _overlayId: overlayId };
      }
      return b;
    });
    const id = original.call(Modal, config);
    // Re-attach handlers
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay._handlers = {};
      const btns = overlay.querySelectorAll('.modal-actions .btn');
      const configBtns = config.buttons || [];
      btns.forEach((btn, i) => {
        const cfg = configBtns[i];
        if (cfg && cfg._origHandler) {
          btn.onclick = function() {
            const bodyEl = overlay.querySelector('.modal-body');
            const result = cfg._origHandler(bodyEl, id);
            if (result !== false && cfg.close !== false) Modal.close(id);
          };
        }
      });
    }
    return id;
  };
})(Modal.show);
