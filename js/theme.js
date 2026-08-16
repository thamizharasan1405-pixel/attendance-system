const savedTheme = localStorage.getItem('aero-theme') || 'light';
document.documentElement.dataset.theme = savedTheme;
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('themeBtn');
  btn?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('aero-theme', next);
  });
});