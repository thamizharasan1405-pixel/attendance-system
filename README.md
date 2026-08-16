# AeroAttend — Step 2 Main Shell

This package contains the new global shell for the attendance project.

## Files
- `public/css/style.css` — complete shell styles, responsive rules, theme variables
- `public/js/common.js` — reusable role-based sidebar + header + mobile navigation
- `demo.html` — standalone preview

## Integration
On an existing page:
1. Keep the existing backend/API/page logic.
2. Link `public/css/style.css`.
3. Load `public/js/common.js`.
4. Keep `<div class="app-shell" id="app-shell"></div>`.
5. Call:
   `renderShell({ role: "admin", page: "Dashboard", subtitle: "Workspace" });`
6. Put that page's existing content inside `#page-content`.

Roles supported: `admin`, `staff`, `student`.

Backend, MongoDB, authentication and API logic are not changed by this package.
