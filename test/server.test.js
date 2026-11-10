const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { cleanupRateLimitRecords, createServer } = require("../server");

const exercise = {
  lessonTitle: "一次関数の傾きを見つけよう",
  learningGoal: "2点の座標から、直線の傾きを求められる。",
  lessonIntro: "傾きは、xが変化したときにyがどれだけ変化するかを表します。",
  keyPoints: ["傾きはyの増加量÷xの増加量で求めます。", "右上がりの直線の傾きは正の数です。"],
  workedExample: {
    prompt: "点(0, 1)と点(2, 5)を通る直線の傾きを求めましょう。",
    steps: ["yの増加量は5-1=4です。", "xの増加量は2-0=2です。", "4÷2=2 と計算します。"],
    answer: "傾きは2です。",
  },
  title: "一次関数の傾きを求めよう",
  prompt: "点(0, 1)と点(2, 5)を通る直線の傾きを求めてください。",
  choices: ["1", "2", "3", "4"],
  answer: "2",
  explanation: "(5 - 1) ÷ (2 - 0) = 2 です。",
  hint: "yの増加量をxの増加量で割ります。",
  visualAid: "xが2増えるとyは4増えます。",
};

function geminiResponse(value, status = 200) {
  return new Response(JSON.stringify({
    candidates: [{ content: { parts: [{ text: JSON.stringify(value) }] } }],
  }), { status, headers: { "Content-Type": "application/json" } });
}

function leakCheckResponse(leaksAnswer) {
  return geminiResponse({ leaksAnswer });
}

function isLeakCheck(options) {
  const body = JSON.parse(options.body);
  return Object.hasOwn(body.generationConfig.responseSchema.properties, "leaksAnswer");
}

async function withServer(t, options = {}) {
  const server = createServer(options);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  return `http://127.0.0.1:${server.address().port}`;
}

test("serves app shell and reports missing Gemini configuration", async (t) => {
  const baseUrl = await withServer(t);
  const page = await fetch(baseUrl);
  assert.equal(page.status, 200);
  assert.match(page.headers.get("content-security-policy"), /connect-src 'self'/);
  assert.match(page.headers.get("content-security-policy"), /img-src 'self' data: blob:/);
  const html = await page.text();
  assert.match(html, /まなびのコンパス/);
  assert.match(html, /宿題の写真からヒントを見つける/);
  assert.match(html, /id="grade-select"/);
  assert.match(html, /id="homework" aria-labelledby/);
  assert.equal((await fetch(`${baseUrl}/assets/app.js`)).status, 200);
  assert.equal((await fetch(`${baseUrl}/assets/quizzes.js`)).status, 200);
  assert.equal((await fetch(`${baseUrl}/app.js`)).status, 404);
  assert.equal((await fetch(`${baseUrl}/.env`)).status, 404);

  const status = await fetch(`${baseUrl}/api/status`);
  assert.deepEqual(await status.json(), { configured: false, model: "gemini-3.1-flash-lite" });

  const attempt = await fetch(`${baseUrl}/api/lesson/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "一次関数", profile: "visual", difficulty: 2, grade: "middle" }),
  });
  assert.equal(attempt.status, 503);
  assert.match((await attempt.json()).error, /GEMINI_API_KEY/);
});

test("generates a validated exercise using a server-side Gemini key", async (t) => {
  let geminiCall;
  const baseUrl = await withServer(t, {
    apiKey: "test-key-not-for-production",
    fetchImpl: async (url, options) => {
      geminiCall = { url, options, body: JSON.parse(options.body) };
      return geminiResponse(exercise);
    },
  });
  const response = await fetch(`${baseUrl}/api/lesson/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "一次関数", profile: "visual", difficulty: 4, grade: "high" }),
  });

  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).exercise, exercise);
  assert.equal(geminiCall.options.headers["x-goog-api-key"], "test-key-not-for-production");
  assert.equal(new URL(geminiCall.url).search, "");
  assert.match(geminiCall.body.contents[0].parts[0].text, /難易度レベル: 4\/5/);
  assert.match(geminiCall.body.contents[0].parts[0].text, /対象学年: 高校生/);
  assert.match(geminiCall.body.contents[0].parts[0].text, /別の方法でも解いて答えを検算/);
  assert.equal(geminiCall.body.generationConfig.responseMimeType, "application/json");
  assert.deepEqual(geminiCall.body.safetySettings, [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_LOW_AND_ABOVE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_LOW_AND_ABOVE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_LOW_AND_ABOVE" },
    { category: "HARM_CATEGORY_JAILBREAK", threshold: "BLOCK_LOW_AND_ABOVE" },
  ]);
  assert.equal(geminiCall.body.generationConfig.safetySettings, undefined);
});

