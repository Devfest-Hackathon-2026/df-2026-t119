
const hintLabels = {
  visual: "図解ヒント",
  verbal: "文章ヒント",
  hands: "動かして試すヒント",
};

const directionArrows = { up: "↑", right: "→", down: "↓", left: "←" };

const balanceSvg = (() => {
  const scale = (x, left, right) => `
    <path d="M${x} 104 V40" stroke="#8a6b47" stroke-width="4"/>
    <path d="M${x - 16} 108 H${x + 16}" stroke="#8a6b47" stroke-width="5" stroke-linecap="round"/>
    <path d="M${x - 58} 40 H${x + 58}" stroke="#8a6b47" stroke-width="4" stroke-linecap="round"/>
    <path d="M${x - 58} 40 l-16 30 h32 z M${x + 58} 40 l-16 30 h32 z" fill="#f2f6ed" stroke="#9caf91"/>
    <text x="${x - 58}" y="64" text-anchor="middle" font-size="15" fill="#3e433b">${left}</text>
    <text x="${x + 58}" y="64" text-anchor="middle" font-size="15" fill="#3e433b">${right}</text>`;
  return `<svg viewBox="0 0 320 140" role="img" aria-label="てんびんの図：●2個と▲1個、▲2個と■1個がつり合う">
    ${scale(80, "●●", "▲")}${scale(240, "▲▲", "■")}
    <text x="160" y="134" text-anchor="middle" font-size="11" fill="#285437" font-weight="700">▲＝●2個分　■＝▲2個分</text>
  </svg>`;
})();

const foldSvg = `<svg viewBox="0 0 320 150" role="img" aria-label="紙を2回折ると4枚重なり、穴が4つになる例">
  <rect x="14" y="24" width="64" height="64" fill="#fff" stroke="#9caf91" stroke-width="2"/>
  <text x="46" y="108" text-anchor="middle" font-size="10" fill="#5b6057">1枚</text>
  <text x="92" y="60" font-size="16" fill="#8d9187">→</text>
  <rect x="112" y="24" width="32" height="64" fill="#f2f6ed" stroke="#9caf91" stroke-width="2"/>
  <text x="128" y="108" text-anchor="middle" font-size="10" fill="#5b6057">1回：2枚</text>
  <text x="156" y="60" font-size="16" fill="#8d9187">→</text>
  <rect x="176" y="40" width="32" height="32" fill="#e3ecd8" stroke="#9caf91" stroke-width="2"/>
  <circle cx="192" cy="56" r="5" fill="#5b6057"/>
  <text x="192" y="108" text-anchor="middle" font-size="10" fill="#5b6057">2回：4枚に穴</text>
  <text x="220" y="60" font-size="16" fill="#8d9187">→</text>
  <rect x="240" y="24" width="64" height="64" fill="#fff" stroke="#9caf91" stroke-width="2"/>
  <path d="M272 24 V88 M240 56 H304" stroke="#d9dfd4" stroke-dasharray="3 3"/>
  <circle cx="256" cy="40" r="5" fill="#5b6057"/><circle cx="288" cy="40" r="5" fill="#5b6057"/>
  <circle cx="256" cy="72" r="5" fill="#5b6057"/><circle cx="288" cy="72" r="5" fill="#5b6057"/>
  <text x="272" y="108" text-anchor="middle" font-size="10" fill="#5b6057">広げると4つ</text>
  <text x="160" y="140" text-anchor="middle" font-size="11" fill="#285437" font-weight="700">例：2回折る → 重なり4枚 → 穴4つ</text>
</svg>`;

const arrowSvg = `<svg viewBox="0 0 320 150" role="img" aria-label="矢印を回したり反転したりする例">
  <text x="20" y="34" font-size="11" fill="#5b6057">例1：時計回りに90°</text>
  <text x="40" y="70" font-size="30" fill="#3e433b">→</text>
  <path d="M86 58 q16 -18 32 0" stroke="#dc8266" stroke-width="2" fill="none"/>
  <text x="102" y="44" text-anchor="middle" font-size="10" fill="#a1533c">↻90°</text>
  <text x="132" y="70" font-size="30" fill="#3e433b">↓</text>
  <text x="180" y="34" font-size="11" fill="#5b6057">例2：上下反転</text>
  <text x="196" y="70" font-size="30" fill="#3e433b">↓</text>
  <path d="M232 46 V72 M226 52 l6 -6 6 6 M226 66 l6 6 6 -6" stroke="#698ca4" stroke-width="2" fill="none"/>
  <text x="250" y="70" font-size="30" fill="#3e433b">↑</text>
  <text x="160" y="112" text-anchor="middle" font-size="11" fill="#285437">時計回り90°：↑ → ↓ ← の順に変わる</text>
  <text x="160" y="134" text-anchor="middle" font-size="11" fill="#285437">左右反転：→と←が入れかわる（↑↓はそのまま）</text>
</svg>`;

