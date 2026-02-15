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
    _allMonthsLoaded: false,
    observer: null,
    sortOrder: 'oldest',

    monthFiles: [
        '/data/timeline-moments-2025-12.md',
        '/data/timeline-moments-2026-01.md',
        '/data/timeline-moments-2026-02.md',
    ],

    async render() {
        const container = document.getElementById('timeline-view');
        if (!container) return;

        // Capture hash before async init (fetch) or rAF can change it
        const targetDate = window.location.hash.slice(1) || null;

        if (!this.initialized) {
            await this.init();
        }

        container.innerHTML = this.buildHTML();

        // Measure sticky bar and set CSS scroll clearance for anchor navigation
        const totalsBar = container.querySelector('.tl-totals-bar');
        if (totalsBar) {
            const clearance = 48 + totalsBar.offsetHeight + 12;
            container.style.setProperty('--tl-scroll-clearance', clearance + 'px');
        }

        this.initScrollObserver();
        this.initClickHandlers();
        this.scrollToDate(targetDate);

        if (!this._allMonthsLoaded) {
            this.loadRemainingMonths();
        }
    },

    async init() {
        const firstFile = this.monthFiles[0];
        const resp = await fetch(firstFile);
        const text = await resp.text();
        this.moments = this.parseMoments(text);
        this.computeMonthData();
        this.initialized = true;
    },

    async loadRemainingMonths() {
        if (this._loadingRemaining) return;
        this._loadingRemaining = true;

        const remaining = this.monthFiles.slice(1);
        const results = await Promise.all(
            remaining.map(f => fetch(f).then(r => r.text()))
        );

        for (const text of results) {
            this.moments.push(...this.parseMoments(text));
        }

        this.moments.sort((a, b) => a.date.localeCompare(b.date));
        this._allMonthsLoaded = true;
        this.computeMonthData();

        const container = document.getElementById('timeline-view');
        if (!container || container.style.display === 'none') return;

        const currentDate = this._lastHashDate;
        container.innerHTML = this.buildHTML();

        const totalsBar = container.querySelector('.tl-totals-bar');
        if (totalsBar) {
            const clearance = 48 + totalsBar.offsetHeight + 12;
            container.style.setProperty('--tl-scroll-clearance', clearance + 'px');
        }

        this.initScrollObserver();
        this.initClickHandlers();

        if (currentDate && currentDate !== this.getFirstDate()) {
            this.scrollToDate(currentDate);
        }
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
            const updateForMatch = fields.match(/update-for:\s*(\S+)/);
            const sourceMatch = fields.match(/source:\s*(\S+)/);
            const imageMatch = fields.match(/image:\s*(\S+)/);

            if (dateMatch && titleMatch) {
                const isUpdate = !!updateForMatch;
                const incident = isUpdate
                    ? (updateForMatch[1].trim())
                    : ((incidentMatch && incidentMatch[1].trim()) || null);
                moments.push({
                    date: dateMatch[1],
                    title: titleMatch[1].trim(),
                    incident,
                    isUpdate,
                    source: (sourceMatch && sourceMatch[1].trim()) || null,
                    image: (imageMatch && imageMatch[1].trim()) || null,
                    body: body
                });
            }
        }
        return moments;
    },

    getFilteredMoments() {
        const query = (typeof Search !== 'undefined' && Search.query) ? Search.query.toLowerCase().trim() : '';
        const activeTags = (typeof Search !== 'undefined' && Search.activeTags) ? Search.activeTags : new Set();
        if (!query && activeTags.size === 0) return this.moments;

        const topicTags = [...activeTags].filter(t => !t.startsWith('src:'));
        const sourceTags = [...activeTags].filter(t => t.startsWith('src:'));

        let stemmedTerms = [];
        if (query) {
            const terms = query.split(/\s+/).filter(t => t.length > 0);
            stemmedTerms = terms.map(t => App.stem(t));
        }

        return this.moments.filter(m => {
            if (stemmedTerms.length > 0) {
                const searchText = [m.title, m.body].join(' ').toLowerCase();
                const words = searchText.match(/\b\w+\b/g) || [];
                const stemmedWords = new Set(words.map(w => App.stem(w)));
                if (!stemmedTerms.every(st => stemmedWords.has(st))) return false;
            }

            if (activeTags.size > 0) {
                const incident = m.incident ? this.findIncident(m.incident) : null;
                const tags = incident ? (incident.searchTags || []) : [];
                const topicMatch = topicTags.length === 0 || topicTags.some(t => tags.includes(t));
                const sourceMatch = sourceTags.length === 0 || sourceTags.some(t => tags.includes(t));
                if (!topicMatch || !sourceMatch) return false;
            }

            return true;
        });
    },

    computeMonthData() {
        const incidents = (typeof App !== 'undefined') ? App.getFilteredIncidents() : [];
        const filteredMoments = this.getFilteredMoments();
        const byDate = {};

        for (const incident of incidents) {
            if (!byDate[incident.date]) {
                byDate[incident.date] = [];
            }
            byDate[incident.date].push(incident);
        }

        // Build map of date -> set of incident slugs that have curated moments on that date
        // Only non-update moments suppress the day listing (update moments appear on different dates)
        this.momentSlugsByDate = {};
        for (const m of filteredMoments) {
            if (m.incident && !m.isUpdate) {
                if (!this.momentSlugsByDate[m.date]) this.momentSlugsByDate[m.date] = new Set();
                this.momentSlugsByDate[m.date].add(m.incident);
            }
        }

        const allDates = new Set([
            ...Object.keys(byDate),
            ...filteredMoments.map(m => m.date)
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
            // Filter out incidents that have a curated moment on this same date
            const daySlugs = this.momentSlugsByDate[date];
            const filteredIncidents = daySlugs
                ? dayIncidents.filter(i => {
                    const slug = i.filePath.split('/').pop().replace('.md', '');
                    return !daySlugs.has(slug);
                })
                : dayIncidents;
            const dayMoments = filteredMoments.filter(m => m.date === date && !m.isUpdate);
            const dayUpdates = filteredMoments.filter(m => m.date === date && m.isUpdate);
            // Count ALL incidents for running totals (not filtered)
            const counts = this.countCategories(dayIncidents);

            monthMap[key].days.push({
                date,
                incidents: filteredIncidents,
                totalIncidentCount: dayIncidents.length,
                moments: dayMoments,
                updates: dayUpdates,
                counts
            });
        }

        this.monthData = Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key));

        // Precompute cumulative totals by date (for both sort modes)
        this.cumulativeByDate = {};
        const running = { citizens: 0, observers: 0, immigrants: 0, 'schools-hospitals': 0 };
        for (const month of this.monthData) {
            for (const day of month.days) {
                for (const cat in day.counts) {
                    if (cat in running) running[cat] += day.counts[cat];
                }
                this.cumulativeByDate[day.date] = { ...running };
            }
        }
        this.grandTotals = { ...running };
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
        this._momentIndex = 0;
        this._usedDateIds = new Set();
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
            <div class="tl-search-bar" id="tl-search-bar"></div>
        `;
    },

    buildMonthHTML(month) {
        const monthName = new Date(month.year, parseInt(month.month) - 1).toLocaleString('en-US', { month: 'long' });
        let html = `<div class="tl-month">`;
        html += `<h3 class="tl-month-label">${monthName} ${month.year}</h3>`;

        const days = this.sortOrder === 'newest' ? [...month.days].reverse() : month.days;
        for (const day of days) {
            const hasContent = day.totalIncidentCount > 0 || day.updates.length > 0;
            const hasMoments = day.moments.length > 0;
            const hasListItems = day.incidents.length > 0 || day.updates.length > 0;

            if (hasMoments) {
                // Split layout: header → moments → remaining incidents
                if (hasContent) {
                    html += this.buildDayHeaderHTML(day);
                }
                for (const moment of day.moments) {
                    html += this.buildMomentHTML(moment);
                }
                if (hasListItems) {
                    html += this.buildDayIncidentsHTML(day, true);
                }
            } else {
                // No moments: single combined day block
                if (hasListItems) {
                    html += this.buildDayFullHTML(day);
                }
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

        const altClass = (this._momentIndex++ % 2 === 1) ? ' tl-moment-alt' : '';

        let dateId = moment.date;
        if (this._usedDateIds.has(dateId)) {
            let suffix = 2;
            while (this._usedDateIds.has(dateId + '-' + suffix)) suffix++;
            dateId = dateId + '-' + suffix;
        }
        this._usedDateIds.add(dateId);

        return `
            <div class="tl-moment${clickClass}${altClass}" id="${dateId}" data-date="${moment.date}" ${clickAttr}>
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

    buildDayHeaderHTML(day) {
        const dateObj = new Date(day.date + 'T12:00:00');
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const totalCount = day.totalIncidentCount + day.updates.length;
        const countStr = totalCount === 1 ? '1 incident' : `${totalCount} incidents`;
        const countsJson = JSON.stringify(day.counts);

        let dateId = day.date;
        if (this._usedDateIds.has(dateId)) {
            let suffix = 2;
            while (this._usedDateIds.has(dateId + '-' + suffix)) suffix++;
            dateId = dateId + '-' + suffix;
        }
        this._usedDateIds.add(dateId);

        return `
            <div class="tl-day" id="${dateId}" data-date="${day.date}" data-counts='${countsJson}'>
                <div class="tl-day-marker"></div>
                <div class="tl-day-body">
                    <div class="tl-day-header">
                        <span class="tl-day-date">${dateStr}</span>
                        <span class="tl-day-count">${countStr}</span>
                    </div>
                </div>
            </div>
        `;
    },

    buildDayFullHTML(day) {
        const dateObj = new Date(day.date + 'T12:00:00');
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const totalCount = day.incidents.length + day.updates.length;
        const countStr = totalCount === 1 ? '1 incident' : `${totalCount} incidents`;
        const countsJson = JSON.stringify(day.counts);

        let titlesHTML = '';
        for (const inc of day.incidents) {
            const slug = App.getIncidentId(inc);
            const tag = this.getCategoryTag(inc);
            titlesHTML += `<div class="tl-day-incident" data-incident-slug="${slug}"><span class="tl-cat-tag">${tag}:</span> ${inc.title}</div>`;
        }
        for (const upd of day.updates) {
            const original = this.findIncident(upd.incident);
            const tag = original ? this.getCategoryTag(original) : 'UPDATE';
            titlesHTML += `<div class="tl-day-incident tl-day-update" data-incident-slug="${upd.incident}"><span class="tl-cat-tag">${tag}:</span> Update — ${upd.title}</div>`;
        }

        let dateId = day.date;
        if (this._usedDateIds.has(dateId)) {
            let suffix = 2;
            while (this._usedDateIds.has(dateId + '-' + suffix)) suffix++;
            dateId = dateId + '-' + suffix;
        }
        this._usedDateIds.add(dateId);

        return `
            <div class="tl-day" id="${dateId}" data-date="${day.date}" data-counts='${countsJson}'>
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

    buildDayIncidentsHTML(day, afterMoments) {
        let titlesHTML = '';
        for (const inc of day.incidents) {
            const slug = App.getIncidentId(inc);
            const tag = this.getCategoryTag(inc);
            titlesHTML += `<div class="tl-day-incident" data-incident-slug="${slug}"><span class="tl-cat-tag">${tag}:</span> ${inc.title}</div>`;
        }
        for (const upd of day.updates) {
            const original = this.findIncident(upd.incident);
            const tag = original ? this.getCategoryTag(original) : 'UPDATE';
            titlesHTML += `<div class="tl-day-incident tl-day-update" data-incident-slug="${upd.incident}"><span class="tl-cat-tag">${tag}:</span> Update — ${upd.title}</div>`;
        }

        const extraClass = afterMoments ? ' tl-day-continued' : '';
        return `
            <div class="tl-day-incidents${extraClass}">
                <div class="tl-day-titles">${titlesHTML}</div>
            </div>
        `;
    },

    categoryLabels: {
        'citizens': 'CITIZEN/LEGAL',
        'observers': 'OBSERVER',
        'immigrants': 'IMMIGRANT',
        'schools-hospitals': 'SCHOOLS/HOSPITALS',
        'response': 'RESPONSE',
        'background': 'CONTEXT'
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
        this._lastHashDate = null;

        // Seed with first visible day's cumulative totals
        const seedMonth = this.sortOrder === 'newest'
            ? this.monthData[this.monthData.length - 1]
            : this.monthData[0];
        const seedDay = seedMonth && (this.sortOrder === 'newest'
            ? seedMonth.days[seedMonth.days.length - 1]
            : seedMonth.days[0]);
        if (seedDay) {
            this.totals = { ...this.cumulativeByDate[seedDay.date] };
            this.updateCurrentDate(seedDay.date);
        } else {
            this.totals = { citizens: 0, observers: 0, immigrants: 0, 'schools-hospitals': 0 };
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

        // Find the current ISO date from the closest scrolled-past element
        // Tolerance matches the scroll-margin breathing room so anchor targets
        // positioned just below the bar are still recognised as current
        let currentDate = null;
        let closestTop = -Infinity;

        const allEls = container.querySelectorAll('.tl-day, .tl-moment');
        for (const el of allEls) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= triggerY + 15 && rect.top > closestTop) {
                closestTop = rect.top;
                currentDate = el.dataset.date || null;
            }
        }

        // Fallback to first visible day if nothing scrolled past yet
        if (!currentDate) {
            const firstMonth = this.sortOrder === 'newest'
                ? this.monthData[this.monthData.length - 1]
                : this.monthData[0];
            const firstDay = firstMonth && (this.sortOrder === 'newest'
                ? firstMonth.days[firstMonth.days.length - 1]
                : firstMonth.days[0]);
            if (firstDay) currentDate = firstDay.date;
        }

        // If scrolled to the bottom, use grand totals (last elements may not scroll past trigger)
        const atBottom = (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 50);
        const newTotals = atBottom
            ? { ...this.grandTotals }
            : (currentDate && this.cumulativeByDate[currentDate]
                ? { ...this.cumulativeByDate[currentDate] }
                : { citizens: 0, observers: 0, immigrants: 0, 'schools-hospitals': 0 });

        // Update totals if changed
        let changed = false;
        for (const cat in newTotals) {
            if (newTotals[cat] !== this.totals[cat]) {
                changed = true;
                break;
            }
        }
        if (changed) {
            this.totals = newTotals;
            this.updateTotalsDisplay();
        }

        // Update current date display and URL hash
        this.updateCurrentDate(currentDate);
        this.updateUrlHash(currentDate);
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

    updateUrlHash(date) {
        if (this._suppressHashUpdate) return;
        if (!date || date === this._lastHashDate) return;
        this._lastHashDate = date;
        const firstDate = this.getFirstDate();
        if (date === firstDate) {
            if (window.location.hash) {
                history.replaceState(null, '', '/timeline');
            }
        } else {
            const hash = '#' + date;
            if (window.location.hash !== hash) {
                history.replaceState(null, '', '/timeline' + hash);
            }
        }
    },

    getFirstDate() {
        const firstMonth = this.sortOrder === 'oldest'
            ? this.monthData[0]
            : this.monthData[this.monthData.length - 1];
        const firstDay = firstMonth && (this.sortOrder === 'oldest'
            ? firstMonth.days[0]
            : firstMonth.days[firstMonth.days.length - 1]);
        return firstDay ? firstDay.date : null;
    },

    scrollToDate(dateId) {
        if (!dateId) return;
        const target = document.getElementById(dateId);
        if (!target) return;
        this._suppressHashUpdate = true;
        requestAnimationFrame(() => {
            target.scrollIntoView({ block: 'start', behavior: 'instant' });
            // Lock hash to the target date so onScroll doesn't drift it
            this._lastHashDate = target.dataset.date || dateId;
            requestAnimationFrame(() => {
                this._suppressHashUpdate = false;
            });
        });
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
            // Intercept inline /entry/ links to open in lightbox instead of navigating
            const inlineLink = e.target.closest('.tl-inline-link');
            if (inlineLink) {
                const href = inlineLink.getAttribute('href');
                if (href && href.startsWith('/entry/')) {
                    e.preventDefault();
                    this.openIncident(href.replace('/entry/', ''));
                }
                return;
            }
            // Let source links navigate normally
            if (e.target.closest('.tl-moment-source')) return;

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
