const profiles = {
  visual: {
    title: "図や配置を使うヒント",
    subtitle: "回答では、図や配置を選ぶことが多めでした",
    icon: "◇",
    description: "図・色・位置関係があると、情報どうしのつながりを見つけやすいかもしれません。グラフや図解を使う方法を試してみましょう。",
    support: "「図や色分けがあると整理しやすい」と伝えてみましょう。ノートに図を描く時間や、大きめのグラフ用紙を用意してもらうのも一案です。",
    nextStep: "今日学んだことを2つ選び、どうつながるかを矢印で描いてみよう。",
    practiceLabel: "図や関係を使って考える",
  },
  verbal: {
    title: "言葉で整理するヒント",
    subtitle: "回答では、説明や言い換えを選ぶことが多めでした",
    icon: "≋",
    description: "言葉で順序立てて説明したり、自分の言葉に言い換えたりすると、考えが整理しやすいかもしれません。",
    support: "「手順を順番に説明してもらえると助かる」と伝えてみましょう。学んだことを誰かに話す時間をつくるのもおすすめです。",
    nextStep: "今日学んだことを1つ選び、自分の言葉で30秒説明してみよう。",
    practiceLabel: "自分の言葉で考えを整理する",
  },
  auditory: {
    title: "耳で聞いて理解するヒント",
    subtitle: "声や音から、内容をつかむ傾向",
    icon: "♪",
    description: "説明を聞いたり、声に出して読んだりすると、内容が頭に入りやすいかもしれません。音読や読み上げを取り入れてみましょう。",
    support: "「口で説明してもらえると助かる」と伝えてみましょう。教科書を読み上げてもらったり、説明を録音して聞き直したりするのも一案です。",
    nextStep: "今日学んだことを声に出して1回読み、何も見ずに30秒話してみよう。",
    practiceLabel: "声に出して読む・聞いて確かめる",
  },
  hands: {
    title: "試しながら学ぶヒント",
    subtitle: "回答では、手を動かして試す方法を選ぶことが多めでした",
    icon: "↗",
    description: "例題を解いたり、実際に試したりしながら、やり方を確かめる方法が合うかもしれません。",
    support: "「まず例を一緒にやってみたい」と伝えてみましょう。短い練習問題や、試行錯誤できる時間をお願いするのも一案です。",
    nextStep: "例題の数字や条件を1つ変え、最初の手順を自分で試してみよう。",
    practiceLabel: "小さな例を自分で試す",
  },
};

const typeOrder = ["visual", "verbal", "auditory", "hands"];
const dominanceNames = { visual: "視覚優位", verbal: "言語優位", auditory: "聴覚優位", hands: "体験優位" };
const typeShortNames = { visual: "見る", verbal: "読む", auditory: "聞く", hands: "動かす" };
const puzzleTypes = ["visual", "verbal", "hands"];
const typeIcons = { visual: "◇", verbal: "≋", auditory: "♪", hands: "↗" };
const stageOrder = ["reading", "memory", "puzzle"];
const stageInfo = {
  reading: {
    kicker: "ステップ1",
    title: "読みやすさチェック",
    body: [
      "短い文章を10回読みます（1回目は練習）。フォント・文字の間隔・背景の色を少しずつ変えるので、いつもどおりのペースで読んでください。",
      "「読みはじめる」をおすと文章が出て、時間を計りはじめます。読み終わったらすぐ「読み終わった」をおしてね。そのあと内容についての問題が1問出ます。",
    ],
  },
  memory: {
    kicker: "ステップ2",
    title: "覚えやすさチェック",
    body: [
      "6つのものの並び方を、「絵で見る」「文章で読む」「音声で聞く」のどれかで伝えます。見たり聞いたりしたあとに、どこに何があったかを答えてください。",
      "音声が流れるので、音が出せる場所でやってみよう。",
    ],
  },
  puzzle: {
    kicker: "ステップ3",
    title: "パズルチェック",
    body: [
      "パズルを6問解きます。問題ごとに「図解」「文章」「動かして試す」のどれか1種類のヒントが出ます。",
      "どの種類のヒントのときによく解けたかを調べます。",
    ],
  },
};
const HISTORY_KEY = "manabi-compass-history-v2";
const DISPLAY_KEY = "manabi-compass-display-v1";
const PUZZLES_PER_RUN = 6;
const MEMORY_PER_TYPE = 3;
const MEMORY_VIEW_MS = 8000;
const speechAvailable = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

let session = null;
let currentProfile = "visual";
let stepShownAt = 0;

const startButton = document.querySelector("#start-button");
const assessmentSection = document.querySelector("#assessment");
const resultsSection = document.querySelector("#results");
const progressTrack = document.querySelector(".progress-track");
const startLabel = document.querySelector("#start-label");
const homeSections = document.querySelectorAll("#home, #how, #about, .header-link");
const summaryTab = document.querySelector("#summary-tab");
const practiceTab = document.querySelector("#practice-tab");
const resultTabs = [summaryTab, practiceTab];
const panels = {
  intro: document.querySelector("#stage-intro"),
  reading: document.querySelector("#reading-panel"),
  memory: document.querySelector("#memory-panel"),
  puzzle: document.querySelector("#quiz-panel"),
};
let hasResults = false;

// 画面は「診断」「ヒント」「写真」の3つのタブで切りかえる。
// 診断タブの中では、トップ（home）とチェック中（assessment）を切りかえる。
const appTabs = [...document.querySelectorAll("[data-app-tab]")];
const hintsEmpty = document.querySelector("#hints-empty");
const photoPanel = document.querySelector("#photo-panel");
let activeTab = "check";
let checkScreen = "home";

function renderAppTabs() {
  homeSections.forEach((section) => {
    section.hidden = !(activeTab === "check" && checkScreen === "home");
  });
  assessmentSection.hidden = !(activeTab === "check" && checkScreen === "assessment");
  resultsSection.hidden = !(activeTab === "hints" && hasResults);
  hintsEmpty.hidden = !(activeTab === "hints" && !hasResults);
  photoPanel.hidden = activeTab !== "photo";
  appTabs.forEach((tab) => {
    const isSelected = tab.dataset.appTab === activeTab;
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  });
  const hintsTabBadge = document.querySelector("#hints-tab-badge");
  if (hintsTabBadge) {
    const { runs } = loadHistory();
    hintsTabBadge.hidden = !(hasResults || (runs && runs.length > 0));
  }
  const activeTarget = activeTab === "check"
    ? (checkScreen === "home" ? document.querySelector("#home") : assessmentSection)
    : (activeTab === "hints" ? (hasResults ? resultsSection : hintsEmpty) : photoPanel);
  if (activeTarget) {
    activeTarget.classList.remove("tab-content-anim");
    void activeTarget.offsetWidth;
    activeTarget.classList.add("tab-content-anim");
  }
}

function showScreen(screen) {
  if (screen === "results") {
    activeTab = "hints";
  } else {
    activeTab = "check";
    checkScreen = screen;
  }
  renderAppTabs();
}

function selectAppTab(tab) {
  if (tab === "hints" && !hasResults) {
    // 前に診断したことがあれば、その記録から結果を表示する
    const { runs } = loadHistory();
    if (runs.length) {
      showResults(runs);
      return;
    }
  }
  // チェックを最後まで終えたあとは、診断タブを開くとトップにもどる
  if (tab === "check" && (!session || session.finished)) checkScreen = "home";
  activeTab = tab;
  renderAppTabs();
  window.scrollTo({ top: 0, behavior: "auto" });
}

function selectResultTab(selectedTab) {
  resultTabs.forEach((tab) => {
    const isSelected = tab === selectedTab;
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !isSelected;
  });
}

function scrollToElement(element, block = "start") {
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  element.scrollIntoView({ behavior, block });
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createElement(tag, className = "", text = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

// ---- 保存（このブラウザーの中だけ） ----

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 保存できない環境でも、その場のチェックは続けられる
  }
}

function loadHistory() {
  const data = readStorage(HISTORY_KEY, null);
  return data && Array.isArray(data.runs) ? data : { runs: [] };
}

function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(DISPLAY_KEY);
  } catch {
    // 何もしない
  }
}

// ---- 表示設定（フォント・間隔・背景色） ----

function findVariant(dimensionId, variantId) {
  const dimension = readingDimensions.find((item) => item.id === dimensionId);
  return dimension.variants.find((variant) => variant.id === variantId) ?? dimension.variants[0];
}

function readerVariables(settings) {
  const font = findVariant("font", settings.font).style;
  const spacing = findVariant("spacing", settings.spacing).style;
  const background = findVariant("background", settings.background).style;
  return {
    "--reader-font": font.font,
    "--reader-letter": spacing.letter,
    "--reader-line": spacing.line,
    "--reader-bg": background.bg,
  };
}

function applyReaderVariables(element, settings) {
  Object.entries(readerVariables(settings)).forEach(([name, value]) => element.style.setProperty(name, value));
}

function loadDisplay() {
  const saved = readStorage(DISPLAY_KEY, null);
  return {
    settings: { ...defaultReaderSettings, ...(saved?.settings ?? {}) },
    decisions: saved?.decisions ?? {},
    manual: saved?.manual ?? {},
  };
}

function saveDisplay(display) {
  writeStorage(DISPLAY_KEY, display);
  applyReaderVariables(document.documentElement, display.settings);
}

function describeSettings(settings) {
  return readingDimensions.map((dimension) => `${dimension.name}：${findVariant(dimension.id, settings[dimension.id]).label}`).join("　");
}

// ---- チェック全体の組み立て ----

function planReading() {
  const [practice, ...rest] = readingPassages;
  const passages = shuffle(rest);
  const steps = [{ kind: "read", practice: true, passage: practice }];
  readingDimensions.forEach((dimension) => {
    shuffle(dimension.variants).forEach((variant) => {
      steps.push({ kind: "read", dimension: dimension.id, variant: variant.id, passage: passages.shift() });
    });
    steps.push({ kind: "compare", dimension: dimension.id });
  });
  return steps;
}

