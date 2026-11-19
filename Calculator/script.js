const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");

let expression = "";        
let justEvaluated = false;  

const OPERATORS = ["+", "−", "×", "÷"];

function tokenize(expr) {
  const tokens = [];
  let num = "";
  for (const ch of expr) {
    if (/[\d.]/.test(ch)) {
      num += ch;
    } else if (num !== "" && num !== "-") {
      tokens.push(num, ch);
      num = "";
    } else if (ch === "−" && num === "" &&
               (tokens.length === 0 || OPERATORS.includes(tokens[tokens.length - 1]))) {
      num = "-";
    } else {
      return null;
    }
  }
  if (num === "" || num === "-") return null;
  tokens.push(num);
  return tokens;
}

function stripTrailingOperators(str) {
  while (OPERATORS.includes(str.slice(-1))) str = str.slice(0, -1);
  return str;
}

function evaluate(expr) {
  const tokens = tokenize(expr);
  if (!tokens) return null;

  const pass1 = [tokens[0]];
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i];
    const next = parseFloat(tokens[i + 1]);
    if (op === "×" || op === "÷") {
      const prev = parseFloat(pass1.pop());
      if (op === "÷" && next === 0) throw new Error("Cannot divide by 0");
      pass1.push(op === "×" ? prev * next : prev / next);
    } else {
      pass1.push(op, next);
    }
  }

  let total = parseFloat(pass1[0]);
  for (let i = 1; i < pass1.length; i += 2) {
    const next = parseFloat(pass1[i + 1]);
    total = pass1[i] === "+" ? total + next : total - next;
  }

  return parseFloat(total.toFixed(10));
}

function fmt(n) {
  let str = String(n);
  if (str.includes("e")) {
    str = Math.abs(n) < 1
      ? n.toFixed(10).replace(/\.?0+$/, "")
      : n.toLocaleString("fullwide", { useGrouping: false });
  }
  return str.replace("-", "−");
}

function updateDisplay() {
  expressionEl.textContent = expression || "0";
  resultEl.classList.remove("final");
  const preview = stripTrailingOperators(expression);
  const tokens = tokenize(preview);
  if (!tokens || tokens.length < 3) {
    resultEl.textContent = "";
    return;
  }

  try {
    const value = evaluate(preview);
    resultEl.textContent = value === null || Number.isNaN(value) ? "" : "= " + fmt(value);
  } catch (err) {
    resultEl.textContent = err.message;
  }
}

function inputNumber(digit) {
  if (justEvaluated) {
    expression = "";
    justEvaluated = false;
  }
  expression += digit;
  updateDisplay();
}

function inputDot() {
  if (justEvaluated) {
    expression = "";
    justEvaluated = false;
  }
  const lastNumber = expression.split(/[+−×÷]/).pop();
  if (lastNumber.includes(".")) return;
  expression += lastNumber === "" ? "0." : ".";
  updateDisplay();
}

function inputOperator(op) {
  justEvaluated = false;
  if (expression === "") {
    if (op === "−") expression = "−";
    updateDisplay();
    return;
  }
  if (expression === "−") return;

  const last = expression.slice(-1);
  if (OPERATORS.includes(last)) {
    if (op === "−") {
      if (last !== "−") {
        expression += op;
        updateDisplay();
      }
      return;
    }
    expression = stripTrailingOperators(expression);
  }
  expression += op;
  updateDisplay();
}

function percent() {
  const match = expression.match(/(\d+\.?\d*|\.\d+)$/);
  if (!match) return;
  const value = parseFloat(match[0]) / 100;
  expression = expression.slice(0, -match[0].length) + fmt(value).replace("−", "-");
  updateDisplay();
}

function clearAll() {
  expression = "";
  justEvaluated = false;
  updateDisplay();
}

function deleteLast() {
  if (justEvaluated) return clearAll();
  expression = expression.slice(0, -1);
  updateDisplay();
}

function calculate() {
  if (expression === "") return;
  const toEvaluate = stripTrailingOperators(expression);

  try {
    const value = evaluate(toEvaluate);
    if (value === null || Number.isNaN(value)) return;
    expression = fmt(value);
    expressionEl.textContent = expression;
    resultEl.textContent = "";
    justEvaluated = true;
  } catch (err) {
    expressionEl.textContent = "Error";
    resultEl.textContent = err.message;
    expression = "";
  }
}
document.querySelector(".keys").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.num !== undefined) inputNumber(btn.dataset.num);
  else if (btn.dataset.op) inputOperator(btn.dataset.op);
  else if (btn.dataset.action === "dot") inputDot();
  else if (btn.dataset.action === "clear") clearAll();
  else if (btn.dataset.action === "delete") deleteLast();
  else if (btn.dataset.action === "percent") percent();
  else if (btn.dataset.action === "equals") calculate();
});

const keyMap = { "+": "+", "-": "−", "*": "×", "x": "×", "/": "÷" };

function flash(selector) {
  const btn = document.querySelector(selector);
  if (!btn) return;
  btn.classList.add("pressed");
  setTimeout(() => btn.classList.remove("pressed"), 120);
}

document.addEventListener("keydown", (e) => {
  const key = e.key;

  if (/^[0-9]$/.test(key)) {
    inputNumber(key);
    flash(`[data-num="${key}"]`);
  } else if (keyMap[key]) {
    e.preventDefault();
    inputOperator(keyMap[key]);
    flash(`[data-op="${keyMap[key]}"]`);
  } else if (key === ".") {
    inputDot();
    flash('[data-action="dot"]');
  } else if (key === "Enter" || key === "=") {
    e.preventDefault();
    calculate();
    flash('[data-action="equals"]');
  } else if (key === "Backspace") {
    deleteLast();
    flash('[data-action="delete"]');
  } else if (key === "Escape" || key === "Delete") {
    clearAll();
    flash('[data-action="clear"]');
  } else if (key === "%") {
    percent();
    flash('[data-action="percent"]');
  }
});

updateDisplay();