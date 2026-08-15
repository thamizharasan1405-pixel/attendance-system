const API = '/api';

async function apiGet(path) {
  const res = await fetch(API + path);
  return res.json();
}
async function apiPost(path, body) {
  const res = await fetch(API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return res.json();
}
async function apiPut(path, body) {
  const res = await fetch(API + path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return res.json();
}
async function apiDelete(path) {
  const res = await fetch(API + path, { method: 'DELETE' });
  return res.json();
}

function getSession() {
  const raw = sessionStorage.getItem('session');
  return raw ? JSON.parse(raw) : null;
}
function requireRole(role) {
  const s = getSession();
  if (!s || s.role !== role) {
    window.location.href = '/login.html';
    return null;
  }
  return s;
}
function requireAnyRole(roles) {
  const s = getSession();
  if (!s) { window.location.href = '/login.html'; return null; }
  if (!roles.includes(s.role)) { redirectToOwnDashboard(s.role); return null; }
  return s;
}
function redirectToOwnDashboard(role) {
  const map = {
    admin: '/admin-dashboard.html',
    staff: '/staff-dashboard.html',
    student: '/student-dashboard.html'
  };
  window.location.href = map[role] || '/login.html';
}
function logout() {
  sessionStorage.removeItem('session');
  window.location.href = '/login.html';
}

const NAV_ITEMS = {
  admin: [
    { href: '/admin-dashboard.html', icon: '📊', label: 'Dashboard' },
    { href: '/students.html', icon: '🎓', label: 'Students' },
    { href: '/staff.html', icon: '👨‍🏫', label: 'Staff' },
    { href: '/staff-directory.html', icon: '👥', label: 'Staff Directory' },
    { href: '/attendance-manual.html', icon: '✅', label: 'Manual Attendance' },
    { href: '/absentees.html', icon: '📋', label: 'Absentee Lists' },
    { href: '/reports.html', icon: '📈', label: 'Reports' },
    { href: '/fees.html', icon: '💰', label: 'Fee Records' },
    { href: '/leave-notifications.html', icon: '📝', label: 'Leave / Complaints' },
    { href: '/notices.html', icon: '🔔', label: 'Notices' },
    { href: '/settings.html', icon: '⚙️', label: 'Settings' }
  ],
  student: [
    { href: '/student-dashboard.html', icon: '📊', label: 'Dashboard' },
    { href: '/timetable.html', icon: '🗓️', label: 'Timetable' },
    { href: '/subject-attendance.html', icon: '📚', label: 'Subject Attendance' },
    { href: '/leave-notifications.html?role=student', icon: '📝', label: 'Leave / Complaints' },
    { href: '/notices.html', icon: '🔔', label: 'Notices' },
    { href: '/settings.html', icon: '⚙️', label: 'Settings' }
  ],
  staff: [
    { href: '/staff-dashboard.html', icon: '📊', label: 'Dashboard' },
    { href: '/students.html', icon: '🎓', label: 'Students' },
    { href: '/attendance-manual.html', icon: '✅', label: 'Mark Attendance' },
    { href: '/absentees.html', icon: '📋', label: 'Absentee Lists' },
    { href: '/staff-timetable.html', icon: '🗓️', label: 'Timetable' },
    { href: '/reports.html', icon: '📈', label: 'Reports' },
    { href: '/fees.html', icon: '💰', label: 'Fee Records' },
    { href: '/leave-notifications.html', icon: '📝', label: 'Leave / Complaints' },
    { href: '/notices.html', icon: '🔔', label: 'Notices' },
    { href: '/settings.html', icon: '⚙️', label: 'Settings' }
  ]
};

function greetingPhrase() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const NAV_BADGE_COLORS = ['blue', 'green', 'orange', 'purple', 'teal', 'rose', 'amber', 'sky', 'indigo', 'lime'];

function renderShell({ role, activeHref, title, welcomeName }) {
  const items = NAV_ITEMS[role] || [];
  const navHtml = items.map((i, idx) =>
    `<a href="${i.href}" class="${i.href.split('?')[0] === activeHref ? 'active' : ''}">
      <span class="nav-badge c-${NAV_BADGE_COLORS[idx % NAV_BADGE_COLORS.length]}">${i.icon}</span>
      <span class="nav-label">${i.label}</span>
    </a>`
  ).join('');

  document.getElementById('app-shell').innerHTML = `
    <div class="sidebar" id="sidebar">
      <div class="workspace-header">
        <span class="workspace-icon">🎓</span>
        <div>
          <strong>Cloud Attendance</strong>
          <div class="workspace-sub">${role.charAt(0).toUpperCase() + role.slice(1)} Workspace</div>
        </div>
      </div>
      <div class="menu-heading">Menu</div>
      <nav>${navHtml}</nav>
      <div class="sidebar-footer">
        <a href="#" onclick="logout()" class="logout-row"><span class="nav-badge c-rose">🚪</span><span class="nav-label">Logout</span></a>
      </div>
    </div>
    <div class="main">
      <div class="topbar">
        <div style="display:flex;align-items:center;gap:14px;">
          <button class="menu-toggle" onclick="document.getElementById('sidebar').classList.toggle('open')">☰</button>
          <div class="topbar-search" style="position:relative;">
            <span>🔍</span><input id="topbar-search-input" placeholder="Search student name or reg no..." oninput="onTopbarSearch(this.value)" autocomplete="off">
            <div id="topbar-search-results" class="search-results-dropdown" style="display:none;"></div>
          </div>
        </div>
        <div class="right">
          <div>
            <strong style="font-size:14px;">${greetingPhrase()}, ${welcomeName.split(' ')[0]}</strong>
            <div class="page-subtitle" style="text-align:right;">${title}</div>
          </div>
          <button class="topbar-icon-btn" id="notif-bell" onclick="toggleNotifDropdown(event)" title="Notifications">🔔<span class="notif-dot"></span></button>
          <div class="avatar-wrap">
            <div class="avatar">${welcomeName.charAt(0)}</div>
            <span class="online-dot"></span>
          </div>
        </div>
      </div>
      <div class="content" id="page-content"></div>
      <div class="app-footer">
        <span>© ${new Date().getFullYear()} Cloud Attendance Management System</span>
        <span>Final Year Project · Built with care</span>
      </div>
    </div>
    <div id="notif-dropdown" class="notif-dropdown" style="display:none;"></div>
    <div id="modal-root"></div>
  `;
  document.addEventListener('click', (e) => {
    const dd = document.getElementById('notif-dropdown');
    const bell = document.getElementById('notif-bell');
    if (dd && dd.style.display !== 'none' && !dd.contains(e.target) && e.target !== bell) dd.style.display = 'none';
    const sr = document.getElementById('topbar-search-results');
    if (sr && sr.style.display !== 'none' && !sr.contains(e.target) && e.target.id !== 'topbar-search-input') sr.style.display = 'none';
  });

  pollNotifications();
}

// ---------- Notification sound (Web Audio API beep, no external file needed) ----------
function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.35);
  } catch (e) { /* audio not available, ignore */ }
}

