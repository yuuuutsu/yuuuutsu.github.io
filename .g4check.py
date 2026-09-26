from PIL import Image
im = Image.open(r"C:\Users\admin\my-blog\static\images\favorite\Group 4.png")
with open(r"C:\Users\admin\my-blog\.g4info.txt", "w") as f:
    f.write(str(im.size) + " " + im.mode)