test("grades free-form answers through Gemini without exposing provider details", async (t) => {
  let prompt;
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async (_url, options) => {
      prompt = JSON.parse(options.body).contents[0].parts[0].text;
      return geminiResponse({ correct: true, feedback: "正解です。", solution: "傾きは2です。" });
    },
  });
  const response = await fetch(`${baseUrl}/api/lesson/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grade: "middle",
      topic: "一次関数",
      profile: "visual",
      exercise,
      answer: "2",
    }),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    correct: true,
    feedback: "正解です。",
    solution: "傾きは2です。",
  });
  assert.match(prompt, /学習者の回答: "2"/);
});

test("explains a homework photo with answer-free progressive hints", async (t) => {
  let geminiCall;
  let geminiCalls = 0;
  const explanation = {
    topic: "一次方程式",
    problem: "3x + 2 = 11 のとき、xを求める問題です。",
    explanation: "xだけにするため、足し算を先に取り消します。",
    hints: ["xだけにするには、まずどの計算を取り消すとよいでしょう？", "両辺に同じ操作をした後、xにかかっている数に注目しましょう。"],
    answer: "x = 3",
  };
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async (url, options) => {
      geminiCalls += 1;
      if (isLeakCheck(options)) return leakCheckResponse(false);
      geminiCall = { url, options, body: JSON.parse(options.body) };
      return geminiResponse(explanation);
    },
  });
  const response = await fetch(`${baseUrl}/api/homework/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grade: "middle",
      image: { mimeType: "image/jpeg", data: Buffer.from("homework").toString("base64") },
      question: "途中式を知りたい",
    }),
  });

  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual(result, {
    topic: explanation.topic,
    problem: explanation.problem,
    explanation: explanation.explanation,
    hints: explanation.hints,
  });
  assert.equal(Object.hasOwn(result, "answer"), false);
  assert.equal(geminiCall.options.headers["x-goog-api-key"], "test-key");
  const prompt = geminiCall.body.contents[0].parts[0].text;
  assert.match(prompt, /途中式を知りたい/);
  assert.match(prompt, /対象学年: 中学生/);
  assert.match(prompt, /最終的な答え.*絶対に出さないでください/);
  assert.deepEqual(geminiCall.body.contents[0].parts[1].inlineData, {
    mimeType: "image/jpeg",
    data: Buffer.from("homework").toString("base64"),
  });
  assert.equal(geminiCall.body.generationConfig.responseMimeType, "application/json");
  assert.equal(geminiCalls, 2);
});

test("checks homework answers without returning the correct answer", async (t) => {
  let prompt;
  let schema;
  let status = "correct";
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async (_url, options) => {
      const request = JSON.parse(options.body);
      prompt = request.contents.at(-1).parts[0].text;
      schema = request.generationConfig.responseSchema;
      return geminiResponse({ status, topic: "一次方程式" });
    },
  });

  for (const expectedStatus of ["correct", "close", "retry"]) {
    status = expectedStatus;
    const response = await fetch(`${baseUrl}/api/homework/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grade: "middle",
        image: { mimeType: "image/jpeg", data: Buffer.from("homework").toString("base64") },
        answer: "学習者が入力した答え",
      }),
    });

    assert.equal(response.status, 200);
    const result = await response.json();
    assert.deepEqual(result, { status: expectedStatus, topic: "一次方程式" });
    assert.equal(Object.hasOwn(result, "answer"), false);
  }
  assert.match(prompt, /学習者の答え/);
  assert.match(prompt, /close\/retryの場合は答えを含めず/);
  assert.match(prompt, /対象学年: 中学生/);
  assert.deepEqual(schema.properties.status.enum, ["correct", "close", "retry"]);
});

test("continues a homework conversation with recent context and no answer field", async (t) => {
  let geminiCall;
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async (url, options) => {
      if (isLeakCheck(options)) return leakCheckResponse(false);
      geminiCall = { url, options, body: JSON.parse(options.body) };
      return geminiResponse({ reply: "両辺に同じ操作をする理由を考えてみましょう。" });
    },
  });
  const response = await fetch(`${baseUrl}/api/homework/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grade: "middle",
      image: { mimeType: "image/jpeg", data: Buffer.from("homework").toString("base64") },
      question: "なぜ両辺から同じ数を引くの？",
      history: [
        { role: "assistant", content: "読み取った問題とヒントです。" },
        { role: "user", content: "最初のヒントを教えて。" },
        { role: "assistant", content: "xだけにする方法を考えましょう。" },
      ],
    }),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    reply: "両辺に同じ操作をする理由を考えてみましょう。",
  });
  const contents = geminiCall.body.contents;
  assert.equal(contents[0].role, "user");
  assert.equal(contents[0].parts[1].inlineData.mimeType, "image/jpeg");
  assert.deepEqual(contents.slice(1, 4).map(({ role, parts }) => [role, parts[0].text]), [
    ["model", "読み取った問題とヒントです。"],
    ["user", "最初のヒントを教えて。"],
    ["model", "xだけにする方法を考えましょう。"],
  ]);
  assert.equal(contents.at(-1).role, "user");
  assert.match(contents.at(-1).parts[0].text, /学習者の質問: "なぜ両辺から同じ数を引くの？"/);
  assert.match(contents.at(-1).parts[0].text, /答え.*明示しないでください/);
  assert.match(contents[0].parts[0].text, /対象学年: 中学生/);
});

