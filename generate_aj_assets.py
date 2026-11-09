from PIL import Image

orig = Image.open('/home/nodejs/eauction-workspace/frontend/public/assets/logo-aj-pristine.png').convert("RGBA")
print("Pristine format/mode/size:", orig.format, orig.mode, orig.size)
bbox = orig.getbbox()
print("Pristine non-transparent bounding box:", bbox)

# Crop tight to the actual logo with 8px padding
if bbox:
    pad = 8
    crop_box = (
        max(0, bbox[0] - pad),
        max(0, bbox[1] - pad),
        min(orig.width, bbox[2] + pad),
        min(orig.height, bbox[3] + pad)
    )
    cropped = orig.crop(crop_box)
    print("Tight cropped size:", cropped.size)
else:
    cropped = orig

# 1. Primary transparent logo
cropped.save("/home/nodejs/eauction-workspace/frontend/public/assets/logo-aj.png", "PNG")
cropped.save("/home/nodejs/eauction-workspace/frontend/public/assets/main_logo-aj.png", "PNG")
cropped.save("/home/nodejs/eauction-workspace/frontend/public/assets/logo-aj-transparent.png", "PNG")

# 2. White background version
white_bg = Image.new("RGBA", cropped.size, (255, 255, 255, 255))
white_bg.paste(cropped, (0, 0), cropped)
white_bg.convert("RGB").save("/home/nodejs/eauction-workspace/frontend/public/assets/logo-aj-white.png", "PNG")

# 3. Square favicon (64x64, 32x32, 16x16)
sq_size = max(cropped.width, cropped.height) + 16
fav_canvas = Image.new("RGBA", (sq_size, sq_size), (0, 0, 0, 0))
ox = (sq_size - cropped.width) // 2
oy = (sq_size - cropped.height) // 2
fav_canvas.paste(cropped, (ox, oy), cropped)

fav_64 = fav_canvas.resize((64, 64), Image.Resampling.LANCZOS)
fav_64.save("/home/nodejs/eauction-workspace/frontend/public/assets/favicon-aj.png", "PNG")
fav_64.save("/home/nodejs/eauction-workspace/frontend/public/favicon.ico", "ICO")

print("Successfully generated all AJ logo assets from pristine transparent upload!")
