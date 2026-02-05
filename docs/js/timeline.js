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

            if (dateMatch && titleMatch) {
                moments.push({
                    date: dateMatch[1],
                    title: titleMatch[1].trim(),
                    incident: (incidentMatch && incidentMatch[1].trim()) || null,
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

        let currentYear = null;
        for (const month of this.monthData) {
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
            <div class="tl-total tl-total-citizens">
                <span class="tl-count" id="tl-count-citizens">0</span>
                <span class="tl-total-label">Citizens</span>
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
        `;
    },

    buildMonthHTML(month) {
        const monthName = new Date(month.year, parseInt(month.month) - 1).toLocaleString('en-US', { month: 'long' });
        let html = `<div class="tl-month">`;
        html += `<h3 class="tl-month-label">${monthName} ${month.year}</h3>`;

        for (const day of month.days) {
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
        const clickAttr = moment.incident ? `data-incident-slug="${moment.incident}"` : '';
        const clickClass = moment.incident ? ' tl-moment-clickable' : '';

        let imgHTML = '';
        if (moment.incident) {
            const incident = this.findIncident(moment.incident);
            if (incident && incident.localMediaPath && incident.localMediaType === 'image') {
                imgHTML = `<img class="tl-moment-img" src="/${incident.localMediaPath}" alt="" loading="lazy">`;
            }
        }

        return `
            <div class="tl-moment${clickClass}" ${clickAttr}>
                <div class="tl-moment-line"></div>
                <div class="tl-moment-content">
                    <div class="tl-moment-date">${dateStr}</div>
                    <h4 class="tl-moment-title">${moment.title}</h4>
                    <p class="tl-moment-desc">${moment.body}</p>
                    ${imgHTML}
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
        const showCount = Math.min(day.incidents.length, 3);
        for (let i = 0; i < showCount; i++) {
            const inc = day.incidents[i];
            const slug = App.getIncidentId(inc);
            titlesHTML += `<div class="tl-day-incident" data-incident-slug="${slug}">${inc.title}</div>`;
        }
        if (day.incidents.length > 3) {
            titlesHTML += `<div class="tl-day-more">+ ${day.incidents.length - 3} more</div>`;
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

    findIncident(slug) {
        if (typeof App === 'undefined') return null;
        return App.incidents.find(i => {
            const id = i.filePath.split('/').pop().replace('.md', '');
            return id === slug;
        });
    },

    initScrollObserver() {
        if (this.observer) this.observer.disconnect();

        this.countedDays.clear();
        this.totals = { citizens: 0, observers: 0, immigrants: 0, 'schools-hospitals': 0 };
        this.updateTotalsDisplay();

        const container = document.getElementById('timeline-view');
        const dayEls = container.querySelectorAll('.tl-day');

        this.observer = new IntersectionObserver((entries) => {
            let changed = false;
            for (const entry of entries) {
                const date = entry.target.dataset.date;
                const counts = JSON.parse(entry.target.dataset.counts);

                if (entry.isIntersecting && !this.countedDays.has(date)) {
                    this.countedDays.add(date);
                    for (const cat in counts) {
                        this.totals[cat] += counts[cat];
                    }
                    changed = true;
                } else if (!entry.isIntersecting && this.countedDays.has(date)) {
                    const rect = entry.target.getBoundingClientRect();
                    if (rect.top > window.innerHeight) {
                        this.countedDays.delete(date);
                        for (const cat in counts) {
                            this.totals[cat] -= counts[cat];
                        }
                        changed = true;
                    }
                }
            }
            if (changed) this.updateTotalsDisplay();
        }, { threshold: 0.1 });

        dayEls.forEach(el => this.observer.observe(el));
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

        container.addEventListener('click', (e) => {
            const momentEl = e.target.closest('.tl-moment-clickable');
            if (momentEl) {
                const slug = momentEl.dataset.incidentSlug;
                this.openIncident(slug);
                return;
            }

            const incidentEl = e.target.closest('.tl-day-incident');
            if (incidentEl) {
                const slug = incidentEl.dataset.incidentSlug;
                this.openIncident(slug);
                return;
            }

            const dayMore = e.target.closest('.tl-day-more');
            if (dayMore) {
                const dayEl = dayMore.closest('.tl-day');
                if (dayEl) dayEl.classList.toggle('tl-day-expanded');
                return;
            }
        });
    },

    openIncident(slug) {
        if (typeof App === 'undefined' || typeof Lightbox === 'undefined') return;
        const incident = this.findIncident(slug);
        if (incident) {
            Lightbox.open(incident);
        }
    }
};
