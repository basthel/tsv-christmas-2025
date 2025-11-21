"""
Extract dominant colors from the club logo for website theme
"""
from PIL import Image
import json
from collections import Counter

def rgb_to_hex(rgb):
    """Convert RGB tuple to hex color code"""
    return '#{:02x}{:02x}{:02x}'.format(rgb[0], rgb[1], rgb[2])

def extract_colors(image_path, num_colors=8):
    """Extract dominant colors from an image"""
    # Open image
    img = Image.open(image_path)

    # Convert to RGB (remove alpha if present)
    img = img.convert('RGB')

    # Resize for faster processing
    img = img.resize((150, 150))

    # Get all pixels
    pixels = list(img.getdata())

    # Count color frequency
    color_counts = Counter(pixels)

    # Get most common colors
    most_common = color_counts.most_common(num_colors * 3)

    # Filter out very light colors (likely background) and very dark
    filtered_colors = []
    for color, count in most_common:
        r, g, b = color
        # Skip near-white and near-black
        if not (r > 240 and g > 240 and b > 240) and not (r < 15 and g < 15 and b < 15):
            # Calculate brightness
            brightness = (r + g + b) / 3
            # Add variety - skip colors too similar in brightness to existing
            is_unique = True
            for existing_color, _ in filtered_colors:
                er, eg, eb = existing_color
                existing_brightness = (er + eg + eb) / 3
                if abs(brightness - existing_brightness) < 30:
                    is_unique = False
                    break

            if is_unique:
                filtered_colors.append((color, count))

        if len(filtered_colors) >= num_colors:
            break

    # Create color palette
    colors = {
        'primary': rgb_to_hex(filtered_colors[0][0]) if len(filtered_colors) > 0 else '#1a472a',
        'secondary': rgb_to_hex(filtered_colors[1][0]) if len(filtered_colors) > 1 else '#2d5a3d',
        'accent': rgb_to_hex(filtered_colors[2][0]) if len(filtered_colors) > 2 else '#d4af37',
        'highlight': rgb_to_hex(filtered_colors[3][0]) if len(filtered_colors) > 3 else '#8b0000',
        'all_colors': [rgb_to_hex(color) for color, _ in filtered_colors]
    }

    return colors

if __name__ == '__main__':
    logo_path = '/home/shell/test_fb/data/logo.png'
    output_path = '/home/shell/test_fb/website/assets/data/colors.json'

    print("Extracting colors from logo...")
    colors = extract_colors(logo_path)

    print("\nExtracted Color Scheme:")
    print(f"Primary:   {colors['primary']}")
    print(f"Secondary: {colors['secondary']}")
    print(f"Accent:    {colors['accent']}")
    print(f"Highlight: {colors['highlight']}")
    print(f"\nAll colors: {colors['all_colors']}")

    # Save to JSON
    with open(output_path, 'w') as f:
        json.dump(colors, f, indent=2)

    print(f"\nColors saved to {output_path}")
