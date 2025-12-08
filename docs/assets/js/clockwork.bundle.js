/* ============================================================================
   clockwork.bundle.js — Single-file bundle for Clockwork Production Studio
   - Modules included:
     Core: partials loader, icons loader, theme, sidebar, components
     Router: simple hash-based router (cw.router)
     Forms: validation & helpers (cw.forms)
     Effects: parallax & reveal (cw.effects)
     API: fetch helpers + cache (cw.api)
     UI: toast/snackbar, confirm modal (cw.ui)
     Editor: simple WYSIWYG minimalist (cw.editor)
   - Usage: one file, auto-initializes on DOMContentLoaded.
   ============================================================================ */
(() => {
  'use strict';

  /* =========================
     Utility helpers
     ========================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const safe = fn => (...a) => { try { return fn(...a); } catch (e) { console.error(e); } };

  /* =========================
     CORE: Partials + Icons + Init
     ========================= */
  const core = (() => {
    async function loadPartial(target, url) {
      const el = document.querySelector(target);
      if (!el) return;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed partial: ${url}`);
        el.innerHTML = await res.text();
      } catch (err) { console.warn(err); }
    }

    function loadMaterialSymbols() {
      const href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0';
      if (document.querySelector(`link[href="${href}"]`)) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onerror = () => {
        console.warn('Material Symbols CDN failed. Using local fallback.');
        if (!document.querySelector('link[href="/assets/css/material-fallback.css"]')) {
          const fb = document.createElement('link');
          fb.rel = 'stylesheet';
          fb.href = '/assets/css/material-fallback.css';
          document.head.appendChild(fb);
        }
      };
      document.head.appendChild(link);
    }

    async function autoLoadPartials() {
      await Promise.allSettled([
        loadPartial('#nav-placeholder', '/partials/nav.html'),
        loadPartial('#footer-placeholder', '/partials/footer.html'),
      ]);
    }

    return { loadPartial, loadMaterialSymbols, autoLoadPartials };
  })();

  /* =========================
     THEME: Light/Dark + storage + CSS class toggles
     ========================= */
  const theme = (() => {
    const key = 'cw-theme';
    function apply(themeName) {
      const body = document.body;
      body.dataset.theme = themeName;
      body.classList.toggle('theme-dark', themeName === 'dark');
      body.classList.toggle('theme-light', themeName === 'light');
      // Update buttons that opt-in
      $$( '[data-cw-theme-toggle]' ).forEach(btn => {
        btn.setAttribute('aria-pressed', themeName === 'dark' ? 'true' : 'false');
        btn.textContent = themeName === 'dark' ? 'LIGHT' : 'DARK';
      });
      localStorage.setItem(key, themeName);
    }
    function init() {
      const saved = localStorage.getItem(key);
      const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      apply(saved || system);
      // delegates
      document.addEventListener('click', (e) => {
        const t = e.target.closest('[data-cw-theme-toggle]');
        if (!t) return;
        document.body.classList.add('theme-anim');
        setTimeout(() => document.body.classList.remove('theme-anim'), 600);
        apply(document.body.classList.contains('theme-dark') ? 'light' : 'dark');
      });
    }
    return { init, apply };
  })();

  /* =========================
     SIDEBAR: mobile toggle helpers
     ========================= */
  const sidebar = (() => {
    function init() {
      // connect any element with data-cw-sidebar-toggle to #mobileSidebar or #mySidebar
      document.addEventListener('click', (e) => {
        const t = e.target.closest('[data-cw-sidebar-toggle]');
        if (!t) return;
        const id = t.getAttribute('data-cw-sidebar-target') || '#mobileSidebar';
        const el = document.querySelector(id) || document.getElementById('mySidebar');
        if (!el) return;
        el.classList.toggle('sidebar-open');
        el.classList.toggle('sidebar-closed');
      });
    }
    return { init };
  })();

  /* =========================
     COMPONENTS: dropdowns, modals, popovers
     ========================= */
  const components = (() => {
    function initDropdowns() {
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-cw-dropdown]');
        if (trigger) {
          e.stopPropagation();
          const menu = document.querySelector(trigger.getAttribute('data-cw-dropdown'));
          if (menu) menu.classList.toggle('cw-open');
          return;
        }
        // click-away closes open dropdowns
        $$('.cw-dropdown.cw-open').forEach(d => d.classList.remove('cw-open'));
      });
    }

    function initModals() {
      // open
      document.addEventListener('click', (e) => {
        const op = e.target.closest('[data-cw-modal-open]');
        if (!op) return;
        const sel = op.getAttribute('data-cw-modal-open');
        const modal = document.querySelector(sel);
        if (!modal) return;
        modal.style.display = 'flex';
        modal.classList.add('cw-modal-open');
      });
      // close (data-cw-modal-close or backdrop)
      document.addEventListener('click', (e) => {
        const cl = e.target.closest('[data-cw-modal-close]');
        if (cl) {
          const modal = cl.closest('.cw-modal');
          if (modal) { modal.style.display = 'none'; modal.classList.remove('cw-modal-open'); }
          return;
        }
        // close by clicking backdrop
        if (e.target.classList && e.target.classList.contains('cw-modal')) {
          e.target.style.display = 'none';
          e.target.classList.remove('cw-modal-open');
        }
      });
    }

    function initPopovers() {
      document.addEventListener('click', (e) => {
        const t = e.target.closest('[data-cw-popover]');
        if (!t) {
          $$('.cw-popover').forEach(p => p.style.display = 'none');
          return;
        }
        const sel = t.getAttribute('data-cw-popover');
        const pop = document.querySelector(sel);
        if (!pop) return;
        pop.style.display = pop.style.display === 'block' ? 'none' : 'block';
        e.stopPropagation();
      });
    }

    function init() { initDropdowns(); initModals(); initPopovers(); }
    return { init };
  })();

  /* =========================
     ROUTER: tiny hash-based router
     Usage:
       cw.router.add('/about', () => {});
       cw.router.start();
     ========================= */
  const router = (() => {
    const routes = [];
    function add(path, handler) { routes.push({ path, handler }); }
    function match(hash) {
      const path = hash.replace(/^#/, '') || '/';
      for (const r of routes) {
        if (r.path === path) return r.handler;
        // simple param :id support
        const keys = [];
        const re = new RegExp('^' + r.path.replace(/:([^/]+)/g, (_, k)=> { keys.push(k); return '([^/]+)'; }) + '$');
        const m = path.match(re);
        if (m) {
          const params = {};
          keys.forEach((k,i) => params[k] = m[i+1]);
          return () => r.handler(params);
        }
      }
      return null;
    }
    function navigate(to) { window.location.hash = to; }
    function start() {
      const run = () => {
        const handler = match(location.hash || '#/');
        if (handler) safe(handler)();
      };
      window.addEventListener('hashchange', run);
      run();
    }
    return { add, start, navigate };
  })();

  /* =========================
     FORMS: validation & helpers
     - data attributes: data-cw-validate="required,email,min:3"
     ========================= */
  const forms = (() => {
    function validateField(field, rules = []) {
      const v = field.value.trim();
      for (const r of rules) {
        if (r === 'required' && !v) return { ok: false, err: 'required' };
        if (r === 'email' && v && !/^\S+@\S+\.\S+$/.test(v)) return { ok: false, err: 'email' };
        if (r.startsWith('min:')) {
          const n = Number(r.split(':')[1]);
          if (v.length < n) return { ok: false, err: 'min' };
        }
        if (r.startsWith('max:')) {
          const n = Number(r.split(':')[1]);
          if (v.length > n) return { ok: false, err: 'max' };
        }
      }
      return { ok: true };
    }

    function attachValidation(form) {
      form.addEventListener('submit', (e) => {
        const flds = $$('[data-cw-validate]', form);
        let ok = true;
        for (const fld of flds) {
          const rules = fld.getAttribute('data-cw-validate').split(',').map(s => s.trim());
          const res = validateField(fld, rules);
          fld.classList.toggle('cw-invalid', !res.ok);
          if (!res.ok) {
            ok = false;
            // show tooltip/simple message
            let msg = fld.dataset.cwInvalidMessage || res.err || 'Invalid';
            showInlineError(fld, msg);
          } else removeInlineError(fld);
        }
        if (!ok) e.preventDefault();
      });
    }

    function showInlineError(field, message) {
      removeInlineError(field);
      const el = document.createElement('div');
      el.className = 'cw-inline-error';
      el.textContent = message;
      field.insertAdjacentElement('afterend', el);
    }
    function removeInlineError(field) {
      const nxt = field.nextElementSibling;
      if (nxt && nxt.classList.contains('cw-inline-error')) nxt.remove();
    }

    function init() {
      document.addEventListener('submit', (e) => {
        const form = e.target;
        if (!(form instanceof HTMLFormElement)) return;
        if ($('[data-cw-validate]', form)) attachValidation(form);
      }, true);
    }
    return { init, validateField, attachValidation };
  })();

  /* =========================
     EFFECTS: parallax & reveal
     ========================= */
  const effects = (() => {
    function initParallax() {
      const items = $$('[data-cw-parallax]');
      if (!items.length) return;
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        items.forEach(el => {
          const speed = Number(el.dataset.cwParallax) || 0.2;
          el.style.transform = `translateY(${y * speed}px)`;
        });
      }, { passive: true });
    }

    function initReveal() {
      const els = $$('[data-cw-reveal]');
      if (!els.length) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            en.target.classList.add('cw-revealed');
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.15 });
      els.forEach(e => io.observe(e));
    }

    function init() { initParallax(); initReveal(); }
    return { init };
  })();

  /* =========================
     API: fetch helpers + simple cache
     ========================= */
  const api = (() => {
    const cache = new Map();
    async function fetchJSON(url, { cacheTTL = 0, force = false } = {}) {
      if (!force && cacheTTL > 0 && cache.has(url)) {
        const entry = cache.get(url);
        if ((Date.now() - entry.time) < cacheTTL) return entry.data;
      }
      const res = await fetch(url, { headers: { 'Accept': 'application/json' }});
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      if (cacheTTL > 0) cache.set(url, { time: Date.now(), data });
      return data;
    }
    return { fetchJSON, cache };
  })();

  /* =========================
     UI: toast/snackbar, confirm modal
     ========================= */
  const ui = (() => {
    let toastEl = null;

    function _createToast() {
      toastEl = document.createElement('div');
      toastEl.id = 'cw-toast';
      toastEl.style.position = 'fixed';
      toastEl.style.right = '16px';
      toastEl.style.bottom = '16px';
      toastEl.style.zIndex = '99999';
      toastEl.style.maxWidth = '320px';
      document.body.appendChild(toastEl);
    }

    function toast(message, opts = {}) {
      if (!toastEl) _createToast();
      const t = document.createElement('div');
      t.className = 'cw-toast-item';
      t.textContent = message;
      t.style.marginTop = '8px';
      t.style.padding = '12px 16px';
      t.style.borderRadius = '8px';
      t.style.boxShadow = '0 6px 18px rgba(0,0,0,0.25)';
      t.style.background = opts.background || 'var(--cw-accent, #d99343)';
      t.style.color = opts.color || 'var(--cw-bg, #0e0e0f)';
      toastEl.appendChild(t);
      setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateY(8px)';
        setTimeout(() => t.remove(), 400);
      }, opts.duration || 3500);
    }

    async function confirm(message, opts = {}) {
      // simple promise-based confirm using a modal template created on demand
      const modalId = 'cw-confirm-modal';
      let modal = document.getElementById(modalId);
      if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'cw-modal';
        Object.assign(modal.style, {
          display: 'none',
          position: 'fixed',
          inset: '0',
          background: 'rgba(0,0,0,0.45)',
          alignItems: 'center', justifyContent: 'center', zIndex: 99998
        });
        modal.innerHTML = `
          <div class="cw-modal-content" role="dialog" aria-modal="true" style="width:380px;padding:18px;border-radius:10px;">
            <div class="cw-modal-body" style="margin-bottom:12px"></div>
            <div style="text-align:right;">
              <button data-cw-confirm-cancel class="cw-btn">Cancel</button>
              <button data-cw-confirm-ok class="cw-btn" style="margin-left:8px;">OK</button>
            </div>
          </div>`;
        document.body.appendChild(modal);
      }
      modal.querySelector('.cw-modal-body').textContent = message;
      modal.style.display = 'flex';
      return new Promise((resolve) => {
        const ok = modal.querySelector('[data-cw-confirm-ok]');
        const cancel = modal.querySelector('[data-cw-confirm-cancel]');
        const done = (val) => {
          modal.style.display = 'none';
          ok.removeEventListener('click', onOk);
          cancel.removeEventListener('click', onCancel);
          resolve(val);
        };
        const onOk = () => done(true);
        const onCancel = () => done(false);
        ok.addEventListener('click', onOk);
        cancel.addEventListener('click', onCancel);
      });
    }

    return { toast, confirm };
  })();

  /* =========================
     EDITOR: tiny WYSIWYG
     - transforms contenteditable areas with data-cw-editor
     - basic toolbar (bold, italic, link, code)
     ========================= */
  const editor = (() => {
    function toolbarHtml() {
      return `<div class="cw-editor-toolbar" style="display:flex;gap:8px;margin-bottom:8px;">
        <button data-cw-editor-cmd="bold" class="cw-btn">B</button>
        <button data-cw-editor-cmd="italic" class="cw-btn">I</button>
        <button data-cw-editor-cmd="code" class="cw-btn">&lt;/&gt;</button>
        <button data-cw-editor-cmd="link" class="cw-btn">🔗</button>
      </div>`;
    }

    function bindEditor(area) {
      // create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'cw-editor';
      wrapper.style.minHeight = '120px';
      const toolbar = document.createElement('div');
      toolbar.innerHTML = toolbarHtml();
      wrapper.appendChild(toolbar);

      const editable = document.createElement('div');
      editable.contentEditable = 'true';
      editable.className = 'cw-editor-area';
      editable.style.minHeight = '80px';
      editable.innerHTML = area.value || area.innerHTML || '';
      wrapper.appendChild(editable);
      area.style.display = 'none';
      area.parentNode.insertBefore(wrapper, area);

      toolbar.querySelectorAll('[data-cw-editor-cmd]').forEach(btn => {
        btn.addEventListener('click', () => {
          const cmd = btn.getAttribute('data-cw-editor-cmd');
          if (cmd === 'link') {
            const url = prompt('Enter URL');
            if (url) document.execCommand('createLink', false, url);
            return;
          }
          if (cmd === 'code') {
            document.execCommand('formatBlock', false, 'pre');
            return;
          }
          document.execCommand(cmd, false, null);
        });
      });

      // sync back to textarea on form submit
      const form = area.closest('form');
      if (form) {
        form.addEventListener('submit', () => {
          area.value = editable.innerHTML;
        });
      }
    }

    function init() {
      $$('[data-cw-editor]').forEach(el => {
        if (el.tagName.toLowerCase() === 'textarea' || el.tagName.toLowerCase() === 'div') bindEditor(el);
      });
    }

    return { init, bindEditor };
  })();

  /* =========================
     INIT: wire everything up
     ========================= */
  function initAll() {
    core.autoLoadPartials();
    core.loadMaterialSymbols();
    theme.init();
    sidebar.init();
    components.init();
    forms.init();
    effects.init();
    editor.init();
    // expose mini APIs
    window.cw = window.cw || {};
    Object.assign(window.cw, {
      theme, router, forms, effects, api, ui, editor,
    });
    // small autos:
    // find anchors that want SPA-style navigation: data-cw-link="/path"
    document.addEventListener('click', (e) => {
      const a = e.target.closest('[data-cw-link]');
      if (!a) return;
      e.preventDefault();
      const path = a.getAttribute('data-cw-link');
      router.navigate(path);
    });
  }

  document.addEventListener('DOMContentLoaded', initAll);

  /* =========================
     Export (light)
     ========================= */
  // keep the bundle self-contained; useful modules are exposed at window.cw
})();

// ============================================================================
// FINAL INIT — starts all modules then fires ready event
// ============================================================================
window.cw = { core, theme, sidebar, components, router, forms, effects, api, ui, editor };

document.addEventListener("DOMContentLoaded", () => {
  core.loadMaterialSymbols();
  core.autoLoadPartials();
  theme.init();
  sidebar.init();
  components.init();
  forms.init();
  effects.init();
  
  // Your app may use the router optionally
  if (cw.router && cw.router.start) cw.router.start();

  // 🔥 Dispatch ready event so external JS can connect
  document.dispatchEvent(new Event("cw:ready"));
});

