import { describe, it, expect, beforeEach } from "vitest";
import {
  getValue,
  getUnit,
  initUnitValue,
} from "../src/js/components/unitValue";

let valueInput;
let decreaseBtn;
let increaseBtn;

beforeEach(() => {
  // Setup DOM
  document.body.innerHTML = `
    <div class="bg-neutral-800 p-6 rounded-xl w-[420px] text-white space-y-6">
      <div class="flex justify-between items-center">
        <div class="flex flex-row items-start p-0.5 gap-0.5 w-[140px] h-9 bg-neutral-900 rounded-lg">
          <button data-unit="percent" class="unit-btn active">%</button>
          <button data-unit="px" class="unit-btn">px</button>
        </div>
      </div>
      <div class="flex justify-between items-center">
        <div class="flex flex-row items-center w-[140px] h-9 bg-neutral-900 rounded-lg">
          <div class="stepper-btn-wrapper">
            <button data-action="decrease" class="stepper-btn">−</button>
            <div class="tooltip"></div>
          </div>
          <input id="value" type="text" value="1.0" />
          <div class="stepper-btn-wrapper">
            <button data-action="increase" class="stepper-btn">+</button>
            <div class="tooltip"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  initUnitValue();

  valueInput = document.getElementById("value");
  unitButtons = document.querySelectorAll(".unit-btn");
  decreaseBtn = document.querySelector('[data-action="decrease"]');
  increaseBtn = document.querySelector('[data-action="increase"]');
});

describe("Unit", () => {
  it("default unit is %", () => {
    expect(getUnit()).toBe("percent");
  });

  it("can switch between % and px", () => {
    const pxBtn = document.querySelector('[data-unit="px"]');
    pxBtn.click();
    expect(getUnit()).toBe("px");

    const percentBtn = document.querySelector('[data-unit="percent"]');
    percentBtn.click();
    expect(getUnit()).toBe("percent");
  });

  it("switching from px to % clamps value to 100 if greater", () => {
    const pxBtn = document.querySelector('[data-unit="px"]');
    pxBtn.click();

    valueInput.value = "150";
    valueInput.dispatchEvent(new Event("blur"));

    const percentBtn = document.querySelector('[data-unit="percent"]');
    percentBtn.click();

    expect(getValue()).toBe(100);
    expect(valueInput.value).toBe("100");
  });
});

describe("Value stepper - Input validation", () => {
  it("default value is 100", () => {
    expect(getValue()).toBe(100);
    expect(valueInput.value).toBe("100");
  });

  it("allows integer and float values", () => {
    valueInput.value = "50";
    valueInput.dispatchEvent(new Event("blur"));
    expect(getValue()).toBe(50);
    expect(valueInput.value).toBe("50");

    valueInput.value = "12.5";
    valueInput.dispatchEvent(new Event("blur"));
    expect(getValue()).toBe(12.5);
    expect(valueInput.value).toBe("12.5");
  });

  it("replaces comma with dot", () => {
    valueInput.value = "12,3";
    valueInput.dispatchEvent(new Event("input"));
    expect(valueInput.value).toBe("12.3");
  });

  it("removes invalid characters: 123a -> 123", () => {
    const pxBtn = document.querySelector('[data-unit="px"]');
    pxBtn.click();
    
    valueInput.value = "123a";
    valueInput.dispatchEvent(new Event("blur"));
    expect(getValue()).toBe(123);
    expect(valueInput.value).toBe("123");
  });

  it("removes invalid characters: 12a3 -> 12", () => {
    valueInput.value = "12a3";
    valueInput.dispatchEvent(new Event("blur"));
    expect(getValue()).toBe(12);
    expect(valueInput.value).toBe("12");
  });

  it("removes invalid characters: a123 -> 123", () => {
    valueInput.value = "a123";
    valueInput.dispatchEvent(new Event("blur"));
    expect(getValue()).toBe(123);
    expect(valueInput.value).toBe("123");
  });

  it("handles multiple dots: 12.4.5 -> 12.4", () => {
    valueInput.value = "12.4.5";
    valueInput.dispatchEvent(new Event("blur"));
    expect(getValue()).toBe(12.4);
    expect(valueInput.value).toBe("12.4");
  });

  it("clamps negative values to 0", () => {
    valueInput.value = "-10";
    valueInput.dispatchEvent(new Event("blur"));
    expect(getValue()).toBe(0);
    expect(valueInput.value).toBe("0");
  });
});

describe("Value stepper - Percent unit constraints", () => {
  it("reverts to previous valid value if input > 100", () => {
    valueInput.value = "80";
    valueInput.dispatchEvent(new Event("blur"));
    expect(getValue()).toBe(80);
    expect(valueInput.value).toBe("80");
  });

  it("disables decrease button when value is 0", () => {
    valueInput.value = "0";
    valueInput.dispatchEvent(new Event("blur"));
    expect(decreaseBtn.disabled).toBe(true);
  });

  it("enables both buttons for values between 0 and 100", () => {
    valueInput.value = "50";
    valueInput.dispatchEvent(new Event("blur"));
    expect(decreaseBtn.disabled).toBe(false);
    expect(increaseBtn.disabled).toBe(false);
  });
});

describe("Value stepper - Pixel unit constraints", () => {
  beforeEach(() => {
    const pxBtn = document.querySelector('[data-unit="px"]');
    pxBtn.click();
  });

  it("allows values > 100 when unit is px", () => {
    valueInput.value = "500";
    valueInput.dispatchEvent(new Event("blur"));
    expect(getValue()).toBe(500);
    expect(valueInput.value).toBe("500");
  });

  it("disables decrease button when value is 0 in px mode", () => {
    valueInput.value = "0";
    valueInput.dispatchEvent(new Event("blur"));
    expect(decreaseBtn.disabled).toBe(true);
  });

  it("never disables increase button for px unit", () => {
    valueInput.value = "1000";
    valueInput.dispatchEvent(new Event("blur"));
    expect(increaseBtn.disabled).toBe(false);
  });
});

describe("Value stepper - Increment/Decrement buttons", () => {
  it("increases value by 0.1 when + button clicked", () => {
    valueInput.value = "5.0";
    valueInput.dispatchEvent(new Event("blur"));

    increaseBtn.click();
    expect(getValue()).toBeCloseTo(5.1, 1);
  });

  it("decreases value by 0.1 when - button clicked", () => {
    valueInput.value = "5.0";
    valueInput.dispatchEvent(new Event("blur"));

    decreaseBtn.click();
    expect(getValue()).toBeCloseTo(4.9, 1);
  });
});