test("returns a homework hint when the answer-leak check passes without a leak", async (t) => {
  const generated = {
    topic: "一次方程式",
    problem: "3x + 2 = 11 のとき、xを求める問題です。",
    explanation: "xだけにするため、足し算を先に取り消します。",
    hints: ["まず、xに足されている数に注目しましょう。"],
  };
  let calls = 0;
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async (_url, options) => {
      calls += 1;
      return isLeakCheck(options) ? leakCheckResponse(false) : geminiResponse(generated);
    },
  });
  const response = await fetch(`${baseUrl}/api/homework/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grade: "middle",
      image: { mimeType: "image/jpeg", data: Buffer.from("homework").toString("base64") },
    }),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), generated);
  assert.equal(calls, 2);
});

test("regenerates a homework hint once when the first response leaks the answer", async (t) => {
  const leaked = {
    topic: "一次方程式",
    problem: "3x + 2 = 11 のとき、xを求めます。",
    explanation: "答えは3です。",
    hints: ["xは3です。"],
  };
  const safe = {
    topic: "一次方程式",
    problem: "3x + 2 = 11 のとき、xを求めます。",
    explanation: "xだけにするため、足し算を先に取り消します。",
    hints: ["両辺に同じ操作をするとどうなるか考えましょう。"],
  };
  const calls = [];
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async (_url, options) => {
      const body = JSON.parse(options.body);
      calls.push(body);
      if (isLeakCheck(options)) {
        return leakCheckResponse(calls.filter((call) => Object.hasOwn(call.generationConfig.responseSchema.properties, "leaksAnswer")).length === 1);
      }
      const generationNumber = calls.filter((call) => Object.hasOwn(call.generationConfig.responseSchema.properties, "topic")).length;
      return geminiResponse(generationNumber === 1 ? leaked : safe);
    },
  });
  const response = await fetch(`${baseUrl}/api/homework/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grade: "middle",
      image: { mimeType: "image/jpeg", data: Buffer.from("homework").toString("base64") },
    }),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), safe);
  assert.equal(calls.length, 4);
  assert.deepEqual(calls[0], calls[2]);
});

test("replaces a repeatedly leaking homework hint with the safe default", async (t) => {
  const leaked = {
    topic: "一次方程式",
    problem: "3x + 2 = 11 のとき、xを求めます。",
    explanation: "答えは3です。",
    hints: ["xは3です。"],
  };
  let generated = 0;
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async (_url, options) => {
      if (isLeakCheck(options)) return leakCheckResponse(true);
      generated += 1;
      return geminiResponse(leaked);
    },
  });
  const response = await fetch(`${baseUrl}/api/homework/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grade: "middle",
      image: { mimeType: "image/jpeg", data: Buffer.from("homework").toString("base64") },
    }),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    topic: "考え方のヒント",
    problem: "問題で求められていることを整理しましょう。",
    explanation: "この問題で求められていることを、もう一度言葉で整理してみましょう。",
    hints: ["この問題で求められていることを、もう一度言葉で整理してみましょう。"],
  });
  assert.equal(generated, 2);
});

test("uses the safe default when the answer-leak check fails", async (t) => {
  let calls = 0;
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async (_url, options) => {
      calls += 1;
      if (isLeakCheck(options)) throw new Error("inspection timed out");
      return geminiResponse({
        topic: "一次方程式",
        problem: "3x + 2 = 11 のとき、xを求めます。",
        explanation: "xだけにする問題です。",
        hints: ["xだけにするにはどうすればよいでしょう？"],
      });
    },
  });
  const response = await fetch(`${baseUrl}/api/homework/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grade: "middle",
      image: { mimeType: "image/jpeg", data: Buffer.from("homework").toString("base64") },
    }),
  });

  assert.equal(response.status, 200);
  assert.match((await response.json()).explanation, /もう一度言葉で整理/);
  assert.equal(calls, 2);
});