const cipherSvg = (() => {
  const letters = "ABCDEFGHIJKL".split("");
  const top = letters.map((letter, index) => `<text x="${20 + index * 25}" y="34" text-anchor="middle" font-size="13" fill="#3e433b">${letter}</text>`).join("");
  const bottom = letters.map((letter, index) => {
    const shifted = String.fromCharCode(letter.charCodeAt(0) + 2);
    return `<text x="${20 + index * 25}" y="94" text-anchor="middle" font-size="13" fill="#a1533c" font-weight="700">${shifted}</text>
      <path d="M${20 + index * 25} 42 V74" stroke="#d9dfd4" stroke-width="1.5"/>`;
  }).join("");
  return `<svg viewBox="0 0 320 130" role="img" aria-label="アルファベットを2つ後ろにずらす対応表">
    <text x="0" y="14" font-size="10" fill="#8d9187">もとの文字</text>${top}${bottom}
    <text x="0" y="114" font-size="10" fill="#8d9187">暗号の文字（2つ後ろ）　※戻すときは下から上へ</text>
  </svg>`;
})();

const sequenceSvg = (() => {
  const values = ["2", "5", "11", "23", "□"];
  const diffs = ["+3", "+6", "+12", "＋？"];
  const nums = values.map((value, index) => `<text x="${30 + index * 66}" y="90" text-anchor="middle" font-size="18" fill="#3e433b" font-weight="700">${value}</text>`).join("");
  const arcs = diffs.map((diff, index) => {
    const x = 30 + index * 66;
    return `<path d="M${x + 6} 70 Q${x + 33} 34 ${x + 60} 70" stroke="#dc8266" stroke-width="2" fill="none"/>
      <text x="${x + 33}" y="40" text-anchor="middle" font-size="12" fill="#a1533c">${diff}</text>`;
  }).join("");
  return `<svg viewBox="0 0 320 120" role="img" aria-label="となりどうしの差の図">${arcs}${nums}
    <text x="160" y="114" text-anchor="middle" font-size="11" fill="#285437">差の並び（3, 6, 12…）にもきまりがある？</text>
  </svg>`;
})();

const liarSvg = `<svg viewBox="0 0 320 150" role="img" aria-label="Aを正直者と仮定すると矛盾する流れの図">
  <text x="10" y="20" font-size="11" fill="#5b6057">例：Aが正直者だと仮定すると…</text>
  <rect x="10" y="34" width="86" height="34" rx="7" fill="#e7f0b5"/><text x="53" y="56" text-anchor="middle" font-size="11" fill="#285437">A 正直</text>
  <text x="102" y="56" font-size="14" fill="#8d9187">→</text>
  <rect x="120" y="34" width="86" height="34" rx="7" fill="#f9e3d2"/><text x="163" y="56" text-anchor="middle" font-size="11" fill="#a1533c">B うそつき</text>
  <text x="212" y="56" font-size="14" fill="#8d9187">→</text>
  <rect x="230" y="34" width="80" height="34" rx="7" fill="#e7f0b5"/><text x="270" y="56" text-anchor="middle" font-size="11" fill="#285437">C 正直</text>
  <text x="160" y="94" text-anchor="middle" font-size="11" fill="#5b6057">でもCは「AもBもうそつき」と言っている → Aがうそつき？</text>
  <text x="160" y="122" text-anchor="middle" font-size="14" fill="#a1533c" font-weight="700">✗ 矛盾！ この仮定はまちがい</text>
  <text x="160" y="144" text-anchor="middle" font-size="10" fill="#8d9187">ほかの人を正直者と仮定してためそう</text>
</svg>`;

