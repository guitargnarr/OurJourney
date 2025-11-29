#!/usr/bin/env python3
"""
Generate Open Graph social preview image for OurJourney
1200x630 optimized for social media sharing
"""

from PIL import Image, ImageDraw, ImageFont
import math


def create_og_image() -> Image.Image:
    """Create 1200x630 OG image for social sharing"""
    width, height = 1200, 630
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)

    # Gradient background (rose to purple)
    for y in range(height):
        ratio = y / height
        r = int(244 * (1 - ratio) + 168 * ratio)
        g = int(63 * (1 - ratio) + 85 * ratio)
        b = int(94 * (1 - ratio) + 247 * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Draw heart on left side
    heart_center_x = 280
    heart_center_y = height // 2
    heart_size = 200

    # Heart using parametric equation
    heart_points = []
    for angle in range(0, 360):
        rad = math.radians(angle)
        x = 16 * math.sin(rad) ** 3
        y = -(13 * math.cos(rad) - 5 * math.cos(2 * rad) - 2 * math.cos(3 * rad) - math.cos(4 * rad))
        px = int(heart_center_x + x * (heart_size / 35))
        py = int(heart_center_y + y * (heart_size / 35))
        heart_points.append((px, py))

    draw.polygon(heart_points, fill=(255, 255, 255, 255))

    # Text on right side
    try:
        # Try to use system font
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 80)
        subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
        desc_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
    except OSError:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        desc_font = ImageFont.load_default()

    # Title
    draw.text((550, 180), "OurJourney", fill=(255, 255, 255), font=title_font)

    # Subtitle
    draw.text((550, 280), "Track Your Story Together", fill=(255, 255, 255, 200), font=subtitle_font)

    # Features
    features = [
        "💕 Shared Goals & Memories",
        "📅 Couple's Calendar",
        "💌 Love Notes"
    ]

    y_pos = 360
    for feature in features:
        draw.text((550, y_pos), feature, fill=(255, 255, 255, 220), font=desc_font)
        y_pos += 45

    return img


def main() -> None:
    import os
    output_dir = os.path.join(os.path.dirname(__file__), 'public')
    os.makedirs(output_dir, exist_ok=True)

    print("🎨 Generating social preview image...")
    og_image = create_og_image()
    og_image.save(os.path.join(output_dir, 'og-image.png'), quality=95, optimize=True)
    print("✅ og-image.png (1200x630 for social sharing)")
    print(f"📁 Location: {output_dir}/og-image.png")
    print("\n✨ Social preview ready for Twitter, Facebook, iMessage!")


if __name__ == '__main__':
    main()
