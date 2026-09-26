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
  /* PNG 实际可见内容比例（Pillow 实测，非文件外框） */
  var TIP_X = 0.1403, TIP_Y = 0.0233;   /* 香头：左上 */
  var END_X = 0.9439, END_Y = 0.9633;   /* 入炉的一端：右下 */
  var MOUTH_X = 1.31, MOUTH_Y = 1.4;    /* 插香位置·电脑（占香炉图的比例，越大越靠右/越靠下） */
  var MOUTH_X_M = 0.61, MOUTH_Y_M = 2.04; /* 插香位置·手机（0.5,0.27 = 顶部香灰中心） */
  var EMBER_DX =33, EMBER_DY = 3;       /* 火光偏移·电脑（px，正值向右/向下） */
  var EMBER_DX_M = 28, EMBER_DY_M = 2;   /* 火光偏移·手机 */
  var SMOKE_DX = 33, SMOKE_DY = 3;       /* 烟偏移·电脑（px，正值向右/向下） */
  var SMOKE_DX_M = 28, SMOKE_DY_M = 2;   /* 烟偏移·手机 */
  /* ==================================================== */

  var mqMobile = window.matchMedia("(max-width: 640px)");

  var held = false, planted = false;
  var grabX = 0, grabY = 0, homeX = 0, homeY = 0;
  var w = 0, h = 0;

  function inSpot(px, py) {
    var r = spot.getBoundingClientRect();
    return px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
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
      grabX = Math.max(0, Math.min(w, e.clientX - r.left));
      grabY = Math.max(h * 0.4, Math.min(h * 0.95, e.clientY - r.top));
    } else {
      grabX = e.clientX - r.left;
      grabY = e.clientY - r.top;
    }
    incense.style.width = w + "px";
    incense.style.position = "absolute";
    incense.style.left = homeX + "px";
    incense.style.top = homeY + "px";
    incense.style.margin = "0";
    if (fromBox) {
      /* 线香直接出现在点击位置（贴手），点香盒任何一处都有反馈 */
      var sx = Math.max(-w * 0.4, Math.min(e.clientX - s.left - grabX, s.width - w * 0.6));
      var sy = Math.max(-h * 0.2, Math.min(e.clientY - s.top - grabY, s.height - h * 0.5));
      incense.style.left = sx + "px";
      incense.style.top = sy + "px";
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
    y = Math.max(-h * 0.2, Math.min(y, s.height - h * 0.5));
    incense.style.left = x + "px";
    incense.style.top = y + "px";
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
    incense.style.left = tx + "px";
    incense.style.top = ty + "px";
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
    incense.style.left = homeX + "px";
    incense.style.top = homeY + "px";
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
