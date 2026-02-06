/**
 * timeline.js - Interactive Timeline View
 *
 * Self-contained module that renders a scrollable timeline of the MN ICE crisis.
 * Shows incidents by month/day with running category totals and narrative moments.
 *
 * Global: Timeline
 * Depends on: App (for incident data), Lightbox (for opening incidents)
 */

const Timeline = {
    moments: [],
    monthData: [],
    countedDays: new Set(),
    totals: { citizens: 0, observers: 0, immigrants: 0, 'schools-hospitals': 0 },
    initialized: false,
    observer: null,
    sortOrder: 'oldest',

    async render() {
        const container = document.getElementById('timeline-view');
        if (!container) return;

        if (!this.initialized) {
            await this.init();
        }

        container.innerHTML = this.buildHTML();
        this.initScrollObserver();
        this.initClickHandlers();
    },

    async init() {
        await this.loadMoments();
        this.computeMonthData();
        this.initialized = true;
    },

    async loadMoments() {
        const resp = await fetch('/data/timeline-moments.md');
        const text = await resp.text();
        this.moments = this.parseMoments(text);
    },

    parseMoments(text) {
        // Match blocks: ---\nfields\n---\nbody (separated by blank lines)
        const pattern = /---\n([\s\S]*?)\n---\n([\s\S]*?)(?=\n\n---|$)/g;
        const moments = [];
        let match;

        while ((match = pattern.exec(text)) !== null) {
            const fields = match[1];
            const body = match[2].trim();

            const dateMatch = fields.match(/date:\s*(\S+)/);
            const titleMatch = fields.match(/title:\s*(.+)/);
            const incidentMatch = fields.match(/incident:\s*(\S+)/);
            const sourceMatch = fields.match(/source:\s*(\S+)/);
            const imageMatch = fields.match(/image:\s*(\S+)/);

            if (dateMatch && titleMatch) {
                moments.push({
                    date: dateMatch[1],
                    title: titleMatch[1].trim(),
                    incident: (incidentMatch && incidentMatch[1].trim()) || null,
                    source: (sourceMatch && sourceMatch[1].trim()) || null,
                    image: (imageMatch && imageMatch[1].trim()) || null,
                    body: body
                });
            }
        }
        return moments;
    },

    computeMonthData() {
        const incidents = (typeof App !== 'undefined') ? App.getFilteredIncidents() : [];
        const byDate = {};

        for (const incident of incidents) {
            if (!byDate[incident.date]) {
                byDate[incident.date] = [];
            }
            byDate[incident.date].push(incident);
        }

        const allDates = new Set([
            ...Object.keys(byDate),
            ...this.moments.map(m => m.date)
        ]);
        const sortedDates = [...allDates].sort();

        const monthMap = {};
        for (const date of sortedDates) {
            const [year, month] = date.split('-');
            const key = `${year}-${month}`;
            if (!monthMap[key]) {
                monthMap[key] = { year, month, key, days: [] };
            }

            const dayIncidents = byDate[date] || [];
            const dayMoments = this.moments.filter(m => m.date === date);
            const counts = this.countCategories(dayIncidents);

            monthMap[key].days.push({
                date,
                incidents: dayIncidents,
                moments: dayMoments,
                counts
            });
        }

        this.monthData = Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key));

        // Compute grand totals for newest-first mode
        this.grandTotals = { citizens: 0, observers: 0, immigrants: 0, 'schools-hospitals': 0 };
        for (const month of this.monthData) {
            for (const day of month.days) {
                for (const cat in day.counts) {
                    if (cat in this.grandTotals) this.grandTotals[cat] += day.counts[cat];
                }
            }
        }
    },

    countCategories(incidents) {
        const counts = { citizens: 0, observers: 0, immigrants: 0, 'schools-hospitals': 0 };
        for (const incident of incidents) {
            const types = Array.isArray(incident.type) ? incident.type : [incident.type];
            for (const t of types) {
                if (t in counts) counts[t]++;
            }
        }
        return counts;
    },

    buildHTML() {
        let html = '';
        html += '<div class="tl-totals-bar">';
        html += this.buildTotalsHTML();
        html += '</div>';
        html += '<div class="tl-content">';

        const months = this.sortOrder === 'newest' ? [...this.monthData].reverse() : this.monthData;
        let currentYear = null;
        for (const month of months) {
            if (month.year !== currentYear) {
                currentYear = month.year;
                html += `<div class="tl-year"><span>${currentYear}</span></div>`;
            }
            html += this.buildMonthHTML(month);
        }

        html += '</div>';
        return html;
    },

    buildTotalsHTML() {
        return `
            <div class="tl-current-date" id="tl-current-date"></div>
            <div class="tl-totals-group">
                <div class="tl-total tl-total-citizens">
                    <span class="tl-count" id="tl-count-citizens">0</span>
                    <span class="tl-total-label">Citizen/Legal</span>
                </div>
                <div class="tl-total tl-total-observers">
                    <span class="tl-count" id="tl-count-observers">0</span>
                    <span class="tl-total-label">Observers</span>
                </div>
                <div class="tl-total tl-total-immigrants">
                    <span class="tl-count" id="tl-count-immigrants">0</span>
                    <span class="tl-total-label">Immigrants</span>
                </div>
                <div class="tl-total tl-total-schools">
                    <span class="tl-count" id="tl-count-schools-hospitals">0</span>
                    <span class="tl-total-label">Schools</span>
                </div>
            </div>
            <div class="tl-totals-note">Count of collected media reports, not total events in state</div>
        `;
    },

    buildMonthHTML(month) {
        const monthName = new Date(month.year, parseInt(month.month) - 1).toLocaleString('en-US', { month: 'long' });
        let html = `<div class="tl-month">`;
        html += `<h3 class="tl-month-label">${monthName} ${month.year}</h3>`;

        const days = this.sortOrder === 'newest' ? [...month.days].reverse() : month.days;
        for (const day of days) {
            for (const moment of day.moments) {
                html += this.buildMomentHTML(moment);
            }
            if (day.incidents.length > 0) {
                html += this.buildDayHTML(day);
            }
        }

        html += '</div>';
        return html;
    },

    buildMomentHTML(moment) {
        const dateObj = new Date(moment.date + 'T12:00:00');
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        let clickAttr = '';
        let clickClass = '';
        if (moment.incident) {
            clickAttr = `data-incident-slug="${moment.incident}"`;
            clickClass = ' tl-moment-clickable';
        } else if (moment.source) {
            clickAttr = `data-source-url="${moment.source}"`;
            clickClass = ' tl-moment-clickable';
        }

        let imgHTML = '';
        if (moment.image !== 'false') {
            let imgSrc = null;
            // 1. Custom image from moments config
            if (moment.image && moment.image !== 'false') {
                imgSrc = moment.image.startsWith('/') ? moment.image : '/' + moment.image;
            }
            // 2. OG image or primary media from incident
            if (!imgSrc && moment.incident) {
                const incident = this.findIncident(moment.incident);
                if (incident) {
                    if (incident.localMediaOgPath) {
                        imgSrc = '/' + incident.localMediaOgPath;
                    } else if (incident.localMediaPath && incident.localMediaType === 'image') {
                        imgSrc = '/' + incident.localMediaPath;
                    }
                }
            }
            if (imgSrc) {
                imgHTML = `<img class="tl-moment-img" src="${imgSrc}" alt="" loading="lazy">`;
            }
        }

        let sourceHTML = '';
        if (moment.source && !moment.incident) {
            try {
                const hostname = new URL(moment.source).hostname.replace('www.', '');
                sourceHTML = `<a class="tl-moment-source" href="${moment.source}">${hostname} →</a>`;
            } catch {
                sourceHTML = `<a class="tl-moment-source" href="${moment.source}">Source article →</a>`;
            }
        }

        return `
            <div class="tl-moment${clickClass}" ${clickAttr}>
                <div class="tl-moment-line"></div>
                <div class="tl-moment-content">
                    <div class="tl-moment-date">${dateStr}</div>
                    <h4 class="tl-moment-title">${moment.title}</h4>
                    ${imgHTML}
                    <p class="tl-moment-desc">${this.renderLinks(moment.body)}</p>
                    ${sourceHTML}
                </div>
            </div>
        `;
    },

    buildDayHTML(day) {
        const dateObj = new Date(day.date + 'T12:00:00');
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const countStr = day.incidents.length === 1 ? '1 incident' : `${day.incidents.length} incidents`;
        const countsJson = JSON.stringify(day.counts);

        let titlesHTML = '';
        for (let i = 0; i < day.incidents.length; i++) {
            const inc = day.incidents[i];
            const slug = App.getIncidentId(inc);
            const tag = this.getCategoryTag(inc);
            titlesHTML += `<div class="tl-day-incident" data-incident-slug="${slug}"><span class="tl-cat-tag">${tag}:</span> ${inc.title}</div>`;
        }

        return `
            <div class="tl-day" data-date="${day.date}" data-counts='${countsJson}'>
                <div class="tl-day-marker"></div>
                <div class="tl-day-body">
                    <div class="tl-day-header">
                        <span class="tl-day-date">${dateStr}</span>
                        <span class="tl-day-count">${countStr}</span>
                    </div>
                    <div class="tl-day-titles">${titlesHTML}</div>
                </div>
            </div>
        `;
    },

    categoryLabels: {
        'citizens': 'CITIZEN/LEGAL',
        'observers': 'OBSERVER',
        'immigrants': 'IMMIGRANT',
        'schools-hospitals': 'SCHOOLS',
        'response': 'RESPONSE',
        'background': 'BACKGROUND'
    },

    renderLinks(text) {
        return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
            '<a class="tl-inline-link" href="$2">$1</a>');
    },

    getCategoryTag(incident) {
        const types = Array.isArray(incident.type) ? incident.type : [incident.type];
        return this.categoryLabels[types[0]] || types[0].toUpperCase();
    },

    findIncident(slug) {
        if (typeof App === 'undefined') return null;
        return App.incidents.find(i => {
            const id = i.filePath.split('/').pop().replace('.md', '');
            return id === slug;
        });
    },

    initScrollObserver() {
        if (this._scrollHandler) {
            window.removeEventListener('scroll', this._scrollHandler);
        }

        // For newest-first, show grand totals always; for oldest, seed with first day
        this.countedDays.clear();
        if (this.sortOrder === 'newest') {
            this.totals = { ...this.grandTotals };
            const lastMonth = this.monthData[this.monthData.length - 1];
            const lastDay = lastMonth && lastMonth.days[lastMonth.days.length - 1];
            if (lastDay) this.updateCurrentDate(lastDay.date);
        } else {
            this.totals = { citizens: 0, observers: 0, immigrants: 0, 'schools-hospitals': 0 };
            const firstDay = this.monthData[0] && this.monthData[0].days[0];
            if (firstDay) {
                this.countedDays.add(firstDay.date);
                for (const cat in firstDay.counts) {
                    this.totals[cat] += firstDay.counts[cat];
                }
                this.updateCurrentDate(firstDay.date);
            }
        }
        this.updateTotalsDisplay();

        this._scrollTicking = false;
        this._scrollHandler = () => {
            if (!this._scrollTicking) {
                this._scrollTicking = true;
                requestAnimationFrame(() => {
                    this.onScroll();
                    this._scrollTicking = false;
                });
            }
        };
        window.addEventListener('scroll', this._scrollHandler, { passive: true });
        // Run once immediately to handle initial visible state
        requestAnimationFrame(() => this.onScroll());
    },

    onScroll() {
        const container = document.getElementById('timeline-view');
        if (!container || container.style.display === 'none') return;

        const totalsBar = container.querySelector('.tl-totals-bar');
        if (!totalsBar) return;
        const triggerY = totalsBar.getBoundingClientRect().bottom;

        // Find the current date from the closest scrolled-past element
        let currentDate = null;
        let closestTop = -Infinity;

        const dayEls = container.querySelectorAll('.tl-day');
        const momentEls = container.querySelectorAll('.tl-moment');

        for (const el of dayEls) {
            const rect = el.getBoundingClientRect();
            if (rect.top < triggerY && rect.top > closestTop) {
                closestTop = rect.top;
                currentDate = el.dataset.date;
            }
        }
        for (const el of momentEls) {
            const rect = el.getBoundingClientRect();
            if (rect.top < triggerY && rect.top > closestTop) {
                closestTop = rect.top;
                const dateEl = el.querySelector('.tl-moment-date');
                if (dateEl) currentDate = dateEl.textContent;
            }
        }

        // Newest-first: always show grand totals, just update date
        if (this.sortOrder === 'newest') {
            this.updateCurrentDate(currentDate);
            return;
        }

        // Oldest-first: accumulate totals as user scrolls
        const newCounted = new Set();
        const newTotals = { citizens: 0, observers: 0, immigrants: 0, 'schools-hospitals': 0 };

        for (const el of dayEls) {
            const rect = el.getBoundingClientRect();
            if (rect.top < triggerY) {
                const date = el.dataset.date;
                newCounted.add(date);
                const counts = JSON.parse(el.dataset.counts);
                for (const cat in counts) {
                    newTotals[cat] += counts[cat];
                }
            }
        }

        // Always include first day so counters never show zeros
        const firstDay = this.monthData[0] && this.monthData[0].days[0];
        if (firstDay && !newCounted.has(firstDay.date)) {
            newCounted.add(firstDay.date);
            for (const cat in firstDay.counts) {
                newTotals[cat] += firstDay.counts[cat];
            }
            if (!currentDate) currentDate = firstDay.date;
        }

        // Update totals if changed
        let changed = false;
        for (const cat in newTotals) {
            if (newTotals[cat] !== this.totals[cat]) {
                changed = true;
                break;
            }
        }
        if (changed) {
            this.countedDays = newCounted;
            this.totals = newTotals;
            this.updateTotalsDisplay();
        }

        // Update current date display
        this.updateCurrentDate(currentDate);
    },

    updateCurrentDate(date) {
        const el = document.getElementById('tl-current-date');
        if (!el) return;

        if (!date) {
            el.textContent = '';
            return;
        }

        // date could be a formatted string from a moment, or a YYYY-MM-DD from a day
        let display = date;
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            const d = new Date(date + 'T12:00:00');
            display = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        } else {
            // Convert moment date strings like "January 12" to full format
            const parsed = new Date(date + ', 2026');
            if (!isNaN(parsed)) {
                display = parsed.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            }
        }
        if (el.textContent !== display) {
            el.textContent = display;
        }
    },

    updateTotalsDisplay() {
        for (const cat of ['citizens', 'observers', 'immigrants', 'schools-hospitals']) {
            const el = document.getElementById(`tl-count-${cat}`);
            if (el) {
                const newVal = this.totals[cat];
                if (el.textContent !== String(newVal)) {
                    el.textContent = newVal;
                    el.classList.remove('tl-count-pop');
                    void el.offsetWidth;
                    el.classList.add('tl-count-pop');
                }
            }
        }
    },

    initClickHandlers() {
        const container = document.getElementById('timeline-view');
        if (this._clickHandler) {
            container.removeEventListener('click', this._clickHandler);
        }

        this._clickHandler = (e) => {
            // Let inline links and source links navigate normally
            if (e.target.closest('.tl-inline-link') || e.target.closest('.tl-moment-source')) return;

            const momentEl = e.target.closest('.tl-moment-clickable');
            if (momentEl) {
                if (momentEl.dataset.incidentSlug) {
                    this.openIncident(momentEl.dataset.incidentSlug);
                } else if (momentEl.dataset.sourceUrl) {
                    window.location.href = momentEl.dataset.sourceUrl;
                }
                return;
            }

            const incidentEl = e.target.closest('.tl-day-incident');
            if (incidentEl) {
                const slug = incidentEl.dataset.incidentSlug;
                this.openIncident(slug);
                return;
            }
        };
        container.addEventListener('click', this._clickHandler);
    },

    openIncident(slug) {
        if (typeof App === 'undefined' || typeof Lightbox === 'undefined') return;
        const incident = this.findIncident(slug);
        if (incident) {
            Lightbox.open(incident);
        }
    }
};
