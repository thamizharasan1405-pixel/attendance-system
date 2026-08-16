document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', event => {
      if (item.getAttribute('href') === '#') event.preventDefault();
    });
  });
});