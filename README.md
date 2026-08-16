# Cloud Attendance — Landing Page Redesign

The screenshot shows the landing page rendering as almost plain HTML, which normally means the page's intended stylesheet is not being loaded. This package provides a self-contained replacement landing page with its own CSS and JS.

## Files
- `landing.html`
- `public/css/landing.css`
- `public/js/landing.js`

## Important
The links keep the existing `/login.html` route so the current authentication flow can remain connected.

If your existing landing page has a different filename, copy the markup from `landing.html` into that page or replace that page while preserving its existing route.
