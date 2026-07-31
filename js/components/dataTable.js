class DataTable {
  constructor(config) {
    this.id = config.id || 'dt_' + Date.now();
    this.container = config.container;
    this.columns = config.columns || [];
    this.data = config.data || [];
    this.pageSize = config.pageSize || 25;
    this.pageSizes = config.pageSizes || [10, 25, 50, 100];
    this.currentPage = 1;
    this.searchTerm = '';
    this.sortCol = config.sortCol || null;
    this.sortDir = config.sortDir || 'asc';
    this.onRowClick = config.onRowClick || null;
    this.actions = config.actions || null;
    this.emptyMessage = config.emptyMessage || 'Belum ada data';
    this.filters = config.filters || null;
    this.bulkActions = config.bulkActions || null;
    this.exportable = config.exportable !== false;
    this.selectable = config.selectable || false;
    this.selected = new Set();
    this.filteredData = [];
    this.pageData = [];
    this.storageKey = 'dt_pageSize_' + this.id;

    const saved = localStorage.getItem(this.storageKey);
    if (saved) this.pageSize = parseInt(saved) || this.pageSize;

    this.init();
  }

  _rowId(row) {
    if (row == null) return '';
    if (row.id != null) return String(row.id);
    if (row.nis != null) return String(row.nis);
    return JSON.stringify(row);
  }

  _escAttr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  init() {
    this.applyFilters();
    this.render();
  }

  setData(data) {
    this.data = data;
    this.currentPage = 1;
    this.selected.clear();
    this.applyFilters();
    this.render();
  }

  setFilter(fn) {
    this.customFilter = fn;
    this.currentPage = 1;
    this.applyFilters();
    this.render();
  }

  applyFilters() {
    let filtered = [...this.data];

    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        this.columns.some(col => {
          const val = row[col.key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }

    if (this.customFilter) {
      filtered = filtered.filter(this.customFilter);
    }

    this.filteredData = filtered;

    if (this.sortCol) {
      filtered.sort((a, b) => {
        const va = a[this.sortCol], vb = b[this.sortCol];
        if (va == null) return 1;
        if (vb == null) return -1;
        const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
        return this.sortDir === 'asc' ? cmp : -cmp;
      });
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const start = (this.currentPage - 1) * this.pageSize;
    this.pageData = filtered.slice(start, start + this.pageSize);
  }

  sort(colKey) {
    if (this.sortCol === colKey) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortCol = colKey;
      this.sortDir = 'asc';
    }
    this.currentPage = 1;
    this.applyFilters();
    this.render();
  }

  goToPage(page) {
    this.currentPage = Math.max(1, Math.min(page, Math.ceil(this.filteredData.length / this.pageSize)));
    this.applyFilters();
    this.render();
  }

  setPageSize(size) {
    this.pageSize = size;
    localStorage.setItem(this.storageKey, size);
    this.currentPage = 1;
    this.applyFilters();
    this.render();
  }

  search(q) {
    this.searchTerm = q;
    this.currentPage = 1;
    this.applyFilters();
    this.render();
  }

  toggleSelect(id) {
    if (this.selected.has(String(id))) this.selected.delete(String(id));
    else this.selected.add(String(id));
    this.render();
  }

  selectAll() {
    const allIds = this.pageData.map(r => this._rowId(r));
    const allSelected = allIds.length > 0 && allIds.every(id => this.selected.has(id));
    if (allSelected) allIds.forEach(id => this.selected.delete(id));
    else allIds.forEach(id => this.selected.add(id));
    this.render();
  }

  exportCSV(filename) {
    const rows = this.filteredData.map(row =>
      this.columns.map(col => {
        let val = row[col.key];
        if (col.export) val = col.export(val, row);
        if (val == null) return '';
        const s = String(val).replace(/"/g, '""');
        return s.includes(',') || s.includes('"') ? '"' + s + '"' : s;
      }).join(',')
    );
    const header = this.columns.map(c => c.label || c.key).join(',');
    const csv = '\uFEFF' + header + '\n' + rows.join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = (filename || 'export') + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  render() {
    if (!this.container) return;

    const total = this.filteredData.length;
    const totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, total);

    let html = '';

    // Toolbar
    html += '<div class="table-toolbar">';

    if (this.filters) {
      html += '<div class="filter-bar">';
      this.filters.forEach(f => {
        if (f.type === 'select') {
          html += `<select class="form-control form-control-sm" id="${this.id}_f_${f.key}" onchange="document.getElementById('${this.id}').__dt.filterChange('${f.key}')">`;
          html += `<option value="">${f.label}</option>`;
          f.options.forEach(o => {
            html += `<option value="${o.value}">${o.label}</option>`;
          });
          html += '</select>';
        }
        if (f.type === 'date') {
          html += `<input type="date" class="form-control form-control-sm" id="${this.id}_f_${f.key}" onchange="document.getElementById('${this.id}').__dt.filterChange('${f.key}')" placeholder="${f.label}">`;
        }
        if (f.type === 'text') {
          html += `<input type="text" class="form-control form-control-sm" id="${this.id}_f_${f.key}" oninput="document.getElementById('${this.id}').__dt.filterChange('${f.key}')" placeholder="${f.label}">`;
        }
      });
      html += '</div>';
    }

    html += '<div class="table-toolbar-right">';
    if (this.bulkActions && this.selected.size > 0) {
      html += `<span class="bulk-info">${this.selected.size} dipilih</span>`;
      this.bulkActions.forEach(btn => {
        html += `<button class="btn btn-sm ${btn.cls || 'btn-primary'}" onclick="document.getElementById('${this.id}').__dt.bulkExec('${btn.key}')">${btn.label}</button>`;
      });
    }
    if (this.exportable && total > 0) {
      html += `<button class="btn btn-sm btn-outline" onclick="document.getElementById('${this.id}').__dt.exportCSV('${this.id}')" title="Export CSV">&#128229; CSV</button>`;
    }
    html += '<input type="text" class="form-control form-control-sm search-input" placeholder="Cari..." oninput="document.getElementById(\'' + this.id + '\').__dt.search(this.value)">';
    html += '</div></div>';

    // Table
    html += '<div class="table-container"><table>';
    html += '<thead><tr>';
    if (this.selectable) {
      const allSelected = this.pageData.length > 0 && this.pageData.every(r => this.selected.has(this._rowId(r)));
      html += `<th class="col-check"><input type="checkbox" ${allSelected ? 'checked' : ''} onchange="document.getElementById('${this.id}').__dt.selectAll()"></th>`;
    }
    this.columns.forEach(col => {
      const sortable = col.sortable !== false;
      const sortIcon = this.sortCol === col.key ? (this.sortDir === 'asc' ? ' &#9650;' : ' &#9660;') : '';
      html += `<th${col.width ? ' style="width:' + col.width + '"' : ''}${sortable ? ' class="sortable" onclick="document.getElementById(\'' + this.id + '\').__dt.sort(\'' + col.key + '\')"' : ''}>${col.label || col.key}${sortable ? sortIcon : ''}</th>`;
    });
    if (this.actions) html += '<th class="col-actions">Aksi</th>';
    html += '</tr></thead><tbody>';

    if (this.pageData.length === 0) {
      html += `<tr><td colspan="${this.columns.length + (this.selectable ? 1 : 0) + (this.actions ? 1 : 0)}" class="empty-cell"><div class="empty-state"><div class="empty-state-icon">&#128196;</div><div class="empty-state-title">${this.emptyMessage}</div></div></td></tr>`;
    } else {
      this.pageData.forEach(row => {
        const rowId = this._rowId(row);
        const escId = this._escAttr(rowId);
        html += '<tr' + (this.onRowClick ? ' style="cursor:pointer" onclick="document.getElementById(\'' + this.id + '\').__dt.rowClick(\'' + escId + '\')"' : '') + '>';
        if (this.selectable) {
          html += `<td class="col-check"><input type="checkbox" ${this.selected.has(rowId) ? 'checked' : ''} onchange="document.getElementById('${this.id}').__dt.toggleSelect('${escId}')"></td>`;
        }
        this.columns.forEach(col => {
          let val = row[col.key];
          if (col.render) val = col.render(val, row);
          else if (val == null) val = '-';
          html += '<td>' + val + '</td>';
        });
        if (this.actions) {
          let actionsHtml = '<div class="action-btns">';
          this.actions.forEach(btn => {
            const show = !btn.show || btn.show(row);
            if (show) {
              actionsHtml += `<button class="btn btn-sm ${btn.cls || 'btn-ghost'}" onclick="event.stopPropagation(); document.getElementById('${this.id}').__dt.actionExec('${btn.key}', '${escId}')">${btn.label}</button>`;
            }
          });
          actionsHtml += '</div>';
          html += '<td>' + actionsHtml + '</td>';
        }
        html += '</tr>';
      });
    }

    html += '</tbody></table></div>';

    // Pagination
    if (total > 0) {
      html += '<div class="pagination-bar">';
      html += '<div class="pagination-info">Menampilkan ' + start + '-' + end + ' dari ' + total + '</div>';
      html += '<div class="pagination-controls">';
      html += '<select class="form-control form-control-sm pagination-size" onchange="document.getElementById(\'' + this.id + '\').__dt.setPageSize(parseInt(this.value))">';
      this.pageSizes.forEach(s => html += `<option value="${s}" ${s === this.pageSize ? 'selected' : ''}>${s}</option>`);
      html += '</select>';

      html += '<div class="pagination-btns">';
      html += `<button class="btn btn-sm btn-ghost" onclick="document.getElementById('${this.id}').__dt.goToPage(1)" ${this.currentPage <= 1 ? 'disabled' : ''}>&#171;</button>`;
      html += `<button class="btn btn-sm btn-ghost" onclick="document.getElementById('${this.id}').__dt.goToPage(${this.currentPage - 1})" ${this.currentPage <= 1 ? 'disabled' : ''}>&#8249;</button>`;

      const pageRange = this.getPageRange(totalPages);
      pageRange.forEach(p => {
        if (p === '...') {
          html += '<span class="pagination-ellipsis">...</span>';
        } else {
          html += `<button class="btn btn-sm ${p === this.currentPage ? 'btn-primary' : 'btn-ghost'}" onclick="document.getElementById('${this.id}').__dt.goToPage(${p})">${p}</button>`;
        }
      });

      html += `<button class="btn btn-sm btn-ghost" onclick="document.getElementById('${this.id}').__dt.goToPage(${this.currentPage + 1})" ${this.currentPage >= totalPages ? 'disabled' : ''}>&#8250;</button>`;
      html += `<button class="btn btn-sm btn-ghost" onclick="document.getElementById('${this.id}').__dt.goToPage(${totalPages})" ${this.currentPage >= totalPages ? 'disabled' : ''}>&#187;</button>`;
      html += '</div></div></div>';
    }

    this.container.innerHTML = html;
    this.container.querySelector('[id="' + this.id + '"]')?.remove();
    const marker = document.createElement('div');
    marker.id = this.id;
    marker.style.display = 'none';
    marker.__dt = this;
    this.container.appendChild(marker);
  }

  getPageRange(totalPages) {
    const range = [];
    const curr = this.currentPage;
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      range.push(1);
      if (curr > 3) range.push('...');
      for (let i = Math.max(2, curr - 1); i <= Math.min(totalPages - 1, curr + 1); i++) range.push(i);
      if (curr < totalPages - 2) range.push('...');
      range.push(totalPages);
    }
    return range;
  }

  _findRow(rowId) {
    const id = String(rowId);
    return this.filteredData.find(r => this._rowId(r) === id);
  }

  actionExec(key, rowId) {
    const row = this._findRow(rowId);
    if (row && this.actions) {
      const btn = this.actions.find(a => a.key === key);
      if (btn && btn.handler) btn.handler(row);
    }
  }

  bulkExec(key) {
    if (this.bulkActions) {
      const btn = this.bulkActions.find(b => b.key === key);
      if (btn && btn.handler) {
        const selectedRows = this.filteredData.filter(r => this.selected.has(this._rowId(r)));
        btn.handler(selectedRows);
      }
    }
  }

  rowClick(rowId) {
    if (this.onRowClick) {
      const row = this._findRow(rowId);
      if (row) this.onRowClick(row);
    }
  }

  filterChange(key) {
    const el = document.getElementById(this.id + '_f_' + key);
    if (!el) return;
    const val = el.value;
    if (!this._filterValues) this._filterValues = {};
    this._filterValues[key] = val;

    this.setFilter(row => {
      for (const k in (this._filterValues || {})) {
        const fv = this._filterValues[k];
        if (!fv) continue;
        const rv = String(row[k] || '').toLowerCase();
        if (!rv.includes(fv.toLowerCase())) return false;
      }
      return true;
    });
  }
}
