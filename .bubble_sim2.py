from PIL import Image, ImageDraw
import traceback

# 模拟 CSS 想法气泡叠加效果（百分比与 custom.css 保持一致）
BUBBLE = (0.66, -0.22, 0.34, 0.48)   # left, top, width, height
DOT_BIG = (0.559, 0.130, 0.067)      # left, top, width
DOT_SMALL = (0.496, 0.094, 0.054)

SRC = r"C:\Users\admin\my-blog\static\images\mascot-nobubble.png"
OUT = r"C:\Users\admin\my-blog\.bubble_sim2.png"
LOG = r"C:\Users\admin\my-blog\.sim_log.txt"

try:
    img = Image.open(SRC).convert("RGBA")
    W, H = img.size
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    l, t, w, h = BUBBLE
    d.ellipse([W * l, H * t, W * (l + w), H * (t + h)],
              fill=(255, 255, 255, 255), outline=(213, 218, 226, 255), width=3)
    for (dl, dt, dw) in (DOT_BIG, DOT_SMALL):
        dpw = W * dw
        dph = dpw  # aspect-ratio:1，圆的宽高像素相同
        d.ellipse([W * dl, H * dt, W * dl + dpw, H * dt + dph],
                  fill=(255, 255, 255, 255), outline=(213, 218, 226, 255), width=3)
    comp = Image.alpha_composite(img, overlay)
    comp.save(OUT)
    with open(LOG, "w", encoding="utf8") as f:
        f.write(f"ok {W} {H}")
except Exception:
    with open(LOG, "w", encoding="utf8") as f:
        f.write(traceback.format_exc())
