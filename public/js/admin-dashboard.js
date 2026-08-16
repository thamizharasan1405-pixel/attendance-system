
const AeroAdminDashboard = {
  mount() {
    const target = document.getElementById("page-content");
    if (!target) return;

    target.innerHTML = `
      <div class="dashboard">
        <section class="dashboard-welcome">
          <div>
            <div class="dashboard-eyebrow">Sunday · August 16, 2026</div>
            <h2>Good evening, Admin <span>👋</span></h2>
            <p>Here's a live overview of attendance and campus activity.</p>
          </div>
          <div class="dashboard-actions">
            <button class="dash-btn" data-action="export">↓ Export</button>
            <button class="dash-btn primary" data-action="quick">＋ Quick Action</button>
          </div>
        </section>

        <section class="kpi-row">
          ${this.metric("Students","1,248","◈","+8.2%","vs last month","up")}
          ${this.metric("Today's Attendance","92.4%","✓","+2.4%","vs yesterday","up",92.4)}
          ${this.metric("Active Staff","78","◉","86","total staff","normal")}
          ${this.metric("Pending Requests","23","↗","7","need review","warn")}
        </section>

        <section class="dashboard-grid-2">
          <article class="card dashboard-card">
            <div class="card-head">
              <div><div class="card-kicker">Performance</div><h3>Attendance Pulse</h3></div>
              <select class="period-select"><option>Last 7 days</option><option>Last 30 days</option><option>This semester</option></select>
            </div>
            <div class="attendance-chart">
              <div class="chart-axis"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
              <div class="chart-canvas">
                <div class="chart-area-fill"></div>
                <div class="chart-line">
                  <svg viewBox="0 0 700 220" preserveAspectRatio="none" aria-label="Attendance trend">
                    <polyline points="0,104 100,88 200,99 300,69 400,80 500,45 600,57 700,32"></polyline>
                  </svg>
                </div>
                <div class="chart-points">
                  <i class="chart-point" style="--point:47%"></i><i class="chart-point" style="--point:40%"></i>
                  <i class="chart-point" style="--point:45%"></i><i class="chart-point" style="--point:31%"></i>
                  <i class="chart-point" style="--point:36%"></i><i class="chart-point" style="--point:20%"></i>
                  <i class="chart-point" style="--point:25%"></i><i class="chart-point" style="--point:15%"></i>
                </div>
                <div class="chart-days"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
              </div>
            </div>
          </article>

          <article class="card dashboard-card health">
            <div class="card-head" style="width:100%">
              <div><div class="card-kicker">Today</div><h3>Attendance Health</h3></div>
              <span class="status-pill status-present">Healthy</span>
            </div>
            <div class="health-ring">
              <div class="health-ring-inner"><strong>92.4%</strong><span>overall attendance</span></div>
            </div>
            <div class="health-grid">
              <div class="health-stat"><b><i class="health-dot green"></i>1,153</b><span>Present</span></div>
              <div class="health-stat"><b><i class="health-dot red"></i>72</b><span>Absent</span></div>
              <div class="health-stat"><b><i class="health-dot orange"></i>23</b><span>Late</span></div>
            </div>
          </article>
        </section>

        <section class="card dashboard-card">
          <div class="card-head">
            <div><div class="card-kicker">Shortcuts</div><h3>Quick Actions</h3></div>
          </div>
          <div class="quick-grid">
            ${this.quick("＋","Add Student","Create student profile","/students.html")}
            ${this.quick("✓","Mark Attendance","Open attendance","/attendance-manual.html")}
            ${this.quick("▣","QR Attendance","Scan student QR","/attendance-qr.html")}
            ${this.quick("◫","Publish Notice","Send announcement","/notices.html")}
          </div>
        </section>

        <section class="lower-grid">
          <article class="card dashboard-card">
            <div class="card-head">
              <div><div class="card-kicker">Live data</div><h3>Recent Attendance</h3></div>
              <a class="card-link" href="/attendance-manual.html">View all →</a>
            </div>
            <div style="overflow:auto">
              <table class="dashboard-table">
                <thead><tr><th>Student</th><th>Reg No.</th><th>Department</th><th>Period</th><th>Status</th></tr></thead>
                <tbody>
                  ${this.row("AK","Arun Kumar","23CA001","BCA","03","present")}
                  ${this.row("PS","Priya S","23CA002","BCA","03","present")}
                  ${this.row("RM","Rahul M","23CS019","BSc CS","03","absent")}
                  ${this.row("SD","Shalini D","23CA014","BCA","02","late")}
                </tbody>
              </table>
            </div>
          </article>

          <article class="card dashboard-card">
            <div class="card-head"><div><div class="card-kicker">Campus</div><h3>Recent Activity</h3></div></div>
            <div class="activity-list">
              ${this.activity("✓","blue","Attendance submitted","ST042 submitted BCA-II attendance.","8 min ago")}
              ${this.activity("₹","green","Fee verified","3 payment records were verified.","24 min ago")}
              ${this.activity("!","orange","New leave request","2 requests are waiting for approval.","1 hr ago")}
              ${this.activity("◫","red","Notice published","Semester circular was published.","2 hrs ago")}
            </div>
          </article>
        </section>

        <section class="dashboard-grid-2">
          <article class="card dashboard-card">
            <div class="card-head"><div><div class="card-kicker">Communication</div><h3>Latest Notices</h3></div><a class="card-link" href="/notices.html">All notices →</a></div>
            <div class="notice-list">
              ${this.notice("Exam","Internal assessment schedule has been published.","Today · 10:30 AM")}
              ${this.notice("Fee","Last date for fee verification is approaching.","Yesterday")}
              ${this.notice("Campus","Department meeting scheduled for Monday.","Aug 14")}
            </div>
          </article>
          <article class="card dashboard-card">
            <div class="card-head"><div><div class="card-kicker">Attention</div><h3>Pending Approvals</h3></div><a class="card-link" href="/leave.html">Review →</a></div>
            <div class="notice-list">
              ${this.notice("Leave","7 student leave requests","Awaiting admin review")}
              ${this.notice("Complaint","4 complaints","Need response")}
              ${this.notice("Fee","12 fee records","Need verification")}
            </div>
          </article>
        </section>
      </div>
    `;

    this.bind();
  },

  metric(title,value,icon,meta,caption,type,progress){
    const metaClass = type === "warn" ? "warn" : "";
    const metaText = type === "up" ? `<b>↗ ${meta}</b>` : `<b>${meta}</b>`;
    return `<article class="card metric-card">
      <div class="metric-top"><span>${title}</span><span class="metric-icon">${icon}</span></div>
      <strong class="metric-value">${value}</strong>
      ${progress ? `<div class="metric-progress"><span style="width:${progress}%"></span></div>` : ""}
      <div class="metric-meta ${metaClass}">${metaText} · ${caption}</div>
    </article>`;
  },

  quick(icon,title,desc,href){
    return `<a class="quick-action" href="${href}"><span class="quick-action-icon">${icon}</span><b>${title}</b><span>${desc}</span></a>`;
  },

  row(initials,name,reg,dept,period,status){
    const labels={present:"Present",absent:"Absent",late:"Late"};
    return `<tr><td><div class="student-cell"><span class="mini-avatar">${initials}</span>${name}</div></td><td>${reg}</td><td>${dept}</td><td>${period}</td><td><span class="status-pill status-${status}">● ${labels[status]}</span></td></tr>`;
  },

  activity(icon,theme,title,text,time){
    return `<div class="activity-item"><span class="activity-icon ${theme}">${icon}</span><div class="activity-copy"><b>${title}</b><p>${text}</p><time>${time}</time></div></div>`;
  },

  notice(title,text,time){
    return `<div class="notice"><span class="notice-mark">◫</span><div><b>${title}</b><p>${text}</p><time>${time}</time></div></div>`;
  },

  bind(){
    document.querySelector('[data-action="export"]')?.addEventListener("click",()=>alert("Connect this button to your existing report/CSV export API."));
    document.querySelector('[data-action="quick"]')?.addEventListener("click",()=>alert("Quick Action menu can be connected to your existing modules."));
  }
};

window.AeroAdminDashboard = AeroAdminDashboard;
