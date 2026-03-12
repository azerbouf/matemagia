function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateWrongAnswers(correct, count = 3) {
  const wrong = new Set();
  let attempts = 0;
  while (wrong.size < count && attempts < 100) {
    const offset = randInt(1, Math.max(10, Math.abs(correct) || 10));
    const sign = Math.random() > 0.5 ? 1 : -1;
    const val = correct + sign * offset;
    if (val !== correct && !wrong.has(val)) wrong.add(val);
    attempts++;
  }
  let fallback = 1;
  while (wrong.size < count) {
    if (correct + fallback !== correct) wrong.add(correct + fallback);
    if (wrong.size < count && correct - fallback !== correct) wrong.add(correct - fallback);
    fallback++;
  }
  return Array.from(wrong).slice(0, count);
}

// ─── Explanation Helpers ──────────────────────────────────────────────────────

function addExplanation(a, b, answer) {
  if (a <= 10 && b <= 10) {
    return `${a} + ${b} = ${answer}\n📌 Начни с числа ${a} и посчитай вперёд ${b} шагов:\n${a}, ${Array.from({ length: b }, (_, i) => a + i + 1).join(', ')} → Ответ: ${answer}`;
  }
  const bTens = Math.floor(b / 10) * 10;
  const bOnes = b % 10;
  if (bOnes === 0) {
    return `${a} + ${b} = ${answer}\n📌 Прибавляем ${b} к ${a}:\nУвеличиваем десятки на ${b / 10}: ${a} + ${b} = ${answer}`;
  }
  return `${a} + ${b} = ${answer}\n📌 Разбиваем ${b} на части: ${bTens} + ${bOnes}\nШаг 1: ${a} + ${bTens} = ${a + bTens}\nШаг 2: ${a + bTens} + ${bOnes} = ${answer}`;
}

function subExplanation(a, b, answer) {
  if (a <= 20 && b <= 10) {
    return `${a} − ${b} = ${answer}\n📌 Начни с числа ${a} и посчитай назад ${b} шагов:\n${a}, ${Array.from({ length: b }, (_, i) => a - i - 1).join(', ')} → Ответ: ${answer}`;
  }
  const bTens = Math.floor(b / 10) * 10;
  const bOnes = b % 10;
  if (bOnes === 0) {
    return `${a} − ${b} = ${answer}\n📌 Вычитаем ${b} из ${a}:\nУменьшаем на ${b / 10} десятков: ${a} − ${b} = ${answer}`;
  }
  return `${a} − ${b} = ${answer}\n📌 Разбиваем ${b} на части: ${bTens} + ${bOnes}\nШаг 1: ${a} − ${bTens} = ${a - bTens}\nШаг 2: ${a - bTens} − ${bOnes} = ${answer}`;
}

function mulExplanation(a, b, answer) {
  const mn = Math.min(a, b);
  const mx = Math.max(a, b);
  if (a <= 10 && b <= 10) {
    if (mn <= 4) {
      const steps = Array.from({ length: mn }, () => mx).join(' + ');
      return `${a} × ${b} = ${answer}\n📌 Умножение — это повторное сложение:\n${steps} = ${answer}\n💡 Подсказка: ${a} × ${b} = ${b} × ${a} = ${answer}`;
    }
    return `${a} × ${b} = ${answer}\n📌 Из таблицы умножения: ${a} × ${b} = ${answer}\n💡 Проверка: ${answer} ÷ ${a} = ${b} ✓`;
  }
  // 11–20 × однозначное
  const aTens = Math.floor(a / 10) * 10;
  const aOnes = a % 10;
  return `${a} × ${b} = ${answer}\n📌 Разбиваем ${a} = ${aTens} + ${aOnes}:\nШаг 1: ${aTens} × ${b} = ${aTens * b}\nШаг 2: ${aOnes} × ${b} = ${aOnes * b}\nШаг 3: ${aTens * b} + ${aOnes * b} = ${answer}`;
}

function divExplanation(a, b, answer) {
  return `${a} ÷ ${b} = ${answer}\n📌 Деление — это обратное умножение.\nВопрос: ${b} × ? = ${a}\n${b} × ${answer} = ${a} ✓\nОтвет: ${answer}`;
}

function squareExplanation(a, answer) {
  return `${a}² = ${answer}\n📌 Квадрат = число, умноженное само на себя:\n${a} × ${a} = ${answer}\n💡 Запомни: ${a}² всегда равно ${answer}`;
}

// ─── Question Generators ──────────────────────────────────────────────────────

function generateEasyQuestion() {
  const op = Math.random() > 0.5 ? "+" : "-";
  let a, b, answer;
  if (op === "+") {
    a = randInt(0, 99); b = randInt(0, 100 - a); answer = a + b;
  } else {
    a = randInt(1, 100); b = randInt(0, a); answer = a - b;
  }
  const display = op === "+" ? `${a} + ${b}` : `${a} − ${b}`;
  const explanation = op === "+" ? addExplanation(a, b, answer) : subExplanation(a, b, answer);
  return { display, answer, explanation };
}

