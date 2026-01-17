import { initUnitValue } from './components/unitValue.js';

fetch('./src/templates/unitValue.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('app').innerHTML = html;
    initUnitValue();
  });
