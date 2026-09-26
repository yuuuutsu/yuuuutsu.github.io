from PIL import Image
im = Image.open(r"C:\Users\admin\my-blog\static\images\favorite\Group 5.png").convert("RGBA")
w, h = im.size
out = []
# 位牌图片显示为 120px 宽；烟从香头(y约510)升到y约441，对应图片上部区域
# 采样上、中、下三段的平均颜色
for name, y0, y1 in [("top", 0, 0.3), ("mid", 0.3, 0.7), ("bottom", 0.7, 1.0)]:
    box = im.crop((int(w*0.2), int(h*y0), int(w*0.8), int(h*y1)))
    px = [p for p in box.getdata() if p[3] > 100]
    if px:
        r = sum(p[0] for p in px)//len(px); g = sum(p[1] for p in px)//len(px); b = sum(p[2] for p in px)//len(px)
        out.append("%s: rgb(%d,%d,%d) n=%d" % (name, r, g, b, len(px)))
    else:
        out.append("%s: transparent" % name)
with open(r"C:\Users\admin\my-blog\.tablet.txt", "w") as f:
    f.write("; ".join(out))
print("done")
