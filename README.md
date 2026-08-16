# Cloud Based Smart Attendance Management System

Final Year Project — full working system matching the design mockup
(Landing page, Admin/Staff/Student/Parent portals, QR + Manual attendance,
Reports, Leave requests, Notifications, Mobile responsive UI).

**No external packages needed for local use.** Built with plain Node.js
(built-in `http` module) for the backend and plain HTML/CSS/JS for the
frontend — nothing to install except Node.js itself, unless you turn on
the optional MongoDB cloud storage described below.

## How to run (VS Code)

1. Install **Node.js** if you don't already have it: https://nodejs.org (LTS version).
2. Open this folder (`attendance-system`) in VS Code.
3. Open a terminal in VS Code (`Terminal > New Terminal`).
4. Run:
   ```
   node server.js
   ```
5. You'll see:
   ```
   ✅ Cloud Attendance Management System running!
      Open your browser at: http://localhost:3000
   ```
6. Open **http://localhost:3000** in your browser.

## Access from your mobile phone

When you run `node server.js`, the terminal now also prints a second link
like `http://192.168.x.x:3000` — that's your computer's WiFi (LAN) address.

1. Make sure your **phone and laptop are on the same WiFi network**.
2. On your phone's browser, open the `http://192.168.x.x:3000` address shown
   in the terminal (NOT `localhost` — that only works on the computer itself).
3. If it doesn't load, your computer's firewall may be blocking the port —
   allow Node.js / port 3000 through Windows Defender Firewall (or your
   Mac/Linux firewall), then try again.
4. Your laptop must stay running the server the whole time — the phone is
   just a client connecting to it, like any other website.

## Deploy to the real internet (so it works on ANY WiFi / mobile data — not just your laptop's network)

This is the recommended setup for your project so students, staff, and
parents can each use their own phone from anywhere, and your laptop doesn't
need to stay on. It has two parts: a free permanent database (MongoDB
Atlas) and a free web host (Render) that runs `server.js` for you 24/7.

### Part 1 — Free permanent database (MongoDB Atlas)

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a free **M0 cluster** (follow the on-screen setup wizard — it's free forever, no card charged).
3. Under **Database Access**, create a database user (username + password — save these).
4. Under **Network Access**, click **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) so Render can connect.
5. Click **Connect** on your cluster → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Replace `<username>` and `<password>` with the ones from step 3.

### Part 2 — Deploy the app (Render)

1. Push this project folder to a new GitHub repository (create a free
   GitHub account at github.com if you don't have one, create a new repo,
   and upload these files — GitHub's web UI lets you drag-and-drop files,
   no command line needed).
2. Go to https://render.com, sign up (you can use your GitHub account to sign in).
3. **New → Web Service** → connect the GitHub repo you just created.
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free
5. Before deploying, add an environment variable so the app knows to use
   MongoDB instead of the local file:
   - Go to the **Environment** tab → **Add Environment Variable**
   - Key: `MONGODB_URI`
   - Value: the connection string you copied from Atlas (with your real
     username/password filled in)
6. Click **Create Web Service** / **Deploy**. Wait a couple of minutes.
7. You'll get a permanent URL like `https://your-app-name.onrender.com` —
   this is what you share with students, staff, and parents. It works from
   any WiFi or mobile data, from anywhere.

### Notes on the free plan

- Render's free web services "sleep" after 15 minutes of no traffic and
  take ~30-60 seconds to wake up on the next visit — totally fine for a
  college project demo. Paid plans (~$7/month) remove this if you ever need it.
- With `MONGODB_URI` set, all student/staff/parent/attendance data is saved
  permanently in MongoDB Atlas (free forever, no time limit) — it will NOT
  reset when Render restarts or redeploys, unlike plain file storage.
- If you don't set `MONGODB_URI` at all (e.g., while testing locally),
  the app automatically falls back to the local `data/db.json` file —
  nothing changes for local development.

That's it — no `npm install` required. (If you ever add npm packages later,
you'd run `npm install` first, but this project doesn't need any.)

## Login credentials (demo data)

| Role    | Username / Reg No | Password    |
|---------|--------------------|-------------|
| Admin   | `admin`            | `admin123`  |
| Staff   | `staff` (shared by all staff — pick your name on the next screen) | `staff123` |
| Student | `22BCA001` (Arasan S) | any password |
| Parent  | `22BCA001` (Selvam R, father of Arasan S) | any password |

