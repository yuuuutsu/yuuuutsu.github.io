from PIL import Image, ImageDraw
import traceback

try:
    img = Image.open(r"C:\Users\admin\my-blog\static\images\mascot.png").convert("RGBA")
    W, H = img.size
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    # 气泡: left 52% top -3% w 48% h 57%
    box = [W * 0.52, H * -0.03, W * 1.00, H * 0.54]
    d.ellipse(box, fill=(255, 255, 255, 255), outline=(213, 218, 226, 255), width=3)
    # 大圆点
    d.ellipse(
        [W * 0.631, H * 0.422, W * 0.631 + W * 0.11, H * 0.422 + W * 0.11],
        fill=(255, 255, 255, 255), outline=(213, 218, 226, 255), width=3,
    )
    # 小圆点
    d.ellipse(
        [W * 0.595, H * 0.466, W * 0.595 + W * 0.085, H * 0.466 + W * 0.085],
        fill=(255, 255, 255, 255), outline=(213, 218, 226, 255), width=3,
    )
    comp = Image.alpha_composite(img, overlay)
    comp.save(r"C:\Users\admin\my-blog\.bubble_sim.png")
    with open(r"C:\Users\admin\my-blog\.sim_log.txt", "w", encoding="utf8") as f:
        f.write(f"ok {W} {H}")
except Exception:
    with open(r"C:\Users\admin\my-blog\.sim_log.txt", "w", encoding="utf8") as f:
        f.write(traceback.format_exc())
