window.__ModuleLoader__.load({
  id: '@ahmed-khaled-z/zadloop-sidebar-panels',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useSyncExternalStore } = React;

    const NS = 'local.sidebarPanels';
    const STORAGE_KEY = '@local/sidebar-panels:v1';
    const STYLE_ID = 'local-sidebar-panels-style';

    const en = {
      inMore: 'In More',
      inSidebar: 'In the sidebar',
      moveToSidebar: 'Show {name} in the sidebar',
      moveToMore: 'Move {name} to More',
      empty: 'No panels yet.',
    };
    const ar = {
      inMore: 'في المزيد',
      inSidebar: 'في الشريط الجانبي',
      moveToSidebar: 'أظهر {name} في الشريط الجانبي',
      moveToMore: 'انقل {name} إلى المزيد',
      empty: 'لا توجد لوحات بعد.',
    };

    // Copies the host menu-row geometry and tokens so these rows read as part of the same menu.
    const CSS = `
.lsp-label{padding:6px 8px;font-size:11px;line-height:15px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary))}
.lsp-row{display:flex;align-items:center;gap:2px;border-radius:var(--dsw-radius-md,8px)}
.lsp-open{display:flex;align-items:center;gap:6px;flex:1;min-width:0;min-height:34px;padding:6px 8px;border:none;border-radius:var(--dsw-radius-md,8px);background:transparent;cursor:pointer;font:inherit;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary);text-align:start}
.lsp-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lsp-dot{flex:none;width:6px;height:6px;border-radius:3px;background:var(--dsw-alias-brand-primary)}
.lsp-toggle{flex:none;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:none;border-radius:var(--dsw-radius-md,8px);background:transparent;cursor:pointer;color:var(--dsw-alias-menu-icon,var(--dsw-alias-label-secondary))}
@media(hover:hover){.lsp-open:hover,.lsp-toggle:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.lsp-open:focus-visible,.lsp-toggle:focus-visible{background:var(--dsw-alias-interactive-bg-hover);outline:none}
.lsp-sep{height:.5px;margin:3px 8px;background:var(--dsw-alias-border-l2)}
.lsp-empty{padding:6px 8px;font-size:12px;color:var(--dsw-alias-label-secondary)}
`;

    /** Persisted ids of panels the user moved into More. */
    function createHiddenStore() {
      const listeners = new Set();
      let ids = read();
      function read() {
        try {
          const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
          return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
        } catch (_error) {
          return [];
        }
      }
      function commit(next) {
        ids = next;
        try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (_error) { /* storage unavailable */ }
        for (const fn of listeners) fn();
      }
      return {
        get: () => ids,
        subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
        reload() { ids = read(); for (const fn of listeners) fn(); },
        set(id, hidden) {
          if (hidden === ids.includes(id)) return;
          commit(hidden ? [...ids, id] : ids.filter((entry) => entry !== id));
        },
      };
    }

    function Icon({ kind }) {
      const common = {
        width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
      };
      // "show": arrow out of the tray to the sidebar; "hide": arrow into the tray.
      return kind === 'show'
        ? h('svg', common, h('path', { d: 'M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3' }), h('path', { d: 'M12 15V4' }), h('path', { d: 'M8 8l4-4 4 4' }))
        : h('svg', common, h('path', { d: 'M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3' }), h('path', { d: 'M12 4v11' }), h('path', { d: 'M8 11l4 4 4-4' }));
    }

    function Row({ entry, hidden, t, onOpen, onDismiss, onToggle }) {
      const action = hidden ? t('moveToSidebar', { name: entry.label }) : t('moveToMore', { name: entry.label });
      return h('div', { className: 'lsp-row' },
        h('button', {
          type: 'button', role: 'menuitem', className: 'lsp-open',
          'aria-current': entry.active ? 'page' : undefined,
          onClick: () => { onDismiss(); onOpen(entry.id); },
        },
        h('span', { className: 'lsp-name' }, entry.label),
        entry.active ? h('span', { className: 'lsp-dot', 'aria-hidden': true }) : null),
        h('button', {
          type: 'button', role: 'menuitem', className: 'lsp-toggle',
          'aria-label': action, title: action,
          onClick: (event) => { event.stopPropagation(); onToggle(entry.id, hidden); },
        }, h(Icon, { kind: hidden ? 'show' : 'hide' })));
    }

    function PanelsMenuSection({ entries = [], onOpen, onPinnedChange, onDismiss, store, useT }) {
      const t = useT();
      const stored = useSyncExternalStore(store.subscribe, store.get);
      const onToggle = (id, hiddenNow) => {
        store.set(id, !hiddenNow);
        onPinnedChange(id, hiddenNow);
      };
      // The sidebar's own pin state is the truth for what is shown; storage only restores it.
      const isHidden = (entry) => entry.pinned === false || (entry.pinned === undefined && stored.includes(entry.id));
      const hidden = entries.filter(isHidden);
      const shown = entries.filter((entry) => !isHidden(entry));
      const row = (entry, isHid) => h(Row, { key: entry.id, entry, hidden: isHid, t, onOpen, onDismiss, onToggle });
      if (entries.length === 0) return h('div', { className: 'lsp-empty' }, t('empty'));
      return h(React.Fragment, null,
        hidden.length > 0 && h('div', { className: 'lsp-label', role: 'presentation' }, t('inMore')),
        hidden.map((entry) => row(entry, true)),
        shown.length > 0 && h('div', { className: 'lsp-label', role: 'presentation' }, t('inSidebar')),
        shown.map((entry) => row(entry, false)),
        h('div', { className: 'lsp-sep', role: 'separator' }));
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en }), 'local-sidebar-panels: en');
        ctx.effect(() => ctx.locale.register(NS, 'ar', ar), 'local-sidebar-panels: ar');
        const t = ctx.locale.bind(NS);
        const useT = () => {
          useSyncExternalStore(ctx.locale.subscribe.bind(ctx.locale), () => ctx.locale.getSnapshot());
          return t;
        };

        ctx.effect(() => {
          const tag = document.createElement('style');
          tag.id = STYLE_ID;
          tag.dataset.plugin = '@ahmed-khaled-z/zadloop-sidebar-panels';
          tag.textContent = CSS;
          document.head.appendChild(tag);
          return () => tag.remove();
        }, 'local-sidebar-panels: styles');

        const store = createHiddenStore();
        ctx.effect(() => {
          const onStorage = (event) => { if (event.key === STORAGE_KEY) store.reload(); };
          window.addEventListener('storage', onStorage);
          return () => window.removeEventListener('storage', onStorage);
        }, 'local-sidebar-panels: cross-tab sync');

        /**
         * The sidebar keeps its pin list in memory only, so saved choices are restored
         * through the pin callback its own registration supplies. When that callback is
         * not reachable, the menu still moves panels; they just reappear after a reload.
         */
        const restore = () => {
          let entries = [];
          try { entries = ctx.slots.entriesOfSlot('sidebar') || []; } catch (_error) { return; }
          for (const entry of entries) {
            const inject = entry && entry.options && entry.options.inject;
            if (typeof inject !== 'function') continue;
            let props;
            try { props = inject(); } catch (_error) { continue; }
            if (props && typeof props.setPinned === 'function') {
              for (const id of store.get()) props.setPinned(id, false);
              return;
            }
          }
        };
        ctx.effect(() => {
          try { return ctx.slots.subscribe('sidebar', restore); } catch (_error) { return () => {}; }
        }, 'local-sidebar-panels: restore on sidebar mount');
        ctx.effect(() => store.subscribe(restore), 'local-sidebar-panels: restore on cross-tab change');
        restore();

        ctx.slots.inject('sidebar.panellist.actions', () => ctx.slots.register({
          name: 'sidebar.panellist.actions',
          id: 'local-sidebar-panels',
          order: -10,
          locale: NS,
          inject: () => ({ store, useT }),
        }, PanelsMenuSection));
      },
    };
  },
});