const treasureGrid = {
  cols: 5,
  rows: 5,
  start: [0, 4],
  items: { "3,3": "宝箱", "3,1": "カギ", "2,3": "本", "1,1": "リンゴ", "4,0": "花" },
};

const treasureSvg = (() => {
  const size = 40;
  const ox = 60;
  const oy = 10;
  const cells = [];
  for (let row = 0; row < treasureGrid.rows; row += 1) {
    for (let col = 0; col < treasureGrid.cols; col += 1) {
      const label = treasureGrid.items[`${col},${row}`] ?? "";
      const isStart = col === treasureGrid.start[0] && row === treasureGrid.start[1];
      cells.push(`<rect x="${ox + col * size}" y="${oy + row * size}" width="${size}" height="${size}" fill="${isStart ? "#dbe9f3" : "#fff"}" stroke="#d9dfd4"/>`);
      if (label || isStart) {
        cells.push(`<text x="${ox + col * size + size / 2}" y="${oy + row * size + 25}" text-anchor="middle" font-size="10" fill="#3e433b">${isStart ? "スタート" : label}</text>`);
      }
    }
  }
  return `<svg viewBox="0 0 320 240" role="img" aria-label="宝の地図のマス目">
    ${cells.join("")}
    <text x="290" y="30" text-anchor="middle" font-size="11" fill="#285437" font-weight="700">北↑</text>
    <text x="290" y="48" text-anchor="middle" font-size="10" fill="#5b6057">東→</text>
    <text x="290" y="64" text-anchor="middle" font-size="10" fill="#5b6057">南↓</text>
    <text x="290" y="80" text-anchor="middle" font-size="10" fill="#5b6057">西←</text>
    <text x="160" y="232" text-anchor="middle" font-size="10" fill="#8d9187">1マス＝1歩。上が北、右が東。</text>
  </svg>`;
})();

const coinSvg = (() => {
  const coin = (x, y, fill = "#f3c969") => `<circle cx="${x}" cy="${y}" r="7" fill="${fill}" stroke="#c49a3c"/>`;
  const group = (x, y) => [0, 1, 2].map((index) => coin(x + index * 17, y)).join("");
  return `<svg viewBox="0 0 320 150" role="img" aria-label="9枚のコインを3グループに分けて1回はかる図">
    <text x="10" y="18" font-size="11" fill="#5b6057">1回目：9枚を3枚ずつ3グループに分ける</text>
    <path d="M60 70 H200 M130 70 V100" stroke="#8a6b47" stroke-width="4" stroke-linecap="round"/>
    <path d="M115 104 H145" stroke="#8a6b47" stroke-width="5" stroke-linecap="round"/>
    ${group(48, 58)}${group(166, 58)}
    <text x="62" y="88" font-size="10" fill="#5b6057">左</text><text x="190" y="88" font-size="10" fill="#5b6057">右</text>
    ${group(240, 58)}<text x="257" y="88" text-anchor="middle" font-size="10" fill="#5b6057">のせない</text>
    <text x="160" y="124" text-anchor="middle" font-size="11" fill="#285437">つり合えば → のせないグループに。かたむけば → 軽い側に。</text>
    <text x="160" y="144" text-anchor="middle" font-size="11" fill="#a1533c" font-weight="700">1回で、候補が9枚 → 3枚にしぼれた。次は？</text>
  </svg>`;
})();

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

const weekSvg = (() => {
  const labels = weekdays.map((day, index) => {
    const angle = (index / 7) * Math.PI * 2 - Math.PI / 2;
    const x = 110 + Math.cos(angle) * 60;
    const y = 80 + Math.sin(angle) * 60;
    const isToday = day === "水";
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15" fill="${isToday ? "#f3c969" : "#f2f6ed"}" stroke="#9caf91"/>
      <text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" font-size="12" fill="#3e433b">${day}</text>`;
  }).join("");
  return `<svg viewBox="0 0 320 165" role="img" aria-label="曜日の輪の図">
    <circle cx="110" cy="80" r="60" fill="none" stroke="#e3e7dc" stroke-width="2" stroke-dasharray="4 4"/>
    ${labels}
    <text x="200" y="60" font-size="11" fill="#5b6057">7日進むと1周して</text>
    <text x="200" y="78" font-size="11" fill="#5b6057">同じ曜日にもどる</text>
    <text x="200" y="108" font-size="11" fill="#285437" font-weight="700">例：10日後＝7＋3</text>
    <text x="200" y="126" font-size="11" fill="#285437" font-weight="700">→ 水から3つ進んで土</text>
  </svg>`;
})();

