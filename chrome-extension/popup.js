const BASE_URL = 'https://troytravelagency.com';
const frame = document.getElementById('troygoFrame');
const tabs = document.querySelectorAll('#tabs button');

tabs.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabs.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    frame.src = BASE_URL + btn.dataset.path;
  });
});

document.querySelector('footer a').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: frame.src || BASE_URL });
});
