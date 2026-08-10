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
    student: '/student-dashboard.html',
    parent: '/parent-dashboard.html'
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
    { href: '/parents.html', icon: '👪', label: 'Parents' },
    { href: '/attendance-qr.html', icon: '📷', label: 'QR Attendance' },
    { href: '/attendance-manual.html', icon: '✅', label: 'Manual Attendance' },
    { href: '/reports.html', icon: '📈', label: 'Reports' },
    { href: '/leave-notifications.html', icon: '📝', label: 'Leave / Complaints' },
    { href: '/notices.html', icon: '🔔', label: 'Notices' },
    { href: '/settings.html', icon: '⚙️', label: 'Settings' }
  ],
  student: [
    { href: '/student-dashboard.html', icon: '📊', label: 'Dashboard' },
    { href: '/attendance-qr.html?self=1', icon: '📷', label: 'My QR Code' },
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
    { href: '/reports.html', icon: '📈', label: 'Reports' },
    { href: '/leave-notifications.html', icon: '📝', label: 'Leave / Complaints' },
    { href: '/notices.html', icon: '🔔', label: 'Notices' },
    { href: '/settings.html', icon: '⚙️', label: 'Settings' }
  ],
  parent: [
    { href: '/parent-dashboard.html', icon: '📊', label: 'Dashboard' },
    { href: '/notices.html', icon: '🔔', label: 'Notices' },
    { href: '/settings.html', icon: '⚙️', label: 'Settings' }
  ]
};

function renderShell({ role, activeHref, title, welcomeName }) {
  const items = NAV_ITEMS[role] || [];
  const navHtml = items.map(i =>
    `<a href="${i.href}" class="${i.href.split('?')[0] === activeHref ? 'active' : ''}"><span>${i.icon}</span><span>${i.label}</span></a>`
  ).join('') + `<a href="#" onclick="logout()"><span>🚪</span><span>Logout</span></a>`;

  document.getElementById('app-shell').innerHTML = `
    <div class="sidebar" id="sidebar">
      <div class="brand"><span class="icon">🎓</span> Cloud Attendance</div>
      <nav>${navHtml}</nav>
    </div>
    <div class="main">
      <div class="topbar">
        <div style="display:flex;align-items:center;gap:10px;">
          <button class="menu-toggle" onclick="document.getElementById('sidebar').classList.toggle('open')">☰</button>
          <strong>${title}</strong>
        </div>
        <div class="right">
          <span class="welcome">Welcome, ${welcomeName}</span>
          <div class="avatar">${welcomeName.charAt(0)}</div>
        </div>
      </div>
      <div class="content" id="page-content"></div>
    </div>
  `;
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').reverse().join('-');
}
