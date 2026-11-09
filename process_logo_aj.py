from PIL import Image

src_path = "/home/nodejs/eauction-workspace/frontend/public/assets/logo-aj.png"
orig_img = Image.open(src_path).convert("RGBA")
print("Original image size:", orig_img.size)

# Convert near-white background pixels to transparent
trans_img = Image.new("RGBA", orig_img.size)
pixels = orig_img.load()
trans_pixels = trans_img.load()

width, height = orig_img.size
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        # Detect white / light background
        if r > 235 and g > 235 and b > 235:
            trans_pixels[x, y] = (255, 255, 255, 0)
        else:
            trans_pixels[x, y] = (r, g, b, 255)

# Calculate bounding box of non-transparent content
bbox = trans_img.getbbox()
print("Non-transparent bounding box:", bbox)

if bbox:
    # Add a modest 10px margin
    pad = 10
    crop_box = (
        max(0, bbox[0] - pad),
        max(0, bbox[1] - pad),
        min(width, bbox[2] + pad),
        min(height, bbox[3] + pad)
    )
    cropped_trans = trans_img.crop(crop_box)
    cropped_white = orig_img.crop(crop_box)
else:
    cropped_trans = trans_img
    cropped_white = orig_img

print("Cropped size:", cropped_trans.size)

# Save cropped original with white background
cropped_white.save("/home/nodejs/eauction-workspace/frontend/public/assets/logo-aj-white.png", "PNG")

# Save primary transparent logo
cropped_trans.save("/home/nodejs/eauction-workspace/frontend/public/assets/logo-aj.png", "PNG")
cropped_trans.save("/home/nodejs/eauction-workspace/frontend/public/assets/main_logo-aj.png", "PNG")
cropped_trans.save("/home/nodejs/eauction-workspace/frontend/public/assets/logo-aj-transparent.png", "PNG")

# Generate favicon-aj.png (square icon 64x64)
sq_size = max(cropped_trans.width, cropped_trans.height)
favicon_canvas = Image.new("RGBA", (sq_size, sq_size), (0, 0, 0, 0))
offset_x = (sq_size - cropped_trans.width) // 2
offset_y = (sq_size - cropped_trans.height) // 2
favicon_canvas.paste(cropped_trans, (offset_x, offset_y), cropped_trans)

favicon_64 = favicon_canvas.resize((64, 64), Image.Resampling.LANCZOS)
favicon_64.save("/home/nodejs/eauction-workspace/frontend/public/assets/favicon-aj.png", "PNG")
favicon_64.save("/home/nodejs/eauction-workspace/frontend/public/favicon.ico", "ICO")

print("All AJ logo variants generated successfully:")
print(" - /home/nodejs/eauction-workspace/frontend/public/assets/logo-aj.png")
print(" - /home/nodejs/eauction-workspace/frontend/public/assets/logo-aj-transparent.png")
print(" - /home/nodejs/eauction-workspace/frontend/public/assets/logo-aj-white.png")
print(" - /home/nodejs/eauction-workspace/frontend/public/assets/main_logo-aj.png")
print(" - /home/nodejs/eauction-workspace/frontend/public/assets/favicon-aj.png")
print(" - /home/nodejs/eauction-workspace/frontend/public/favicon.ico")
