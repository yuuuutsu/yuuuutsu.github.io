import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getDatabase, onValue, push, ref } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const firebaseConfig = { apiKey: "AIzaSyAynCP6hcb1dn5XGewLXrT5prwFKLRIb1o", authDomain: "yuuuutsu-blog.firebaseapp.com", databaseURL: "https://yuuuutsu-blog-default-rtdb.firebaseio.com", projectId: "yuuuutsu-blog", storageBucket: "yuuuutsu-blog.firebasestorage.app", messagingSenderId: "511996034685", appId: "1:511996034685:web:131559dd234451fb4d3b14" };

/* 想换表情就只改这一行（表情要用 Twemoji 扁平图，svg 放在 /images/emoji/ 里） */
const EMOJIS = ["🥳", "😭", "👴", "🙏", "🩵", "🩷", "🍑", "🍮", "🧸", "⚰️", "🌙", "🎶", "⁉️"];

/* 布局常量（和 custom.css 保持一致） */
const EMOJI_W = 22, GAP = 5, MAX_ROWS = 3, ROW_H = EMOJI_W + GAP;

const root = document.querySelector(".post-reactions");

/* 表情字符 → Twemoji 文件名（codepoint 十六进制，去掉 fe0f 变体符） */
function twemojiSrc(char) {
  const hex = [...char].map((c) => c.codePointAt(0).toString(16)).filter((cp) => cp !== "fe0f").join("-");
  return `/images/emoji/${hex}.svg`;
}

/* 任意字符串 → Firebase 合法 key（base64 url-safe） */
function toSafeKey(value) {
  return btoa(unescape(encodeURIComponent(value))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function makeEmojiImg(char, isNew) {
  const img = document.createElement("img");
  img.className = "post-reaction-emoji" + (isNew ? " is-new" : "");
  img.src = twemojiSrc(char);
  img.alt = "";
  img.draggable = false;
  return img;
}

if (root) {
  const database = getDatabase(initializeApp(firebaseConfig));
  const postId = toSafeKey(root.dataset.reactionPost);
  const reactionsRef = ref(database, `reactions/${postId}`);
  const logRef = ref(database, `reactions/${postId}/log`);
  const area = root.querySelector(".post-reaction-area");
  const addBtn = root.querySelector(".post-reaction-add");
  const moreBtn = root.querySelector(".post-reaction-more");
  const picker = root.querySelector(".post-reaction-picker");
  let lastAdded = null;

  /* 是否需要折叠：按固定尺寸算出排数，超过 3 排就折叠（图片尺寸固定，数学计算比量 DOM 可靠） */
  function updateFold(count) {
    const perRow = Math.max(1, Math.floor((area.clientWidth + GAP) / (EMOJI_W + GAP)));
    const rows = Math.ceil(count / perRow);
    const canFold = rows > MAX_ROWS;
    root.classList.toggle("can-fold", canFold);
    if (!canFold) {
      root.classList.remove("folded", "expanded");
    } else if (!root.classList.contains("expanded")) {
      root.classList.add("folded");
    }
    if (root.classList.contains("folded")) area.scrollTop = area.scrollHeight;
  }
  moreBtn.addEventListener("click", () => {
    const expanded = root.classList.toggle("expanded");
    root.classList.toggle("folded", !expanded);
    if (!expanded) area.scrollTop = area.scrollHeight;
  });
  window.addEventListener("resize", () => updateFold(area.querySelectorAll(".post-reaction-emoji").length));

  /* 由 EMOJIS 自动生成表情库按钮 */
  for (const char of EMOJIS) {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.reaction = char;
    b.setAttribute("aria-label", char);
    const img = document.createElement("img");
    img.src = twemojiSrc(char);
    img.alt = char;
    img.draggable = false;
    b.appendChild(img);
    picker.appendChild(b);
  }

  /* 「＋」展开/收起表情库 */
  addBtn.addEventListener("click", () => {
    picker.hidden = !picker.hidden;
    addBtn.setAttribute("aria-expanded", picker.hidden ? "false" : "true");
  });

  /* 点某个表情 = 往点击日志里追加一条（按点击先后穿插显示） */
  picker.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", async () => {
      const char = button.dataset.reaction;
      lastAdded = char;
      picker.hidden = true;
      addBtn.setAttribute("aria-expanded", "false");
      try {
        await push(logRef, toSafeKey(char));
      } catch {
        lastAdded = null;
      }
    });
  });

  /* 实时渲染：旧数据（次数格式）排最前，之后严格按点击日志的先后一个个排 */
  const byKey = Object.fromEntries(EMOJIS.map((c) => [toSafeKey(c), c]));
  onValue(reactionsRef, (snapshot) => {
    const data = snapshot.val() || {};
    const seq = [];

    /* 兼容旧格式：reactions/<id>/<表情key> = {n,t}（或纯数字），无法还原历史顺序，只能按最后点击时间成组排在最前 */
    const legacy = Object.entries(data)
      .filter(([k, v]) => k !== "log" && byKey[k] && v != null)
      .map(([k, v]) => ({ char: byKey[k], n: (typeof v === "number" ? v : (Number(v.n) || 0)), t: ((typeof v === "object" && Number(v.t)) || 0) }))
      .filter((e) => e.n > 0)
      .sort((a, b) => a.t - b.t);
    for (const e of legacy) for (let i = 0; i < e.n; i++) seq.push(e.char);

    /* 新格式：log/<pushId> = 表情key，pushId 天然按时间排序 → 每次点击单独占一位 */
    const log = data.log || {};
    for (const pk of Object.keys(log).sort()) {
      const char = byKey[log[pk]];
      if (char) seq.push(char);
    }

    area.querySelectorAll(".post-reaction-emoji").forEach((el) => el.remove());
    let popTarget = null;
    for (const char of seq) {
      const img = makeEmojiImg(char, char === lastAdded);
      if (char === lastAdded) popTarget = img;
      area.appendChild(img);
    }
    lastAdded = null;
    updateFold(seq.length);
  });
}
