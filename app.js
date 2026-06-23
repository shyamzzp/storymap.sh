// Storymap clone — interactive board logic (clean-room implementation).
// Card / status colour values mirror storymaps.io exactly.

// ---- Exact colour palette (matches storymaps.io CARD_COLORS) ----
export const CARD_COLORS = {
    red:     '#fca5a5',
    rose:    '#fecdd3',
    orange:  '#fdba74',
    amber:   '#fcd34d',
    yellow:  '#fef08a',
    lime:    '#bef264',
    green:   '#86efac',
    teal:    '#5eead4',
    cyan:    '#a5f3fc',
    blue:    '#93c5fd',
    indigo:  '#a5b4fc',
    purple:  '#d8b4fe',
    fuchsia: '#f0abfc',
    pink:    '#f9a8d4',
};

// Default card-type colours (matches storymaps.io DEFAULT_CARD_COLORS)
const DEFAULT = { Users: '#fca5a5', Activities: '#93c5fd', story: '#fef08a' };

// Exact status options (matches storymaps.io STATUS_OPTIONS)
const STATUS_OPTIONS = {
    none:          { label: '—',           color: 'transparent' },
    done:          { label: 'Done',        color: '#22c55e' },
    'in-progress': { label: 'In Progress', color: '#eab308' },
    planned:       { label: 'Planned',     color: '#3b82f6' },
    blocked:       { label: 'Blocked',     color: '#ef4444' },
};

const STORAGE_KEY = 'storymap.board';
const uid = () => Math.random().toString(36).slice(2, 10);

// ---- DOM helpers ----
const el = (tag, cls, attrs = {}) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    for (const [k, v] of Object.entries(attrs)) {
        if (v == null) continue;
        if (k === 'text') n.textContent = v;
        else if (k === 'html') n.innerHTML = v;
        else if (k.startsWith('data-')) n.dataset[k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v;
        else n.setAttribute(k, v);
    }
    return n;
};
const $ = (sel) => document.querySelector(sel);

// ---- Default board content (sample story map) ----
function seedBoard() {
    return {
        name: 'Coffee Ordering App',
        theme: 'light',
        activities: [
            { id: uid(), title: 'Browse Menu',  color: DEFAULT.Activities,
              tasks: [ { id: 't1', title: 'View categories', color: DEFAULT.Activities },
                       { id: 't2', title: 'See item detail',  color: DEFAULT.Activities } ] },
            { id: uid(), title: 'Place Order',  color: DEFAULT.Activities,
              tasks: [ { id: 't3', title: 'Add to cart',  color: DEFAULT.Activities },
                       { id: 't4', title: 'Checkout',     color: DEFAULT.Activities } ] },
            { id: uid(), title: 'Track & Collect', color: DEFAULT.Activities,
              tasks: [ { id: 't5', title: 'Order status', color: DEFAULT.Activities },
                       { id: 't6', title: 'Pickup notify', color: DEFAULT.Activities } ] },
        ],
        releases: [
            { id: uid(), title: 'Release 1 — MVP', cards: {
                t1: [{ id: uid(), title: 'List drink categories', color: DEFAULT.story, status: 'done' }],
                t2: [{ id: uid(), title: 'Show price & photo', color: DEFAULT.story, status: 'done' }],
                t3: [{ id: uid(), title: 'Adjust quantity', color: DEFAULT.story, status: 'in-progress' }],
                t4: [{ id: uid(), title: 'Pay with card', color: DEFAULT.story, status: 'planned' }],
                t5: [{ id: uid(), title: 'Live prep status', color: DEFAULT.story, status: 'planned' }],
                t6: [{ id: uid(), title: 'Push notification', color: DEFAULT.story, status: 'blocked' }],
            }},
            { id: uid(), title: 'Release 2 — Loyalty', cards: {
                t1: [{ id: uid(), title: 'Filter by favourites', color: DEFAULT.story, status: 'planned' }],
                t3: [{ id: uid(), title: 'Save usual order', color: DEFAULT.story, status: 'planned' }],
                t4: [{ id: uid(), title: 'Apply reward points', color: DEFAULT.story, status: 'planned' }],
            }},
        ],
    };
}

