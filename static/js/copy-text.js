/* 点击复制短代码 {{< copy >}} 的交互逻辑
   页面上任何 .copy-text 元素点一下就把内容复制到剪贴板，并弹出「已复制」气泡。
   复制优先用 navigator.clipboard，失败（旧浏览器 / 非安全上下文）时降级到 execCommand。 */
(function () {
  var FEEDBACK_MS = 1400;

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.left = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      ta.setSelectionRange(0, ta.value.length);
      document.execCommand("copy");
    } catch (e) {
      /* 复制失败就什么都不做，页面不报错 */
    }
    document.body.removeChild(ta);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function flash(el) {
    el.classList.add("copied");
    clearTimeout(el._copyTimer);
    el._copyTimer = setTimeout(function () {
      el.classList.remove("copied");
    }, FEEDBACK_MS);
  }

  function fire(el) {
    var raw = el.querySelector(".copy-raw");
    var text = raw ? raw.textContent : el.textContent;
    copyText(text);
    flash(el);
  }

  function wire() {
    var list = document.querySelectorAll(".copy-text");
    Array.prototype.forEach.call(list, function (el) {
      if (el.dataset.copyWired) return;
      el.dataset.copyWired = "1";
      el.addEventListener("click", function () {
        fire(el);
      });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          fire(el);
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
  /* 兜底：万一有内容在页面加载完之后才插进 DOM，load 时再扫一遍。
     重复接线有 dataset.copyWired 挡着，不会重复绑定。 */
  window.addEventListener("load", wire);
})();