function planMemory() {
  const modalities = speechAvailable ? ["visual", "verbal", "auditory"] : ["visual", "verbal"];
  return shuffle(modalities.flatMap((modality) => Array.from({ length: MEMORY_PER_TYPE }, () => modality)))
    .map((modality) => {
      const objects = shuffle(memoryObjects).slice(0, 6);
      const target = Math.floor(Math.random() * 6);
      const others = shuffle(objects.filter((_, index) => index !== target)).slice(0, 2);
      return {
        modality,
        objects,
        target,
        choices: [objects[target].name, ...others.map((item) => item.name)],
      };
    });
}

function planPuzzleOnce(used) {
  const seen = (problem) => typeOrder.reduce((sum, type) => sum + (used[problem.id]?.[type] ?? 0), 0);
  const problems = shuffle(assessmentProblems).sort((a, b) => seen(a) - seen(b)).slice(0, PUZZLES_PER_RUN);
  const quota = Object.fromEntries(puzzleTypes.map((type) => [type, PUZZLES_PER_RUN / puzzleTypes.length]));
  let repeats = 0;
  const plan = problems.map((problem) => {
    const counts = used[problem.id] ?? {};
    const [type] = shuffle(puzzleTypes.filter((option) => quota[option] > 0))
      .sort((a, b) => (counts[a] ?? 0) - (counts[b] ?? 0));
    quota[type] -= 1;
    repeats += counts[type] ?? 0;
    return { problem, type };
  });
  return { plan: shuffle(plan), repeats };
}

// 前回までにその問題で出たことが少ない種類のヒントを優先して割り当てる
function planPuzzles() {
  const used = {};
  loadHistory().runs.forEach((run) => (run.puzzle ?? []).forEach((result) => {
    used[result.problemId] ??= {};
    used[result.problemId][result.type] = (used[result.problemId][result.type] ?? 0) + 1;
  }));
  let best = planPuzzleOnce(used);
  for (let attempt = 0; attempt < 60 && best.repeats > 0; attempt += 1) {
    const candidate = planPuzzleOnce(used);
    if (candidate.repeats < best.repeats) best = candidate;
  }
  return best.plan;
}

function startSession() {
  session = {
    stageIndex: 0,
    view: "intro",
    finished: false,
    reading: { steps: planReading(), index: 0, records: [], preferences: {}, settings: { ...defaultReaderSettings }, decisions: {}, skipped: false },
    memory: { items: planMemory(), index: 0, records: [], skipped: false },
    puzzle: { plan: planPuzzles(), index: 0, results: [], skipped: false },
  };
}

function currentStage() {
  return stageOrder[session.stageIndex];
}

function showAssessment() {
  if (!session || session.finished) startSession();
  showScreen("assessment");
  scrollToElement(assessmentSection);
  renderCurrent();
}

function showPanel(name) {
  Object.entries(panels).forEach(([key, panel]) => { panel.hidden = key !== name; });
}

function updateProgress(label, done, total) {
  const percent = total ? Math.round((done / total) * 100) : 0;
  document.querySelector("#question-count").textContent = label;
  document.querySelector("#progress-percent").textContent = `${percent}%`;
  document.querySelector("#progress-fill").style.width = `${percent}%`;
  progressTrack.setAttribute("aria-valuenow", String(percent));
  document.querySelectorAll("#stage-steps li").forEach((item) => {
    const index = stageOrder.indexOf(item.dataset.stage);
    item.classList.toggle("is-current", index === session.stageIndex);
    item.classList.toggle("is-done", index < session.stageIndex);
  });
}

function renderCurrent() {
  if (session.view === "intro") renderStageIntro();
  else if (currentStage() === "reading") renderReadingStep();
  else if (currentStage() === "memory") renderMemoryItem();
  else renderPuzzle();
}

function renderStageIntro() {
  const stage = currentStage();
  const info = stageInfo[stage];
  showPanel("intro");
  updateProgress(`${info.kicker}／3`, 0, 1);
  document.querySelector("#stage-intro-kicker").textContent = info.kicker;
  document.querySelector("#stage-intro-title").textContent = info.title;
  const body = document.querySelector("#stage-intro-body");
  body.replaceChildren(...info.body.map((text) => createElement("p", "", text)));
  if (stage === "memory" && !speechAvailable) {
    body.append(createElement("p", "quiz-help", "このブラウザーでは音声を流せないため、「聞く」はとばして「見る」「読む」だけで比べます。"));
  }
  document.querySelector("#stage-intro-title").focus({ preventScroll: true });
}

async function beginStage() {
  if (currentStage() === "reading") {
    // フォントの読み込み待ちで時間がずれないように、先に読み込んでおく
    try {
      await Promise.all(['16px "BIZ UDPGothic"', '16px "Klee One"', '16px "Noto Sans JP"'].map((font) => document.fonts.load(font, "あ亜")));
    } catch {
      // 読み込めなくても代わりのフォントで続ける
    }
  }
  session.view = "step";
  renderCurrent();
  scrollToElement(assessmentSection);
}

function nextStage() {
  if (session.stageIndex < stageOrder.length - 1) {
    session.stageIndex += 1;
    session.view = "intro";
    renderCurrent();
    scrollToElement(assessmentSection);
  } else {
    finishSession();
  }
}

function skipStage() {
  session[currentStage()].skipped = true;
  nextStage();
}

// ---- ステップ1：読みやすさ ----

function readingSettingsFor(step) {
  const settings = { ...session.reading.settings };
  if (step.dimension) settings[step.dimension] = step.variant;
  return settings;
}

function renderReadingStep() {
  showPanel("reading");
  const { steps, index } = session.reading;
  const step = steps[index];
  updateProgress(`ステップ1 読みやすさ　${index + 1} / ${steps.length}`, index, steps.length);
  const title = document.querySelector("#reading-title");
  ["#reading-text", "#reading-done-button", "#reading-question-form", "#reading-compare-form"].forEach((selector) => {
    document.querySelector(selector).hidden = true;
  });
  document.querySelector("#reading-error").hidden = true;
  document.querySelector("#compare-error").hidden = true;

  if (step.kind === "compare") {
    const dimension = readingDimensions.find((item) => item.id === step.dimension);
    document.querySelector("#reading-kicker").textContent = `${dimension.name}をくらべる`;
    title.textContent = "いちばん読みやすかったのはどれ？";
    document.querySelector("#reading-instruction").textContent = "さっき読んだ3つの表示です。読みやすいと感じたものを選んでね。";
    document.querySelector("#reading-start-button").hidden = true;
    const options = document.querySelector("#reading-compare-options");
    options.replaceChildren();
    dimension.variants.forEach((variant, position) => {
      const wrapper = createElement("div", "compare-option");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "reading-compare";
      input.id = `reading-compare-${position}`;
      input.value = variant.id;
      const label = document.createElement("label");
      label.htmlFor = input.id;
      const sample = createElement("span", "reader-sample", "ミツバチの巣は、六角形の部屋がならんでいます。");
      applyReaderVariables(sample, { ...session.reading.settings, [dimension.id]: variant.id });
      label.append(createElement("span", "compare-label", variant.label), sample);
      wrapper.append(input, label);
      options.append(wrapper);
    });
    document.querySelector("#reading-compare-form").hidden = false;
  } else {
    document.querySelector("#reading-kicker").textContent = step.practice ? "練習" : "文章を読む";
    title.textContent = step.practice ? "まずは練習してみよう" : `文章 ${steps.slice(0, index).filter((item) => item.kind === "read" && !item.practice).length + 1}`;
    document.querySelector("#reading-instruction").textContent = "準備ができたら「読みはじめる」をおしてね。読み終わったらすぐ「読み終わった」をおそう。";
    document.querySelector("#reading-start-button").hidden = false;
    const text = document.querySelector("#reading-text");
    text.textContent = step.passage.text;
    applyReaderVariables(text, readingSettingsFor(step));
  }
  title.focus({ preventScroll: true });
}

function startReading() {
  document.querySelector("#reading-start-button").hidden = true;
  document.querySelector("#reading-text").hidden = false;
  document.querySelector("#reading-done-button").hidden = false;
  document.querySelector("#reading-done-button").focus({ preventScroll: true });
  stepShownAt = performance.now();
}

function finishReading() {
  const step = session.reading.steps[session.reading.index];
  step.ms = Math.round(performance.now() - stepShownAt);
  document.querySelector("#reading-text").hidden = true;
  document.querySelector("#reading-done-button").hidden = true;
  document.querySelector("#reading-question-prompt").textContent = step.passage.question.prompt;
  renderChoices("#reading-question-choices", "reading-answer", step.passage.question.choices);
  document.querySelector("#reading-question-form").hidden = false;
  document.querySelector("#reading-question-prompt").scrollIntoView({ block: "center" });
}

// 1秒あたりに読めた文字数。内容をまちがえたときは「速く読み飛ばした」可能性があるので割り引く。
function readingScore(record) {
  const speed = record.chars / (record.ms / 1000);
  return record.correct ? speed : speed * 0.6;
}

function decideDimension(dimensionId) {
  const { records, preferences } = session.reading;
  const scored = records
    .filter((record) => record.dimension === dimensionId)
    .map((record) => ({ ...record, score: readingScore(record) }))
    .sort((a, b) => b.score - a.score);
  const preferred = preferences[dimensionId];
  const [best, second] = scored;
  let choice = preferred;
  let reason = "preference";
  if (best && second && best.score >= second.score * 1.1) {
    choice = best.variant;
    reason = best.variant === preferred ? "both" : "measured";
  } else if (best && best.variant === preferred) {
    reason = "both";
  }
  session.reading.settings[dimensionId] = choice;
  session.reading.decisions[dimensionId] = {
    choice,
    reason,
    preferred,
    measurements: scored.map(({ variant, chars, ms, correct }) => ({ variant, chars, ms, correct })),
  };
}

function nextReadingStep() {
  session.reading.index += 1;
  if (session.reading.index >= session.reading.steps.length) {
    const display = loadDisplay();
    display.settings = { ...session.reading.settings };
    display.decisions = session.reading.decisions;
    display.manual = {};
    saveDisplay(display);
    nextStage();
    return;
  }
  renderReadingStep();
  scrollToElement(assessmentSection);
}

// ---- ステップ2：覚えやすさ ----

function memorySentence(item) {
  const names = item.objects.map((object) => object.name);
  return `上の段は、左から、${names.slice(0, 3).join("、")}。下の段は、左から、${names.slice(3).join("、")}。`;
}

