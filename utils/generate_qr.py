"""
Generate QR Code for the TSV Marquartstein Statistics Website
"""
import qrcode
from PIL import Image, ImageDraw, ImageFont
import sys

def generate_qr_code(url, output_path, logo_path=None):
    """
    Generate a QR code with optional logo overlay
    """
    # Create QR code instance
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction for logo overlay
        box_size=10,
        border=4,
    )

    # Add data
    qr.add_data(url)
    qr.make(fit=True)

    # Create QR code image
    qr_img = qr.make_image(fill_color="#165b33", back_color="white").convert('RGB')

    # If logo provided, add it to the center
    if logo_path:
        try:
            logo = Image.open(logo_path)

            # Calculate logo size (should be about 1/5 of QR code size)
            qr_width, qr_height = qr_img.size
            logo_size = qr_width // 5

            # Resize logo
            logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)

            # Calculate position for logo (center)
            logo_pos = ((qr_width - logo_size) // 2, (qr_height - logo_size) // 2)

            # Create a white background for logo
            logo_bg = Image.new('RGB', (logo_size + 20, logo_size + 20), 'white')
            logo_bg.paste(logo, (10, 10))

            # Paste logo onto QR code
            qr_img.paste(logo_bg, (logo_pos[0] - 10, logo_pos[1] - 10))

            print(f"✓ Logo added to QR code")
        except Exception as e:
            print(f"⚠ Could not add logo: {e}")

    # Save QR code
    qr_img.save(output_path, quality=95)
    print(f"✓ QR code saved to: {output_path}")

    return qr_img

def create_printable_qr(url, output_path, logo_path=None):
    """
    Create a printable QR code with title and instructions
    """
    # Generate base QR code
    qr_img = generate_qr_code(url, output_path + '_temp.png', logo_path)

    # Create larger canvas for printable version
    canvas_width = 800
    canvas_height = 1000
    canvas = Image.new('RGB', (canvas_width, canvas_height), 'white')
    draw = ImageDraw.Draw(canvas)

    # Resize QR code to fit nicely
    qr_size = 600
    qr_img = qr_img.resize((qr_size, qr_size), Image.Resampling.LANCZOS)

    # Calculate positions
    qr_x = (canvas_width - qr_size) // 2
    qr_y = 150

    # Add border around QR
    border_color = '#53a612'
    draw.rectangle([qr_x-10, qr_y-10, qr_x+qr_size+10, qr_y+qr_size+10],
                   outline=border_color, width=5)

    # Paste QR code
    canvas.paste(qr_img, (qr_x, qr_y))

    # Add title (we'll use default font since we don't have custom fonts)
    try:
        # Try to use a nice font
        from PIL import ImageFont
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
        subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 32)
        text_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
    except:
        # Fallback to default
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        text_font = ImageFont.load_default()

    # Add title text
    title = "TSV Marquartstein"
    subtitle = "Saison 2025 Statistiken"
    instruction = "Scanne den QR-Code mit deinem Smartphone"

    # Calculate text positions (centered)
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]

    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]

    instruction_bbox = draw.textbbox((0, 0), instruction, font=text_font)
    instruction_width = instruction_bbox[2] - instruction_bbox[0]

    # Draw title
    draw.text(((canvas_width - title_width) // 2, 40), title,
              fill='#165b33', font=title_font)

    # Draw subtitle
    draw.text(((canvas_width - subtitle_width) // 2, 95), subtitle,
              fill='#53a612', font=subtitle_font)

    # Draw instruction
    draw.text(((canvas_width - instruction_width) // 2, qr_y + qr_size + 40),
              instruction, fill='#333333', font=text_font)

    # Draw URL (small text at bottom)
    url_text = url
    url_bbox = draw.textbbox((0, 0), url_text, font=text_font)
    url_width = url_bbox[2] - url_bbox[0]
    draw.text(((canvas_width - url_width) // 2, qr_y + qr_size + 80),
              url_text, fill='#666666', font=text_font)

    # Add Christmas decorations
    draw.text((50, canvas_height - 60), "🎄", font=title_font)
    draw.text((canvas_width - 100, canvas_height - 60), "🎄", font=title_font)

    # Save printable version
    canvas.save(output_path, quality=95)
    print(f"✓ Printable QR code saved to: {output_path}")

    # Clean up temp file
    import os
    try:
        os.remove(output_path + '_temp.png')
    except:
        pass

if __name__ == '__main__':
    # Get URL from command line or use placeholder
    url = sys.argv[1] if len(sys.argv) > 1 else 'https://YOUR-USERNAME.github.io/tsv-marquartstein-stats'

    logo_path = '/home/shell/test_fb/data/logo.png'
    output_basic = '/home/shell/test_fb/docs/qr_code.png'
    output_printable = '/home/shell/test_fb/docs/qr_code_printable.png'

    print(f"\n🎄 Generating QR Codes for TSV Marquartstein")
    print(f"URL: {url}\n")

    # Generate basic QR code
    generate_qr_code(url, output_basic, logo_path)

    # Generate printable version
    create_printable_qr(url, output_printable, logo_path)

    print(f"\n✅ QR Codes generated successfully!")
    print(f"\nBasic QR: {output_basic}")
    print(f"Printable QR: {output_printable}")
    print(f"\n📱 Scan these codes to view the statistics website!")
