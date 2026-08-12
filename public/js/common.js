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

function renderShell({ role, activeHref, title, welcomeName }) {
  const items = NAV_ITEMS[role] || [];
  const navHtml = items.map(i =>
    `<a href="${i.href}" class="${i.href.split('?')[0] === activeHref ? 'active' : ''}" data-tip="${i.label}"><span>${i.icon}</span></a>`
  ).join('') + `<a href="#" onclick="logout()" data-tip="Logout"><span>🚪</span></a>`;

  document.getElementById('app-shell').innerHTML = `
    <div class="sidebar" id="sidebar">
      <div class="brand"><span class="icon">🎓</span></div>
      <nav>${navHtml}</nav>
    </div>
    <div class="main">
      <div class="topbar">
        <div style="display:flex;align-items:center;gap:12px;">
          <button class="menu-toggle" onclick="document.getElementById('sidebar').classList.toggle('open')">☰</button>
          <div>
            <strong>${greetingPhrase()}, ${welcomeName.split(' ')[0]}</strong>
            <div class="page-subtitle">${title}</div>
          </div>
        </div>
        <div class="right">
          <button class="topbar-icon-btn" title="Notifications">🔔</button>
          <button class="topbar-icon-btn" title="Messages">✉️</button>
          <div class="avatar-wrap">
            <div class="avatar">${welcomeName.charAt(0)}</div>
            <span class="online-dot"></span>
          </div>
        </div>
      </div>
      <div class="content" id="page-content"></div>
    </div>
  `;
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