function renderMemoryItem() {
  showPanel("memory");
  const { items, index } = session.memory;
  const item = items[index];
  updateProgress(`ステップ2 覚えやすさ　${index + 1} / ${items.length}`, index, items.length);
  const label = { visual: "絵で見る", verbal: "文章で読む", auditory: "音声で聞く" }[item.modality];
  document.querySelector("#memory-kicker").textContent = `${typeIcons[item.modality]} ${label}`;
  document.querySelector("#memory-title").textContent = `問題 ${index + 1}`;
  document.querySelector("#memory-instruction").textContent = item.modality === "auditory"
    ? "「はじめる」をおすと、6つのものの並び方が1回だけ読み上げられます。よく聞いて覚えてね。"
    : `「はじめる」をおすと、6つのものの並び方が${MEMORY_VIEW_MS / 1000}秒だけ表示されます。よく見て覚えてね。`;
  document.querySelector("#memory-start-button").hidden = false;
  document.querySelector("#memory-stimulus").hidden = true;
  document.querySelector("#memory-question-form").hidden = true;
  document.querySelector("#memory-error").hidden = true;
  document.querySelector("#memory-title").focus({ preventScroll: true });
}

function showMemoryQuestion() {
  const item = session.memory.items[session.memory.index];
  document.querySelector("#memory-stimulus").hidden = true;
  document.querySelector("#memory-question-prompt").textContent = `${memoryPositions[item.target]}にあったのは？`;
  renderChoices("#memory-question-choices", "memory-answer", item.choices);
  document.querySelector("#memory-question-form").hidden = false;
  stepShownAt = performance.now();
}

function startMemory() {
  const item = session.memory.items[session.memory.index];
  const stimulus = document.querySelector("#memory-stimulus");
  document.querySelector("#memory-start-button").hidden = true;
  stimulus.replaceChildren();
  stimulus.className = `memory-stimulus memory-${item.modality}`;
  stimulus.hidden = false;
  const timer = createElement("span", "memory-timer");

  if (item.modality === "visual") {
    const grid = createElement("div", "memory-grid");
    grid.setAttribute("role", "img");
    grid.setAttribute("aria-label", "6つのものの絵");
    item.objects.forEach((object) => grid.append(createElement("span", "memory-cell", object.emoji)));
    stimulus.append(grid, timer);
  } else if (item.modality === "verbal") {
    const text = createElement("p", "memory-text reader-surface", memorySentence(item));
    stimulus.append(text, timer);
  } else {
    stimulus.append(createElement("p", "memory-listen", "🔊 よく聞いてね（1回だけ流れます）"));
    const utterance = new SpeechSynthesisUtterance(memorySentence(item));
    utterance.lang = "ja-JP";
    utterance.rate = 0.9;
    const voice = speechSynthesis.getVoices().find((option) => option.lang.startsWith("ja"));
    if (voice) utterance.voice = voice;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setTimeout(showMemoryQuestion, 400);
    };
    utterance.addEventListener("end", finish);
    utterance.addEventListener("error", finish);
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
    setTimeout(finish, 20000); // 読み上げの終了が通知されない環境への保険
    return;
  }
  timer.style.animationDuration = `${MEMORY_VIEW_MS}ms`;
  setTimeout(showMemoryQuestion, MEMORY_VIEW_MS);
}

// ---- ステップ3：パズル ----

function renderPuzzle() {
  showPanel("puzzle");
  const { plan, index } = session.puzzle;
  const { problem, type } = plan[index];
  updateProgress(`ステップ3 パズル　${index + 1} / ${plan.length}`, index, plan.length);
  document.querySelector("#quiz-measure").textContent = problem.subject;
  document.querySelector("#quiz-title").textContent = problem.title;
  document.querySelector("#quiz-task").textContent = problem.task;
  document.querySelector("#quiz-hint-label").textContent = `${typeIcons[type]} ${hintLabels[type]}`;
  document.querySelector("#quiz-hint").dataset.type = type;
  document.querySelector("#quiz-hint-body").replaceChildren(...problem.hints[type].map(renderBlock));
  document.querySelector("#quiz-check-prompt").textContent = problem.check.prompt;
  renderChoices("#quiz-check-choices", "quiz-check", problem.check.choices);
  document.querySelector("#quiz-check-button").hidden = false;
  document.querySelector("#form-error").hidden = true;
  document.querySelector("#quiz-feedback").hidden = true;
  document.querySelector("#quiz-next-button").hidden = true;
  stepShownAt = performance.now();
  document.querySelector("#quiz-title").focus({ preventScroll: true });
}

// choices の先頭が正解。並びはシャッフルし、value にもとの番号を入れる。
function renderChoices(selector, name, choiceTexts) {
  const container = document.querySelector(selector);
  container.replaceChildren();
  shuffle(choiceTexts.map((_, index) => index)).forEach((choiceIndex, position) => {
    const wrapper = createElement("div", "problem-choice");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = name;
    input.id = `${name}-${position}`;
    input.value = String(choiceIndex);
    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.append(
      createElement("span", "choice-marker", String.fromCharCode(65 + position)),
      createElement("span", "", choiceTexts[choiceIndex]),
    );
    wrapper.append(input, label);
    container.append(wrapper);
  });
}

