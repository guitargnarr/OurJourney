#!/usr/bin/env python3
"""
Generate Premium OurJourney App Icon
Following 2025 iOS design trends: minimalist, gradient, single focal point
"""

from PIL import Image, ImageDraw, ImageFilter
import math
import os

def create_premium_icon():
    """Create professional 1024x1024 app icon following 2025 iOS trends"""
    size = 1024
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))

    # Layer 1: Vibrant gradient background (Instagram-style smooth gradient)
    gradient = Image.new('RGBA', (size, size))
    draw = ImageDraw.Draw(gradient)

    for y in range(size):
        ratio = y / size
        # Smooth gradient: Rose (#f43f5e) -> Fuchsia (#e879f9) -> Purple (#a855f7)
        if ratio < 0.5:
            # First half: Rose to Fuchsia
            r_ratio = ratio * 2
            r = int(244 * (1 - r_ratio) + 232 * r_ratio)
            g = int(63 * (1 - r_ratio) + 121 * r_ratio)
            b = int(94 * (1 - r_ratio) + 249 * r_ratio)
        else:
            # Second half: Fuchsia to Purple
            r_ratio = (ratio - 0.5) * 2
            r = int(232 * (1 - r_ratio) + 168 * r_ratio)
            g = int(121 * (1 - r_ratio) + 85 * r_ratio)
            b = int(249 * (1 - r_ratio) + 247 * r_ratio)

        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))

    img = Image.alpha_composite(img, gradient)

    # Layer 2: Radial glow overlay for depth (2025 trend)
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    center_x, center_y = size // 2, size // 2

    for i in range(60, 0, -1):
        radius = i * 8
        alpha = int(3 * (60 - i) / 60)
        glow_draw.ellipse([
            center_x - radius, center_y - radius,
            center_x + radius, center_y + radius
        ], fill=(255, 255, 255, alpha))

    img = Image.alpha_composite(img, glow)

    # Layer 3: Perfect heart shape (single focal point - 2025 minimalism)
    heart = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    heart_draw = ImageDraw.Draw(heart)

    # Heart parameters
    heart_width = 420
    heart_height = 380
    offset_x = center_x
    offset_y = center_y - 30  # Shift up slightly for better balance

    # Draw heart using bezier-like approach with many points
    heart_points = []
    for angle in range(0, 360):
        rad = math.radians(angle)
        # Parametric heart equation
        x = 16 * math.sin(rad) ** 3
        y = -(13 * math.cos(rad) - 5 * math.cos(2*rad) - 2 * math.cos(3*rad) - math.cos(4*rad))

        # Scale and translate
        px = int(offset_x + x * (heart_width / 35))
        py = int(offset_y + y * (heart_height / 35))
        heart_points.append((px, py))

    # Draw shadow first (soft, subtle)
    shadow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_points = [(p[0] + 6, p[1] + 8) for p in heart_points]
    shadow_draw.polygon(shadow_points, fill=(0, 0, 0, 50))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    heart = Image.alpha_composite(heart, shadow)

    # Draw white heart (crisp, clean)
    heart_draw.polygon(heart_points, fill=(255, 255, 255, 255))

    # Add subtle inner shadow for depth
    inner = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    inner_draw = ImageDraw.Draw(inner)
    inner_points = [(p[0], p[1]) for p in heart_points]
    inner_draw.polygon(inner_points, fill=(0, 0, 0, 15))
    inner = inner.filter(ImageFilter.GaussianBlur(4))
    heart = Image.alpha_composite(heart, inner)

    img = Image.alpha_composite(img, heart)

    # Convert to RGB
    final = Image.new('RGB', (size, size), (255, 255, 255))
    final.paste(img, (0, 0), img)

    # Apply slight overall sharpening for crispness
    final = final.filter(ImageFilter.UnsharpMask(radius=1, percent=120, threshold=3))

    return final

def create_favicon(icon_img, size):
    """Create favicon of specified size with high-quality resampling"""
    return icon_img.resize((size, size), Image.Resampling.LANCZOS)

def main():
    output_dir = os.path.join(os.path.dirname(__file__), 'public')
    os.makedirs(output_dir, exist_ok=True)

    print("✨ Generating PREMIUM OurJourney app icons (2025 iOS standards)...")

    # Generate main 1024x1024 icon
    print("  → Creating professional 1024x1024 app icon...")
    app_icon = create_premium_icon()
    app_icon.save(os.path.join(output_dir, 'app-icon-1024.png'), quality=100, optimize=True)
    print("  ✅ app-icon-1024.png (App Store quality)")

    # Generate favicons with high quality
    sizes = [16, 32, 180, 192, 512]
    for icon_size in sizes:
        print(f"  → Creating {icon_size}x{icon_size} favicon...")
        favicon = create_favicon(app_icon, icon_size)
        if icon_size == 16:
            favicon.save(os.path.join(output_dir, 'favicon.ico'), quality=100)
            print(f"  ✅ favicon.ico")
        favicon.save(os.path.join(output_dir, f'icon-{icon_size}.png'), quality=100, optimize=True)
        print(f"  ✅ icon-{icon_size}.png")

    print("\n🎉 Premium app icons generated!")
    print("📁 Location: frontend/public/")
    print("\n✨ Features:")
    print("  - Smooth 3-color gradient (rose → fuchsia → purple)")
    print("  - Mathematically perfect heart shape")
    print("  - Soft shadow with gaussian blur")
    print("  - Radial glow for depth")
    print("  - Crisp edges with subtle sharpening")
    print("  - Follows 2025 iOS minimalist trends")

if __name__ == '__main__':
    main()
