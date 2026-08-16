document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const menu = document.getElementById('menuBtn');
  const close = () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); };
  menu?.addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('show'); });
  overlay?.addEventListener('click', close);
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 760) close();
    });
  });
});