function renderBlock(block) {
  const wrapper = createElement("div", `quiz-block quiz-block-${block.kind}`);
  if (block.kind === "svg") {
    wrapper.innerHTML = block.svg; // quizzes.js 内の固定の図のみ
  } else if (block.kind === "text") {
    block.paragraphs.forEach((text) => wrapper.append(createElement("p", "", text)));
  } else if (block.kind === "slider") {
    const id = `slider-${Math.random().toString(36).slice(2)}`;
    const label = createElement("label", "", block.label);
    label.htmlFor = id;
    const input = document.createElement("input");
    Object.assign(input, { type: "range", id, min: block.min, max: block.max, step: block.step, value: block.value });
    const output = createElement("output", "quiz-output", block.format(block.value));
    output.setAttribute("for", id);
    input.addEventListener("input", () => {
      output.textContent = block.format(Number(input.value));
    });
    wrapper.append(label, input, output);
  } else if (block.kind === "steps") {
    const list = createElement("ol", "quiz-steps");
    list.setAttribute("aria-live", "polite");
    const button = createElement("button", "button button-secondary", "一歩進む →");
    button.type = "button";
    let shown = 0;
    button.addEventListener("click", () => {
      list.append(createElement("li", "", block.steps[shown]));
      shown += 1;
      if (shown >= block.steps.length) {
        button.disabled = true;
        button.textContent = "到着！";
      }
    });
    wrapper.append(list, button);
  } else if (block.kind === "trycalc") {
    const id = `trycalc-${Math.random().toString(36).slice(2)}`;
    const label = createElement("label", "", block.label);
    label.htmlFor = id;
    const input = document.createElement("input");
    Object.assign(input, { type: "number", id, min: block.min, max: block.max, placeholder: block.placeholder, className: "problem-input" });
    const button = createElement("button", "button button-secondary", "試す");
    button.type = "button";
    const log = createElement("ul", "trycalc-log");
    log.setAttribute("aria-live", "polite");
    const tryValue = () => {
      const value = Number(input.value);
      if (input.value === "" || !Number.isInteger(value) || value < block.min || value > block.max) {
        log.prepend(createElement("li", "", `${block.min}〜${block.max} の整数で試してみよう`));
        return;
      }
      log.prepend(createElement("li", "", block.compute(value)));
    };
    button.addEventListener("click", tryValue);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        tryValue();
      }
    });
    const inputRow = createElement("div", "practice-input-row");
    inputRow.append(input, button);
    wrapper.append(label, inputRow, log);
  } else if (block.kind === "expand") {
    const tokens = createElement("div", "token-row");
    const summary = createElement("p", "quiz-output");
    summary.setAttribute("aria-live", "polite");
    let items = [...block.start];
    const draw = () => {
      tokens.replaceChildren();
      items.forEach((symbol, index) => {
        const button = createElement("button", "token-button", symbol);
        button.type = "button";
        const rule = block.rules[symbol];
        button.disabled = !rule;
        button.setAttribute("aria-label", rule ? `${symbol} を ${rule.join("")} に置きかえる` : symbol);
        button.addEventListener("click", () => {
          items.splice(index, 1, ...rule);
          draw();
        });
        tokens.append(button);
      });
      const count = items.filter((symbol) => symbol === block.unit).length;
      summary.textContent = items.every((symbol) => symbol === block.unit)
        ? `全部 ${block.unit} になった！ ${block.unit} ${count}個分`
        : `いまの記号：${items.join("")}`;
    };
    const reset = createElement("button", "button button-quiet", "最初にもどす");
    reset.type = "button";
    reset.addEventListener("click", () => {
      items = [...block.start];
      draw();
    });
    draw();
    wrapper.append(createElement("p", "quiz-help", block.label), tokens, summary, reset);
  } else if (block.kind === "transform") {
    const order = ["up", "right", "down", "left"];
    let direction = block.start;
    const display = createElement("div", "arrow-display", directionArrows[direction]);
    display.setAttribute("aria-live", "polite");
    const log = createElement("p", "quiz-help", "");
    const operations = [
      ["時計回り90°", () => order[(order.indexOf(direction) + 1) % 4]],
      ["反時計回り90°", () => order[(order.indexOf(direction) + 3) % 4]],
      ["左右反転", () => ({ right: "left", left: "right" }[direction] ?? direction)],
      ["上下反転", () => ({ up: "down", down: "up" }[direction] ?? direction)],
    ];
    const buttons = createElement("div", "tool-button-row");
    operations.forEach(([label, next]) => {
      const button = createElement("button", "button button-secondary", label);
      button.type = "button";
      button.addEventListener("click", () => {
        const before = directionArrows[direction];
        direction = next();
        display.textContent = directionArrows[direction];
        log.textContent = `${before} →（${label}）→ ${directionArrows[direction]}`;
      });
      buttons.append(button);
    });
    const reset = createElement("button", "button button-quiet", `最初（${directionArrows[block.start]}）にもどす`);
    reset.type = "button";
    reset.addEventListener("click", () => {
      direction = block.start;
      display.textContent = directionArrows[direction];
      log.textContent = "";
    });
    wrapper.append(createElement("p", "quiz-help", block.label), display, buttons, log, reset);
  } else if (block.kind === "cipher") {
    const textId = `cipher-text-${Math.random().toString(36).slice(2)}`;
    const shiftId = `cipher-shift-${Math.random().toString(36).slice(2)}`;
    const textLabel = createElement("label", "", "文字（アルファベット）");
    textLabel.htmlFor = textId;
    const text = document.createElement("input");
    Object.assign(text, { type: "text", id: textId, value: block.sample, autocomplete: "off", className: "problem-input", maxLength: 12 });
    const shiftLabel = createElement("label", "", "ずらす数");
    shiftLabel.htmlFor = shiftId;
    const shift = document.createElement("input");
    Object.assign(shift, { type: "range", id: shiftId, min: -3, max: 3, step: 1, value: 0 });
    const output = createElement("output", "quiz-output");
    const update = () => {
      const amount = Number(shift.value);
      const converted = text.value.toUpperCase().replace(/[A-Z]/g, (letter) => String.fromCharCode(((letter.charCodeAt(0) - 65 + amount + 26) % 26) + 65));
      output.textContent = `${amount > 0 ? `${amount}つ後ろ` : amount < 0 ? `${-amount}つ前` : "ずらさない"}：${text.value.toUpperCase()} → ${converted}`;
    };
    text.addEventListener("input", update);
    shift.addEventListener("input", update);
    update();
    wrapper.append(createElement("p", "quiz-help", block.label), textLabel, text, shiftLabel, shift, output);
  } else if (block.kind === "rules") {
    const output = createElement("p", "quiz-output", "ボタンをおしてみよう");
    output.setAttribute("aria-live", "polite");
    const buttons = createElement("div", "tool-button-row");
    block.options.forEach((option) => {
      const button = createElement("button", "button button-secondary", option.label);
      button.type = "button";
      button.addEventListener("click", () => {
        const values = [block.start];
        for (let i = 1; i < block.terms; i += 1) values.push(option.apply(values[values.length - 1]));
        output.textContent = `「${option.label}」：${values.join(", ")}`;
      });
      buttons.append(button);
    });
    wrapper.append(createElement("p", "quiz-help", block.label), buttons, output);
  } else if (block.kind === "toggles") {
    const honest = Object.fromEntries(block.people.map((person) => [person, true]));
    const buttons = createElement("div", "tool-button-row");
    const results = createElement("ul", "toggle-results");
    results.setAttribute("aria-live", "polite");
    const verdict = createElement("p", "quiz-output");
    const update = () => {
      results.replaceChildren();
      let consistent = true;
      block.people.forEach((person) => {
        const statement = block.statements[person];
        const isTrue = statement.isTrue(honest);
        const matches = isTrue === honest[person];
        if (!matches) consistent = false;
        results.append(createElement("li", matches ? "is-ok" : "is-ng",
          `${person}「${statement.text}」は${isTrue ? "本当" : "うそ"} → ${person}が${honest[person] ? "正直者" : "うそつき"}なら${matches ? "つじつまが合う ✓" : "おかしい ✗"}`));
      });
      verdict.textContent = consistent ? "全員つじつまが合った！" : "どこかでつじつまが合わない…";
    };
    block.people.forEach((person) => {
      const button = createElement("button", "button button-secondary toggle-person");
      button.type = "button";
      const label = () => `${person}：${honest[person] ? "正直" : "うそつき"}`;
      button.textContent = label();
      button.setAttribute("aria-pressed", "true");
      button.addEventListener("click", () => {
        honest[person] = !honest[person];
        button.textContent = label();
        button.setAttribute("aria-pressed", String(honest[person]));
        update();
      });
      buttons.append(button);
    });
    update();
    wrapper.append(createElement("p", "quiz-help", block.label), buttons, results, verdict);
  } else if (block.kind === "gridmove") {
    const { grid } = block;
    let position = [...grid.start];
    const board = createElement("div", "move-grid");
    board.style.gridTemplateColumns = `repeat(${grid.cols}, 1fr)`;
    board.setAttribute("aria-hidden", "true");
    const status = createElement("p", "quiz-output");
    status.setAttribute("aria-live", "polite");
    const log = [];
    const draw = () => {
      board.replaceChildren();
      for (let row = 0; row < grid.rows; row += 1) {
        for (let col = 0; col < grid.cols; col += 1) {
          const cell = createElement("span", "move-cell", grid.items[`${col},${row}`] ?? "");
          if (col === grid.start[0] && row === grid.start[1]) cell.classList.add("is-start");
          if (col === position[0] && row === position[1]) cell.classList.add("is-here");
          board.append(cell);
        }
      }
      const atStart = position[0] === grid.start[0] && position[1] === grid.start[1];
      const item = grid.items[`${position[0]},${position[1]}`] ?? (atStart ? "スタート" : undefined);
      status.textContent = `${log.length ? `${log.join("・")} → ` : ""}いまのマス：${item ?? "（なにもない）"}`;
    };
    const moves = [["北", 0, -1], ["東", 1, 0], ["南", 0, 1], ["西", -1, 0]];
    const buttons = createElement("div", "tool-button-row");
    moves.forEach(([label, dx, dy]) => {
      const button = createElement("button", "button button-secondary", `${label}へ1マス`);
      button.type = "button";
      button.addEventListener("click", () => {
        const next = [position[0] + dx, position[1] + dy];
        if (next[0] < 0 || next[1] < 0 || next[0] >= grid.cols || next[1] >= grid.rows) return;
        position = next;
        log.push(label);
        draw();
      });
      buttons.append(button);
    });
    const reset = createElement("button", "button button-quiet", "スタートにもどる");
    reset.type = "button";
    reset.addEventListener("click", () => {
      position = [...grid.start];
      log.length = 0;
      draw();
    });
    draw();
    wrapper.append(createElement("p", "quiz-help", block.label), board, buttons, status, reset);
  } else if (block.kind === "hanoi") {
    let pegs;
    let selected = null;
    let moves = 0;
    const board = createElement("div", "hanoi-board");
    const status = createElement("p", "quiz-output");
    status.setAttribute("aria-live", "polite");
    const pegNames = ["左", "真ん中", "右"];
    const draw = (message = "") => {
      board.replaceChildren();
      pegs.forEach((stack, index) => {
        const peg = createElement("button", "hanoi-peg");
        peg.type = "button";
        peg.setAttribute("aria-label", `${pegNames[index]}の棒（円盤 ${stack.length}枚）`);
        if (selected === index) peg.classList.add("is-selected");
        stack.forEach((size) => {
          const disk = createElement("span", "hanoi-disk");
          disk.style.width = `${30 + size * 18}%`;
          disk.style.background = ["#dc8266", "#d6a35c", "#698ca4", "#81a874"][(size - 1) % 4];
          peg.append(disk);
        });
        peg.addEventListener("click", () => {
          if (selected === null) {
            if (!stack.length) return;
            selected = index;
            draw(`${pegNames[index]}の棒を選んだ。移す先の棒をおそう`);
            return;
          }
          const from = pegs[selected];
          const disk = from[from.length - 1];
          if (selected !== index && (!stack.length || stack[stack.length - 1] > disk)) {
            from.pop();
            stack.push(disk);
            moves += 1;
          } else if (selected !== index) {
            selected = null;
            draw("小さい円盤の上に大きい円盤はのせられない！");
            return;
          }
          selected = null;
          const done = pegs[2].length === block.disks;
          draw(done ? `全部移せた！ ${moves}回` : "");
        });
        board.append(peg);
      });
      status.textContent = message || `動かした回数：${moves}回`;
    };
    const reset = () => {
      pegs = [Array.from({ length: block.disks }, (_, index) => block.disks - index), [], []];
      selected = null;
      moves = 0;
      draw();
    };
    const resetButton = createElement("button", "button button-quiet", "最初からやり直す");
    resetButton.type = "button";
    resetButton.addEventListener("click", reset);
    reset();
    wrapper.append(createElement("p", "quiz-help", block.label), board, status, resetButton);
  }
  return wrapper;
}

// ---- 結果 ----

function finishSession() {
  session.finished = true;
  const history = loadHistory();
  history.runs.push({
    date: new Date().toISOString(),
    reading: session.reading.skipped ? [] : session.reading.records,
    memory: session.memory.skipped ? [] : session.memory.records,
    puzzle: session.puzzle.skipped ? [] : session.puzzle.results,
  });
  writeStorage(HISTORY_KEY, history);
  showResults(history.runs);
}

// 「覚えやすさ」と「パズル」は問題の難しさがちがうので、そのまま正答率を足さない。
// それぞれの中で「平均よりどれだけよく解けたか」を出し、その平均で〇〇優位を判定する。
function getProfile(runs) {
  const tasks = {
    memory: { name: "覚えやすさ", types: ["visual", "verbal", "auditory"], label: { visual: "見て", verbal: "読んで", auditory: "聞いて" }, stats: {} },
    puzzle: { name: "パズル", types: puzzleTypes, label: { visual: "図解ヒント", verbal: "文章ヒント", hands: "動かすヒント" }, stats: {} },
  };
  Object.values(tasks).forEach((task) => task.types.forEach((type) => { task.stats[type] = { total: 0, correct: 0 }; }));
  runs.forEach((run) => {
    (run.memory ?? []).forEach((record) => {
      const stat = tasks.memory.stats[record.type];
      if (!stat) return;
      stat.total += 1;
      if (record.correct) stat.correct += 1;
    });
    (run.puzzle ?? []).forEach((record) => {
      const stat = tasks.puzzle.stats[record.type];
      if (!stat) return;
      stat.total += 1;
      if (record.correct) stat.correct += 1;
    });
  });

  const deviations = Object.fromEntries(typeOrder.map((type) => [type, []]));
  Object.values(tasks).forEach((task) => {
    const measured = task.types.filter((type) => task.stats[type].total > 0);
    if (measured.length < 2) return;
    const rate = (type) => task.stats[type].correct / task.stats[type].total;
    const mean = measured.reduce((sum, type) => sum + rate(type), 0) / measured.length;
    measured.forEach((type) => deviations[type].push(rate(type) - mean));
  });
  const measuredTypes = typeOrder.filter((type) => deviations[type].length);
  const scores = Object.fromEntries(measuredTypes.map((type) => [type, deviations[type].reduce((a, b) => a + b, 0) / deviations[type].length]));
  const ranked = [...measuredTypes].sort((a, b) => scores[b] - scores[a]);
  const winner = ranked[0] ?? null;
  const leadingTypes = winner ? ranked.filter((type) => scores[winner] - scores[type] < 0.001) : [];
  const margin = ranked.length > 1 ? scores[ranked[0]] - scores[ranked[1]] : 0;
  return { tasks, scores, ranked, winner, leadingTypes, margin };
}