const hanoiSvg = (() => {
  const frame = (x, title, pegs) => {
    const pegLines = [0, 1, 2].map((peg) => `<path d="M${x + 14 + peg * 28} 30 V76" stroke="#b9b2a4" stroke-width="3"/>`).join("");
    const disks = pegs.flatMap((stack, peg) => stack.map((disk, level) => {
      const width = disk === 2 ? 24 : 14;
      return `<rect x="${x + 14 + peg * 28 - width / 2}" y="${70 - level * 9}" width="${width}" height="8" rx="3" fill="${disk === 2 ? "#698ca4" : "#dc8266"}"/>`;
    })).join("");
    return `${pegLines}<path d="M${x} 78 H${x + 84}" stroke="#8a6b47" stroke-width="3"/>${disks}<text x="${x + 42}" y="96" text-anchor="middle" font-size="10" fill="#5b6057">${title}</text>`;
  };
  return `<svg viewBox="0 0 400 120" role="img" aria-label="円盤2枚を3回で移す例">
    ${frame(4, "はじめ", [[2, 1], [], []])}
    ${frame(102, "1手目", [[2], [1], []])}
    ${frame(200, "2手目", [[], [1], [2]])}
    ${frame(298, "3手目", [[], [], [2, 1]])}
    <text x="200" y="116" text-anchor="middle" font-size="11" fill="#285437" font-weight="700">例：円盤2枚なら3回で移せる</text>
  </svg>`;
})();

