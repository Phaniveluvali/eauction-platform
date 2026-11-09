from PIL import Image

img = Image.open('/home/nodejs/eauction-workspace/frontend/public/assets/logo-aj-white.png').convert("RGBA")
print("Size:", img.size)
print("Pixel at 0,0:", img.getpixel((0,0)))
print("Pixel at 10,10:", img.getpixel((10,10)))
print("Pixel at 50,50:", img.getpixel((50,50)))
print("Pixel at 200,100:", img.getpixel((200,100)))

# Let's count colors or find what the background color actually is
from collections import Counter
border_pixels = []
for x in range(img.width):
    border_pixels.append(img.getpixel((x, 0))[:3])
    border_pixels.append(img.getpixel((x, img.height-1))[:3])
for y in range(img.height):
    border_pixels.append(img.getpixel((0, y))[:3])
    border_pixels.append(img.getpixel((img.width-1, y))[:3])

print("Most common border pixels:", Counter(border_pixels).most_common(5))
