const questions = [
  {
    prompt: "新しいことを学ぶとき、いちばん「わかった！」と思いやすいのは？",
    answers: [
      { text: "図や色分け、全体のイメージを見たとき", type: "visual" },
      { text: "説明を読んだり、人の話を聞いたりしたとき", type: "verbal" },
      { text: "自分で手を動かして試したとき", type: "hands" },
    ],
  },
  {
    prompt: "道順を教えてもらうなら、どんな伝え方が助かる？",
    answers: [
      { text: "地図や目印の写真を見せてもらう", type: "visual" },
      { text: "曲がる場所を順番に言葉で説明してもらう", type: "verbal" },
      { text: "一緒に歩きながら案内してもらう", type: "hands" },
    ],
  },
  {
    prompt: "授業のノートをとるとき、よくすることは？",
    answers: [
      { text: "図・矢印・色を使って整理する", type: "visual" },
      { text: "大事な言葉や説明を文章でまとめる", type: "verbal" },
      { text: "例題を書いて、手順をまねして解く", type: "hands" },
    ],
  },
  {
    prompt: "難しい問題に出会ったら、まず何を試したい？",
    answers: [
      { text: "図に描いたり、位置関係を見える形にする", type: "visual" },
      { text: "問題文や解説を読み直し、自分の言葉で整理する", type: "verbal" },
      { text: "簡単な例で、実際に計算や操作をしてみる", type: "hands" },
    ],
  },
  {
    prompt: "復習するとき、自分に合いそうなのは？",
    answers: [
      { text: "図解や色分けしたまとめを見返す", type: "visual" },
      { text: "要点を声に出したり、誰かに説明したりする", type: "verbal" },
      { text: "練習問題を解いて、やり方を確かめる", type: "hands" },
    ],
  },
];

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

const typeNames = { visual: "図・色", verbal: "言葉", hands: "体験" };
const typeOrder = ["visual", "verbal", "hands"];
const selectedAnswers = [];
let currentQuestion = 0;
let currentProfile = "visual";

const startButton = document.querySelector("#start-button");
const assessmentSection = document.querySelector("#assessment");
const resultsSection = document.querySelector("#results");
const questionForm = document.querySelector("#question-form");
const questionText = document.querySelector("#question-text");
const answerList = document.querySelector("#answer-list");
const progressTrack = document.querySelector(".progress-track");
const startLabel = document.querySelector("#start-label");
const homeSections = document.querySelectorAll("#home, #how, #about, .header-link");
const summaryTab = document.querySelector("#summary-tab");
const practiceTab = document.querySelector("#practice-tab");
const resultTabs = [summaryTab, practiceTab];
let hasResults = false;