function showResults(runs) {
  const { tasks, scores, ranked, winner, leadingTypes, margin } = getProfile(runs);
  currentProfile = winner ?? "visual";
  const profile = profiles[currentProfile];
  document.querySelector("#result-icon").textContent = profile.icon;
  document.querySelector("#result-title").textContent = winner ? `${dominanceNames[winner]}の傾向` : "学び方の傾向はまだわかりません";
  document.querySelector("#result-subtitle").textContent = winner ? profile.subtitle : "覚えやすさ・パズルのステップをやってみよう";
  document.querySelector("#result-description").textContent = winner ? profile.description : "読みやすい表示は下のカードで確認できます。";
  document.querySelector("#support-copy").textContent = profile.support;
  document.querySelector("#practice-approach").textContent = `今回の練習のヒント：${profile.practiceLabel}`;
  renderTextList("#next-step-list", (leadingTypes.length ? leadingTypes : [currentProfile]).map((type) => profiles[type].nextStep));

  const scoreList = document.querySelector("#score-list");
  scoreList.replaceChildren();
  typeOrder.forEach((type) => {
    if (!(type in scores)) return;
    const row = createElement("div", "score-row");
    const bar = createElement("span", "score-bar");
    // 0 を中央（平均）として、平均より上なら右へのびる
    const position = Math.max(0, Math.min(100, 50 + scores[type] * 100));
    bar.setAttribute("aria-label", `${dominanceNames[type]}：平均との差 ${Math.round(scores[type] * 100)}ポイント`);
    const fill = document.createElement("span");
    fill.style.width = `${position}%`;
    bar.append(fill);
    const sign = scores[type] > 0 ? "+" : "";
    row.append(
      createElement("span", "score-label", dominanceNames[type]),
      bar,
      createElement("span", "score-value", `${sign}${Math.round(scores[type] * 100)}`),
    );
    scoreList.append(row);
  });

  const reasons = [];
  Object.values(tasks).forEach((task) => {
    const parts = task.types
      .filter((type) => task.stats[type].total)
      .map((type) => `${task.label[type]} ${task.stats[type].correct}/${task.stats[type].total}`);
    if (parts.length) reasons.push(`${task.name}：${parts.join("・")}`);
  });
  if (winner) {
    reasons.unshift(`これまで${runs.length}回のチェックでは、${dominanceNames[winner]}（${typeShortNames[winner]}）のときがいちばんよくできていました。`);
    if (margin < 0.15) reasons.push("ただし、ほかとの差は小さめです。もう一度チェックすると、結果がはっきりしてきます。");
    if (!("auditory" in scores)) reasons.push("「聞く」はまだ測れていません（音声が使えない、またはステップをとばしたため）。");
  } else {
    reasons.push("覚えやすさ・パズルのステップの記録がまだありません。");
  }
  renderTextList("#reason-list", reasons);
  document.querySelector("#score-heading-note").textContent = "（平均を0として、どれだけよくできたか）";

  renderDisplayCard();
  document.querySelector("#lesson-speak-button").hidden = !speechAvailable;

  hasResults = true;
  startLabel.textContent = "チェック結果を見る";
  selectResultTab(summaryTab);
  showScreen("results");
  scrollToElement(resultsSection);
  document.querySelector("#results-title").focus({ preventScroll: true });
  resetLesson();
}

function renderDisplayCard() {
  const display = loadDisplay();
  applyReaderVariables(document.documentElement, display.settings);
  const list = document.querySelector("#display-list");
  list.replaceChildren();
  readingDimensions.forEach((dimension) => {
    const row = createElement("div", "display-row");
    const id = `display-${dimension.id}`;
    const label = createElement("label", "display-label", dimension.name);
    label.htmlFor = id;
    const select = document.createElement("select");
    select.id = id;
    dimension.variants.forEach((variant) => {
      const option = document.createElement("option");
      option.value = variant.id;
      option.textContent = variant.label;
      option.selected = display.settings[dimension.id] === variant.id;
      select.append(option);
    });
    select.addEventListener("change", () => {
      const next = loadDisplay();
      next.settings[dimension.id] = select.value;
      next.manual[dimension.id] = true;
      saveDisplay(next);
      renderDisplayCard();
    });
    row.append(label, select, createElement("p", "display-reason", displayReason(dimension, display)));
    list.append(row);
  });
}

function displayReason(dimension, display) {
  if (display.manual[dimension.id]) return "自分で選んだ設定です（いちばん優先します）。";
  const decision = display.decisions[dimension.id];
  if (!decision) return "まだ測っていません（標準の設定です）。";
  const speeds = decision.measurements
    .map((item) => `${findVariant(dimension.id, item.variant).label} ${(item.chars / (item.ms / 1000)).toFixed(1)}字/秒${item.correct ? "" : "（問題×）"}`)
    .join("、");
  const chosen = findVariant(dimension.id, decision.choice).label;
  const message = {
    measured: `「${chosen}」がはっきり速く読めました。`,
    both: `「${chosen}」が速く読めて、読みやすいとも感じていました。`,
    preference: `速さの差が小さかったので、読みやすいと選んだ「${chosen}」にしました。`,
  }[decision.reason];
  return `${message}（${speeds}）`;
}

// ---- AI練習の読み上げ ----

function lessonSpeechText() {
  const pick = (selector) => document.querySelector(selector)?.textContent ?? "";
  const list = (selector) => [...document.querySelectorAll(`${selector} li`)].map((item) => item.textContent).join("。");
  return [pick("#lesson-title"), pick("#lesson-goal"), pick("#lesson-intro"), list("#lesson-keypoints-list"),
    `例題。${pick("#example-prompt")}`, list("#example-steps"), pick("#example-answer"),
    `問題。${pick("#problem-prompt")}`].filter(Boolean).join("。");
}

function toggleLessonSpeech() {
  const button = document.querySelector("#lesson-speak-button");
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    button.textContent = "🔊 読み上げる";
    return;
  }
  const utterance = new SpeechSynthesisUtterance(lessonSpeechText());
  utterance.lang = "ja-JP";
  utterance.rate = 0.95;
  utterance.addEventListener("end", () => { button.textContent = "🔊 読み上げる"; });
  speechSynthesis.speak(utterance);
  button.textContent = "■ 止める";
}

const lessonState = {
  topic: "",
  difficulty: 2,
  attempts: 0,
  correct: 0,
  exercise: null,
  answered: false,
};

const difficultyNames = ["入門", "やさしい", "標準", "応用", "チャレンジ"];

let lessonRevision = 0;

function setGenerating(generating) {
  const button = document.querySelector("#start-lesson-button");
  document.querySelector("#lesson-output").setAttribute("aria-busy", String(generating));
  button.disabled = generating;
  button.innerHTML = generating
    ? '<span class="loading-dot" aria-hidden="true"></span>問題を作成中…'
    : '問題をつくる <span aria-hidden="true">→</span>';
}

function setGrading(grading) {
  const button = document.querySelector("#submit-answer-button");
  document.querySelector("#answer-form").setAttribute("aria-busy", String(grading));
  button.disabled = grading;
  button.innerHTML = grading
    ? '<span class="loading-dot" aria-hidden="true"></span>AIが答え合わせ中…'
    : '答え合わせ <span aria-hidden="true">→</span>';
}

function resetLesson() {
  lessonRevision += 1;
  setGenerating(false);
  setGrading(false);
  Object.assign(lessonState, {
    topic: "",
    difficulty: 2,
    attempts: 0,
    correct: 0,
    exercise: null,
    answered: false,
  });
  document.querySelector("#lesson-output").hidden = true;
  document.querySelector("#lesson-error").hidden = true;
}

function updateLessonDashboard() {
  document.querySelector("#lesson-count").textContent = `問題 ${lessonState.attempts + (!lessonState.answered && lessonState.exercise ? 1 : 0)}`;
  document.querySelector("#correct-count").textContent = `${lessonState.correct} 問`;
  document.querySelector("#difficulty-label").textContent = `Lv.${lessonState.difficulty} · ${difficultyNames[lessonState.difficulty - 1]}`;
}

async function callLessonApi(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...body,
      grade: document.querySelector("#grade-select").value,
    }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || `リクエストに失敗しました（${response.status}）。`);
  }
  return payload;
}

const MAX_HOMEWORK_FILE_BYTES = 12 * 1024 * 1024;
const MAX_COMPRESSED_IMAGE_BYTES = 1_500_000;
const MAX_HOMEWORK_HISTORY = 10;
let homeworkImagePayload = null;
let homeworkPreviewUrl = "";
let homeworkSelectionId = 0;
let homeworkConversation = [];
let homeworkHints = [];
let homeworkHintIndex = 0;
let homeworkTopic = "";
let learningRecords = [];

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("写真を縮小できませんでした。別の写真をお試しください。"));
    }, "image/jpeg", quality);
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string" || !dataUrl.includes(",")) {
        reject(new Error("写真を読み込めませんでした。"));
        return;
      }
      resolve(dataUrl.slice(dataUrl.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("写真を読み込めませんでした。"));
    reader.readAsDataURL(blob);
  });
}