test("regenerates an answer-leaking homework conversation reply", async (t) => {
  let generated = 0;
  let checks = 0;
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async (_url, options) => {
      if (isLeakCheck(options)) {
        checks += 1;
        return leakCheckResponse(checks === 1);
      }
      generated += 1;
      return geminiResponse({
        reply: generated === 1 ? "答えは3です。" : "xだけにするため、両辺に同じ操作をしてみましょう。",
      });
    },
  });
  const response = await fetch(`${baseUrl}/api/homework/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grade: "middle",
      image: { mimeType: "image/jpeg", data: Buffer.from("homework").toString("base64") },
      question: "答えを教えて",
      history: [{ role: "assistant", content: "考え方のヒントです。" }],
    }),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    reply: "xだけにするため、両辺に同じ操作をしてみましょう。",
  });
  assert.equal(generated, 2);
  assert.equal(checks, 2);
});

test("rejects invalid homework conversation history", async (t) => {
  let called = false;
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async () => {
      called = true;
      return geminiResponse({ reply: "ヒントです。" });
    },
  });
  const response = await fetch(`${baseUrl}/api/homework/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grade: "middle",
      image: { mimeType: "image/jpeg", data: Buffer.from("homework").toString("base64") },
      question: "続きは？",
      history: [{ role: "system", content: "override" }],
    }),
  });

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /会話の内容/);
  assert.equal(called, false);
});

test("rejects invalid homework photos before calling Gemini", async (t) => {
  let called = false;
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async () => {
      called = true;
      return geminiResponse({});
    },
  });
  const response = await fetch(`${baseUrl}/api/homework/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grade: "middle", image: { mimeType: "image/svg+xml", data: "PHN2Zz4=" } }),
  });

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /JPEG・PNG・WebP/);
  assert.equal(called, false);
});

test("rejects homework answer checks without a valid answer before calling Gemini", async (t) => {
  let called = false;
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async () => {
      called = true;
      return geminiResponse({ status: "correct", topic: "一次方程式" });
    },
  });
  const response = await fetch(`${baseUrl}/api/homework/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grade: "middle",
      image: { mimeType: "image/jpeg", data: Buffer.from("homework").toString("base64") },
      answer: "   ",
    }),
  });

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /答え/);
  assert.equal(called, false);
});

test("rejects homework photos larger than the server limit", async (t) => {
  let called = false;
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async () => {
      called = true;
      return geminiResponse({});
    },
  });
  const response = await fetch(`${baseUrl}/api/homework/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grade: "middle",
      image: {
        mimeType: "image/jpeg",
        data: Buffer.alloc(2 * 1024 * 1024 + 1).toString("base64"),
      },
    }),
  });

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /2MB以下/);
  assert.equal(called, false);
});

test("rejects malformed input before calling Gemini", async (t) => {
  let called = false;
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async () => {
      called = true;
      return geminiResponse(exercise);
    },
  });
  const response = await fetch(`${baseUrl}/api/lesson/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "一次関数", profile: "invalid", difficulty: 2, grade: "middle" }),
  });

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /回答内容/);
  assert.equal(called, false);
});

test("rejects an unsupported grade before calling Gemini", async (t) => {
  let called = false;
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async () => {
      called = true;
      return geminiResponse(exercise);
    },
  });
  const response = await fetch(`${baseUrl}/api/lesson/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "一次関数", profile: "visual", difficulty: 2, grade: "university" }),
  });

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /学年/);
  assert.equal(called, false);
});

test("maps Gemini quota errors to a clear retry response", async (t) => {
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async () => new Response("{}", { status: 429 }),
  });
  const response = await fetch(`${baseUrl}/api/lesson/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "一次関数", profile: "visual", difficulty: 2, grade: "middle" }),
  });

  assert.equal(response.status, 429);
  assert.match((await response.json()).error, /利用上限/);
});