function showScreen(screen) {
  homeSections.forEach((section) => {
    section.hidden = screen !== "home";
  });
  assessmentSection.hidden = screen !== "assessment";
  resultsSection.hidden = screen !== "results";
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

function showAssessment() {
  showScreen("assessment");
  scrollToElement(assessmentSection);
  renderQuestion();
  answerList.querySelector("input")?.focus({ preventScroll: true });
}

function renderQuestion() {
  const question = questions[currentQuestion];
  const percent = Math.round(((currentQuestion + 1) / questions.length) * 100);
  questionText.textContent = question.prompt;
  answerList.replaceChildren();
  document.querySelector("#question-count").textContent = `質問 ${currentQuestion + 1} / ${questions.length}`;
  document.querySelector("#progress-percent").textContent = `${percent}%`;
  document.querySelector("#progress-fill").style.width = `${percent}%`;
  progressTrack.setAttribute("aria-valuenow", String(percent));
  document.querySelector("#back-button").disabled = currentQuestion === 0;
  document.querySelector("#next-button").innerHTML = currentQuestion === questions.length - 1
    ? "回答からヒントを見る <span aria-hidden=\"true\">→</span>"
    : "次の質問へ <span aria-hidden=\"true\">→</span>";
  document.querySelector("#form-error").hidden = true;

  question.answers.forEach((answer, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "answer-option";
    const input = document.createElement("input");
    const id = `answer-${currentQuestion}-${index}`;
    input.type = "radio";
    input.name = "answer";
    input.id = id;
    input.value = answer.type;
    input.checked = selectedAnswers[currentQuestion] === answer.type;
    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = answer.text;
    wrapper.append(input, label);
    answerList.append(wrapper);
  });
}

function getProfile() {
  const scores = { visual: 0, verbal: 0, hands: 0 };
  selectedAnswers.forEach((type) => { scores[type] += 1; });
  const highest = Math.max(...Object.values(scores));
  const winner = typeOrder.find((type) => scores[type] === highest) ?? "visual";
  return { scores, winner };
}

function showResults() {
  const { scores, winner } = getProfile();
  currentProfile = winner;
  const profile = profiles[winner];
  document.querySelector("#result-icon").textContent = profile.icon;
  document.querySelector("#result-title").textContent = profile.title;
  document.querySelector("#result-subtitle").textContent = profile.subtitle;
  document.querySelector("#result-description").textContent = profile.description;
  document.querySelector("#support-copy").textContent = profile.support;
  const leadingTypes = typeOrder.filter((type) => scores[type] === scores[winner]);
  document.querySelector("#practice-approach").textContent = leadingTypes.length > 1
    ? `同点のため、AI練習では「${typeNames[winner]}」の方法（${profile.practiceLabel}）を使います。`
    : `今回の練習のヒント：${profile.practiceLabel}`;
  renderTextList("#next-step-list", leadingTypes.map((type) => profiles[type].nextStep));

  const scoreList = document.querySelector("#score-list");
  scoreList.replaceChildren();
  typeOrder.forEach((type) => {
    const row = document.createElement("div");
    row.className = "score-row";
    const label = document.createElement("span");
    label.className = "score-label";
    label.textContent = typeNames[type];
    const bar = document.createElement("span");
    bar.className = "score-bar";
    bar.setAttribute("aria-label", `${typeNames[type]} ${scores[type]}問`);
    const fill = document.createElement("span");
    fill.style.width = `${(scores[type] / questions.length) * 100}%`;
    bar.append(fill);
    const value = document.createElement("span");
    value.className = "score-value";
    value.textContent = `${scores[type]}問`;
    row.append(label, bar, value);
    scoreList.append(row);
  });

  const reasons = selectedAnswers.flatMap((type, index) => type === winner
    ? [`Q${index + 1}：${questions[index].answers.find((answer) => answer.type === type).text}`]
    : []);
  const reasonList = document.querySelector("#reason-list");
  reasonList.replaceChildren();
  reasons.slice(0, 3).forEach((reason) => {
    const item = document.createElement("li");
    item.textContent = reason;
    reasonList.append(item);
  });
  if (reasons.length > 3) {
    const more = document.createElement("li");
    more.textContent = `ほか ${reasons.length - 3} 問でも同じ方法を選んでいました。`;
    reasonList.append(more);
  }
  if (leadingTypes.length > 1) {
    const note = document.createElement("li");
    note.textContent = "同じ数だけ選ばれた方法が複数あります。ここではそのうちのひとつを紹介しています。";
    reasonList.append(note);
  }

  hasResults = true;
  startLabel.textContent = "チェック結果を見る";
  selectResultTab(summaryTab);
  showScreen("results");
  scrollToElement(resultsSection);
  document.querySelector("#results-title").focus({ preventScroll: true });
  resetLesson();
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
    submitButton.disabled = false;
  } catch (error) {
    if (selectionId !== homeworkSelectionId) return;
    showHomeworkError(error);
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
  const form = document.querySelector("#material-form");
  let available = false;
  try {
    const response = await fetch("/api/status");
    if (!response.ok) throw new Error("status");
    const status = await response.json();
    available = status.configured === true;
  } catch (error) {
    console.error("学習機能の利用状況を確認できませんでした:", error);
  }
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

document.querySelectorAll("[data-home-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showScreen("home");
    if (!hasResults && selectedAnswers.length) startLabel.textContent = "チェックを続ける";
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
questionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const answer = questionForm.querySelector('input[name="answer"]:checked');
  if (!answer) {
    document.querySelector("#form-error").hidden = false;
    answerList.querySelector("input")?.focus({ preventScroll: true });
    return;
  }
  selectedAnswers[currentQuestion] = answer.value;
  document.querySelector("#form-error").hidden = true;
  if (currentQuestion < questions.length - 1) {
    currentQuestion += 1;
    renderQuestion();
    answerList.querySelector("input")?.focus({ preventScroll: true });
  } else {
    showResults();
  }
});
answerList.addEventListener("change", (event) => {
  selectedAnswers[currentQuestion] = event.target.value;
  document.querySelector("#form-error").hidden = true;
});
document.querySelector("#back-button").addEventListener("click", () => {
  if (currentQuestion > 0) {
    currentQuestion -= 1;
    renderQuestion();
    answerList.querySelector("input")?.focus({ preventScroll: true });
  }
});
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
  document.querySelector("#homework-image").focus();
});
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
  selectedAnswers.length = 0;
  currentQuestion = 0;
  hasResults = false;
  startLabel.textContent = "学び方をチェックする";
  resetLesson();
  showAssessment();
});
document.querySelector("#print-button").addEventListener("click", () => window.print());
checkGeminiStatus();
