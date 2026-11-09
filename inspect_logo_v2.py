from PIL import Image

raw_path = "/home/nodejs/eauction-workspace/frontend/public/assets/logo-aj-v2-raw.png"
img = Image.open(raw_path).convert("RGBA")
print("Size:", img.size)
print("Mode:", img.mode)

# Sample corner pixels and border pixels
print("Corner (0,0):", img.getpixel((0,0)))
print("Corner (width-1, 0):", img.getpixel((img.width-1, 0)))
print("Corner (0, height-1):", img.getpixel((0, img.height-1)))
print("Corner (width-1, height-1):", img.getpixel((img.width-1, img.height-1)))

# Check transparency or if background is white
is_transparent = any(img.getpixel((x, y))[3] < 255 for x in range(0, img.width, 50) for y in range(0, img.height, 50))
print("Has transparency already:", is_transparent)
