
(function () {
  const AeroAttend = {
    init(options = {}) {
      this.options = {
        role: options.role || "admin",
        page: options.page || "Dashboard",
        subtitle: options.subtitle || "Smart Campus",
        ...options
      };
      this.renderShell();
      this.bind();
      this.applyTheme();
    },

    navByRole(role) {
      const common = [
        ["Dashboard","⌂","/admin-dashboard.html"],
        ["Students","◈","/students.html"],
        ["Staff","◉","/staff.html"],
        ["Attendance","✓","/attendance-manual.html"],
        ["Timetable","▦","/timetable.html"],
        ["Fees","₹","/fees.html"],
        ["Leave Requests","↗","/leave.html"],
        ["Complaints","!","/complaints.html"],
        ["Notices","◫","/notices.html"],
        ["Reports","⌁","/reports.html"]
      ];
      if (role === "staff") return [
        ["Dashboard","⌂","/staff-dashboard.html"],
        ["My Classes","▦","/timetable.html"],
        ["Attendance","✓","/attendance-manual.html"],
        ["QR Attendance","▣","/attendance-qr.html"],
        ["Students","◈","/students.html"],
        ["Reports","⌁","/reports.html"],
        ["Notices","◫","/notices.html"]
      ];
      if (role === "student") return [
        ["Dashboard","⌂","/student-dashboard.html"],
        ["My Attendance","✓","/attendance.html"],
        ["Timetable","▦","/timetable.html"],
        ["My QR","▣","/student-qr.html"],
        ["Fees","₹","/fees.html"],
        ["Notices","◫","/notices.html"],
        ["Leave & Complaints","!","/requests.html"]
      ];
      return common;
    },

    renderShell() {
      const shell = document.getElementById("app-shell");
      if (!shell) return;
      const role = this.options.role;
      const links = this.navByRole(role);
      const current = this.options.page;

      shell.innerHTML = `
        <aside class="app-sidebar" id="app-sidebar">
          <div class="app-brand">
            <div class="app-brand-mark">A</div>
            <div>
              <div class="app-brand-name">AeroAttend</div>
              <span class="app-brand-sub">Smart Campus</span>
            </div>
          </div>

          <nav class="app-nav">
            <div class="app-nav-label">Overview</div>
            ${links.slice(0,1).map(x=>this.link(x,current)).join("")}

            <div class="app-nav-label">Workspace</div>
            ${links.slice(1,5).map(x=>this.link(x,current)).join("")}

            <div class="app-nav-label">Campus</div>
            ${links.slice(5).map(x=>this.link(x,current)).join("")}
          </nav>

          <div class="app-sidebar-footer">
            <a class="app-nav-link" href="/settings.html"><span class="app-nav-icon">⚙</span> Settings</a>
            <a class="app-nav-link" href="/profile.html"><span class="app-nav-icon">◯</span> Profile</a>
            <div class="app-user">
              <div class="app-avatar">${role === "admin" ? "AD" : role === "staff" ? "ST" : "SR"}</div>
              <div class="app-user-info">
                <strong>${role.charAt(0).toUpperCase()+role.slice(1)} User</strong>
                <span>${role === "admin" ? "Administrator" : role === "staff" ? "Teaching Staff" : "Student"}</span>
              </div>
              <button class="app-icon-btn" id="app-user-menu" aria-label="User menu">⋮</button>
            </div>
          </div>
        </aside>

        <div class="app-overlay" id="app-overlay"></div>

        <main class="app-main">
          <header class="app-header">
            <button class="app-menu-btn" id="app-menu-btn" aria-label="Open menu">☰</button>
            <div class="app-page-title">
              <small>${this.options.subtitle}</small>
              <h1>${current}</h1>
            </div>

            <div class="app-header-actions">
              <label class="app-search">
                <span>⌕</span>
                <input type="search" placeholder="Search anything..." aria-label="Search">
                <kbd>⌘ K</kbd>
              </label>
              <button class="app-icon-btn" id="app-theme-btn" aria-label="Toggle theme">☼</button>
              <button class="app-icon-btn" aria-label="Notifications">♢</button>
              <button class="app-profile">
                <span class="app-avatar">${role === "admin" ? "AD" : role === "staff" ? "ST" : "SR"}</span>
                <span class="app-profile-text">${role.charAt(0).toUpperCase()+role.slice(1)}</span>
                <span>⌄</span>
              </button>
            </div>
          </header>
          <section class="app-content" id="page-content"></section>
        </main>

        <nav class="app-mobile-nav">
          <a class="active" href="#"><span>⌂</span>Home</a>
          <a href="/attendance-manual.html"><span>✓</span>Attendance</a>
          <a href="/timetable.html"><span>▦</span>Classes</a>
          <a href="/notices.html"><span>◫</span>Notices</a>
          <a href="/profile.html"><span>◯</span>Profile</a>
        </nav>
      `;
    },

    link(item, current) {
      return `<a class="app-nav-link ${item[0] === current ? "active" : ""}" href="${item[2]}">
        <span class="app-nav-icon">${item[1]}</span>${item[0]}
      </a>`;
    },

    bind() {
      const sidebar = document.getElementById("app-sidebar");
      const overlay = document.getElementById("app-overlay");
      document.getElementById("app-menu-btn")?.addEventListener("click", () => {
        sidebar.classList.add("open"); overlay.classList.add("show");
      });
      overlay?.addEventListener("click", () => {
        sidebar.classList.remove("open"); overlay.classList.remove("show");
      });
      document.getElementById("app-theme-btn")?.addEventListener("click", () => {
        const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        localStorage.setItem("aero-theme", next);
      });
    },

    applyTheme() {
      document.documentElement.dataset.theme = localStorage.getItem("aero-theme") || "light";
    }
  };

  window.AeroAttend = AeroAttend;
  window.renderShell = (options) => AeroAttend.init(options);
})();
