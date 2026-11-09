from PIL import Image

raw_path = "/home/nodejs/eauction-workspace/frontend/public/assets/logo-aj-v2-raw.png"
orig_img = Image.open(raw_path).convert("RGBA")
width, height = orig_img.size

# 1. Convert near-white background pixels to transparent
trans_img = Image.new("RGBA", (width, height))
pixels = orig_img.load()
trans_pixels = trans_img.load()

for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        # Detect near-white background
        if r > 240 and g > 240 and b > 240:
            trans_pixels[x, y] = (255, 255, 255, 0)
        else:
            trans_pixels[x, y] = (r, g, b, 255)

# 2. Get tight bounding box
bbox = trans_img.getbbox()
print("Non-transparent bounding box:", bbox)

pad = 12
crop_box = (
    max(0, bbox[0] - pad),
    max(0, bbox[1] - pad),
    min(width, bbox[2] + pad),
    min(height, bbox[3] + pad)
)

cropped_trans = trans_img.crop(crop_box)
cropped_white = orig_img.crop(crop_box)

print("Tight cropped size:", cropped_trans.size)

# 3. Save core logo files
assets_dir = "/home/nodejs/eauction-workspace/frontend/public/assets"
cropped_trans.save(f"{assets_dir}/logo-aj.png", "PNG")
cropped_trans.save(f"{assets_dir}/main_logo-aj.png", "PNG")
cropped_trans.save(f"{assets_dir}/logo-aj-transparent.png", "PNG")
cropped_white.save(f"{assets_dir}/logo-aj-white.png", "PNG")

# 4. Generate square favicon (64x64, 32x32, 16x16)
# For the favicon icon, crop just the "AJ" symbol portion so it's super visible in browser tabs!
# The AJ symbol is in the upper part of the bbox
aj_symbol_box = (
    bbox[0],
    bbox[1],
    int(bbox[0] + (bbox[2] - bbox[0]) * 0.72), # AJ symbol width
    int(bbox[1] + (bbox[3] - bbox[1]) * 0.72)  # AJ symbol height
)
aj_symbol = trans_img.crop(aj_symbol_box)
sq_size = max(aj_symbol.width, aj_symbol.height) + 12
fav_canvas = Image.new("RGBA", (sq_size, sq_size), (0, 0, 0, 0))
ox = (sq_size - aj_symbol.width) // 2
oy = (sq_size - aj_symbol.height) // 2
fav_canvas.paste(aj_symbol, (ox, oy), aj_symbol)

favicon_64 = fav_canvas.resize((64, 64), Image.Resampling.LANCZOS)
favicon_64.save(f"{assets_dir}/favicon-aj.png", "PNG")
favicon_64.save("/home/nodejs/eauction-workspace/frontend/public/favicon.ico", "ICO")

print("Generated logo-aj.png, main_logo-aj.png, logo-aj-white.png, favicon-aj.png, favicon.ico successfully!")
