from PIL import Image
im = Image.open(r"C:\Users\admin\my-blog\static\images\favorite\Group 5.png")
with open(r"C:\Users\admin\my-blog\.bbox.txt", "w") as f:
    f.write(str(im.size) + " " + im.mode + " bbox=" + str(im.convert("RGBA").getbbox()))
