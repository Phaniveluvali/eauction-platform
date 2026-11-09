from PIL import Image, ImageDraw, ImageFont

# Dimensions for hero web banner
width, height = 2560, 600
banner = Image.new("RGBA", (width, height), (15, 23, 42, 255)) # Dark slate base
draw = ImageDraw.Draw(banner)

# Linear gradient from rich navy (#0B132B) to slate dark teal (#0D2538) to deep indigo (#1C1E38)
for x in range(width):
    factor = x / width
    r = int(11 * (1 - factor) + 16 * factor)
    g = int(19 * (1 - factor) + 37 * factor)
    b = int(43 * (1 - factor) + 56 * factor)
    draw.line([(x, 0), (x, height)], fill=(r, g, b, 255))

# Draw subtle ambient accent glow on left and far right
for r_glow in range(450, 0, -6):
    alpha = int(28 * (1 - r_glow / 450))
    # Green accent glow on left
    draw.ellipse([(180 - r_glow, height//2 - r_glow), (180 + r_glow, height//2 + r_glow)],
                 outline=(0, 168, 107, alpha), width=2)
    # Red accent glow on far right
    draw.ellipse([(width + 100 - r_glow, 150 - r_glow), (width + 100 + r_glow, 150 + r_glow)],
                 outline=(225, 45, 57, alpha // 2), width=2)

# Load pristine new AJ logo
logo = Image.open("/home/nodejs/eauction-workspace/frontend/public/assets/logo-aj-white.png").convert("RGBA")
# Target logo height in banner ~ 280px with a sleek white rounded container so the full logo with tagline pops!
logo_ratio = 240.0 / logo.height
logo_w = int(logo.width * logo_ratio)
logo_h = 240
logo_resized = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)

# Create a clean white rounded card on the left for the logo
card_pad = 20
card_w = logo_w + card_pad * 2
card_h = logo_h + card_pad * 2
card_x = 140
card_y = (height - card_h) // 2

# Draw white container card with subtle shadow
draw.rounded_rectangle([(card_x, card_y), (card_x + card_w, card_y + card_h)], radius=16, fill=(255, 255, 255, 255))
banner.paste(logo_resized, (card_x + card_pad, card_y + card_pad), logo_resized)

# Vertical divider
divider_x = card_x + card_w + 70
draw.line([(divider_x, 140), (divider_x, height - 140)], fill=(255, 255, 255, 60), width=2)

# Text placement
text_x = divider_x + 70

try:
    font_badge = ImageFont.truetype("/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf", 24)
    font_title = ImageFont.truetype("/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf", 64)
    font_sub = ImageFont.truetype("/usr/share/fonts/dejavu/DejaVuSans.ttf", 30)
    font_tag = ImageFont.truetype("/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf", 22)
except Exception:
    try:
        font_badge = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 64)
        font_sub = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 30)
        font_tag = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
    except Exception:
        font_badge = font_title = font_sub = font_tag = ImageFont.load_default()

# 1. Badge Pill
badge_text = "OFFICIAL DIGITAL AUCTION PORTAL • LIVE 24/7"
draw.rectangle([(text_x, 130), (text_x + 620, 175)], fill=(0, 135, 90, 240)) # Emerald Green
draw.text((text_x + 20, 138), badge_text, fill=(255, 255, 255, 255), font=font_badge)

# 2. Main Title
title_text = "AJ AUCTIONS"
draw.text((text_x, 195), title_text, fill=(255, 255, 255, 255), font=font_title)

# 3. Subtitle
sub_text = "Commercial Fleet, Passenger Vehicles & Heavy Equipment"
draw.text((text_x, 285), sub_text, fill=(203, 213, 225, 255), font=font_sub)

# 4. Tech Tagline
tag_text = "POWERED BY ASHWIKTECHNOLOGIES • REAL-TIME MULTI-POINT VERIFIED"
draw.text((text_x, 345), tag_text, fill=(52, 211, 153, 255), font=font_tag)

# 5. Highlights bar
highlights = "✓ 150-Point Inspection   ✓ Instant UAE Wire Settlement   ✓ Bank-Grade Cryptographic Audit Trail"
draw.text((text_x, 400), highlights, fill=(148, 163, 184, 255), font=font_badge)

# Save high-res banner
target_path = "/home/nodejs/eauction-workspace/frontend/public/assets/banner-aj.png"
banner.save(target_path, "PNG")
print(f"Generated hero banner successfully at {target_path} ({width}x{height})")
