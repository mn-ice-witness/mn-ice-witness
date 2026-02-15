const Search = {
    query: '',
    activeTags: new Set(),
    isOpen: false,

    init() {
        this.btn = document.getElementById('search-btn');
        this.modal = document.getElementById('search-modal');
        this.input = document.getElementById('search-input');
        this.closeBtn = document.getElementById('search-close');
        this.backdrop = this.modal.querySelector('.search-modal-backdrop');
        this.checkboxes = this.modal.querySelectorAll('input[name="search-tag"]');

        this.btn.addEventListener('click', () => this.toggle());
        this.backdrop.addEventListener('click', () => this.close());
        this.closeBtn.addEventListener('click', () => this.close());
        this.input.addEventListener('input', () => this.onInput());
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.close();
            }
        });

        this.checkboxes.forEach(cb => {
            cb.addEventListener('change', () => this.onTagChange(cb));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        this.isOpen = true;
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (window.innerWidth > 768) {
            setTimeout(() => {
                this.input.focus();
                this.input.select();
            }, 50);
        }
    },

    close() {
        this.isOpen = false;
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this.query = this.input.value.trim();
        this.updateButtonState();
        this.applyFilter();
    },

    clear() {
        this.query = '';
        this.input.value = '';
        this.activeTags.clear();
        this.checkboxes.forEach(cb => {
            cb.checked = false;
            cb.closest('.filter-chip').classList.remove('active');
        });
        this.updateButtonState();
        this.applyFilter();
    },

    onInput() {
        this.query = this.input.value.trim();
        this.updateButtonState();
    },

    onTagChange(checkbox) {
        if (checkbox.checked) {
            this.activeTags.add(checkbox.value);
            checkbox.closest('.filter-chip').classList.add('active');
        } else {
            this.activeTags.delete(checkbox.value);
            checkbox.closest('.filter-chip').classList.remove('active');
        }
        this.updateButtonState();
        this.applyFilter();
    },

    hasActiveFilters() {
        return this.query.length > 0 || this.activeTags.size > 0;
    },

    updateButtonState() {
        if (this.hasActiveFilters()) {
            this.btn.classList.add('active');
        } else {
            this.btn.classList.remove('active');
        }
    },

    applyFilter() {
        if (typeof App !== 'undefined') {
            App.render();
            if (ViewState.currentView === 'media') {
                App.renderMediaGallery();
            } else if (ViewState.currentView === 'timeline' && typeof Timeline !== 'undefined') {
                Timeline.computeMonthData();
                Timeline.render();
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Search.init());
