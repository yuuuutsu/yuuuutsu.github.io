# -*- coding: utf-8 -*-
"""把 deceased.png 的白底转回透明：从四边向内泛洪，只清掉与外部连通的近白像素。"""
from PIL import Image
from collections import deque

SRC = r"C:\Users\admin\.workbuddy\clipboard-images\clipboard-2026-09-26T16-42-14-955Z-55722ecb.jpg"
DST = r"C:\Users\admin\my-blog\static\images\favorite\deceased.png"
CHECK = r"C:\Users\admin\my-blog\.transparency_check.png"

img = Image.open(SRC).convert("RGB")
w, h = img.size
px = img.load()
print("size:", w, h)

# 近白判定：三通道都不低于阈值（JPG 噪声留点余量）
def near_white(x, y):
    r, g, b = px[x, y]
    return r >= 242 and g >= 242 and b >= 242

visited = bytearray(w * h)
q = deque()
# 种子：四条边的近白像素
for x in range(w):
    for y in (0, h - 1):
        if near_white(x, y) and not visited[y * w + x]:
            visited[y * w + x] = 1
            q.append((x, y))
for y in range(h):
    for x in (0, w - 1):
        if near_white(x, y) and not visited[y * w + x]:
            visited[y * w + x] = 1
            q.append((x, y))

# 四向泛洪
while q:
    x, y = q.popleft()
    for nx, ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
        if 0 <= nx < w and 0 <= ny < h and not visited[ny * w + nx] and near_white(nx, ny):
            visited[ny * w + nx] = 1
            q.append((nx, ny))

cleared = sum(visited)
print("cleared px:", cleared, "(%.1f%%)" % (100.0 * cleared / (w * h)))

out = img.convert("RGBA")
opx = out.load()
for y in range(h):
    row = y * w
    for x in range(w):
        if visited[row + x]:
            r, g, b, _ = opx[x, y]
            opx[x, y] = (r, g, b, 0)

out.save(DST)
print("saved:", DST)

# 生成校验图：铺在博客的浅粉背景上，人眼检查有没有白框残留/误伤
bg = Image.new("RGBA", (w, h), (253, 246, 248, 255))
bg.alpha_composite(out)
bg.convert("RGB").save(CHECK)
print("check:", CHECK)