const assessmentProblems = [
  {
    id: "balance",
    subject: "ひらめき",
    title: "てんびんの重さくらべ",
    task: "てんびんで、●2個と▲1個がつり合いました。また、▲2個と■1個もつり合います。",
    hints: {
      visual: [{ kind: "svg", svg: balanceSvg }],
      verbal: [{ kind: "text", paragraphs: [
        "重さの単位を、いちばん軽い●にそろえて考えよう。",
        "▲は●2個分。■は▲2個分なので、■を▲に、▲を●に、順番に置きかえていけば●の数で表せる。",
      ] }],
      hands: [{ kind: "expand", label: "記号をクリックすると、同じ重さの小さい記号に置きかわるよ（例：■1個）",
        start: ["■"], rules: { "■": ["▲", "▲"], "▲": ["●", "●"] }, unit: "●" }],
    },
    check: {
      prompt: "■2個と▲1個を合わせた重さは、●何個分？",
      choices: ["●10個分", "●8個分", "●6個分"],
      explain: "■は●4個分、▲は●2個分。4×2＋2＝10個分です。",
    },
  },
  {
    id: "fold",
    subject: "空間",
    title: "折り紙パンチ",
    task: "正方形の紙を、半分に折ることを何回かくり返します。最後に、重なった紙の真ん中に穴を1つあけてから広げます。",
    hints: {
      visual: [{ kind: "svg", svg: foldSvg }],
      verbal: [{ kind: "text", paragraphs: [
        "半分に折るたびに、重なっている紙の枚数は2倍になる。",
        "穴は、重なっている紙すべてを1度につらぬくので、広げたときの穴の数＝重なっていた枚数。たとえば2回折ると4枚重なるので、穴は4つ。",
      ] }],
      hands: [{ kind: "slider", label: "折る回数（練習：2回まで）", min: 0, max: 2, step: 1, value: 0,
        format: (v) => `${v}回折る → 重なり ${2 ** v}枚 → 広げると穴 ${2 ** v}つ\n${"◎".repeat(2 ** v)}` }],
    },
    check: {
      prompt: "3回折ってから穴をあけると、広げたとき穴はいくつ？",
      choices: ["8つ", "6つ", "3つ"],
      explain: "3回折ると 2×2×2＝8枚重なるので、穴は8つです。",
    },
  },
  {
    id: "arrow",
    subject: "空間",
    title: "矢印くるくる",
    task: "矢印 ↑ を、回したりひっくり返したりします。",
    hints: {
      visual: [{ kind: "svg", svg: arrowSvg }],
      verbal: [{ kind: "text", paragraphs: [
        "時計回りに90°回すと、向きは「上 → 右 → 下 → 左 → 上」の順に1つ進む。",
        "左右反転すると、右向きと左向きが入れかわる。上向き・下向きはそのまま。",
      ] }],
      hands: [{ kind: "transform", label: "ボタンで矢印を動かしてみよう（練習は → から）", start: "right" }],
    },
    check: {
      prompt: "↑ を時計回りに90°回してから、左右反転すると、どちら向き？",
      choices: ["←", "→", "↓"],
      explain: "↑ を時計回りに90°回すと →。左右反転すると ← になります。",
    },
  },
  {
    id: "cipher",
    subject: "暗号",
    title: "ずらし暗号",
    task: "ある暗号は、アルファベットを決まった数だけ後ろにずらして作られています（A→C なら「2つずらし」）。",
    hints: {
      visual: [{ kind: "svg", svg: cipherSvg }],
      verbal: [{ kind: "text", paragraphs: [
        "暗号を作るときは、アルファベット順で後ろにずらす。もとに戻すときは、反対に前へ同じ数だけずらす。",
        "たとえば2つずらしの暗号「C」は、2つ前の「A」に戻る。",
      ] }],
      hands: [{ kind: "cipher", label: "文字を入れて、ずらす数を動かしてみよう（マイナスは前にずらす）", sample: "HELLO" }],
    },
    check: {
      prompt: "暗号「EQFG」は、2つずらしで作られました。もとの言葉は？",
      choices: ["CODE", "GSHI", "COME"],
      explain: "1文字ずつ2つ前に戻すと、E→C、Q→O、F→D、G→E で「CODE」です。",
    },
  },
  {
    id: "sequence",
    subject: "ひらめき",
    title: "数の並びのきまり",
    task: "数が、あるきまりで並んでいます。\n2, 5, 11, 23, □",
    hints: {
      visual: [{ kind: "svg", svg: sequenceSvg }],
      verbal: [{ kind: "text", paragraphs: [
        "となりどうしの数の「差」を調べてみよう。差の並びにも、きまりがかくれていることがある。",
        "または、前の数を何倍かして、少したしたりひいたりすると次の数になっていないか考えてみよう。",
      ] }],
      hands: [{ kind: "rules", label: "きまりのボタンをおすと、2から始めた並びを作るよ。問題と同じになるのはどれ？", start: 2, terms: 4,
        options: [
          { label: "＋3", apply: (n) => n + 3 },
          { label: "×2", apply: (n) => n * 2 },
          { label: "×2＋1", apply: (n) => n * 2 + 1 },
          { label: "×3−1", apply: (n) => n * 3 - 1 },
        ] }],
    },
    check: {
      prompt: "□に入る数は？",
      choices: ["47", "35", "46"],
      explain: "どの数も「前の数×2＋1」。23×2＋1＝47 です（差も 3, 6, 12, 24 と2倍ずつ）。",
    },
  },
  {
    id: "liars",
    subject: "論理",
    title: "正直者はだれ？",
    task: "正直者は本当のことだけ、うそつきはうそだけを言います。3人がこう言いました。\nA「Bはうそつきだ」\nB「Cはうそつきだ」\nC「AもBもうそつきだ」",
    hints: {
      visual: [{ kind: "svg", svg: liarSvg }],
      verbal: [{ kind: "text", paragraphs: [
        "だれか1人を「正直者」と決めて（仮定して）、ほかの人の発言が本当かうそかを順にたしかめよう。",
        "どこかでつじつまが合わなくなったら（矛盾）、その仮定はまちがい。別の人で試そう。",
      ] }],
      hands: [{ kind: "toggles", label: "名前をおして「正直」「うそつき」を切りかえ、つじつまが合うか試そう", people: ["A", "B", "C"],
        // honest[X] が true なら X は正直者。各人の発言が本当になるかどうかを返す
        statements: {
          A: { text: "Bはうそつき", isTrue: (honest) => !honest.B },
          B: { text: "Cはうそつき", isTrue: (honest) => !honest.C },
          C: { text: "AもBもうそつき", isTrue: (honest) => !honest.A && !honest.B },
        } }],
    },
    check: {
      prompt: "正直者はだれ？",
      choices: ["Bだけ", "Aだけ", "AとC"],
      explain: "Bが正直なら、Cはうそつき、Aもうそつき。Cの「AもBもうそつき」はうそになり、つじつまが合います。",
    },
  },
  {
    id: "treasure",
    subject: "方向",
    title: "宝の地図",
    task: "宝の地図にこう書いてあります。\n「スタートから北へ2マス、東へ3マス、南へ1マス進め」",
    hints: {
      visual: [{ kind: "svg", svg: treasureSvg }],
      verbal: [{ kind: "text", paragraphs: [
        "地図では、北が上、東が右、南が下、西が左。",
        "スタートから見た、ものの場所：宝箱は東へ3・北へ1、カギは東へ3・北へ3、本は東へ2・北へ1、リンゴは東へ1・北へ3、花は東へ4・北へ4。",
        "北へ進んでから南へもどった分は、さしひきして考えよう（北へ2進んで南へ1もどる → 北へ1）。",
      ] }],
      hands: [{ kind: "gridmove", label: "方角ボタンでコマを動かしてみよう", grid: treasureGrid }],
    },
    check: {
      prompt: "着いたマスにあるのは？",
      choices: ["宝箱", "カギ", "本"],
      explain: "北へ2、東へ3、南へ1進むと、宝箱のマスに着きます。",
    },
  },
  {
    id: "coins",
    subject: "ひらめき",
    title: "ニセモノコインさがし",
    task: "見た目が同じコインが9枚あり、1枚だけ少し軽いニセモノがまじっています。てんびん（左右にのせて重さをくらべる道具）を使って見つけます。",
    hints: {
      visual: [{ kind: "svg", svg: coinSvg }],
      verbal: [{ kind: "text", paragraphs: [
        "コインを3つのグループに分けて、2グループをてんびんにのせよう。",
        "つり合えば、ニセモノはのせなかったグループに。かたむけば、上がった（軽い）側にある。どちらでも、1回で候補が3分の1になる。",
      ] }],
      hands: [{ kind: "trycalc", label: "候補のコインの枚数（2〜27）を入れて、1回はかるとどうなるか試そう", min: 2, max: 27, placeholder: "例：27",
        compute: (n) => (n <= 3
          ? `${n}枚 → 1枚ずつ左右にのせれば、1回で見つかる`
          : `${n}枚 → ${Math.ceil(n / 3)}枚ずつに分けてはかる → 候補は ${Math.ceil(n / 3)}枚にしぼれる`) }],
    },
    check: {
      prompt: "必ずニセモノを見つけるには、てんびんを最少で何回使えばいい？",
      choices: ["2回", "3回", "4回"],
      explain: "1回目で9枚→3枚、2回目で3枚→1枚。2回で見つかります。",
    },
  },
  {
    id: "weekday",
    subject: "ひらめき",
    title: "100日後の曜日",
    task: "今日は水曜日です。",
    hints: {
      visual: [{ kind: "svg", svg: weekSvg }],
      verbal: [{ kind: "text", paragraphs: [
        "曜日は7日で1周する。7日後、14日後…のように7の倍数の日数がたつと、同じ曜日にもどる。",
        "だから、日数を7でわった「あまり」の分だけ、今日の曜日から進めればいい。たとえば10日後は、10÷7＝1あまり3 なので、水曜日から3つ進んで土曜日。",
      ] }],
      hands: [{ kind: "trycalc", label: "何日後？（1〜30）を入れて、曜日をたしかめよう", min: 1, max: 30, placeholder: "例：10",
        compute: (n) => `${n}日後 → ${weekdays[(3 + n) % 7]}曜日` }],
    },
    check: {
      prompt: "100日後は何曜日？",
      choices: ["金曜日", "木曜日", "土曜日"],
      explain: "100÷7＝14あまり2。水曜日から2つ進んで金曜日です。",
    },
  },
  {
    id: "hanoi",
    subject: "パズル",
    title: "円盤うつし",
    task: "3本の棒と、大きさのちがう円盤があります。円盤は1回に1枚だけ動かせて、小さい円盤の上に大きい円盤はのせられません。左の棒にある円盤を全部、右の棒へ移します。",
    hints: {
      visual: [{ kind: "svg", svg: hanoiSvg }],
      verbal: [{ kind: "text", paragraphs: [
        "円盤2枚なら、小さい円盤を真ん中へ → 大きい円盤を右へ → 小さい円盤を右へ、の3回で移せる。",
        "3枚のときは「上の2枚を真ん中へ移す」→「いちばん大きい円盤を右へ」→「2枚を右へ移す」と、2枚の動かし方を2回使うと考えよう。",
      ] }],
      hands: [{ kind: "hanoi", label: "棒をおして円盤を選び、移したい棒をおそう（3枚で練習できる）", disks: 3 }],
    },
    check: {
      prompt: "円盤が3枚のとき、最少で何回動かせばいい？",
      choices: ["7回", "6回", "9回"],
      explain: "上の2枚を移すのに3回、大きい円盤に1回、2枚をもう一度移すのに3回。3＋1＋3＝7回です。",
    },
  },
];

