import { clamp } from '../utils/clamp.js';

let value = 1.0;
let currentUnit = 'percent'; // 'percent' or 'px'

export function initUnitValue() {
  const valueEl = document.getElementById('value');
  const unitButtons = document.querySelectorAll('.unit-btn');
  const actionButtons = document.querySelectorAll('[data-action]');

  // Unit switching
  unitButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      unitButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const newUnit = btn.dataset.unit === 'percent' ? 'percent' : 'px';
      if (newUnit !== currentUnit) {
        currentUnit = newUnit;
        
        // If switching to % and value > 100, set to 100
        if (currentUnit === 'percent' && value > 100) {
          value = 100;
        }
        updateInputAndButtons();
      }
    });
  });

  // Input event - allow comma to dot conversion
  valueEl.addEventListener('input', () => {
    valueEl.value = valueEl.value.replace(',', '.');
  });

  // Blur event - validate and clean up input
  valueEl.addEventListener('blur', () => {
    cleanupAndValidateInput();
  });

  // Action buttons (increase/decrease)
  actionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentValue = parseFloat(valueEl.value) || 0;
      const newValue = currentValue + (btn.dataset.action === 'increase' ? 0.1 : -0.1);
      value = clampValue(newValue);
      updateInputAndButtons();
    });
    
    // Position tooltip on hover
    btn.addEventListener('mouseenter', (e) => {
      const wrapper = btn.closest('.stepper-btn-wrapper');
      const tooltip = wrapper.querySelector('.tooltip');
      if (tooltip) {
        const rect = btn.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 + 'px';
        tooltip.style.top = rect.top - 38 + 'px';
        tooltip.style.transform = 'translateX(-50%)';
      }
    });
  });

  // Initialize button states
  updateInputAndButtons();
}

function cleanupAndValidateInput() {
  const valueEl = document.getElementById('value');
  let input = valueEl.value.trim();

  if (!input) {
    valueEl.value = '0';
    value = 0;
    updateInputAndButtons();
    return;
  }

  // Replace comma with dot
  input = input.replace(',', '.');

  // Extract the first valid number (handles cases like "a123", "123a", "12a3", "12.4.5")
  const numberMatch = input.match(/\d+(\.\d+)?/);
  let cleanValue = 0;

  if (numberMatch) {
    cleanValue = parseFloat(numberMatch[0]);
  }

  // Apply constraints
  value = clampValue(cleanValue);
  updateInputAndButtons();
}

function clampValue(val) {
  // Minimum is always 0
  if (val < 0) val = 0;
  
  // Maximum depends on unit
  if (currentUnit === 'percent' && val > 100) val = 100;
  
  return val;
}

function updateInputAndButtons() {
  const valueEl = document.getElementById('value');
  const decreaseBtn = document.querySelector('[data-action="decrease"]');
  const increaseBtn = document.querySelector('[data-action="increase"]');

  // Update input value
  valueEl.value = value.toFixed(1);

  // Disable/enable buttons based on current value
  if (currentUnit === 'percent') {
    decreaseBtn.disabled = value === 0;
    increaseBtn.disabled = value === 100;
  } else {
    // For px, only disable decrease at 0
    decreaseBtn.disabled = value === 0;
    increaseBtn.disabled = false;
  }
}

export function getValue() {
  return value;
}

export function getUnit() {
  return currentUnit;
}
