import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getDatabase, onValue, ref, runTransaction } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const firebaseConfig = { apiKey: "AIzaSyAynCP6hcb1dn5XGewLXrT5prwFKLRIb1o", authDomain: "yuuuutsu-blog.firebaseapp.com", databaseURL: "https://yuuuutsu-blog-default-rtdb.firebaseio.com", projectId: "yuuuutsu-blog", storageBucket: "yuuuutsu-blog.firebasestorage.app", messagingSenderId: "511996034685", appId: "1:511996034685:web:131559dd234451fb4d3b14" };
const EMOJIS = { heart: "❤️", sparkle: "✨", laugh: "😂", cry: "😭", like: "👍" };
const root = document.querySelector(".post-reactions");

if (root) {
  const database = getDatabase(initializeApp(firebaseConfig));
  const postId = toSafeKey(root.dataset.reactionPost);
  const reactionsRef = ref(database, `reactions/${postId}`);
  const area = root.querySelector(".post-reaction-area");
  const addBtn = root.querySelector(".post-reaction-add");
  const picker = root.querySelector(".post-reaction-picker");
  let lastAdded = null;

  // 「＋」展开/收起表情库
  addBtn.addEventListener("click", () => {
    picker.hidden = !picker.hidden;
    addBtn.setAttribute("aria-expanded", picker.hidden ? "false" : "true");
  });

  // 点表情库里的某个表情 = 该表情数量 +1（可反复点，一直累计）
  picker.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", async () => {
      const reaction = button.dataset.reaction;
      lastAdded = reaction;
      picker.hidden = true;
      addBtn.setAttribute("aria-expanded", "false");
      try {
        await runTransaction(ref(database, `reactions/${postId}/${reaction}`), (count) => (Number(count) || 0) + 1);
      } catch {
        lastAdded = null;
      }
    });
  });

  // 实时渲染：每个表情按数量重复显示本体，不显示数字
  onValue(reactionsRef, (snapshot) => {
    const counts = snapshot.val() || {};
    area.querySelectorAll(".post-reaction-emoji").forEach((el) => el.remove());
    let popTarget = null;
    for (const [name, emoji] of Object.entries(EMOJIS)) {
      const n = Number(counts[name]) || 0;
      for (let i = 0; i < n; i++) {
        const span = document.createElement("span");
        span.className = "post-reaction-emoji";
        span.textContent = emoji;
        area.insertBefore(span, addBtn);
        if (name === lastAdded) popTarget = span;
      }
    }
    if (popTarget) popTarget.classList.add("is-new");
    lastAdded = null;
  });
}

function toSafeKey(value) {
  return btoa(unescape(encodeURIComponent(value))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