let board = load();

function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return seedBoard();
}
function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
}

// ---- Rendering ----
const mapEl = $('#story-map');

function allTasks() {
    return board.activities.flatMap(a => a.tasks);
}

function render() {
    mapEl.innerHTML = '';

    // Backbone (activities + tasks)
    const backbone = el('div', 'backbone');
    board.activities.forEach(act => {
        const wrap = el('div', 'activity');
        const span = act.tasks.length;
        const head = el('div', 'activity-card', { contenteditable: 'true', text: act.title });
        head.style.background = act.color;
        head.style.width = `calc(${span} * var(--card-width) + ${span - 1} * var(--spacing-md))`;
        head.addEventListener('blur', () => { act.title = head.textContent.trim(); save(); });
        wrap.appendChild(head);

        const tasks = el('div', 'tasks');
        act.tasks.forEach(task => {
            const c = el('div', 'card card-task');
            c.style.background = task.color;
            const title = el('div', 'card-title', { contenteditable: 'true', text: task.title });
            title.addEventListener('blur', () => { task.title = title.textContent.trim(); save(); });
            c.appendChild(title);
            c.appendChild(cardActions(task, c, () => render()));
            tasks.appendChild(c);
        });
        wrap.appendChild(tasks);
        backbone.appendChild(wrap);
    });
    mapEl.appendChild(backbone);

    // Releases (swimlanes)
    board.releases.forEach(rel => {
        const r = el('div', 'release');
        const header = el('div', 'release-header');
        const title = el('span', 'release-title', { contenteditable: 'true', text: rel.title });
        title.addEventListener('blur', () => { rel.title = title.textContent.trim(); save(); });
        const del = el('button', 'card-btn', { html: '🗑', title: 'Delete release' });
        del.addEventListener('click', () => { board.releases = board.releases.filter(x => x !== rel); save(); render(); });
        header.append(title, del);
        r.appendChild(header);

        const body = el('div', 'release-body');
        allTasks().forEach(task => {
            const col = el('div', 'release-column');
            const cards = rel.cards[task.id] || (rel.cards[task.id] = []);
            cards.forEach(story => col.appendChild(storyCard(story, cards)));
            const add = el('button', 'add-card', { text: '+ Story' });
            add.addEventListener('click', () => {
                cards.push({ id: uid(), title: 'New story', color: DEFAULT.story, status: 'none' });
                save(); render();
            });
            col.appendChild(add);
            body.appendChild(col);
        });
        r.appendChild(body);
        mapEl.appendChild(r);
    });
}

function storyCard(story, list) {
    const c = el('div', 'card');
    c.style.background = story.color;
    if (story.status && story.status !== 'none') {
        const s = STATUS_OPTIONS[story.status];
        const pill = el('span', 'status-pill', { text: s.label });
        pill.style.background = s.color;
        c.appendChild(pill);
    }
    const title = el('div', 'card-title', { contenteditable: 'true', text: story.title });
    title.addEventListener('blur', () => { story.title = title.textContent.trim(); save(); });
    c.appendChild(title);
    c.appendChild(cardActions(story, c, () => render(), list));
    return c;
}

function cardActions(item, cardEl, rerender, list) {
    const wrap = el('div', 'card-actions');
    const colorBtn = el('button', 'card-btn', { html: '🎨', title: 'Colour' });
    colorBtn.addEventListener('click', (e) => { e.stopPropagation(); openColorPopover(e, item, rerender); });
    wrap.appendChild(colorBtn);

    if (list) { // story cards support status + delete
        const statusBtn = el('button', 'card-btn', { html: '◑', title: 'Status' });
        statusBtn.addEventListener('click', (e) => { e.stopPropagation(); openStatusPopover(e, item, rerender); });
        wrap.appendChild(statusBtn);
        const del = el('button', 'card-btn', { html: '✕', title: 'Delete' });
        del.addEventListener('click', (e) => {
            e.stopPropagation();
            const i = list.indexOf(item); if (i > -1) list.splice(i, 1);
            save(); rerender();
        });
        wrap.appendChild(del);
    }
    return wrap;
}