async function prepareHomeworkImage(file) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("JPEG・PNG・WebP形式の写真を選んでください。");
  }
  if (file.size > MAX_HOMEWORK_FILE_BYTES) {
    throw new Error("写真は12MB以下のものを選んでください。");
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("写真を読み込めませんでした。画像を確認して選び直してください。");
  }

  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("写真を処理できませんでした。このブラウザーで再度お試しください。");
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let blob = await canvasToBlob(canvas, 0.82);
  if (blob.size > MAX_COMPRESSED_IMAGE_BYTES) {
    blob = await canvasToBlob(canvas, 0.65);
  }
  if (blob.size > MAX_COMPRESSED_IMAGE_BYTES) {
    throw new Error("写真のサイズを小さくできませんでした。別の写真をお試しください。");
  }
  return {
    blob,
    payload: { mimeType: "image/jpeg", data: await blobToBase64(blob) },
  };
}

function showHomeworkError(error) {
  const errorElement = document.querySelector("#homework-error");
  errorElement.textContent = error instanceof Error ? error.message : "写真の解説に失敗しました。";
  errorElement.hidden = false;
}

async function selectHomeworkImage(event) {
  const input = event.currentTarget;
  const file = input.files?.[0];
  const selectionId = ++homeworkSelectionId;
  const submitButton = document.querySelector("#homework-submit");
  const previewContainer = document.querySelector("#homework-preview-container");
  homeworkImagePayload = null;
  homeworkConversation = [];
  homeworkTopic = "";
  homeworkHints = [];
  homeworkHintIndex = 0;
  submitButton.disabled = true;
  document.querySelector("#homework-result").hidden = true;
  document.querySelector("#homework-chat").hidden = true;
  document.querySelector("#homework-messages").replaceChildren();
  document.querySelector("#homework-error").hidden = true;
  document.querySelector("#homework-check-feedback").hidden = true;
  document.querySelector("#homework-answer").value = "";
  document.querySelector("#homework-answer").disabled = false;
  document.querySelector("#homework-check-submit").disabled = false;
  updateHomeworkHintProgress();
  if (homeworkPreviewUrl) URL.revokeObjectURL(homeworkPreviewUrl);
  homeworkPreviewUrl = "";
  previewContainer.hidden = true;
  const homeworkDropzone = document.querySelector("#homework-dropzone");
  if (homeworkDropzone) homeworkDropzone.hidden = false;
  if (!file) return;

  submitButton.disabled = true;
  submitButton.textContent = "写真を準備中…";
  try {
    const prepared = await prepareHomeworkImage(file);
    if (selectionId !== homeworkSelectionId) return;
    homeworkImagePayload = prepared.payload;
    homeworkPreviewUrl = URL.createObjectURL(prepared.blob);
    document.querySelector("#homework-preview").src = homeworkPreviewUrl;
    document.querySelector("#homework-image-name").textContent = `${file.name}（送信前に縮小済み）`;
    previewContainer.hidden = false;
    if (homeworkDropzone) homeworkDropzone.hidden = true;
    submitButton.disabled = false;
  } catch (error) {
    if (selectionId !== homeworkSelectionId) return;
    showHomeworkError(error);
    if (homeworkDropzone) homeworkDropzone.hidden = false;
    input.value = "";
  } finally {
    if (selectionId === homeworkSelectionId) {
      submitButton.innerHTML = '写真の問題を読み取る <span aria-hidden="true">→</span>';
    }
  }
}

function renderHomeworkExplanation(result) {
  homeworkTopic = result.topic;
  document.querySelector("#homework-topic").textContent = `テーマ：${result.topic}`;
  document.querySelector("#homework-problem").textContent = result.problem;
  document.querySelector("#homework-explanation").textContent = result.explanation;
  homeworkHints = result.hints;
  homeworkHintIndex = 0;
  const hints = document.querySelector("#homework-hints");
  hints.replaceChildren();
  homeworkHints.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    item.hidden = true;
    hints.append(item);
  });
  updateHomeworkHintProgress();
  document.querySelector("#homework-answer").value = "";
  document.querySelector("#homework-answer").disabled = false;
  document.querySelector("#homework-check-submit").disabled = false;
  const checkFeedback = document.querySelector("#homework-check-feedback");
  checkFeedback.hidden = true;
  checkFeedback.textContent = "";
  const context = [
    `テーマ: ${result.topic}`,
    `読み取った問題: ${result.problem}`,
    `説明: ${result.explanation}`,
    "ヒントは必要に応じて画面から一つずつ開いてください。",
  ].join("\n");
  homeworkConversation = [{ role: "assistant", content: context.slice(0, 1_000) }];
  document.querySelector("#homework-messages").replaceChildren();
  document.querySelector("#homework-chat").hidden = false;
}

function updateHomeworkHintProgress() {
  const progress = document.querySelector("#homework-hint-progress");
  progress.textContent = `ヒント ${homeworkHintIndex} / ${homeworkHints.length}`;
  const button = document.querySelector("#homework-hint-button");
  button.disabled = homeworkHintIndex >= homeworkHints.length;
  button.textContent = homeworkHintIndex >= homeworkHints.length
    ? "すべてのヒントを表示しました"
    : "次のヒントを見る";
}

function appendHomeworkMessage(role, content) {
  const message = document.createElement("p");
  message.className = `homework-message ${role === "user" ? "is-user" : "is-assistant"}`;
  message.textContent = content;
  document.querySelector("#homework-messages").append(message);
  return message;
}

async function askHomeworkFollowup(event) {
  event.preventDefault();
  const input = document.querySelector("#homework-followup");
  const question = input.value.trim();
  if (!question || !homeworkImagePayload || !homeworkConversation.length) return;

  const button = document.querySelector("#homework-chat-submit");
  const messages = document.querySelector("#homework-messages");
  const userMessage = appendHomeworkMessage("user", question);
  button.disabled = true;
  input.disabled = true;
  button.innerHTML = '<span class="loading-dot" aria-hidden="true"></span>考え中…';
  document.querySelector("#homework-error").hidden = true;
  try {
    const result = await callLessonApi("/api/homework/explain", {
      image: homeworkImagePayload,
      question,
      history: homeworkConversation.slice(-MAX_HOMEWORK_HISTORY),
    });
    homeworkConversation.push(
      { role: "user", content: question },
      { role: "assistant", content: result.reply.slice(0, 1_000) },
    );
    homeworkConversation = homeworkConversation.slice(-MAX_HOMEWORK_HISTORY);
    appendHomeworkMessage("assistant", result.reply);
    input.value = "";
    messages.scrollTop = messages.scrollHeight;
  } catch (error) {
    userMessage.remove();
    showHomeworkError(error);
  } finally {
    button.disabled = false;
    input.disabled = false;
    button.innerHTML = '質問する <span aria-hidden="true">→</span>';
    input.focus();
  }
}

async function explainHomeworkPhoto(event) {
  event.preventDefault();
  if (!homeworkImagePayload) {
    showHomeworkError(new Error("宿題の写真を選んでください。"));
    return;
  }

  const resultElement = document.querySelector("#homework-result");
  const submitButton = document.querySelector("#homework-submit");
  const question = document.querySelector("#homework-question").value.trim();
  document.querySelector("#homework-error").hidden = true;
  resultElement.hidden = false;
  resultElement.setAttribute("aria-busy", "true");
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="loading-dot" aria-hidden="true"></span>写真を読み取り中…';
  try {
    const result = await callLessonApi("/api/homework/explain", {
      image: homeworkImagePayload,
      question,
    });
    renderHomeworkExplanation(result);
    scrollToElement(resultElement);
  } catch (error) {
    showHomeworkError(error);
    resultElement.hidden = true;
  } finally {
    resultElement.setAttribute("aria-busy", "false");
    submitButton.disabled = !homeworkImagePayload;
    submitButton.innerHTML = '写真の問題を読み取る <span aria-hidden="true">→</span>';
  }
}

const LEARNING_RECORDS_KEY = "manabi-compass.learning-records.v1";

function isLearningRecord(value) {
  return value && typeof value === "object"
    && typeof value.topic === "string" && value.topic.length > 0 && value.topic.length <= 60
    && ["practice", "homework"].includes(value.kind)
    && typeof value.correct === "boolean"
    && typeof value.at === "string";
}

function loadLearningRecords() {
  const stored = localStorage.getItem(LEARNING_RECORDS_KEY);
  if (stored === null) {
    learningRecords = [];
    return;
  }
  const parsed = JSON.parse(stored);
  if (!Array.isArray(parsed) || !parsed.every(isLearningRecord)) {
    throw new Error("保存された学習記録の形式を確認できません。記録を消してから使ってください。");
  }
  learningRecords = parsed;
}

function renderLearningRecords() {
  const summary = document.querySelector("#record-summary");
  const container = document.querySelector("#review-topics");
  container.replaceChildren();
  const practiceCount = learningRecords.filter((record) => record.kind === "practice").length;
  const homeworkCount = learningRecords.filter((record) => record.kind === "homework").length;
  summary.textContent = learningRecords.length
    ? `記録 ${learningRecords.length}件（練習 ${practiceCount}件・宿題 ${homeworkCount}件）`
    : "まだ記録はありません。練習や宿題の結果がこの端末に保存されます。";

  const byTopic = new Map();
  learningRecords.forEach((record) => {
    const counts = byTopic.get(record.topic) || { total: 0, correct: 0, missed: 0 };
    counts.total += 1;
    if (record.correct) counts.correct += 1;
    else counts.missed += 1;
    byTopic.set(record.topic, counts);
  });
  [...byTopic.entries()]
    .filter(([, counts]) => counts.missed > 0)
    .sort((left, right) => left[1].correct / left[1].total - right[1].correct / right[1].total)
    .forEach(([topic, counts]) => {
      const item = document.createElement("div");
      item.className = "review-topic";
      const text = document.createElement("p");
      text.textContent = `${topic}：正解率 ${Math.round((counts.correct / counts.total) * 100)}%（${counts.correct}/${counts.total}）`;
      const button = document.createElement("button");
      button.className = "button button-quiet";
      button.type = "button";
      button.textContent = "このテーマを復習する";
      button.addEventListener("click", () => {
        const topicInput = document.querySelector("#topic-input");
        topicInput.value = topic;
        topicInput.focus();
        document.querySelector("#material-form").requestSubmit();
      });
      item.append(text, button);
      container.append(item);
    });
}

function recordLearningResult(record) {
  const nextRecords = [...learningRecords, { ...record, at: new Date().toISOString() }];
  try {
    localStorage.setItem(LEARNING_RECORDS_KEY, JSON.stringify(nextRecords));
    learningRecords = nextRecords;
    renderLearningRecords();
  } catch {
    document.querySelector("#record-summary").textContent =
      "学習記録を保存できませんでした。ブラウザーの保存容量や設定を確認してください。";
  }
}