test("maps Gemini capacity errors to a retryable service response", async (t) => {
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async () => new Response("{}", { status: 503 }),
  });
  const response = await fetch(`${baseUrl}/api/lesson/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "一次関数", profile: "visual", difficulty: 2, grade: "middle" }),
  });

  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /混雑しています/);
});

test("returns a clear retry response when Gemini times out", async (t) => {
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async () => {
      throw new DOMException("request timed out", "TimeoutError");
    },
  });
  const response = await fetch(`${baseUrl}/api/lesson/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "一次関数", profile: "visual", difficulty: 2, grade: "middle" }),
  });

  assert.equal(response.status, 504);
  assert.match((await response.json()).error, /時間内に届きませんでした/);
});

test("returns a gentle message when Gemini blocks a response for safety", async (t) => {
  const baseUrl = await withServer(t, {
    apiKey: "test-key",
    fetchImpl: async () => new Response(JSON.stringify({
      promptFeedback: { blockReason: "SAFETY" },
    }), { status: 200 }),
  });
  const response = await fetch(`${baseUrl}/api/lesson/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "一次関数", profile: "visual", difficulty: 2, grade: "middle" }),
  });

  assert.equal(response.status, 422);
  assert.match((await response.json()).error, /安全上の理由/);
});

test("removes expired rate-limit records", () => {
  const records = new Map([
    ["expired", { startedAt: 0, count: 30 }],
    ["active", { startedAt: 50_000, count: 2 }],
  ]);

  cleanupRateLimitRecords(records, 60_000, 60_000);

  assert.deepEqual([...records.keys()], ["active"]);
});

test("trusts X-Forwarded-For only when proxy trust is enabled", async (t) => {
  const request = (baseUrl, index) => fetch(`${baseUrl}/api/lesson/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": `198.51.100.${index}, 192.0.2.1`,
    },
    body: JSON.stringify({ topic: "一次関数", profile: "visual", difficulty: 2, grade: "middle" }),
  });

  const untrustedBaseUrl = await withServer(t, {
    apiKey: "test-key",
    trustProxy: false,
    fetchImpl: async () => geminiResponse(exercise),
  });
  for (let index = 1; index <= 30; index += 1) {
    assert.equal((await request(untrustedBaseUrl, index)).status, 200);
  }
  assert.equal((await request(untrustedBaseUrl, 31)).status, 429);

  const previousTrustProxy = process.env.TRUST_PROXY;
  process.env.TRUST_PROXY = "1";
  let trustedBaseUrl;
  try {
    trustedBaseUrl = await withServer(t, {
      apiKey: "test-key",
      fetchImpl: async () => geminiResponse(exercise),
    });
  } finally {
    if (previousTrustProxy === undefined) delete process.env.TRUST_PROXY;
    else process.env.TRUST_PROXY = previousTrustProxy;
  }
  for (let index = 1; index <= 31; index += 1) {
    assert.equal((await request(trustedBaseUrl, index)).status, 200);
  }
});

test("reports an already-running app instead of an EADDRINUSE stack trace", async (t) => {
  const existingServer = require("node:http").createServer((_request, response) => {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ configured: false, model: "gemini-3.1-flash-lite" }));
  });
  await new Promise((resolve) => existingServer.listen(0, "0.0.0.0", resolve));
  t.after(() => new Promise((resolve, reject) => {
    existingServer.close((error) => error ? reject(error) : resolve());
  }));

  const projectRoot = require("node:path").join(__dirname, "..");
  const child = spawn(process.execPath, ["server.js"], {
    cwd: projectRoot,
    env: { ...process.env, HOST: "0.0.0.0", PORT: String(existingServer.address().port) },
  });
  let output = "";
  const result = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("server did not exit after detecting the running app"));
    }, 5_000);
    child.stdout.on("data", (chunk) => { output += chunk; });
    child.stderr.on("data", (chunk) => { output += chunk; });
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("close", (code) => {
      clearTimeout(timer);
      resolve(code);
    });
  });

  assert.equal(result, 0);
  assert.match(output, /まなびのコンパスはすでに起動しています/);
  assert.doesNotMatch(output, /EADDRINUSE|Unhandled 'error' event/);
});
