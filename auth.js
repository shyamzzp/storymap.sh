// Client-side access gate for the static GitHub Pages deployment.
//
// IMPORTANT: This is a soft gate, not real security. GitHub Pages serves all
// files publicly, so the underlying assets remain fetchable by anyone who knows
// the paths. This only hides the UI behind a login prompt and prevents the app
// from booting until the correct credentials are entered. For genuine
// protection, host privately behind server-side auth (Vercel/Netlify password,
// Cloudflare Access, etc.).

const AUTH = {
    username: 'admin',
    salt: 'storymap.sh::v1',
    // SHA-256 of `${salt}:${username}:${password}` — plaintext is never stored.
    hash: '8d640e1c856d5fcdc7ce95b447880b49cecc6e0961a31ec542e258fd7e6caa73',
};

const STORE_KEY = 'sm_auth_v1';
const enc = new TextEncoder();

async function sha256Hex(str) {
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(str));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function loadApp() {
    const s = document.createElement('script');
    s.type = 'module';
    s.src = 'src/app.js';
    document.body.appendChild(s);
}

function unlock() {
    document.getElementById('auth-gate')?.remove();
    document.documentElement.classList.remove('auth-locked');
    loadApp();
}

function wireForm() {
    const form = document.getElementById('auth-form');
    const err = document.getElementById('auth-error');
    const userEl = document.getElementById('auth-user');
    const passEl = document.getElementById('auth-pass');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        err.style.display = 'none';
        const u = userEl.value.trim();
        const p = passEl.value;
        const h = await sha256Hex(`${AUTH.salt}:${u}:${p}`);
        if (u === AUTH.username && h === AUTH.hash) {
            try { sessionStorage.setItem(STORE_KEY, h); } catch { /* private mode */ }
            unlock();
        } else {
            err.style.display = 'block';
            passEl.value = '';
            passEl.focus();
        }
    });
    userEl.focus();
}

(function init() {
    let token = null;
    try { token = sessionStorage.getItem(STORE_KEY); } catch { /* ignore */ }
    if (token && token === AUTH.hash) {
        unlock();
    } else if (document.getElementById('auth-form')) {
        wireForm();
    } else {
        document.addEventListener('DOMContentLoaded', wireForm);
    }
})();