async function checkHomeworkAnswer(event) {
  event.preventDefault();
  const answerInput = document.querySelector("#homework-answer");
  const answer = answerInput.value.trim();
  if (!answer || !homeworkImagePayload || !homeworkTopic) return;
  const button = document.querySelector("#homework-check-submit");
  const feedback = document.querySelector("#homework-check-feedback");
  button.disabled = true;
  answerInput.disabled = true;
  feedback.hidden = true;
  try {
    const result = await callLessonApi("/api/homework/check", {
      image: homeworkImagePayload,
      answer,
    });
    const messages = {
      correct: "正解です。自分の力で解けました！",
      close: "考え方が一部合っています。ヒントを見直して、もう一度考えてみましょう。",
      retry: "問題の条件とヒントを確かめて、もう一度考えてみましょう。",
    };
    if (!Object.hasOwn(messages, result.status)) {
      throw new Error("答えの確認結果を読み取れませんでした。もう一度お試しください。");
    }
    feedback.textContent = messages[result.status];
    feedback.hidden = false;
    recordLearningResult({
      topic: result.topic,
      kind: "homework",
      correct: result.status === "correct",
    });
    if (result.status !== "correct") {
      answerInput.disabled = false;
      answerInput.focus();
      button.disabled = false;
    }
  } catch (error) {
    answerInput.disabled = false;
    button.disabled = false;
    showHomeworkError(error);
  }
}

async function checkGeminiStatus() {
  const badge = document.querySelector("#api-status");
  const form = document.querySelector("#material-form");
  let available = false;
  try {
    const response = await fetch("/api/status");
    if (!response.ok) throw new Error("status");
    const status = await response.json();
    available = status.configured === true;
    badge.textContent = available ? "Geminiで問題を作成" : "現在、AI練習問題は利用できません";
  } catch {
    badge.textContent = "接続できませんでした。ページを再読み込みしてお試しください。";
  }
  badge.classList.toggle("api-unconfigured", !available);
  form.hidden = !available;
  document.querySelector("#open-practice-button").hidden = !available;
  document.querySelector("#lesson-privacy-note").hidden = !available;
}

function displayLessonError(error) {
  const errorElement = document.querySelector("#lesson-error");
  errorElement.textContent = error instanceof Error ? error.message : "問題の作成に失敗しました。";
  errorElement.hidden = false;
}

async function startLesson(event) {
  event.preventDefault();
  const topic = document.querySelector("#topic-input").value.trim();
  if (!topic) {
    document.querySelector("#topic-input").focus();
    return;
  }

  resetLesson();
  const revision = lessonRevision;
  lessonState.topic = topic;
  document.querySelector("#lesson-output").hidden = false;
  document.querySelector("#lesson-error").hidden = true;
  setGenerating(true);
  scrollToElement(document.querySelector("#lesson-output"));
  try {
    const result = await callLessonApi("/api/lesson/generate", {
      topic,
      profile: currentProfile,
      difficulty: lessonState.difficulty,
    });
    if (revision !== lessonRevision) return;
    lessonState.exercise = result.exercise;
    renderExercise();
    document.querySelector("#problem-title").focus({ preventScroll: true });
  } catch (error) {
    if (revision !== lessonRevision) return;
    displayLessonError(error);
    document.querySelector("#lesson-output").hidden = true;
  } finally {
    if (revision === lessonRevision) setGenerating(false);
  }
}

function renderExercise() {
  const exercise = lessonState.exercise;
  if (!exercise) return;
  lessonState.answered = false;
  const isChoice = exercise.choices.length > 0;
  document.querySelector("#lesson-title").textContent = exercise.lessonTitle;
  document.querySelector("#lesson-paper-topic").textContent = `テーマ：${lessonState.topic}`;
  document.querySelector("#lesson-goal").textContent = exercise.learningGoal;
  document.querySelector("#lesson-intro").textContent = exercise.lessonIntro;
  renderTextList("#lesson-keypoints-list", exercise.keyPoints, "lesson-keypoint");
  document.querySelector("#example-prompt").textContent = exercise.workedExample.prompt;
  renderTextList("#example-steps", exercise.workedExample.steps);
  document.querySelector("#example-answer").textContent = `答え：${exercise.workedExample.answer}`;
  document.querySelector("#question-tag").textContent = `問題 ${lessonState.attempts + 1} · ${difficultyNames[lessonState.difficulty - 1]}`;
  document.querySelector("#question-topic").textContent = lessonState.topic;
  document.querySelector("#problem-title").textContent = exercise.title;
  document.querySelector("#problem-prompt").textContent = exercise.prompt;
  document.querySelector("#answer-legend").textContent = isChoice ? "答えをひとつ選んでください" : "あなたの答え";
  const choices = document.querySelector("#problem-choices");
  choices.replaceChildren();
  choices.hidden = !isChoice;
  document.querySelector("#problem-input").hidden = isChoice;
  document.querySelector("#problem-input").value = "";
  document.querySelector("#problem-input").required = !isChoice;

  if (isChoice) {
    exercise.choices.forEach((choice, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "problem-choice";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "problem-answer";
      input.id = `problem-choice-${index}`;
      input.value = choice;
      const label = document.createElement("label");
      label.htmlFor = input.id;
      const marker = document.createElement("span");
      marker.className = "choice-marker";
      marker.textContent = String.fromCharCode(65 + index);
      const text = document.createElement("span");
      text.textContent = choice;
      label.append(marker, text);
      wrapper.append(input, label);
      choices.append(wrapper);
    });
  }

  const visual = document.querySelector("#problem-visual");
  visual.hidden = !exercise.visualAid;
  visual.textContent = exercise.visualAid || "";
  const hint = document.querySelector("#lesson-hint");
  hint.hidden = true;
  hint.textContent = exercise.hint;
  document.querySelector("#hint-button").hidden = !exercise.hint;
  document.querySelector("#answer-feedback").hidden = true;
  document.querySelector("#answer-feedback").replaceChildren();
  document.querySelector("#next-problem-button").hidden = true;
  document.querySelector("#submit-answer-button").disabled = false;
  document.querySelector("#answer-form").hidden = false;
  document.querySelector("#lesson-error").hidden = true;
  updateLessonDashboard();
}

function renderTextList(selector, items, className = "") {
  const list = document.querySelector(selector);
  list.replaceChildren();
  items.forEach((text) => {
    const item = document.createElement("li");
    if (className) item.className = className;
    item.textContent = text;
    list.append(item);
  });
}

async function submitAnswer(event) {
  event.preventDefault();
  if (lessonState.answered || !lessonState.exercise) return;
  const selectedChoice = document.querySelector('input[name="problem-answer"]:checked');
  const answer = lessonState.exercise.choices.length
    ? selectedChoice?.value
    : document.querySelector("#problem-input").value.trim();
  if (!answer) {
    displayLessonError(new Error("答えを選ぶか、入力してください。"));
    return;
  }

  const revision = lessonRevision;
  setGrading(true);
  document.querySelector("#lesson-error").hidden = true;
  try {
    const result = await callLessonApi("/api/lesson/answer", {
      topic: lessonState.topic,
      profile: currentProfile,
      exercise: lessonState.exercise,
      answer,
    });
    recordLearningResult({
      topic: lessonState.topic,
      kind: "practice",
      correct: result.correct,
    });
    lessonState.answered = true;
    lessonState.attempts += 1;
    if (result.correct) {
      lessonState.correct += 1;
      lessonState.difficulty = Math.min(5, lessonState.difficulty + 1);
    } else {
      lessonState.difficulty = Math.max(1, lessonState.difficulty - 1);
    }
    updateLessonDashboard();
    renderFeedback(result);
  } catch (error) {
    if (revision === lessonRevision) displayLessonError(error);
  } finally {
    if (revision === lessonRevision) setGrading(false);
  }
}

function renderFeedback(result) {
  const feedback = document.querySelector("#answer-feedback");
  feedback.replaceChildren();
  feedback.className = `answer-feedback ${result.correct ? "is-correct" : "is-incorrect"}`;
  const heading = document.createElement("h4");
  heading.textContent = result.correct ? "正解！いい調子です。" : "今回は不正解。考え方を確認しよう。";
  const message = document.createElement("p");
  message.textContent = result.feedback;
  const solution = document.createElement("p");
  solution.className = "solution-copy";
  solution.textContent = `解説：${result.solution}`;
  const nextLevel = document.createElement("p");
  nextLevel.className = "level-change";
  nextLevel.textContent = result.correct
    ? `次は Lv.${lessonState.difficulty} · ${difficultyNames[lessonState.difficulty - 1]} に挑戦。`
    : `次は Lv.${lessonState.difficulty} · ${difficultyNames[lessonState.difficulty - 1]} からやり直そう。`;
  feedback.append(heading, message, solution, nextLevel);
  feedback.hidden = false;
  document.querySelector("#answer-form").hidden = true;
  const nextButton = document.querySelector("#next-problem-button");
  nextButton.disabled = false;
  nextButton.innerHTML = '次の問題へ <span aria-hidden="true">→</span>';
  nextButton.hidden = false;
  nextButton.focus({ preventScroll: true });
}

async function loadNextProblem() {
  const revision = lessonRevision;
  const nextButton = document.querySelector("#next-problem-button");
  nextButton.disabled = true;
  nextButton.innerHTML = '<span class="loading-dot" aria-hidden="true"></span>次の問題を準備中…';
  document.querySelector("#lesson-error").hidden = true;
  try {
    const result = await callLessonApi("/api/lesson/generate", {
      topic: lessonState.topic,
      profile: currentProfile,
      difficulty: lessonState.difficulty,
    });
    if (revision !== lessonRevision) return;
    lessonState.exercise = result.exercise;
    renderExercise();
    document.querySelector("#problem-title").focus({ preventScroll: true });
    scrollToElement(document.querySelector("#problem-title"), "center");
  } catch (error) {
    if (revision !== lessonRevision) return;
    displayLessonError(error);
    nextButton.disabled = false;
    nextButton.innerHTML = '再試行 <span aria-hidden="true">↻</span>';
  }
}

appTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectAppTab(tab.dataset.appTab));
  tab.addEventListener("keydown", (event) => {
    const offset = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    const target = offset
      ? appTabs[(index + offset + appTabs.length) % appTabs.length]
      : { Home: appTabs[0], End: appTabs[appTabs.length - 1] }[event.key];
    if (!target) return;
    event.preventDefault();
    selectAppTab(target.dataset.appTab);
    target.focus();
  });
});
document.querySelectorAll("[data-app-tab-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    selectAppTab(link.dataset.appTabLink);
    document.querySelector(`[data-app-tab="${link.dataset.appTabLink}"]`).focus({ preventScroll: true });
  });
});

document.querySelectorAll("[data-home-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showScreen("home");
    if (!hasResults && session && !session.finished) startLabel.textContent = "チェックを続ける";
    scrollToElement(document.querySelector("#home"));
    startButton.focus({ preventScroll: true });
  });
});

startButton.addEventListener("click", () => {
  if (!hasResults) {
    showAssessment();
    return;
  }
  showScreen("results");
  scrollToElement(resultsSection);
  document.querySelector("#results-title").focus({ preventScroll: true });
});

resultTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectResultTab(tab));
  tab.addEventListener("keydown", (event) => {
    const target = {
      ArrowLeft: resultTabs[1 - index],
      ArrowRight: resultTabs[1 - index],
      Home: summaryTab,
      End: practiceTab,
    }[event.key];
    if (!target) return;
    event.preventDefault();
    selectResultTab(target);
    target.focus();
  });
});
document.querySelector("#open-practice-button").addEventListener("click", () => {
  selectResultTab(practiceTab);
  practiceTab.focus({ preventScroll: true });
  scrollToElement(practiceTab, "center");
});
document.querySelector("#stage-start-button").addEventListener("click", beginStage);
document.querySelector("#stage-skip-button").addEventListener("click", skipStage);
document.querySelector("#reading-start-button").addEventListener("click", startReading);
document.querySelector("#reading-done-button").addEventListener("click", finishReading);
document.querySelector("#reading-question-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const checked = document.querySelector('input[name="reading-answer"]:checked');
  if (!checked) {
    document.querySelector("#reading-error").hidden = false;
    return;
  }
  const step = session.reading.steps[session.reading.index];
  if (!step.practice) {
    session.reading.records.push({
      dimension: step.dimension,
      variant: step.variant,
      passageId: step.passage.id,
      chars: step.passage.text.replace(/\s/g, "").length,
      ms: step.ms,
      correct: checked.value === "0",
    });
  }
  nextReadingStep();
});
document.querySelector("#reading-compare-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const checked = document.querySelector('input[name="reading-compare"]:checked');
  if (!checked) {
    document.querySelector("#compare-error").hidden = false;
    return;
  }
  const step = session.reading.steps[session.reading.index];
  session.reading.preferences[step.dimension] = checked.value;
  decideDimension(step.dimension);
  nextReadingStep();
});
document.querySelector("#memory-start-button").addEventListener("click", startMemory);
document.querySelector("#memory-question-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const checked = document.querySelector('input[name="memory-answer"]:checked');
  if (!checked) {
    document.querySelector("#memory-error").hidden = false;
    return;
  }
  const item = session.memory.items[session.memory.index];
  session.memory.records.push({ type: item.modality, correct: checked.value === "0", ms: Math.round(performance.now() - stepShownAt) });
  session.memory.index += 1;
  if (session.memory.index >= session.memory.items.length) {
    nextStage();
  } else {
    renderMemoryItem();
    scrollToElement(assessmentSection);
  }
});
document.querySelector("#quiz-check-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const { plan, index, results } = session.puzzle;
  if (results.length > index) return;
  const { problem, type } = plan[index];
  const checked = document.querySelector('input[name="quiz-check"]:checked');
  if (!checked) {
    document.querySelector("#form-error").hidden = false;
    return;
  }
  document.querySelector("#form-error").hidden = true;
  const correct = checked.value === "0";
  results.push({ problemId: problem.id, type, correct, ms: Math.round(performance.now() - stepShownAt) });
  const feedback = document.querySelector("#quiz-feedback");
  feedback.className = `answer-feedback ${correct ? "is-correct" : "is-incorrect"}`;
  feedback.replaceChildren(
    createElement("h4", "", correct ? "正解！" : "おしい！"),
    createElement("p", "", problem.check.explain),
  );
  feedback.hidden = false;
  document.querySelectorAll('input[name="quiz-check"]').forEach((input) => { input.disabled = true; });
  document.querySelector("#quiz-check-button").hidden = true;
  const nextButton = document.querySelector("#quiz-next-button");
  nextButton.innerHTML = index === plan.length - 1
    ? '結果を見る <span aria-hidden="true">→</span>'
    : '次の問題へ <span aria-hidden="true">→</span>';
  nextButton.hidden = false;
  nextButton.focus({ preventScroll: true });
});
document.querySelector("#quiz-next-button").addEventListener("click", () => {
  session.puzzle.index += 1;
  if (session.puzzle.index < session.puzzle.plan.length) {
    renderPuzzle();
    scrollToElement(assessmentSection);
  } else {
    nextStage();
  }
});
document.querySelector("#lesson-speak-button").addEventListener("click", toggleLessonSpeech);
document.querySelector("#material-form").addEventListener("submit", startLesson);
document.querySelector("#homework-image").addEventListener("change", selectHomeworkImage);
document.querySelector("#homework-form").addEventListener("submit", explainHomeworkPhoto);
document.querySelector("#homework-chat-form").addEventListener("submit", askHomeworkFollowup);
document.querySelector("#homework-check-form").addEventListener("submit", checkHomeworkAnswer);
document.querySelector("#homework-hint-button").addEventListener("click", () => {
  if (homeworkHintIndex >= homeworkHints.length) return;
  document.querySelector("#homework-hints").children[homeworkHintIndex].hidden = false;
  homeworkHintIndex += 1;
  updateHomeworkHintProgress();
});
document.querySelector("#clear-homework-image").addEventListener("click", () => {
  homeworkSelectionId += 1;
  document.querySelector("#homework-image").value = "";
  document.querySelector("#homework-preview-container").hidden = true;
  document.querySelector("#homework-result").hidden = true;
  document.querySelector("#homework-chat").hidden = true;
  document.querySelector("#homework-messages").replaceChildren();
  document.querySelector("#homework-error").hidden = true;
  document.querySelector("#homework-submit").disabled = true;
  document.querySelector("#homework-submit").innerHTML = '写真の問題を読み取る <span aria-hidden="true">→</span>';
  homeworkImagePayload = null;
  homeworkConversation = [];
  homeworkTopic = "";
  homeworkHints = [];
  homeworkHintIndex = 0;
  document.querySelector("#homework-hints").replaceChildren();
  document.querySelector("#homework-hint-progress").textContent = "ヒント 0 / 0";
  document.querySelector("#homework-hint-button").disabled = true;
  document.querySelector("#homework-answer").value = "";
  document.querySelector("#homework-answer").disabled = false;
  document.querySelector("#homework-check-submit").disabled = false;
  document.querySelector("#homework-check-feedback").hidden = true;
  if (homeworkPreviewUrl) URL.revokeObjectURL(homeworkPreviewUrl);
  homeworkPreviewUrl = "";
  const homeworkDropzone = document.querySelector("#homework-dropzone");
  if (homeworkDropzone) homeworkDropzone.hidden = false;
  document.querySelector("#homework-image").focus();
});

const homeworkDropzone = document.querySelector("#homework-dropzone");
const homeworkInput = document.querySelector("#homework-image");
if (homeworkDropzone && homeworkInput) {
  ["dragenter", "dragover"].forEach((eventName) => {
    homeworkDropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      event.stopPropagation();
      homeworkDropzone.classList.add("is-dragover");
    });
  });

  ["dragleave", "dragend", "drop"].forEach((eventName) => {
    homeworkDropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      event.stopPropagation();
      homeworkDropzone.classList.remove("is-dragover");
    });
  });

  homeworkDropzone.addEventListener("drop", (event) => {
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      homeworkInput.files = files;
      homeworkInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });

  homeworkDropzone.addEventListener("click", (event) => {
    if (event.target !== homeworkInput) {
      homeworkInput.click();
    }
  });

  homeworkDropzone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      homeworkInput.click();
    }
  });
}
document.querySelector("#clear-records-button").addEventListener("click", () => {
  try {
    localStorage.removeItem(LEARNING_RECORDS_KEY);
    learningRecords = [];
    renderLearningRecords();
  } catch {
    document.querySelector("#record-summary").textContent =
      "学習記録を消せませんでした。ブラウザーの保存設定を確認してください。";
  }
});
document.querySelectorAll(".topic-suggestions [data-topic]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#topic-input").value = button.dataset.topic;
    document.querySelector("#topic-input").focus();
  });
});
document.querySelector("#answer-form").addEventListener("submit", submitAnswer);
document.querySelector("#hint-button").addEventListener("click", () => {
  document.querySelector("#lesson-hint").hidden = false;
  document.querySelector("#hint-button").hidden = true;
});
try {
  loadLearningRecords();
  renderLearningRecords();
} catch (error) {
  document.querySelector("#record-summary").textContent = error.message;
}
document.querySelector("#next-problem-button").addEventListener("click", loadNextProblem);
document.querySelector("#restart-button").addEventListener("click", () => {
  hasResults = false;
  startLabel.textContent = "学び方をチェックする";
  resetLesson();
  startSession();
  showAssessment();
});
document.querySelector("#clear-history-button").addEventListener("click", () => {
  if (!window.confirm("これまでのチェックの記録と表示の設定を消して、最初からやり直しますか？")) return;
  clearHistory();
  applyReaderVariables(document.documentElement, defaultReaderSettings);
  hasResults = false;
  startLabel.textContent = "学び方をチェックする";
  resetLesson();
  startSession();
  showAssessment();
});
document.querySelector("#print-button").addEventListener("click", () => window.print());
applyReaderVariables(document.documentElement, loadDisplay().settings);
renderAppTabs();
checkGeminiStatus();
