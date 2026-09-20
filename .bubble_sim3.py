from PIL import Image, ImageDraw
import traceback

# 模拟：小人整体上移 4%，气泡下移（top -22% -> -14%），圆点微调
SHIFT_UP = 0.04        # 小人上移量（占容器高度百分比）
BUBBLE = (0.66, -0.14, 0.34, 0.46)
DOT_BIG = (0.562, 0.145, 0.067)
DOT_SMALL = (0.50, 0.11, 0.054)

SRC = r"C:\Users\admin\my-blog\static\images\mascot-nobubble.png"
OUT = r"C:\Users\admin\my-blog\.bubble_sim3.png"
LOG = r"C:\Users\admin\my-blog\.sim_log.txt"

try:
    img = Image.open(SRC).convert("RGBA")
    W, H = img.size
    canvas = Image.new("RGBA", img.size, (0, 0, 0, 0))
    # 小人上移
    up = int(H * SHIFT_UP)
    canvas.alpha_composite(img, (0, -up))
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    l, t, w, h = BUBBLE
    d.ellipse([W * l, H * t, W * (l + w), H * (t + h)],
              fill=(255, 255, 255, 255), outline=(213, 218, 226, 255), width=3)
    for (dl, dt, dw) in (DOT_BIG, DOT_SMALL):
        dpw = W * dw
        d.ellipse([W * dl, H * dt, W * dl + dpw, H * dt + dpw],
                  fill=(255, 255, 255, 255), outline=(213, 218, 226, 255), width=3)
    comp = Image.alpha_composite(canvas, overlay)
    comp.save(OUT)
    with open(LOG, "w", encoding="utf8") as f:
        f.write("ok")
except Exception:
    with open(LOG, "w", encoding="utf8") as f:
        f.write(traceback.format_exc())