function generateMediumQuestion() {
  const type = randInt(0, 2);
  let a, b, answer, display, explanation;
  if (type === 0) {
    const op = Math.random() > 0.5 ? "+" : "-";
    if (op === "+") {
      a = randInt(100, 900); b = randInt(100, 1000 - a); answer = a + b;
      display = `${a} + ${b}`; explanation = addExplanation(a, b, answer);
    } else {
      a = randInt(200, 1000); b = randInt(100, a - 1); answer = a - b;
      display = `${a} − ${b}`; explanation = subExplanation(a, b, answer);
    }
  } else if (type === 1) {
    a = randInt(2, 10); b = randInt(2, 10); answer = a * b;
    display = `${a} × ${b}`; explanation = mulExplanation(a, b, answer);
  } else {
    b = randInt(2, 10); answer = randInt(2, 10); a = b * answer;
    display = `${a} ÷ ${b}`; explanation = divExplanation(a, b, answer);
  }
  return { display, answer, explanation };
}

function generateHardQuestion() {
  const type = randInt(0, 2);
  let a, b, answer, display, explanation;
  if (type === 0) {
    const op = Math.random() > 0.5 ? "+" : "-";
    if (op === "+") {
      a = randInt(200, 4800); b = randInt(200, 5000 - a); answer = a + b;
      display = `${a} + ${b}`; explanation = addExplanation(a, b, answer);
    } else {
      a = randInt(400, 5000); b = randInt(200, a - 1); answer = a - b;
      display = `${a} − ${b}`; explanation = subExplanation(a, b, answer);
    }
  } else if (type === 1) {
    a = randInt(1, 9); b = randInt(1, 9); answer = a * b;
    display = `${a} × ${b}`; explanation = mulExplanation(a, b, answer);
  } else {
    b = randInt(1, 9); answer = randInt(1, 9); a = b * answer;
    display = `${a} ÷ ${b}`; explanation = divExplanation(a, b, answer);
  }
  return { display, answer, explanation };
}

function generateBonusQuestion() {
  const type = randInt(0, 3);
  let a, b, answer, display, explanation;
  if (type === 0) {
    a = randInt(2, 15); answer = a * a;
    display = `${a}²`; explanation = squareExplanation(a, answer);
  } else if (type === 1) {
    a = randInt(11, 20); b = randInt(2, 9); answer = a * b;
    display = `${a} × ${b}`; explanation = mulExplanation(a, b, answer);
  } else if (type === 2) {
    b = randInt(3, 12); answer = randInt(3, 12); a = b * answer;
    display = `${a} ÷ ${b}`; explanation = divExplanation(a, b, answer);
  } else {
    const op = Math.random() > 0.5 ? "+" : "-";
    if (op === "+") {
      a = randInt(1000, 8000); b = randInt(1000, 9999 - a); answer = a + b;
      display = `${a} + ${b}`; explanation = addExplanation(a, b, answer);
    } else {
      a = randInt(2000, 9999); b = randInt(1000, a - 1); answer = a - b;
      display = `${a} − ${b}`; explanation = subExplanation(a, b, answer);
    }
  }
  return { display, answer, explanation };
}

// ─── Seeded PRNG for daily challenge ─────────────────────────────────────────

function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function () {
    h |= 0; h = h + 0x6D2B79F5 | 0;
    let t = Math.imul(h ^ h >>> 15, 1 | h);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function generateDailyQuestion() {
  const r = Math.random();
  if (r < 0.25) return generateEasyQuestion();
  if (r < 0.55) return generateMediumQuestion();
  if (r < 0.80) return generateHardQuestion();
  return generateBonusQuestion();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function generateQuestion(level) {
  let q;
  switch (level) {
    case "easy":   q = generateEasyQuestion();   break;
    case "medium": q = generateMediumQuestion(); break;
    case "hard":   q = generateHardQuestion();   break;
    case "bonus":  q = generateBonusQuestion();  break;
    case "daily":  q = generateDailyQuestion();  break;
    default:       q = generateEasyQuestion();
  }
  const wrongAnswers = generateWrongAnswers(q.answer);
  const options = shuffle([q.answer, ...wrongAnswers]);
  return { display: q.display, answer: q.answer, options, explanation: q.explanation };
}

export function generateDailyQuestions() {
  const today = new Date().toISOString().slice(0, 10);
  const rng = seededRandom('daily-' + today);
  const original = Math.random;
  Math.random = rng;
  try {
    return Array.from({ length: TOTAL_QUESTIONS }, () => generateQuestion("daily"));
  } finally {
    Math.random = original;
  }
}

export function getTodayUTC() {
  return new Date().toISOString().slice(0, 10);
}

export function getPointsPerQuestion(level) {
  switch (level) {
    case "easy":   return 10;
    case "medium": return 20;
    case "hard":   return 30;
    case "bonus":  return 50;
    case "daily":  return 25;
    default:       return 10;
  }
}

export function getSpeedBonus(level, timeLeft) {
  const totalTime = TIMER_SECONDS[level] || 30;
  const base = getPointsPerQuestion(level);
  return Math.round(base * 0.5 * (timeLeft / totalTime));
}

export const TOTAL_QUESTIONS = 10;

export const LEVEL_LABELS = {
  easy:   "Лёгкий",
  medium: "Средний",
  hard:   "Тяжёлый",
  bonus:  "Бонусный",
  daily:  "Ежедневный",
};

export const TIMER_SECONDS = {
  easy:   30,
  medium: 25,
  hard:   20,
  bonus:  20,
  daily:  25,
};