// ---- ステップ1：読みやすさチェック ----
// 実際に文章を読んでもらい、読む速さ（1秒あたりの文字数）と内容の理解で比べる。
// 参考：Zorzi ほか (2012, PNAS) 字間を広げると読みが速く正確になる子がいる／
//       Rello & Baeza-Yates (2013) 読みやすいフォントは人によってちがう／
//       Rello & Bigham (2017) 背景色で読みやすさが変わる人がいる。
// 1つの観点（フォント→間隔→背景色）ごとに3種類を読みくらべ、それまでに決まった設定は引きつぐ。

const readingDimensions = [
  {
    id: "font",
    name: "フォント",
    variants: [
      { id: "gothic", label: "ゴシック", style: { font: '"Noto Sans JP", sans-serif' } },
      { id: "ud", label: "UDゴシック", style: { font: '"BIZ UDPGothic", "Noto Sans JP", sans-serif' } },
      { id: "kyokasho", label: "教科書体ふう", style: { font: '"Klee One", "Noto Sans JP", serif' } },
    ],
  },
  {
    id: "spacing",
    name: "文字と行の間隔",
    variants: [
      { id: "normal", label: "標準", style: { letter: "0em", line: "1.8" } },
      { id: "wide", label: "広め", style: { letter: "0.08em", line: "2.15" } },
      { id: "wider", label: "とても広め", style: { letter: "0.2em", line: "2.5" } },
    ],
  },
  {
    id: "background",
    name: "背景の色",
    variants: [
      { id: "white", label: "白", style: { bg: "#ffffff" } },
      { id: "peach", label: "ピーチ", style: { bg: "#fde9da" } },
      { id: "blue", label: "うすい青", style: { bg: "#e4eef7" } },
    ],
  },
];

