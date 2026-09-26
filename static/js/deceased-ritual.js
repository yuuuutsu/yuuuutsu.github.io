/* deceased 页 · 上香仪式：点香盒取香 → 拖动 → 松手入炉 → 自动点燃 → 冒烟 */
(function () {
  var root = document.getElementById("ritual");
  if (!root || root.dataset.ritualWired) return;
  root.dataset.ritualWired = "1";

  var incense = root.querySelector(".ritual-incense");
  var box     = root.querySelector(".ritual-box");
  var spot    = root.querySelector(".ritual-plant-spot");
  var koro    = root.querySelector(".ritual-koro");
  var ember   = root.querySelector(".ritual-ember");
  var smoke   = root.querySelector(".ritual-smoke");

  /* ============ 可调参数（微调位置就改这里） ============ */
  /* PNG 实测比例（2026-09-27 用 Pillow 量 deceased-senkou.png：可见香身是正中一条竖线 x≈0.496） */
  var TIP_X = 0.496, TIP_Y = 0.059;     /* 香头：香身最顶端 */
  var END_X = 0.496, END_Y = 0.941;     /* 入炉的一端：香身最底端 */
  var MOUTH_X = 0.48, MOUTH_Y = 0.18;   /* 插香位置·电脑：香灰中心（占香炉图的比例） */
  var MOUTH_X_M = 0.5, MOUTH_Y_M = 0.18; /* 插香位置·手机：同是香灰中心 */
  var EMBER_DX = 0, EMBER_DY = 0;       /* 火光偏移（px）：香头已算准，无需补偿 */
  var EMBER_DX_M = 0, EMBER_DY_M = 0;   /* 火光偏移·手机 */
  var SMOKE_DX = 0, SMOKE_DY = 0;       /* 烟偏移（px）：跟着香头 */
  var SMOKE_DX_M = 0, SMOKE_DY_M = 0;   /* 烟偏移·手机 */
  /* ==================================================== */

  var mqMobile = window.matchMedia("(max-width: 640px)");

  var held = false, planted = false;
  var grabX = 0, grabY = 0, homeX = 0, homeY = 0;
  var w = 0, h = 0;

  function inSpot(px, py) {
    var r = spot.getBoundingClientRect();
    return px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
  }

  /* 坐标系修正：线香拖动后是 position:absolute，挂在 .ritual-offer 下，
     style.left/top 相对「束容器」解析；而所有计算都按 #ritual 做。
     赋值前必须减掉两个容器的原点差，否则整体错位（此前 PC/手机的怪参数都是在手动补这个错位） */
  function frameDelta() {
    var s = root.getBoundingClientRect();
    var p = incense.offsetParent;
    if (!p) return { dx: 0, dy: 0 };
    var f = p.getBoundingClientRect();
    return { dx: f.left - s.left, dy: f.top - s.top };
  }
  /* x/y 一律是相对 #ritual 的坐标 */
  function setPos(x, y) {
    var o = frameDelta();
    incense.style.left = (x - o.dx) + "px";
    incense.style.top = (y - o.dy) + "px";
  }

  /* fromBox=true：从香盒里取出新的一根（线香平时藏在盒里，点香盒才出现） */
  function startDrag(e, fromBox) {
    if (planted || held) return;
    e.preventDefault();
    if (fromBox) root.classList.add("ritual-spawned"); /* 让线香显形 */
    var r = incense.getBoundingClientRect();
    var s = root.getBoundingClientRect();
    w = r.width; h = r.height;
    homeX = r.left - s.left;
    homeY = r.top - s.top;
    if (fromBox) {
      /* 从香束取香：当成捏着香的底端中上部，香的底端正对手指（家里此时没有线香，不能按家的位置算抓点） */
      grabX = w * 0.5;
      grabY = h * 0.9;
    } else {
      grabX = e.clientX - r.left;
      grabY = e.clientY - r.top;
    }
    incense.style.width = w + "px";
    incense.style.position = "absolute";
    incense.style.margin = "0";
    if (fromBox) {
      /* 线香直接出现在点击位置（贴手），点香盒任何一处都有反馈 */
      var sx = Math.max(-w * 0.4, Math.min(e.clientX - s.left - grabX, s.width - w * 0.6));
      var sy = Math.max(-h * 1.05, Math.min(e.clientY - s.top - grabY, s.height - h * 0.5));
      setPos(sx, sy);
    } else {
      setPos(homeX, homeY);
    }
    root.classList.add("ritual-held");
    incense.classList.add("is-held");
    held = true;
    try { incense.setPointerCapture(e.pointerId); } catch (err) {}
  }

  incense.addEventListener("pointerdown", function (e) { startDrag(e, false); });
  if (box) box.addEventListener("pointerdown", function (e) { startDrag(e, true); });

  incense.addEventListener("pointermove", function (e) {
    if (!held) return;
    var s = root.getBoundingClientRect();
    var x = e.clientX - s.left - grabX;
    var y = e.clientY - s.top - grabY;
    /* 限制在仪式区内，拖不出页面、不会产生横向滚动 */
    x = Math.max(-w * 0.4, Math.min(x, s.width - w * 0.6));
    y = Math.max(-h * 1.05, Math.min(y, s.height - h * 0.5));
    setPos(x, y);
    /* 进入判定区：极轻的吸附反馈（只微微抬起，无文字无震动） */
    var tipX = s.left + x + TIP_X * w;
    var tipY = s.top + y + TIP_Y * h;
    incense.classList.toggle("is-near", inSpot(tipX, tipY) || inSpot(e.clientX, e.clientY));
  });

  function release(e) {
    if (!held) return;
    held = false;
    var s = root.getBoundingClientRect();
    var x = parseFloat(incense.style.left);
    var y = parseFloat(incense.style.top);
    incense.classList.remove("is-near");
    if (inSpot(s.left + x + TIP_X * w, s.top + y + TIP_Y * h) || inSpot(e.clientX, e.clientY)) {
      plant(x, y);
    } else {
      goHome();
    }
  }
  incense.addEventListener("pointerup", release);
  incense.addEventListener("pointercancel", function () {
    if (held) {
      held = false;
      incense.classList.remove("is-near");
      goHome();
    }
  });

  /* 松手在炉区：0.55s 平滑滑入预设插香位，然后自动点燃 */
  function plant(x, y) {
    planted = true;
    var s = root.getBoundingClientRect();
    var k = koro.getBoundingClientRect();
    var mb = mqMobile.matches;
    var mx = mb ? MOUTH_X_M : MOUTH_X, my = mb ? MOUTH_Y_M : MOUTH_Y;
    var mouthX = k.left - s.left + mx * k.width;
    var mouthY = k.top - s.top + my * k.height;
    var tx = mouthX - END_X * w;
    var ty = mouthY - END_Y * h;
    tx = Math.max(-w * 0.2, Math.min(tx, s.width - w * 0.8));
    incense.classList.add("is-planting");
    setPos(tx, ty);
    window.setTimeout(function () {
      incense.classList.remove("is-planting");
      root.classList.add("ritual-lit", "ritual-done");
    }, 620);

    /* 火光和烟每帧跟随香头的实际渲染位置（滑入动画期间和结束后都对得准） */
    (function anchor() {
      if (!planted) return;
      var mb = mqMobile.matches;
      var edx = mb ? EMBER_DX_M : EMBER_DX, edy = mb ? EMBER_DY_M : EMBER_DY;
      var sdx = mb ? SMOKE_DX_M : SMOKE_DX, sdy = mb ? SMOKE_DY_M : SMOKE_DY;
      var ir = incense.getBoundingClientRect();
      var vx = ir.left + TIP_X * ir.width;
      var vy = ir.top + TIP_Y * ir.height;
      var a = koro.parentElement.getBoundingClientRect();
      ember.style.left = (vx - a.left + edx) + "px";
      ember.style.top = (vy - a.top + edy) + "px";
      smoke.style.left = (vx - a.left + sdx) + "px";
      smoke.style.top = (vy - a.top + sdy) + "px";
      window.requestAnimationFrame(anchor);
    })();
  }

  /* 没插进炉里：放回原处后收回盒里（隐身），可以再点香盒重新取 */
  function goHome() {
    incense.classList.add("is-returning");
    setPos(homeX, homeY);
    window.setTimeout(function () {
      incense.classList.remove("is-returning", "is-held");
      incense.style.position = "";
      incense.style.left = "";
      incense.style.top = "";
      incense.style.width = "";
      incense.style.margin = "";
      root.classList.remove("ritual-held", "ritual-spawned"); /* 收回盒里 */
    }, 500);
  }
})();