function notifQueryFor(session) {
  if (!session) return null;
  if (session.role === 'admin') return '/notifications?role=admin';
  if (session.role === 'staff') return '/notifications?role=staff&staffId=' + encodeURIComponent(session.data.staffId);
  if (session.role === 'student') return '/notifications?role=student&regNo=' + encodeURIComponent(session.data.regNo);
  return null;
}

// Silently checks for new notifications on page load; plays a sound + shows a dot if count grew since last visit.
async function pollNotifications() {
  const session = getSession();
  const q = notifQueryFor(session);
  if (!q) return;
  try {
    const items = await apiGet(q);
    const lastCount = parseInt(sessionStorage.getItem('notifCount') || '0');
    if (items.length > lastCount) playNotifSound();
    sessionStorage.setItem('notifCount', String(items.length));
  } catch (e) { /* ignore */ }
}

async function onTopbarSearch(value) {
  const box = document.getElementById('topbar-search-results');
  const q = value.trim();
  if (!q) { box.style.display = 'none'; return; }
  try {
    const results = await apiGet('/students/lookup?q=' + encodeURIComponent(q));
    box.innerHTML = results.length ? results.map(s => `
      <div class="search-result-row">
        <div class="search-result-avatar">${titleCase(s.name).charAt(0)}</div>
        <div style="flex:1;">
          <div class="search-result-name">${titleCase(s.name)}</div>
          <div class="search-result-meta">${s.regNo} · ${s.department}-Y${s.year}</div>
        </div>
        <div class="search-result-percent ${s.stats.percent >= 75 ? 'good' : 'low'}">${s.stats.percent}%</div>
      </div>
    `).join('') : `<div class="notif-empty">No students found</div>`;
    box.style.display = 'block';
  } catch (e) { box.style.display = 'none'; }
}