const defaultReaderSettings = { font: "gothic", spacing: "normal", background: "white" };

// 先頭は練習用（記録しない）。ほかの9つは毎回ランダムにわりあてる。
const readingPassages = [
  {
    id: "snail",
    text: "カタツムリは、雨の日によく見かけます。体がかわくのが苦手なので、しめった場所を好むからです。晴れた日は、葉のうらや石の下でじっとしています。カタツムリの目は、長いほうのしょっかくの先にあります。",
    question: { prompt: "カタツムリの目はどこにある？", choices: ["長いしょっかくの先", "短いしょっかくの先", "口のそば"] },
  },
  {
    id: "lighthouse",
    text: "灯台は、夜の海で船に場所を知らせる建物です。灯台ごとに光り方がちがい、何秒ごとに何回光るかで、どの灯台かがわかるようになっています。昼間は、白と赤のしまもようなど、目立つ色でぬられていることが多いです。",
    question: { prompt: "船は、どうやってどの灯台かを見分ける？", choices: ["光り方のちがい", "灯台の高さ", "灯台が鳴らす音"] },
  },
  {
    id: "penguin",
    text: "ペンギンは鳥のなかまですが、空を飛ぶことはできません。そのかわり、つばさをオールのように使って、海の中をすばやく泳ぎます。白いおなかは、海の下から見上げたときに、明るい空の色にまぎれて見つかりにくくなります。",
    question: { prompt: "ペンギンの白いおなかは、何に役立つ？", choices: ["下から見て空の色にまぎれる", "上から見て海の色にまぎれる", "氷の上で目立つ"] },
  },
  {
    id: "bread",
    text: "パンがふっくらふくらむのは、生地に入れた酵母のはたらきです。酵母は生地の中の糖を食べて、ガスを出します。このガスが生地の中に小さなあわをたくさん作り、焼くとそのあわが固まって、やわらかいパンになります。",
    question: { prompt: "パンをふくらませるガスを出すのは？", choices: ["酵母", "塩", "バター"] },
  },
  {
    id: "honeycomb",
    text: "ミツバチの巣は、六角形の部屋がすき間なくならんでできています。六角形は、少ない材料で広い部屋を作れて、しかもじょうぶな形です。ミツバチはこの部屋に、花のみつをためたり、たまごを産んだりします。",
    question: { prompt: "ミツバチの巣の部屋は、何の形？", choices: ["六角形", "四角形", "円"] },
  },
  {
    id: "rainbow",
    text: "雨上がりに太陽を背にして空を見ると、虹が見えることがあります。空気中に残った小さな水のつぶが、太陽の光を曲げて、色ごとに分けるからです。虹はいつも、太陽と反対側の空に出ます。",
    question: { prompt: "虹は、どちら側の空に出る？", choices: ["太陽と反対側", "太陽と同じ側", "真上"] },
  },
  {
    id: "bamboo",
    text: "竹は、とても速く育つ植物です。種類によっては、一日に1メートル近くのびることもあります。竹の中は空どうで、ところどころに節があります。この節があるおかげで、細くても折れにくい、じょうぶなつくりになっています。",
    question: { prompt: "竹が折れにくいのは、何があるから？", choices: ["節", "太い根", "かたい葉"] },
  },
  {
    id: "swallow",
    text: "ツバメは春になると、あたたかい南の国から日本へやってきます。日本で巣を作ってひなを育て、秋になるとまた南へもどっていきます。このように、季節によって住む場所を変える鳥を、渡り鳥といいます。",
    question: { prompt: "ツバメが日本へやってくるのはいつ？", choices: ["春", "夏の終わり", "冬"] },
  },
  {
    id: "eraser",
    text: "消しゴムで鉛筆の字が消えるのは、紙についた鉛筆の黒いこなを、消しゴムがからめとるからです。消しかすが出るのは、こなをくっつけた消しゴムの表面がけずれて、はがれ落ちるためです。",
    question: { prompt: "消しかすは、何からできている？", choices: ["けずれた消しゴムの表面", "紙のせんい", "鉛筆のしん"] },
  },
  {
    id: "moon",
    text: "月は自分で光っているのではなく、太陽の光をはね返してかがやいています。月と太陽と地球の位置が少しずつ変わるので、地球から見える月の明るい部分の形も変わります。満月から次の満月までは、およそ30日です。",
    question: { prompt: "月がかがやいて見えるのはなぜ？", choices: ["太陽の光をはね返すから", "自分で光るから", "地球の光を受けるから"] },
  },
];

// ---- ステップ2：覚えやすさチェック（視覚優位・言語優位・聴覚優位） ----
// 同じ内容（2段×3列にならんだ6つのもの）を、「絵で見る」「文章で読む」「音声で聞く」のどれか1つで伝え、
// 位置を覚えられたかで比べる。どの形でも伝える情報の量は同じにしてある。
const memoryObjects = [
  { emoji: "🍎", name: "りんご" }, { emoji: "🐱", name: "ねこ" }, { emoji: "🚗", name: "くるま" },
  { emoji: "⚽", name: "ボール" }, { emoji: "🌸", name: "さくら" }, { emoji: "🎸", name: "ギター" },
  { emoji: "🐟", name: "さかな" }, { emoji: "☂️", name: "かさ" }, { emoji: "📚", name: "ほん" },
  { emoji: "🍌", name: "バナナ" }, { emoji: "🐶", name: "いぬ" }, { emoji: "✏️", name: "えんぴつ" },
  { emoji: "🎈", name: "ふうせん" }, { emoji: "🍞", name: "パン" }, { emoji: "⏰", name: "とけい" },
];
const memoryPositions = ["上の段の左", "上の段のまん中", "上の段の右", "下の段の左", "下の段のまん中", "下の段の右"];
