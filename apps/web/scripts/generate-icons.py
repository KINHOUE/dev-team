"""Génère les icônes PWA (PNG) sans dépendance externe."""
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "public"
OUT.mkdir(parents=True, exist_ok=True)

TOP = (99, 102, 241)     # accent (indigo)
BOTTOM = (67, 56, 202)   # indigo plus profond
WHITE = (255, 255, 255, 255)


def draw_icon(size: int, rounded: bool, safe_scale: float = 1.0) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Dégradé vertical
    for y in range(size):
        t = y / max(1, size - 1)
        color = tuple(int(TOP[i] + (BOTTOM[i] - TOP[i]) * t) for i in range(3))
        draw.line([(0, y), (size, y)], fill=(*color, 255))

    # Coins arrondis (icône « any ») ; maskable = fond plein
    if rounded:
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            [0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=255
        )
        img.putalpha(mask)
        draw = ImageDraw.Draw(img)

    # Trois barres croissantes (symbole « budget / statistiques »)
    s = size * safe_scale
    offset = (size - s) / 2
    bar_w = s * 0.12
    gap = s * 0.07
    base_y = offset + s * 0.74
    heights = (0.24, 0.38, 0.52)
    total_w = 3 * bar_w + 2 * gap
    x0 = (size - total_w) / 2

    for i, h in enumerate(heights):
        x = x0 + i * (bar_w + gap)
        top = base_y - s * h
        draw.rounded_rectangle(
            [x, top, x + bar_w, base_y], radius=bar_w * 0.32, fill=WHITE
        )

    # Ligne de base
    draw.rounded_rectangle(
        [x0 - s * 0.04, base_y + s * 0.055, x0 + total_w + s * 0.04, base_y + s * 0.075],
        radius=s * 0.01,
        fill=(255, 255, 255, 150),
    )

    return img


icons = [
    ("pwa-192x192.png", 192, True, 1.0),
    ("pwa-512x512.png", 512, True, 1.0),
    ("maskable-512x512.png", 512, False, 0.78),
    ("apple-touch-icon.png", 180, False, 1.0),
]

for name, size, rounded, scale in icons:
    draw_icon(size, rounded, scale).save(OUT / name, "PNG", optimize=True)
    print("écrit:", OUT / name)
