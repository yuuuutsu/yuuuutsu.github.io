from PIL import Image, ImageDraw
import traceback

# 模拟：小人上移4%；气泡加大(left65/top-20/w36/h52)；小圆点改到气泡下方往下排
SHIFT_UP = 0.04
BUBBLE = (0.65, -0.20, 0.36, 0.52)
DOT_BIG = (0.714, 0.316, 0.062)
DOT_SMALL = (0.683, 0.412, 0.048)

SRC = r"C:\Users\admin\my-blog\static\images\mascot-nobubble.png"
OUT = r"C:\Users\admin\my-blog\.bubble_sim4.png"
LOG = r"C:\Users\admin\my-blog\.sim_log.txt"

try:
    img = Image.open(SRC).convert("RGBA")
    W, H = img.size
    canvas = Image.new("RGBA", img.size, (0, 0, 0, 0))
    canvas.alpha_composite(img, (0, -int(H * SHIFT_UP)))
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    l, t, w, h = BUBBLE
    d.ellipse([W * l, H * t, W * (l + w), H * (t + h)],
              fill=(255, 255, 255, 255), outline=(213, 218, 226, 255), width=3)
    for (dl, dt, dw) in (DOT_BIG, DOT_SMALL):
        dpw = W * dw
        d.ellipse([W * dl, H * dt, W * dl + dpw, H * dt + dpw],
                  fill=(255, 255, 255, 255), outline=(213, 218, 226, 255), width=3)
    Image.alpha_composite(canvas, overlay).save(OUT)
    with open(LOG, "w", encoding="utf8") as f:
        f.write("ok")
except Exception:
    with open(LOG, "w", encoding="utf8") as f:
        f.write(traceback.format_exc())
