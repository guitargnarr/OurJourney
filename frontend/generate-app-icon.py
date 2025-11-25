#!/usr/bin/env python3
"""
Generate OurJourney App Icons
Creates 1024x1024 icon for iOS App Store and various favicon sizes
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_app_icon():
    """Create the main 1024x1024 app icon with modern design"""
    size = 1024
    img = Image.new('RGBA', (size, size), color=(0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Modern gradient background (rose to purple)
    for y in range(size):
        ratio = y / size
        # Rose #f43f5e to Purple #a855f7
        r = int(244 * (1 - ratio) + 168 * ratio)
        g = int(63 * (1 - ratio) + 85 * ratio)
        b = int(94 * (1 - ratio) + 247 * ratio)
        draw.rectangle([(0, y), (size, y+1)], fill=(r, g, b, 255))

    # Add subtle radial glow in center
    center_x, center_y = size // 2, size // 2
    for radius in range(400, 0, -10):
        alpha = int(30 * (radius / 400))
        draw.ellipse([
            center_x - radius, center_y - radius,
            center_x + radius, center_y + radius
        ], fill=(255, 255, 255, alpha))

    # Draw modern heart shape
    heart_size = 350
    heart_y_offset = -20  # Shift up slightly

    # Create heart using proper curves
    # Two circles for top lobes
    lobe_radius = heart_size // 3
    left_lobe_x = center_x - heart_size // 4
    right_lobe_x = center_x + heart_size // 4
    lobe_y = center_y - heart_size // 4 + heart_y_offset

    # White heart with subtle shadow
    shadow_offset = 8
    # Shadow
    draw.ellipse([
        left_lobe_x - lobe_radius + shadow_offset,
        lobe_y - lobe_radius + shadow_offset,
        left_lobe_x + lobe_radius + shadow_offset,
        lobe_y + lobe_radius + shadow_offset
    ], fill=(0, 0, 0, 30))

    draw.ellipse([
        right_lobe_x - lobe_radius + shadow_offset,
        lobe_y - lobe_radius + shadow_offset,
        right_lobe_x + lobe_radius + shadow_offset,
        lobe_y + lobe_radius + shadow_offset
    ], fill=(0, 0, 0, 30))

    draw.polygon([
        (center_x + shadow_offset, center_y + heart_size // 2 + heart_y_offset + shadow_offset),
        (left_lobe_x - lobe_radius//2 + shadow_offset, lobe_y + shadow_offset),
        (right_lobe_x + lobe_radius//2 + shadow_offset, lobe_y + shadow_offset)
    ], fill=(0, 0, 0, 30))

    # White heart
    draw.ellipse([
        left_lobe_x - lobe_radius,
        lobe_y - lobe_radius,
        left_lobe_x + lobe_radius,
        lobe_y + lobe_radius
    ], fill=(255, 255, 255, 255))

    draw.ellipse([
        right_lobe_x - lobe_radius,
        lobe_y - lobe_radius,
        right_lobe_x + lobe_radius,
        lobe_y + lobe_radius
    ], fill=(255, 255, 255, 255))

    draw.polygon([
        (center_x, center_y + heart_size // 2 + heart_y_offset),
        (left_lobe_x - lobe_radius//2, lobe_y),
        (right_lobe_x + lobe_radius//2, lobe_y)
    ], fill=(255, 255, 255, 255))

    # Convert to RGB for compatibility
    rgb_img = Image.new('RGB', (size, size), (255, 255, 255))
    rgb_img.paste(img, (0, 0), img)

    return rgb_img

def create_favicon(icon_img, size):
    """Create favicon of specified size"""
    return icon_img.resize((size, size), Image.Resampling.LANCZOS)

def main():
    output_dir = os.path.join(os.path.dirname(__file__), 'public')
    os.makedirs(output_dir, exist_ok=True)

    print("🎨 Generating OurJourney app icons...")

    # Generate main 1024x1024 icon
    print("  → Creating 1024x1024 app icon...")
    app_icon = create_app_icon()
    app_icon.save(os.path.join(output_dir, 'app-icon-1024.png'))
    print("  ✅ app-icon-1024.png")

    # Generate favicons
    sizes = [16, 32, 180, 192, 512]
    for size in sizes:
        print(f"  → Creating {size}x{size} favicon...")
        favicon = create_favicon(app_icon, size)
        if size == 16:
            favicon.save(os.path.join(output_dir, 'favicon.ico'))
            print(f"  ✅ favicon.ico")
        favicon.save(os.path.join(output_dir, f'icon-{size}.png'))
        print(f"  ✅ icon-{size}.png")

    print("\n✨ All icons generated successfully!")
    print(f"📁 Location: {output_dir}")
    print("\nGenerated files:")
    print("  - app-icon-1024.png (for iOS App Store)")
    print("  - favicon.ico (browser)")
    print("  - icon-16.png, icon-32.png (favicons)")
    print("  - icon-180.png (iOS home screen)")
    print("  - icon-192.png, icon-512.png (PWA)")

if __name__ == '__main__':
    main()