async function toggleNotifDropdown(e) {
  e.stopPropagation();
  const dd = document.getElementById('notif-dropdown');
  if (dd.style.display !== 'none') { dd.style.display = 'none'; return; }
  const rect = document.getElementById('notif-bell').getBoundingClientRect();
  dd.style.top = (rect.bottom + window.scrollY + 8) + 'px';
  dd.style.left = (rect.right - 300 + window.scrollX) + 'px';
  dd.innerHTML = `<div class="notif-header">Notifications</div><div class="notif-loading">Loading...</div>`;
  dd.style.display = 'block';
  try {
    const session = getSession();
    const q = notifQueryFor(session);
    const items = q ? await apiGet(q) : [];
    sessionStorage.setItem('notifCount', String(items.length));
    dd.innerHTML = `<div class="notif-header">Notifications</div>` + (
      items.length
        ? items.map(n => `<div class="notif-item"><span class="notif-dot-sm"></span><div><div class="notif-text">${n.message}</div><div class="notif-time">${n.time}</div></div></div>`).join('')
        : `<div class="notif-empty">🔕 No new notifications</div>`
    );
  } catch (err) {
    dd.innerHTML = `<div class="notif-header">Notifications</div><div class="notif-empty">🔕 Nothing to show</div>`;
  }
}

// ---------- Modal helper ----------
function openModal(innerHtml) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-overlay" id="modal-overlay" onclick="if(event.target===this) closeModal()">
      <div class="modal-box">${innerHtml}</div>
    </div>
  `;
}
function closeModal() {
  const root = document.getElementById('modal-root');
  if (root) root.innerHTML = '';
}
function confirmModal(message, onConfirm) {
  openModal(`
    <div style="text-align:center;">
      <div style="font-size:34px;margin-bottom:10px;">⚠️</div>
      <h3 style="margin-bottom:10px;">Are you sure?</h3>
      <p style="font-size:13.5px;color:var(--gray);margin-bottom:22px;">${message}</p>
      <div style="display:flex;gap:10px;justify-content:center;">
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" style="background:var(--rose);box-shadow:none;" id="confirm-yes-btn">Yes, Delete</button>
      </div>
    </div>
  `);
  document.getElementById('confirm-yes-btn').onclick = () => { closeModal(); onConfirm(); };
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').reverse().join('-');
}

// Standard department & year lists — always shown in full regardless of existing student data
const ALL_DEPARTMENTS = ['BCA', 'CS', 'IT'];
const ALL_YEARS = [1, 2, 3];

// Converts any-case input to proper Title Case for consistent display (e.g. "dhanush" / "KISHOR" -> "Dhanush" / "Kishor")
function titleCase(str) {
  if (!str) return str;
  return String(str).toLowerCase().replace(/(^|\s|['-])\S/g, c => c.toUpperCase());
}
