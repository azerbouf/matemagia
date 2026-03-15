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

function generateWrongAnswers(correct, count = 3, exclude = null) {
  const wrong = new Set();
  const excludeSet = exclude !== null && exclude !== undefined ? new Set([].concat(exclude)) : new Set();
  let attempts = 0;
  while (wrong.size < count && attempts < 100) {
    const offset = randInt(1, Math.max(10, Math.abs(correct) || 10));
    const sign = Math.random() > 0.5 ? 1 : -1;
    const val = correct + sign * offset;
    if (val !== correct && !wrong.has(val) && !excludeSet.has(val)) wrong.add(val);
    attempts++;
  }
  let fallback = 1;
  while (wrong.size < count) {
    const v1 = correct + fallback;
    const v2 = correct - fallback;
    if (v1 !== correct && !excludeSet.has(v1)) wrong.add(v1);
    if (wrong.size < count && v2 !== correct && !excludeSet.has(v2)) wrong.add(v2);
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

// ─── New question type generators ───────────────────────────────────────────────

function generateComparisonQuestion(minVal, maxVal) {
  const a = randInt(minVal, maxVal);
  let b = randInt(minVal, maxVal);
  while (b === a) b = randInt(minVal, maxVal);
  const isGreater = Math.random() > 0.5;
  const answer = isGreater ? Math.max(a, b) : Math.min(a, b);
  const display = isGreater ? `Что больше: ${a} или ${b}?` : `Что меньше: ${a} или ${b}?`;
  const other = isGreater ? Math.min(a, b) : Math.max(a, b);
  const wrong = generateWrongAnswers(answer, 2, [other]);
  const options = shuffle([answer, other, ...wrong]);
  const explanation = isGreater
    ? `Больше число ${answer}: ${Math.max(a, b)} > ${Math.min(a, b)}\n📌 Сравни по разрядам: сначала сотни, потом десятки, потом единицы.`
    : `Меньше число ${answer}: ${Math.min(a, b)} < ${Math.max(a, b)}\n📌 Сравни по разрядам: сначала сотни, потом десятки, потом единицы.`;
  return { display, answer, options, explanation };
}

function generateMissingNumberQuestion(minVal, maxVal, allowMulDiv = false) {
  const kinds = allowMulDiv
    ? randInt(0, 5)
    : randInt(0, 3);
  let display, answer, explanation;
  if (kinds === 0) {
    const b = randInt(1, maxVal - 1);
    const c = randInt(b + 1, maxVal);
    answer = c - b;
    display = `? + ${b} = ${c}`;
    explanation = `? + ${b} = ${c}\n📌 Неизвестное слагаемое: от суммы отнимаем известное.\n${c} − ${b} = ${answer}`;
  } else if (kinds === 1) {
    const a = randInt(1, maxVal - 1);
    const c = randInt(a + 1, maxVal);
    answer = c - a;
    display = `${a} + ? = ${c}`;
    explanation = `${a} + ? = ${c}\n📌 Неизвестное слагаемое: ${c} − ${a} = ${answer}`;
  } else if (kinds === 2) {
    const a = randInt(minVal, maxVal);
    const b = randInt(1, a);
    const diff = a - b;
    answer = a;
    display = `? − ${b} = ${diff}`;
    explanation = `? − ${b} = ${diff}\n📌 Неизвестное уменьшаемое: к разности прибавляем вычитаемое.\n${diff} + ${b} = ${a}`;
  } else if (kinds === 3) {
    const a = randInt(minVal, maxVal);
    const b = randInt(1, a);
    answer = b;
    const diff = a - b;
    display = `${a} − ? = ${diff}`;
    explanation = `${a} − ? = ${diff}\n📌 Неизвестное вычитаемое: ${a} − ${diff} = ${answer}`;
  } else if (kinds === 4) {
    const b = randInt(2, 9);
    const answerVal = randInt(2, 12);
    const c = b * answerVal;
    answer = answerVal;
    display = `? × ${b} = ${c}`;
    explanation = `? × ${b} = ${c}\n📌 Неизвестный множитель: ${c} ÷ ${b} = ${answer}`;
  } else {
    const b = randInt(2, 9);
    const quotient = randInt(2, 9);
    const a = b * quotient;
    answer = b;
    display = `${a} ÷ ? = ${quotient}`;
    explanation = `${a} ÷ ? = ${quotient}\n📌 Неизвестный делитель: ${a} ÷ ${quotient} = ${b}`;
  }
  const wrongAnswers = generateWrongAnswers(answer);
  const options = shuffle([answer, ...wrongAnswers]);
  return { display, answer, options, explanation };
}

function generatePercentQuestion(level) {
  const percents = level === "easy" ? [10, 25, 50] : level === "medium" ? [10, 20, 25, 50] : [10, 15, 20, 25, 30, 50];
  const p = percents[randInt(0, percents.length - 1)];
  const maxBase = level === "easy" ? 100 : level === "medium" ? 400 : 1000;
  const base = randInt(10, maxBase);
  const answer = Math.round((base * p) / 100);
  const display = `${p}% от ${base}`;
  const explanation = `${p}% от ${base} = ${answer}\n📌 1% = ${base} ÷ 100 = ${base / 100}\n${p}% = ${base / 100} × ${p} = ${answer}`;
  const wrongAnswers = generateWrongAnswers(answer);
  const options = shuffle([answer, ...wrongAnswers]);
  return { display, answer, options, explanation };
}

function generateFractionQuestion() {
  const type = randInt(0, 2);
  let display, answer, explanation;
  if (type === 0) {
    const d = 2 * randInt(1, 5);
    const n = randInt(1, d - 1);
    const ofVal = randInt(2, 12) * d;
    answer = (n * ofVal) / d;
    display = `${n}/${d} от ${ofVal}`;
    explanation = `${n}/${d} от ${ofVal} = ${answer}\n📌 Делим на ${d} и умножаем на ${n}: ${ofVal} ÷ ${d} × ${n} = ${answer}`;
  } else if (type === 1) {
    const n1 = 1;
    const d1 = 2;
    const n2 = 1;
    const d2 = 4;
    answer = 0.75;
    display = "1/2 + 1/4";
    explanation = "1/2 + 1/4 = 2/4 + 1/4 = 3/4 = 0,75\n📌 Приводим к общему знаменателю 4.";
  } else {
    const n1 = 1;
    const d1 = 3;
    const n2 = 1;
    const d2 = 6;
    answer = 0.5;
    display = "1/3 + 1/6";
    explanation = "1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2 = 0,5\n📌 Общий знаменатель 6.";
  }
  const wrongPool = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
  const wrongOptions = wrongPool.filter((x) => Math.abs(x - answer) > 0.01);
  const options = shuffle([answer, ...wrongOptions.slice(0, 3)]);
  return { display, answer, options, explanation };
}

const WORD_TEMPLATES_ADD = [
  { q: "У Маши {a} яблок, у Пети {b}. Сколько всего яблок?", op: "+" },
  { q: "В вазе {a} конфет, положили ещё {b}. Сколько всего?", op: "+" },
  { q: "На полке {a} книг, поставили ещё {b}. Сколько стало книг?", op: "+" },
  { q: "У Коли {a} марок, у Оли {b}. Сколько марок вместе?", op: "+" },
  { q: "В корзине {a} грибов, нашли ещё {b}. Сколько всего грибов?", op: "+" },
  { q: "На столе {a} тетрадей, принесли {b}. Сколько тетрадей?", op: "+" },
  { q: "В пакете {a} ручек, купили ещё {b}. Сколько ручек?", op: "+" },
  { q: "У бабушки {a} пирожков, испекла ещё {b}. Сколько пирожков?", op: "+" },
  { q: "В аквариуме {a} рыбок, запустили {b}. Сколько рыбок?", op: "+" },
  { q: "На ветке {a} вишен, сорвали ещё {b}. Сколько вишен?", op: "+" },
];
const WORD_TEMPLATES_SUB = [
  { q: "Было {a} шаров, {b} лопнуло. Сколько осталось?", op: "-" },
  { q: "У Димы {a} марок, он подарил {b}. Сколько осталось?", op: "-" },
  { q: "В коробке {a} карандашей, взяли {b}. Сколько осталось?", op: "-" },
  { q: "Было {a} конфет, съели {b}. Сколько осталось?", op: "-" },
  { q: "На дереве {a} яблок, сняли {b}. Сколько осталось?", op: "-" },
  { q: "В гараже {a} машинок, уехало {b}. Сколько осталось?", op: "-" },
  { q: "В вазе {a} цветов, завяло {b}. Сколько осталось?", op: "-" },
  { q: "В стакане {a} ягод, съели {b}. Сколько осталось?", op: "-" },
  { q: "На тарелке {a} оладьев, съели {b}. Сколько осталось?", op: "-" },
  { q: "В пенале {a} фломастеров, потеряли {b}. Сколько осталось?", op: "-" },
];
const WORD_TEMPLATES_MUL = [
  { q: "В одной коробке {a} конфет. Таких коробок {b}. Сколько всего конфет?", op: "×" },
  { q: "На каждой тарелке {a} пирожков. Тарелок {b}. Сколько пирожков?", op: "×" },
  { q: "В каждом пакете {a} орехов. Пакетов {b}. Сколько орехов?", op: "×" },
  { q: "В букете {a} цветков. Таких букетов {b}. Сколько цветков?", op: "×" },
  { q: "В одной упаковке {a} ручек. Упаковок {b}. Сколько ручек?", op: "×" },
  { q: "В каждой корзине {a} яблок. Корзин {b}. Сколько яблок?", op: "×" },
  { q: "В наборе {a} карандашей. Наборов {b}. Сколько карандашей?", op: "×" },
  { q: "В одной коробке {a} кубиков. Коробок {b}. Сколько кубиков?", op: "×" },
];
const WORD_TEMPLATES_DIV = [
  { q: "{a} конфет раздали поровну {b} детям. Сколько конфет каждому?", op: "÷" },
  { q: "{a} яблок разложили в {b} пакета поровну. Сколько в каждом пакете?", op: "÷" },
  { q: "{a} тетрадей раздали {b} ученикам поровну. Сколько каждому?", op: "÷" },
  { q: "{a} орехов разложили на {b} тарелок поровну. Сколько на тарелке?", op: "÷" },
  { q: "{a} карандашей раздали поровну {b} ребятам. Сколько каждому?", op: "÷" },
  { q: "{a} пирожков разложили на {b} тарелок поровну. Сколько на тарелке?", op: "÷" },
  { q: "{a} марок подарили {b} друзьям поровну. Сколько каждому?", op: "÷" },
  { q: "{a} цветов поставили в {b} ваз поровну. Сколько в каждой вазе?", op: "÷" },
];

function generateWordProblemQuestion(minVal, maxVal, withMulDiv = false) {
  let templates, a, b, answer;
  const useMulDiv = withMulDiv && Math.random() > 0.5;
  if (useMulDiv && Math.random() > 0.5) {
    templates = Math.random() > 0.5 ? WORD_TEMPLATES_MUL : WORD_TEMPLATES_DIV;
    const t = templates[randInt(0, templates.length - 1)];
    if (t.op === "×") {
      a = randInt(2, 9);
      b = randInt(2, 9);
      answer = a * b;
    } else {
      b = randInt(2, 9);
      answer = randInt(2, 9);
      a = b * answer;
    }
    const display = t.q.replace("{a}", String(a)).replace("{b}", String(b));
    const explanation = `${display}\n📌 Ответ: ${answer}`;
    const wrongAnswers = generateWrongAnswers(answer);
    const options = shuffle([answer, ...wrongAnswers]);
    return { display, answer, options, explanation, extraTime: true };
  }
  const op = Math.random() > 0.5 ? "+" : "-";
  templates = op === "+" ? WORD_TEMPLATES_ADD : WORD_TEMPLATES_SUB;
  const t = templates[randInt(0, templates.length - 1)];
  if (op === "+") {
    a = randInt(1, Math.min(50, maxVal - 1));
    b = randInt(1, maxVal - a);
    answer = a + b;
  } else {
    a = randInt(minVal, maxVal);
    b = randInt(1, a);
    answer = a - b;
  }
  const display = t.q.replace("{a}", String(a)).replace("{b}", String(b));
  const explanation = `${display}\n📌 Ответ: ${answer}`;
  const wrongAnswers = generateWrongAnswers(answer);
  const options = shuffle([answer, ...wrongAnswers]);
  return { display, answer, options, explanation, extraTime: true };
}

// ─── Question Generators ──────────────────────────────────────────────────────

function generateEasyQuestion() {
  const type = randInt(0, 3);
  if (type === 0) return generateComparisonQuestion(1, 99);
  if (type === 1) return generateMissingNumberQuestion(5, 50, false);
  if (type === 2) return generateWordProblemQuestion(5, 50, false);
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
  const type = randInt(0, 6);
  if (type === 0) return generateComparisonQuestion(100, 999);
  if (type === 1) return generateMissingNumberQuestion(10, 200, true);
  if (type === 2) return generatePercentQuestion("medium");
  if (type === 3) return generateWordProblemQuestion(10, 200, true);
  let a, b, answer, display, explanation;
  if (type === 4) {
    const op = Math.random() > 0.5 ? "+" : "-";
    if (op === "+") {
      a = randInt(100, 900); b = randInt(100, 1000 - a); answer = a + b;
      display = `${a} + ${b}`; explanation = addExplanation(a, b, answer);
    } else {
      a = randInt(200, 1000); b = randInt(100, a - 1); answer = a - b;
      display = `${a} − ${b}`; explanation = subExplanation(a, b, answer);
    }
  } else if (type === 5) {
    a = randInt(2, 10); b = randInt(2, 10); answer = a * b;
    display = `${a} × ${b}`; explanation = mulExplanation(a, b, answer);
  } else {
    b = randInt(2, 10); answer = randInt(2, 10); a = b * answer;
    display = `${a} ÷ ${b}`; explanation = divExplanation(a, b, answer);
  }
  return { display, answer, explanation };
}

function generateHardQuestion() {
  const type = randInt(0, 5);
  if (type === 0) return generateMissingNumberQuestion(50, 1000, true);
  if (type === 1) return generatePercentQuestion("hard");
  if (type === 2) return generateWordProblemQuestion(50, 500, true);
  let a, b, answer, display, explanation;
  if (type === 3) {
    const op = Math.random() > 0.5 ? "+" : "-";
    if (op === "+") {
      a = randInt(200, 4800); b = randInt(200, 5000 - a); answer = a + b;
      display = `${a} + ${b}`; explanation = addExplanation(a, b, answer);
    } else {
      a = randInt(400, 5000); b = randInt(200, a - 1); answer = a - b;
      display = `${a} − ${b}`; explanation = subExplanation(a, b, answer);
    }
  } else if (type === 4) {
    a = randInt(1, 9); b = randInt(1, 9); answer = a * b;
    display = `${a} × ${b}`; explanation = mulExplanation(a, b, answer);
  } else {
    b = randInt(1, 9); answer = randInt(1, 9); a = b * answer;
    display = `${a} ÷ ${b}`; explanation = divExplanation(a, b, answer);
  }
  return { display, answer, explanation };
}

function generateBonusQuestion() {
  const type = randInt(0, 6);
  if (type === 0) return generateFractionQuestion();
  if (type === 1) return generatePercentQuestion("hard");
  if (type === 2) return generateWordProblemQuestion(100, 500, true);
  let a, b, answer, display, explanation;
  if (type === 3) {
    a = randInt(2, 15); answer = a * a;
    display = `${a}²`; explanation = squareExplanation(a, answer);
  } else if (type === 4) {
    a = randInt(11, 20); b = randInt(2, 9); answer = a * b;
    display = `${a} × ${b}`; explanation = mulExplanation(a, b, answer);
  } else if (type === 5) {
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
  const options = q.options || shuffle([q.answer, ...generateWrongAnswers(q.answer)]);
  return { display: q.display, answer: q.answer, options, explanation: q.explanation, ...(q.extraTime && { extraTime: true }) };
}

function getLocalDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function generateDailyQuestions() {
  const today = getLocalDateString();
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
  return getLocalDateString();
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

export function generateBonusRoundQuestion(level) {
  let q;
  switch (level) {
    case "easy":
      q = Math.random() < 0.5 ? generateEasyQuestion() : generateMediumQuestion();
      break;
    case "medium":
      q = Math.random() < 0.5 ? generateMediumQuestion() : generateHardQuestion();
      break;
    case "hard":
      q = Math.random() < 0.5 ? generateHardQuestion() : generateBonusQuestion();
      break;
    case "bonus":
      q = generateBonusQuestion();
      break;
    case "daily":
      q = Math.random() < 0.5 ? generateHardQuestion() : generateBonusQuestion();
      break;
    default:
      q = generateMediumQuestion();
  }
  const options = q.options || shuffle([q.answer, ...generateWrongAnswers(q.answer)]);
  return { display: q.display, answer: q.answer, options, explanation: q.explanation, ...(q.extraTime && { extraTime: true }) };
}

export function getBonusRoundPoints(level) {
  return Math.round(getPointsPerQuestion(level) * 1.5);
}

export function getSpeedBonus(level, timeLeft, totalTimeForQuestion) {
  const totalTime = totalTimeForQuestion ?? (TIMER_SECONDS[level] || 30);
  const base = getPointsPerQuestion(level);
  return Math.round(base * 0.5 * (Math.min(timeLeft, totalTime) / totalTime));
}

export const TOTAL_QUESTIONS = 10;
export const BONUS_ROUND_QUESTIONS = 5;

export const LEVEL_LABELS = {
  easy:   "Лёгкий",
  medium: "Средний",
  hard:   "Тяжёлый",
  bonus:  "Сложный",
  daily:  "Ежедневный",
};

export const TIMER_SECONDS = {
  easy:   30,
  medium: 25,
  hard:   20,
  bonus:  20,
  daily:  25,
};

export function getQuestionTime(level, question) {
  const base = TIMER_SECONDS[level] || 30;
  if (question && question.extraTime && (level === "easy" || level === "medium" || level === "daily")) return base * 2;
  return base;
}