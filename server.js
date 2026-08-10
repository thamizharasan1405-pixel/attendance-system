const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const os = require('os');
const { readDB, writeDB } = require('./db');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk.toString()));
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function calcAttendancePercent(db, regNo) {
  const records = db.attendance.filter(a => a.regNo === regNo);
  if (records.length === 0) return { percent: 0, present: 0, absent: 0, total: 0 };
  const present = records.filter(r => r.status === 'Present').length;
  const absent = records.length - present;
  return { percent: Math.round((present / records.length) * 100), present, absent, total: records.length };
}

// ---------- Route Handlers ----------

async function handleApi(req, res, pathname, query) {
  const method = req.method;

  // ---- AUTH ----
  if (pathname === '/api/login' && method === 'POST') {
    const body = await getBody(req);
    const db = await readDB();

    // Admin: fixed single account
    if (body.username === db.admin.username && body.password === db.admin.password) {
      return sendJSON(res, 200, { success: true, role: 'admin', name: 'Admin' });
    }

    // Staff: ONE shared username/password for every staff member.
    // After this succeeds, the frontend shows a "select your name" step
    // and calls /api/login again with staffId set to attach the right profile.
    if (body.username === db.staffLogin.username && body.password === db.staffLogin.password) {
      if (body.staffId) {
        const staff = db.staff.find(s => s.staffId === body.staffId);
        if (!staff) return sendJSON(res, 401, { success: false, message: 'Staff not found' });
        return sendJSON(res, 200, { success: true, role: 'staff', data: staff });
      }
      return sendJSON(res, 200, { success: true, role: 'staff', needsSelection: true, staffList: db.staff });
    }

    // Student: login with Register Number, any password
    const student = db.students.find(s => s.regNo === body.username);
    if (student) return sendJSON(res, 200, { success: true, role: 'student', data: student });

    // Parent: login with their child's Register Number, any password
    const parent = db.parents.find(p => p.regNo === body.username);
    if (parent) return sendJSON(res, 200, { success: true, role: 'parent', data: parent });

    return sendJSON(res, 401, { success: false, message: 'Invalid credentials' });
  }

  // ---- STUDENTS CRUD ----
  if (pathname === '/api/students' && method === 'GET') {
    const db = await readDB();
    return sendJSON(res, 200, db.students);
  }
  if (pathname === '/api/students' && method === 'POST') {
    const body = await getBody(req);
    const db = await readDB();
    const newStudent = { id: db.nextId.students++, status: 'Active', ...body };
    db.students.push(newStudent);
    await writeDB(db);
    return sendJSON(res, 201, newStudent);
  }
  if (pathname.match(/^\/api\/students\/\d+$/) && method === 'PUT') {
    const id = parseInt(pathname.split('/').pop());
    const body = await getBody(req);
    const db = await readDB();
    const idx = db.students.findIndex(s => s.id === id);
    if (idx === -1) return sendJSON(res, 404, { message: 'Not found' });
    db.students[idx] = { ...db.students[idx], ...body };
    await writeDB(db);
    return sendJSON(res, 200, db.students[idx]);
  }
  if (pathname.match(/^\/api\/students\/\d+$/) && method === 'DELETE') {
    const id = parseInt(pathname.split('/').pop());
    const db = await readDB();
    db.students = db.students.filter(s => s.id !== id);
    await writeDB(db);
    return sendJSON(res, 200, { success: true });
  }

  // ---- STAFF CRUD ----
  if (pathname === '/api/staff' && method === 'GET') {
    const db = await readDB();
    return sendJSON(res, 200, db.staff);
  }
  if (pathname === '/api/staff' && method === 'POST') {
    const body = await getBody(req);
    const db = await readDB();
    const newStaff = { id: db.nextId.staff++, status: 'Active', ...body };
    db.staff.push(newStaff);
    await writeDB(db);
    return sendJSON(res, 201, newStaff);
  }
  if (pathname.match(/^\/api\/staff\/\d+$/) && method === 'PUT') {
    const id = parseInt(pathname.split('/').pop());
    const body = await getBody(req);
    const db = await readDB();
    const idx = db.staff.findIndex(s => s.id === id);
    if (idx === -1) return sendJSON(res, 404, { message: 'Not found' });
    db.staff[idx] = { ...db.staff[idx], ...body };
    await writeDB(db);
    return sendJSON(res, 200, db.staff[idx]);
  }
  if (pathname.match(/^\/api\/staff\/\d+$/) && method === 'DELETE') {
    const id = parseInt(pathname.split('/').pop());
    const db = await readDB();
    db.staff = db.staff.filter(s => s.id !== id);
    await writeDB(db);
    return sendJSON(res, 200, { success: true });
  }

  // ---- PARENTS CRUD ----
  if (pathname === '/api/parents' && method === 'GET') {
    const db = await readDB();
    return sendJSON(res, 200, db.parents);
  }
  if (pathname === '/api/parents' && method === 'POST') {
    const body = await getBody(req);
    const db = await readDB();
    const newParent = { id: db.nextId.parents++, status: 'Active', ...body };
    db.parents.push(newParent);
    await writeDB(db);
    return sendJSON(res, 201, newParent);
  }
  if (pathname.match(/^\/api\/parents\/\d+$/) && method === 'DELETE') {
    const id = parseInt(pathname.split('/').pop());
    const db = await readDB();
    db.parents = db.parents.filter(s => s.id !== id);
    await writeDB(db);
    return sendJSON(res, 200, { success: true });
  }

  // ---- ATTENDANCE ----
  if (pathname === '/api/attendance' && method === 'GET') {
    const db = await readDB();
    let records = db.attendance;
    if (query.date) records = records.filter(r => r.date === query.date);
    if (query.regNo) records = records.filter(r => r.regNo === query.regNo);
    return sendJSON(res, 200, records);
  }

  if (pathname === '/api/attendance/mark' && method === 'POST') {
    // body: { date, records: [{ regNo, status }] }
    const body = await getBody(req);
    const db = await readDB();
    const { date, records } = body;
    records.forEach(r => {
      const existingIdx = db.attendance.findIndex(a => a.regNo === r.regNo && a.date === date);
      const time = r.status === 'Present' ? new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-';
      if (existingIdx !== -1) {
        db.attendance[existingIdx].status = r.status;
        db.attendance[existingIdx].time = time;
        db.attendance[existingIdx].method = 'Manual';
      } else {
        db.attendance.push({ id: db.nextId.attendance++, regNo: r.regNo, date, status: r.status, time, method: 'Manual' });
      }
    });
    await writeDB(db);
    return sendJSON(res, 200, { success: true });
  }

  if (pathname === '/api/attendance/qr-scan' && method === 'POST') {
    const body = await getBody(req);
    const db = await readDB();
    const student = db.students.find(s => s.regNo === body.regNo);
    if (!student) return sendJSON(res, 404, { success: false, message: 'Student not found for this QR / Reg No' });
    const date = todayStr();
    const existingIdx = db.attendance.findIndex(a => a.regNo === body.regNo && a.date === date);
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    if (existingIdx !== -1) {
      db.attendance[existingIdx].status = 'Present';
      db.attendance[existingIdx].time = time;
      db.attendance[existingIdx].method = 'QR';
    } else {
      db.attendance.push({ id: db.nextId.attendance++, regNo: body.regNo, date, status: 'Present', time, method: 'QR' });
    }
    await writeDB(db);
    return sendJSON(res, 200, { success: true, student: student.name, regNo: student.regNo, time });
  }

  // ---- REPORTS ----
  if (pathname === '/api/reports/summary' && method === 'GET') {
    const db = await readDB();
    let students = db.students;
    if (query.department) students = students.filter(s => s.department === query.department);
    const weekly = {};
    db.attendance.forEach(a => {
      if (!weekly[a.date]) weekly[a.date] = { present: 0, absent: 0 };
      if (a.status === 'Present') weekly[a.date].present++;
      else weekly[a.date].absent++;
    });
    const deptStats = {};
    db.students.forEach(s => {
      if (!deptStats[s.department]) deptStats[s.department] = { total: 0, present: 0 };
    });
    db.attendance.forEach(a => {
      const student = db.students.find(s => s.regNo === a.regNo);
      if (!student) return;
      deptStats[student.department].total++;
      if (a.status === 'Present') deptStats[student.department].present++;
    });
    const deptWise = Object.entries(deptStats).map(([dept, v]) => ({
      department: dept,
      percent: v.total ? Math.round((v.present / v.total) * 100) : 0
    }));
    return sendJSON(res, 200, { weekly, deptWise, totalStudents: students.length });
  }

  // ---- LEAVE REQUESTS ----
  if (pathname === '/api/leave-requests' && method === 'GET') {
    const db = await readDB();
    let list = db.leaveRequests;
    if (query.regNo) list = list.filter(l => l.regNo === query.regNo);
    return sendJSON(res, 200, list);
  }
  if (pathname === '/api/leave-requests' && method === 'POST') {
    const body = await getBody(req);
    const db = await readDB();
    const newReq = { id: db.nextId.leaveRequests++, status: 'Pending', ...body };
    db.leaveRequests.push(newReq);
    await writeDB(db);
    return sendJSON(res, 201, newReq);
  }
  if (pathname.match(/^\/api\/leave-requests\/\d+$/) && method === 'PUT') {
    const id = parseInt(pathname.split('/').pop());
    const body = await getBody(req);
    const db = await readDB();
    const idx = db.leaveRequests.findIndex(l => l.id === id);
    if (idx === -1) return sendJSON(res, 404, { message: 'Not found' });
    db.leaveRequests[idx].status = body.status;
    await writeDB(db);
    return sendJSON(res, 200, db.leaveRequests[idx]);
  }

  // ---- COMPLAINTS ----
  if (pathname === '/api/complaints' && method === 'GET') {
    const db = await readDB();
    let list = db.complaints;
    if (query.regNo) list = list.filter(c => c.regNo === query.regNo);
    return sendJSON(res, 200, list);
  }
  if (pathname === '/api/complaints' && method === 'POST') {
    const body = await getBody(req);
    const db = await readDB();
    const newC = { id: db.nextId.complaints++, status: 'Open', date: todayStr(), ...body };
    db.complaints.push(newC);
    await writeDB(db);
    return sendJSON(res, 201, newC);
  }
  if (pathname.match(/^\/api\/complaints\/\d+$/) && method === 'PUT') {
    // staff/admin reply to and/or resolve a complaint
    const id = parseInt(pathname.split('/').pop());
    const body = await getBody(req);
    const db = await readDB();
    const idx = db.complaints.findIndex(c => c.id === id);
    if (idx === -1) return sendJSON(res, 404, { message: 'Not found' });
    if (body.reply !== undefined) db.complaints[idx].reply = body.reply;
    if (body.status !== undefined) db.complaints[idx].status = body.status;
    await writeDB(db);
    return sendJSON(res, 200, db.complaints[idx]);
  }

  // ---- NOTICES / ANNOUNCEMENTS ----
  if (pathname === '/api/notices' && method === 'GET') {
    const db = await readDB();
    return sendJSON(res, 200, db.notices.slice().reverse());
  }
  if (pathname === '/api/notices' && method === 'POST') {
    const body = await getBody(req);
    const db = await readDB();
    const newN = { id: db.nextId.notices++, date: todayStr(), postedBy: 'Admin', ...body };
    db.notices.push(newN);
    await writeDB(db);
    return sendJSON(res, 201, newN);
  }
  if (pathname.match(/^\/api\/notices\/\d+$/) && method === 'DELETE') {
    const id = parseInt(pathname.split('/').pop());
    const db = await readDB();
    db.notices = db.notices.filter(n => n.id !== id);
    await writeDB(db);
    return sendJSON(res, 200, { success: true });
  }

  // ---- SUBJECTS (subject-wise attendance) ----
  if (pathname === '/api/subjects' && method === 'GET') {
    const db = await readDB();
    const department = query.department || 'default';
    const list = db.subjects[department] || db.subjects.default;
    let overallPercent = 0;
    if (query.regNo) {
      const stats = calcAttendancePercent(db, query.regNo);
      overallPercent = stats.percent;
    }
    const result = list.map(subj => {
      let hash = 0;
      for (const ch of subj) hash += ch.charCodeAt(0);
      const variance = (hash % 11) - 5;
      const percent = Math.min(100, Math.max(0, overallPercent + variance));
      return { subject: subj, percent };
    });
    return sendJSON(res, 200, result);
  }

  // ---- TIMETABLE ----
  if (pathname === '/api/timetable' && method === 'GET') {
    const db = await readDB();
    const department = query.department;
    return sendJSON(res, 200, db.timetable[department] || []);
  }

  // ---- ATTENDANCE REPORT EXPORT (CSV) ----
  if (pathname === '/api/reports/export' && method === 'GET') {
    const db = await readDB();
    let records = db.attendance;
    if (query.department) {
      const deptRegNos = db.students.filter(s => s.department === query.department).map(s => s.regNo);
      records = records.filter(r => deptRegNos.includes(r.regNo));
    }
    if (query.month) {
      records = records.filter(r => r.date.startsWith(query.month));
    }
    const rows = ['Reg No,Name,Date,Status,Time,Method'];
    records.forEach(r => {
      const student = db.students.find(s => s.regNo === r.regNo);
      rows.push(`${r.regNo},${student ? student.name : ''},${r.date},${r.status},${r.time},${r.method}`);
    });
    const csv = rows.join('\n');
    res.writeHead(200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="attendance_report.csv"',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(csv);
  }

  if (pathname.match(/^\/api\/student\/[^/]+\/report-csv$/) && method === 'GET') {
    const regNo = decodeURIComponent(pathname.split('/')[3]);
    const db = await readDB();
    const student = db.students.find(s => s.regNo === regNo);
    const records = db.attendance.filter(a => a.regNo === regNo);
    const rows = ['Date,Status,Time,Method'];
    records.forEach(r => rows.push(`${r.date},${r.status},${r.time},${r.method}`));
    const csv = rows.join('\n');
    res.writeHead(200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${student ? student.regNo : 'student'}_attendance.csv"`,
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(csv);
  }

  // ---- NOTIFICATIONS ----
  if (pathname === '/api/notifications' && method === 'GET') {
    const db = await readDB();
    return sendJSON(res, 200, db.notifications);
  }

  // ---- DASHBOARDS ----
  if (pathname === '/api/dashboard/admin' && method === 'GET') {
    const db = await readDB();
    const today = todayStr();
    const todayRecords = db.attendance.filter(a => a.date === today);
    const presentToday = todayRecords.filter(r => r.status === 'Present').length;
    const absentToday = todayRecords.filter(r => r.status === 'Absent').length;
    return sendJSON(res, 200, {
      totalStudents: db.students.length,
      totalStaff: db.staff.length,
      presentToday,
      absentToday,
      recentActivities: db.notifications.slice(0, 5)
    });
  }
  if (pathname.match(/^\/api\/dashboard\/student\/.+$/) && method === 'GET') {
    const regNo = decodeURIComponent(pathname.split('/').pop());
    const db = await readDB();
    const student = db.students.find(s => s.regNo === regNo);
    if (!student) return sendJSON(res, 404, { message: 'Not found' });
    const stats = calcAttendancePercent(db, regNo);
    const recent = db.attendance.filter(a => a.regNo === regNo).slice(-10).reverse();
    return sendJSON(res, 200, { student, stats, recent });
  }
  if (pathname.match(/^\/api\/dashboard\/staff\/.+$/) && method === 'GET') {
    const staffId = decodeURIComponent(pathname.split('/').pop());
    const db = await readDB();
    const staff = db.staff.find(s => s.staffId === staffId);
    if (!staff) return sendJSON(res, 404, { message: 'Not found' });
    const deptStudents = db.students.filter(s => s.department === staff.department);
    const today = todayStr();
    const todayPresent = db.attendance.filter(a => a.date === today && a.status === 'Present' && deptStudents.some(s => s.regNo === a.regNo)).length;
    const todayAbsent = db.attendance.filter(a => a.date === today && a.status === 'Absent' && deptStudents.some(s => s.regNo === a.regNo)).length;
    return sendJSON(res, 200, { staff, totalStudents: deptStudents.length, todayPresent, todayAbsent });
  }
  if (pathname.match(/^\/api\/dashboard\/parent\/.+$/) && method === 'GET') {
    const regNo = decodeURIComponent(pathname.split('/').pop());
    const db = await readDB();
    const parent = db.parents.find(p => p.regNo === regNo);
    const student = db.students.find(s => s.regNo === regNo);
    if (!parent || !student) return sendJSON(res, 404, { message: 'Not found' });
    const stats = calcAttendancePercent(db, regNo);
    const recent = db.attendance.filter(a => a.regNo === regNo).slice(-10).reverse();
    return sendJSON(res, 200, { parent, student, stats, recent });
  }

  return sendJSON(res, 404, { message: 'API route not found' });
}

function serveStatic(req, res, pathname) {
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(PUBLIC_DIR, filePath);

  // security: prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      return res.end('<h1>404 - Page Not Found</h1><a href="/">Go Home</a>');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const query = parsed.query;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  if (pathname.startsWith('/api/')) {
    try {
      await handleApi(req, res, pathname, query);
    } catch (e) {
      console.error(e);
      sendJSON(res, 500, { message: 'Server error', error: e.message });
    }
    return;
  }

  serveStatic(req, res, pathname);
});

function getLanIps() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
    }
  }
  return ips;
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Cloud Attendance Management System running!`);
  console.log(`   On this computer: http://localhost:${PORT}`);
  const ips = getLanIps();
  if (ips.length) {
    console.log(`   On your phone (same WiFi as this computer):`);
    ips.forEach(ip => console.log(`     http://${ip}:${PORT}`));
  } else {
    console.log(`   Could not detect a WiFi/LAN IP - connect your PC to WiFi (not just ethernet) and restart.`);
  }
  console.log('');
});
