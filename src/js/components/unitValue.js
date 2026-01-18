let value = 100.0;
let currentUnit = "percent"; // 'percent' | 'px'
let lastValidValue = 100;

/**
 * Initialize unit value logic:
 * - switch unit (% / px)
 * - handle input typing
 * - validate on blur
 * - handle increase / decrease buttons
 */
export function initUnitValue() {
  const valueEl = document.getElementById("value");
  const unitButtons = document.querySelectorAll(".unit-btn");
  const actionButtons = document.querySelectorAll("[data-action]");

  unitButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      unitButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const newUnit = btn.dataset.unit === "percent" ? "percent" : "px";
      if (newUnit !== currentUnit) {
        currentUnit = newUnit;

        if (currentUnit === "percent" && value > 100) {
          value = 100;
        }
        updateInputAndButtons();
      }
    });
  });

  valueEl.addEventListener("input", () => {
    valueEl.value = valueEl.value.replace(",", ".");
  });

  valueEl.addEventListener("blur", () => {
    cleanupAndValidateInput();
  });

  actionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const currentValue = parseFloat(valueEl.value) || 0;
      const delta = btn.dataset.action === "increase" ? 0.1 : -0.1;
      value = clampValue(currentValue + delta);
      updateInputAndButtons();
    });

    btn.addEventListener("mouseenter", () => {
      if (btn.dataset.action === "increase" && currentUnit !== "percent")
        return;

      const wrapper = btn.closest(".stepper-btn-wrapper");
      const tooltip = wrapper.querySelector(".tooltip");
      if (!tooltip) return;

      const rect = btn.getBoundingClientRect();
      tooltip.style.left = rect.left + rect.width / 2 + "px";
      tooltip.style.top = rect.top - 38 + "px";
      tooltip.style.transform = "translateX(-50%)";
    });
  });

  updateInputAndButtons();
}

/**
 * Clean and validate input on blur:
 * - extract the first valid number
 * - clamp value based on unit
 * - store last valid percent value
 */
function cleanupAndValidateInput() {
  const valueEl = document.getElementById("value");
  let input = valueEl.value.trim();

  if (!input) {
    value = 0;
    updateInputAndButtons();
    return;
  }

  input = input.replace(",", ".");

  const match = input.match(/-?\d+(\.\d+)?/);
  const cleanValue = match ? parseFloat(match[0]) : 0;

  const newValue = clampValue(cleanValue);

  if (currentUnit === "percent" && newValue >= 0 && newValue <= 100) {
    lastValidValue = newValue;
  }

  value = newValue;
  updateInputAndButtons();
}

/**
 * Clamp value:
 * - minimum is always 0
 * - maximum is 100 for percent unit
 */
function clampValue(val) {
  if (val < 0) return 0;

  if (currentUnit === "percent" && val > 100) {
    return lastValidValue;
  }

  return val;
}

/**
 * Sync UI state:
 * - update input value
 * - enable / disable buttons
 * - show / hide tooltip based on unit
 */
function updateInputAndButtons() {
  const valueEl = document.getElementById("value");
  const decreaseBtn = document.querySelector('[data-action="decrease"]');
  const increaseBtn = document.querySelector('[data-action="increase"]');
  const tooltip = increaseBtn
    .closest(".stepper-btn-wrapper")
    .querySelector(".tooltip");

  valueEl.value = formatValue(value);

  decreaseBtn.disabled = value === 0;

  if (currentUnit === "percent") {
    increaseBtn.disabled = value === 100;
    if (tooltip) tooltip.style.display = "";
  } else {
    increaseBtn.disabled = false;
    if (tooltip) tooltip.style.display = "none";
  }
}

/**
 * Format number for display:
 * - integer → no decimal
 * - decimal → one decimal place
 */
function formatValue(val) {
  return Number.isInteger(val) ? String(val) : val.toFixed(1);
}

export function getValue() {
  return value;
}

export function getUnit() {
  return currentUnit;
}
