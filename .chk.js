/* deceased 页 · 上香仪式：取香 → 拖动 → 松手入炉 → 自动点燃 → 冒烟 */
(function () {
  var root = document.getElementById("ritual");
  if (!root || root.dataset.ritualWired) return;
  root.dataset.ritualWired = "1";

  var incense = root.querySelector(".ritual-incense");
  var spot    = root.querySelector(".ritual-plant-spot");
  var koro    = root.querySelector(".ritual-koro");
  var ember   = root.querySelector(".ritual-ember");
  var smoke   = root.querySelector(".ritual-smoke");

  /* PNG 实际可见内容比例（Pillow 实测，非文件外框） */
  var TIP_X = 0.1403, TIP_Y = 0.0233;   /* 香头：左上 */
  var END_X = 0.9439, END_Y = 0.9633;   /* 入炉的一端：右下 */
  var MOUTH_X = 0.4792, MOUTH_Y = 0.16; /* 香炉口灰面中心 */

  var held = false, planted = false;
  var grabX = 0, grabY = 0, homeX = 0, homeY = 0;
  var w = 0, h = 0;

  function inSpot(px, py) {
    var r = spot.getBoundingClientRect();
    return px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
  }

  incense.addEventListener("pointerdown", function (e) {
    if (planted || held) return;
    e.preventDefault();
    var r = incense.getBoundingClientRect();
    var s = root.getBoundingClientRect();
    w = r.width; h = r.height;
    homeX = r.left - s.left;
    homeY = r.top - s.top;
    grabX = e.clientX - r.left;
    grabY = e.clientY - r.top;
    incense.style.width = w + "px";
    incense.style.position = "absolute";
    incense.style.left = homeX + "px";
    incense.style.top = homeY + "px";
    incense.style.margin = "0";
    root.classList.add("ritual-held");
    incense.classList.add("is-held");
    held = true;
    try { incense.setPointerCapture(e.pointerId); } catch (err) {}
  });

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
    var tipX = s.left + x + TIP_X * w;
    var tipY = s.top + y + TIP_Y * h;
    incense.classList.remove("is-near");
    if (inSpot(tipX, tipY) || inSpot(e.clientX, e.clientY)) {
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
    var mouthX = k.left - s.left + MOUTH_X * k.width;
    var mouthY = k.top - s.top + MOUTH_Y * k.height;
    var tx = mouthX - END_X * w;
    var ty = mouthY - END_Y * h;
    tx = Math.max(-w * 0.2, Math.min(tx, s.width - w * 0.8));
    incense.classList.add("is-planting");
    incense.style.left = tx + "px";
    incense.style.top = ty + "px";
    window.setTimeout(function () {
      incense.classList.remove("is-planting");
      root.classList.add("ritual-lit", "ritual-done");
      /* 火星和烟雾定位到实际香头位置 */
      var tipL = tx + TIP_X * w;
      var tipT = ty + TIP_Y * h;
      ember.style.left = tipL + "px";
      ember.style.top = tipT + "px";
      smoke.style.left = tipL + "px";
      smoke.style.top = tipT + "px";
    }, 620);
  }

  /* 没插进炉里：安静地放回原处 */
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
      root.classList.remove("ritual-held");
    }, 500);
  }
})();