// ---- Popovers ----
const colorPop = $('#color-popover');
const statusPop = $('#status-popover');

function openColorPopover(e, item, rerender) {
    colorPop.innerHTML = '';
    const grid = el('div', 'swatch-grid');
    Object.entries(CARD_COLORS).forEach(([name, hex]) => {
        const sw = el('button', 'swatch', { title: name });
        sw.style.background = hex;
        sw.addEventListener('click', () => { item.color = hex; save(); hidePopovers(); rerender(); });
        grid.appendChild(sw);
    });
    colorPop.appendChild(grid);
    positionPopover(colorPop, e);
}

function openStatusPopover(e, item, rerender) {
    statusPop.innerHTML = '';
    const listEl = el('div', 'status-list');
    Object.entries(STATUS_OPTIONS).forEach(([key, opt]) => {
        const row = el('div', 'status-item');
        const dot = el('span', 'status-dot');
        dot.style.background = opt.color === 'transparent' ? 'var(--color-border)' : opt.color;
        row.append(dot, el('span', null, { text: opt.label }));
        row.addEventListener('click', () => { item.status = key; save(); hidePopovers(); rerender(); });
        listEl.appendChild(row);
    });
    statusPop.appendChild(listEl);
    positionPopover(statusPop, e);
}

function positionPopover(pop, e) {
    hidePopovers();
    pop.classList.remove('hidden');
    const r = pop.getBoundingClientRect();
    let x = e.clientX, y = e.clientY + 8;
    if (x + r.width > innerWidth) x = innerWidth - r.width - 8;
    if (y + r.height > innerHeight) y = e.clientY - r.height - 8;
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
}
function hidePopovers() { colorPop.classList.add('hidden'); statusPop.classList.add('hidden'); }
document.addEventListener('click', (e) => {
    if (!colorPop.contains(e.target) && !statusPop.contains(e.target)) hidePopovers();
});

// ---- Toast ----
function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.add('hidden'), 2200);
}

// ---- Header actions ----
$('#board-name').addEventListener('input', (e) => { board.name = e.target.value; save(); });
$('#board-name').value = board.name;

$('#add-activity').addEventListener('click', () => {
    const id = uid();
    board.activities.push({ id, title: 'New Activity', color: DEFAULT.Activities,
        tasks: [{ id: uid(), title: 'New task', color: DEFAULT.Activities }] });
    save(); render();
});

$('#add-release').addEventListener('click', () => {
    board.releases.push({ id: uid(), title: 'New Release', cards: {} });
    save(); render();
});

$('#clear-all').addEventListener('click', () => {
    if (confirm('Clear the whole board? This cannot be undone.')) {
        board = { name: board.name, theme: board.theme, activities: [], releases: [] };
        save(); render();
    }
});

$('#export-json').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(board, null, 2)], { type: 'application/json' });
    const a = el('a', null, { href: URL.createObjectURL(blob), download: (board.name || 'storymap') + '.json' });
    document.body.appendChild(a); a.click(); a.remove();
    toast('Exported board as JSON');
});

$('#share').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); toast('Link copied to clipboard'); }
    catch { toast('Copy this URL: ' + location.href); }
});

// Theme toggle
const themeBtn = $('#theme-toggle');
function applyTheme() {
    document.documentElement.setAttribute('data-theme', board.theme);
    themeBtn.textContent = board.theme === 'dark' ? '☀️' : '🌙';
}
themeBtn.addEventListener('click', () => {
    board.theme = board.theme === 'dark' ? 'light' : 'dark';
    save(); applyTheme();
});

// ---- Boot ----
applyTheme();
render();
