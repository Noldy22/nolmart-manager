// js/custom-select.js
// Replaces native <select class="form-select"> popups (unstylable on phones) with a
// dark-theme dropdown / bottom-sheet. The native <select> stays in the DOM as the
// source of truth, so existing code (.value, 'change' events, form.reset()) keeps working.

const valueDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
const indexDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex');

let panel = null;
let backdrop = null;
let activeSelect = null;

function ensurePanel() {
  if (panel) return;
  backdrop = document.createElement('div');
  backdrop.className = 'cs-backdrop';
  backdrop.addEventListener('click', closePanel);
  panel = document.createElement('div');
  panel.className = 'cs-panel';
  panel.setAttribute('role', 'listbox');
  document.body.appendChild(backdrop);
  document.body.appendChild(panel);

  document.addEventListener('keydown', (e) => {
    if (!activeSelect) return;
    if (e.key === 'Escape') { closePanel(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = [...panel.querySelectorAll('.cs-option')];
      let idx = items.findIndex(i => i.classList.contains('cs-focus'));
      if (idx < 0) idx = items.findIndex(i => i.classList.contains('cs-selected'));
      idx = e.key === 'ArrowDown' ? Math.min(items.length - 1, idx + 1) : Math.max(0, idx - 1);
      items.forEach(i => i.classList.remove('cs-focus'));
      items[idx]?.classList.add('cs-focus');
      items[idx]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      const f = panel.querySelector('.cs-option.cs-focus');
      if (f) { e.preventDefault(); f.click(); }
    }
  });
  window.addEventListener('resize', closePanel);
}

function closePanel() {
  if (!panel) return;
  panel.classList.remove('open', 'cs-sheet');
  backdrop.classList.remove('open');
  if (activeSelect?._csTrigger) activeSelect._csTrigger.classList.remove('cs-open');
  activeSelect = null;
}

function selectedLabel(select) {
  const opt = select.options[select.selectedIndex];
  return opt ? opt.textContent.trim() : '';
}

function syncTrigger(select) {
  const t = select._csTrigger;
  if (!t) return;
  t.querySelector('.cs-label').textContent = selectedLabel(select) || 'Select…';
  t.disabled = select.disabled;
}

function openPanel(select) {
  ensurePanel();
  if (activeSelect === select) { closePanel(); return; }
  closePanel();
  activeSelect = select;

  const frag = document.createDocumentFragment();
  const addOption = (opt, parent) => {
    const el = document.createElement('div');
    el.className = 'cs-option' + (opt.index === select.selectedIndex ? ' cs-selected' : '');
    el.setAttribute('role', 'option');
    el.textContent = opt.textContent.trim();
    if (opt.disabled) el.classList.add('cs-disabled');
    el.addEventListener('click', () => {
      if (opt.disabled) return;
      select.selectedIndex = opt.index;
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
      closePanel();
      select._csTrigger?.focus({ preventScroll: true });
    });
    parent.appendChild(el);
  };
  [...select.children].forEach(child => {
    if (child.tagName === 'OPTGROUP') {
      const h = document.createElement('div');
      h.className = 'cs-group';
      h.textContent = child.label;
      frag.appendChild(h);
      [...child.children].forEach(o => addOption(o, frag));
    } else if (child.tagName === 'OPTION') {
      addOption(child, frag);
    }
  });
  panel.innerHTML = '';
  panel.appendChild(frag);

  const trigger = select._csTrigger;
  trigger.classList.add('cs-open');
  const rect = trigger.getBoundingClientRect();

  if (window.innerWidth <= 640) {
    panel.classList.add('cs-sheet');
    panel.style.cssText = '';
  } else {
    const maxH = 280;
    const below = window.innerHeight - rect.bottom - 12;
    const openUp = below < 160 && rect.top > below;
    const h = Math.min(maxH, openUp ? rect.top - 12 : below);
    panel.style.left = rect.left + 'px';
    panel.style.width = rect.width + 'px';
    panel.style.maxHeight = h + 'px';
    panel.style.top = openUp ? 'auto' : (rect.bottom + 6) + 'px';
    panel.style.bottom = openUp ? (window.innerHeight - rect.top + 6) + 'px' : 'auto';
  }

  backdrop.classList.add('open');
  panel.classList.add('open');
  panel.querySelector('.cs-selected')?.scrollIntoView({ block: 'center' });
}

function enhance(select) {
  if (select._csTrigger) return;

  const wrap = document.createElement('div');
  wrap.className = 'cs-wrap';
  select.parentNode.insertBefore(wrap, select);
  wrap.appendChild(select);
  select.classList.add('cs-native');
  select.tabIndex = -1;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'cs-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.innerHTML = '<span class="cs-label"></span><svg class="cs-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
  wrap.appendChild(trigger);
  select._csTrigger = trigger;

  trigger.addEventListener('click', () => openPanel(select));

  // Keep trigger label in sync when code sets value / selectedIndex programmatically
  Object.defineProperty(select, 'value', {
    configurable: true,
    get() { return valueDesc.get.call(this); },
    set(v) { valueDesc.set.call(this, v); syncTrigger(this); }
  });
  Object.defineProperty(select, 'selectedIndex', {
    configurable: true,
    get() { return indexDesc.get.call(this); },
    set(v) { indexDesc.set.call(this, v); syncTrigger(this); }
  });

  select.addEventListener('change', () => syncTrigger(select));
  new MutationObserver(() => syncTrigger(select)).observe(select, {
    childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'selected']
  });
  if (select.form) select.form.addEventListener('reset', () => setTimeout(() => syncTrigger(select), 0));

  syncTrigger(select);
}

export function initCustomSelects(root = document) {
  root.querySelectorAll('select.form-select').forEach(enhance);
}