Staff all share one login (`staff` / `staff123`); after logging in, a
dropdown lets them pick which staff member they are, and their own
dashboard/data loads from there. Student and Parent logins use the
Register Number as the username with any password. Only the Admin login
checks a real password — all of this is easy to change in `server.js`
inside the `/api/login` handler.

## What's included

- **Landing page** — `index.html`
- **Login** (role-based) — `login.html`
- **Admin Dashboard** — stats + attendance chart — `admin-dashboard.html`
- **Student / Staff / Parent Management** (full Add/Edit/Delete, saved to disk — Admin only)
- **QR Code Attendance** — generates a real scannable QR per student and
  supports live camera scanning (via `html5-qrcode`) or a "Simulate Scan"
  button if you don't have a camera handy
- **Manual Attendance** — mark present/absent by department + date
- **Reports & Analytics** — bar chart + doughnut chart (Chart.js) + CSV export
- **Student / Staff / Parent Dashboards** — attendance %, recent records
- **Leave Requests & Complaints** — students request leave / raise complaints,
  staff/admin approve leave and reply to complaints
- **Notices & Announcements** — Admin posts, everyone can view
- **Timetable & Subject-wise Attendance** — student-only views
- **My QR Code** — students can view/download their own QR code
- **Profile & Settings**
- **Mobile responsive** — sidebar collapses to a hamburger menu on small screens

## Access control (who can do what)

| Feature | Admin | Staff | Student | Parent |
|---|---|---|---|---|
| Full CRUD on Students/Staff/Parents | ✅ | ❌ (view students only) | ❌ | ❌ |
| Mark attendance | ✅ (any dept) | ✅ (own dept only) | ❌ | ❌ |
| QR scanning tool | ✅ | ✅ | ❌ | ❌ |
| View own QR code | — | — | ✅ | ❌ |
| Reports + CSV export | ✅ (any dept) | ✅ (own dept only) | ❌ | ❌ |
| Own attendance report download | — | — | ✅ | ❌ |
| Approve/reject leave, reply to complaints | ✅ | ✅ | ❌ (submit only) | ❌ |
| Post/delete notices | ✅ | ❌ (view only) | ❌ (view only) | ❌ (view only) |
| Timetable / Subject-wise attendance | — | — | ✅ | ❌ |

This is enforced on the frontend (pages redirect unauthorized roles to their
own dashboard). Since this is a demo project without login tokens/sessions
on the server, a technically savvy user could still hit the API directly —
fine for a college project, but don't use this auth model in a real
production system.

## How data is stored

By default, all data (students, staff, parents, attendance, leave requests,
complaints) lives in **`data/db.json`** — every add/edit/delete from the UI
writes straight to this file, so nothing is lost when you restart the
server locally.

If you set the `MONGODB_URI` environment variable (see the deployment
section above), the app automatically switches to storing everything in
MongoDB Atlas instead — permanently, and safely surviving server
restarts/redeploys. You don't need to change any code to switch between
the two — `db.js` picks whichever one is configured.

## Project structure

```
attendance-system/
├── server.js          → main server (routing + REST API)
├── db.js               → reads/writes data/db.json
├── data/db.json         → the "database" (JSON file)
└── public/              → everything the browser loads
    ├── index.html, login.html, admin-dashboard.html, students.html,
    │   staff.html, parents.html, attendance-qr.html, attendance-manual.html,
    │   reports.html, student-dashboard.html, staff-dashboard.html,
    │   parent-dashboard.html, leave-notifications.html, settings.html
    ├── css/style.css
    └── js/common.js     → shared API helpers + sidebar navigation
```

## For your project report

You can describe the architecture as:
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS, fetch API), Chart.js for
  analytics, html5-qrcode for QR scanning
- **Backend:** Node.js (HTTP server, REST API)
- **Database:** JSON file storage by default; swaps automatically to
  MongoDB Atlas when deployed (set `MONGODB_URI`) — same data model either way
- **Architecture:** 3-tier (Presentation / Application / Data), Role-Based
  Access Control (Admin, Staff, Student, Parent)

## Extending it later

- Add real password hashing (currently plain-text for demo simplicity —
  do not use this login logic in production as-is).
- Add per-staff individual passwords instead of the shared staff login,
  if you'd rather each staff member have their own credentials.
