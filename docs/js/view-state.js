/**
 * view-state.js - View State Management
 *
 * Handles:
 * - Viewed incidents tracking (localStorage)
 * - Sort mode (all, new-updated, new, updated, occurred)
 * - View toggle (list, media, timeline)
 * - Clear viewed functionality
 *
 * Global: ViewState
 * Depends on: App (for re-rendering), Router (for URL updates)
 */

const ViewState = {
    viewedIncidents: new Set(),
    sortMode: 'all',
    listSortMode: 'all',
    mediaSortMode: 'all',
    currentView: 'list',

    init() {
        this.loadViewedState();
        this.initSortDropdown();
        this.initViewToggle();
        this.initClearViewed();
    },

    syncUrlWithFilterState() {
        const route = Router.parseUrl();
        if (route.type !== 'media' && route.type !== 'list') return;

        // Handle ?sort= param
        const sortParam = Router.parseSort();
        if (sortParam && ['new-updated', 'new', 'updated', 'occurred'].includes(sortParam)) {
            this.setSortMode(sortParam, true);
            return;
        }

        // Backward compat: ?filter=new → sort mode new-updated
        if (route.filter === 'new' && this.sortMode === 'all') {
            this.setSortMode('new-updated', true);
        }
    },

    // ==================== VIEWED INCIDENTS ====================

    loadViewedState() {
        const stored = localStorage.getItem('viewedIncidents');
        if (stored) {
            this.viewedIncidents = new Set(JSON.parse(stored));
        }
    },

    saveViewedState() {
        localStorage.setItem('viewedIncidents', JSON.stringify([...this.viewedIncidents]));
    },

    getIncidentId(incident) {
        return incident.filePath.split('/').pop().replace('.md', '');
    },

    isViewed(incident) {
        return this.viewedIncidents.has(this.getIncidentId(incident));
    },

    markAsViewed(incident) {
        const id = this.getIncidentId(incident);
        if (!this.viewedIncidents.has(id)) {
            this.viewedIncidents.add(id);
            this.saveViewedState();
            this.updateViewedUI(id);
        }
    },

    updateViewedUI(id) {
        const row = document.querySelector(`.incident-row[data-incident-id="${id}"]`);
        if (row) {
            row.classList.add('viewed');
        }
    },

    clearViewed() {
        this.viewedIncidents.clear();
        this.saveViewedState();
        document.querySelectorAll('.incident-row.viewed').forEach(row => {
            row.classList.remove('viewed');
        });
    },

    initClearViewed() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href="#clear-viewed"]')) {
                e.preventDefault();
                this.clearViewed();
                alert('Viewed history cleared');
            }
        });
    },

    // ==================== SORT DROPDOWN ====================

    initSortDropdown() {
        const btn = document.getElementById('sort-btn');
        const menu = document.getElementById('sort-menu');
        if (!btn || !menu) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menu.classList.toggle('open');
            menu.setAttribute('aria-hidden', !isOpen);
            btn.classList.toggle('active', isOpen);
        });

        menu.querySelectorAll('.sort-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setSortMode(option.dataset.sort);
                menu.classList.remove('open');
                menu.setAttribute('aria-hidden', 'true');
                btn.classList.remove('active');
            });
        });

        document.addEventListener('click', () => {
            menu.classList.remove('open');
            menu.setAttribute('aria-hidden', 'true');
            btn.classList.remove('active');
        });
    },

    setSortMode(mode, skipRender) {
        // Handle timeline sort modes
        if (mode === 'tl-oldest' || mode === 'tl-newest') {
            const order = mode === 'tl-newest' ? 'newest' : 'oldest';
            if (typeof Timeline !== 'undefined' && Timeline.sortOrder !== order) {
                Timeline.sortOrder = order;
                history.replaceState(null, '', '/timeline');
                Timeline.render();
                window.scrollTo({ top: 0, behavior: 'instant' });
            }
            // Update active state
            const menu = document.getElementById('sort-menu');
            if (menu) {
                menu.querySelectorAll('.sort-option').forEach(opt => {
                    opt.classList.toggle('active', opt.dataset.sort === mode);
                });
            }
            return;
        }

        this.sortMode = mode;

        // Remember per-view sort
        if (this.currentView === 'list') {
            this.listSortMode = mode;
        } else if (this.currentView === 'media') {
            this.mediaSortMode = mode;
        }

        // Update active state in dropdown
        const menu = document.getElementById('sort-menu');
        if (menu) {
            menu.querySelectorAll('.sort-option').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.sort === mode);
            });
        }

        // Backward compat: keep sortByUpdated in sync
        this.sortByUpdated = mode !== 'all';

        // Update nav visibility
        const sectionNav = document.getElementById('section-nav');
        if (sectionNav && this.currentView === 'list') {
            sectionNav.style.display = (mode !== 'all') ? 'none' : '';
        }

        // Update sort button visual — stay highlighted when non-default sort
        const sortBtn = document.getElementById('sort-btn');
        if (sortBtn) {
            sortBtn.classList.toggle('active', mode !== 'all');
        }

        // Update URL
        this.updateUrlWithSort();

        if (!skipRender && typeof App !== 'undefined') {
            App.render();
            if (this.currentView === 'media') {
                App.renderMediaGallery();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    updateUrlWithSort() {
        const basePath = Router.buildUrl(this.currentView);
        const sortParam = this.sortMode !== 'all' ? `?sort-by=${this.sortMode}` : '';
        window.history.replaceState({}, '', basePath + sortParam);
    },

    disableSortByUpdated() {
        this.sortMode = 'all';
        this.sortByUpdated = false;
        const menu = document.getElementById('sort-menu');
        if (menu) {
            menu.querySelectorAll('.sort-option').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.sort === 'all');
            });
        }
    },

    enableSortByUpdated() {
        this.setSortMode('new-updated', true);

        const sectionNav = document.getElementById('section-nav');
        if (sectionNav) {
            sectionNav.style.display = 'none';
        }

        const toggle = document.getElementById('view-toggle');
        if (toggle) {
            toggle.classList.remove('list-active');
        }
    },

    // ==================== VIEW TOGGLE ====================

    initViewToggle() {
        const toggle = document.getElementById('view-toggle');
        if (!toggle) return;

        toggle.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchView(btn.dataset.view);
            });
        });
    },

    switchView(view, skipUrlUpdate) {
        if (this.currentView === 'media' && view !== 'media') {
            MediaGallery.cleanup();
        }

        this.currentView = view;

        // Restore per-view sort mode
        if (view === 'list') {
            this.setSortMode(this.listSortMode, true);
        } else if (view === 'media') {
            this.setSortMode(this.mediaSortMode, true);
        }

        if (!skipUrlUpdate) {
            this.updateUrlView(view);
        }

        const listView = document.getElementById('list-view');
        const mediaGallery = document.getElementById('media-gallery');
        const timelineView = document.getElementById('timeline-view');
        const toggle = document.getElementById('view-toggle');
        const sectionNav = document.getElementById('section-nav');
        const sortDropdown = document.getElementById('sort-dropdown');

        // Update button states
        toggle.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        toggle.classList.toggle('list-active', view === 'list' && this.sortMode === 'all');

        // Show/hide section nav (only for list view with 'all' sort)
        if (sectionNav) {
            sectionNav.style.display = (view === 'list' && this.sortMode === 'all') ? '' : 'none';
        }

        // Show/hide sort dropdown - swap options for timeline
        if (sortDropdown) {
            sortDropdown.style.display = '';
            const menu = document.getElementById('sort-menu');
            if (menu) {
                if (view === 'timeline') {
                    menu.innerHTML = `
                        <div class="sort-menu-header">Sort By</div>
                        <button class="sort-option${Timeline.sortOrder === 'oldest' ? ' active' : ''}" data-sort="tl-oldest">Oldest</button>
                        <button class="sort-option${Timeline.sortOrder === 'newest' ? ' active' : ''}" data-sort="tl-newest">Newest</button>
                    `;
                } else {
                    const currentSort = this.sortMode || 'all';
                    menu.innerHTML = `
                        <div class="sort-menu-header">Sort By</div>
                        <button class="sort-option${currentSort === 'all' ? ' active' : ''}" data-sort="all">${view === 'media' ? 'Featured' : 'Category'}</button>
                        <button class="sort-option${currentSort === 'occurred' ? ' active' : ''}" data-sort="occurred">Occurred</button>
                        <button class="sort-option${currentSort === 'new-updated' ? ' active' : ''}" data-sort="new-updated">New/Updated</button>
                        <button class="sort-option${currentSort === 'new' ? ' active' : ''}" data-sort="new">New</button>
                        <button class="sort-option${currentSort === 'updated' ? ' active' : ''}" data-sort="updated">Updated</button>
                    `;
                }
                // Re-bind click handlers for the new buttons
                menu.querySelectorAll('.sort-option').forEach(option => {
                    option.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.setSortMode(option.dataset.sort);
                        menu.classList.remove('open');
                        menu.setAttribute('aria-hidden', 'true');
                    });
                });
            }
        }
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.style.display = (view === 'timeline') ? 'none' : '';
        }

        // Switch views
        listView.style.display = (view === 'list') ? '' : 'none';
        mediaGallery.style.display = (view === 'media') ? '' : 'none';
        if (timelineView) {
            timelineView.style.display = (view === 'timeline') ? '' : 'none';
        }

        if (view === 'list' && typeof App !== 'undefined') {
            App.render();
        } else if (view === 'media' && typeof App !== 'undefined') {
            App.renderMediaGallery();
        } else if (view === 'timeline' && typeof Timeline !== 'undefined') {
            Timeline.render();
        }
    },

    updateUrlView(view) {
        const basePath = Router.buildUrl(view);
        const sortParam = (view !== 'timeline' && this.sortMode !== 'all') ? `?sort-by=${this.sortMode}` : '';
        window.history.replaceState({}, '', basePath + sortParam);
    },

    getPreferredView() {
        return 'list';
    }
};
