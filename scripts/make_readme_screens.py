from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "docs" / "screenshots"
OUT.mkdir(parents=True, exist_ok=True)

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def font(size, bold=False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT, size)


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def centered(draw, xy, text, f, fill):
    box = draw.textbbox((0, 0), text, font=f)
    draw.text((xy[0] - (box[2] - box[0]) / 2, xy[1] - (box[3] - box[1]) / 2), text, font=f, fill=fill)


def phone(bg, surface, primary, text, muted):
    image = Image.new("RGB", (900, 1700), "#D8D5DE")
    draw = ImageDraw.Draw(image)
    rounded(draw, (45, 35, 855, 1665), 72, "#15131A")
    rounded(draw, (78, 82, 822, 1618), 44, bg)
    rounded(draw, (345, 56, 555, 94), 20, "#15131A")
    return image, draw, (78, 82, 822, 1618), surface, primary, text, muted


def save_intro():
    image = Image.new("RGB", (900, 1700), "#D8D5DE")
    draw = ImageDraw.Draw(image)
    rounded(draw, (45, 35, 855, 1665), 72, "#15131A")
    rounded(draw, (78, 82, 822, 1618), 44, "#6750A4")
    rounded(draw, (345, 56, 555, 94), 20, "#15131A")
    rounded(draw, (280, 525, 620, 865), 72, "#FFFFFF")
    centered(draw, (450, 690), "✦", font(145, True), "#6750A4")
    centered(draw, (450, 955), "Lumo Notes", font(58, True), "#FFFFFF")
    centered(draw, (450, 1040), "Guarda tus ideas.", font(29), "#F0EAFD")
    centered(draw, (450, 1080), "Dales un momento para brillar.", font(29), "#F0EAFD")
    rounded(draw, (240, 1195, 660, 1285), 36, "#FFFFFF")
    centered(draw, (450, 1240), "Entrar a mis notas", font(27, True), "#6750A4")
    image.save(OUT / "intro.png", optimize=True)


def save_home():
    image, draw, _, surface, primary, text, muted = phone("#F7F5FA", "#FFFFFF", "#6750A4", "#28242E", "#706B78")
    centered(draw, (450, 175), "Lumo Notes", font(34, True), text)
    centered(draw, (450, 215), "Ideas con pulso", font(19), muted)
    draw.text((705, 170), "⚙", font=font(32), fill=muted)
    rounded(draw, (120, 285, 780, 370), 26, surface, outline="#DCD7E2", width=2)
    draw.text((155, 307), "⌕", font=font(36), fill=muted)
    draw.text((215, 312), "Buscar en tus notas", font=font(25), fill=muted)
    for i, label in enumerate(["Todas", "Favoritas", "Archivadas"]):
        x = 120 + i * 205
        rounded(draw, (x, 405, x + 180, 470), 28, primary if i == 0 else "#E8E2F0")
        centered(draw, (x + 90, 437), label, font(19, i == 0), "#FFFFFF" if i == 0 else primary)
    draw.text((125, 530), "2 notas", font=font(20, True), fill=muted)
    cards = [("Una idea luminosa", "Escribir también es una forma de respirar.", "#EDE7F6", "#6750A4"), ("Plan de mañana", "Revisar las prioridades y avanzar con calma.", "#DFF5E1", "#237A4B")]
    y = 585
    for title, body, color, accent in cards:
        rounded(draw, (115, y, 785, y + 225), 30, color)
        draw.text((145, y + 30), title, font=font(29, True), fill="#28242E")
        draw.text((145, y + 92), body, font=font(22), fill="#443E4B")
        draw.text((145, y + 170), "#ideas", font=font(19, True), fill=accent)
        draw.text((720, y + 30), "♡", font=font(32), fill="#E85D75")
        y += 255
    rounded(draw, (685, 1415, 790, 1520), 35, primary)
    centered(draw, (738, 1468), "+", font(45), "#FFFFFF")
    draw.text((168, 1560), "⌕   Notas", font=font(20, True), fill=primary)
    draw.text((365, 1560), "♥   Favoritas", font=font(20), fill=muted)
    draw.text((610, 1560), "⚙", font=font(26), fill=muted)
    image.save(OUT / "notas-blanco.png", optimize=True)


def save_neon():
    image, draw, _, surface, primary, text, muted = phone("#080D1D", "#111A35", "#00F5D4", "#F7FFFF", "#A7B4D1")
    centered(draw, (450, 175), "Lumo Notes", font(34, True), text)
    centered(draw, (450, 215), "Tema Neón", font(19, True), primary)
    rounded(draw, (120, 285, 780, 370), 26, surface, outline="#00F5D4", width=2)
    draw.text((155, 307), "⌕", font=font(36), fill=primary)
    draw.text((215, 312), "Buscar en tus notas", font=font(25), fill=muted)
    for i, label in enumerate(["Todas", "Favoritas", "Archivadas"]):
        x = 120 + i * 205
        rounded(draw, (x, 405, x + 180, 470), 28, primary if i == 0 else "#202B4D")
        centered(draw, (x + 90, 437), label, font(19, i == 0), "#05131B" if i == 0 else "#C6D4F0")
    rounded(draw, (115, 540, 785, 790), 30, surface, outline="#00F5D4", width=2)
    draw.text((145, 575), "Ideas con pulso", font=font(29, True), fill=text)
    draw.text((145, 640), "El futuro también puede", font=font(22), fill="#C6D4F0")
    draw.text((145, 678), "ser una página en blanco.", font=font(22), fill="#C6D4F0")
    draw.text((145, 745), "#neon", font=font(19, True), fill="#FF4ECD")
    draw.text((720, 575), "♥", font=font(32), fill="#FF4ECD")
    rounded(draw, (115, 825, 785, 1075), 30, "#20163C", outline="#FF4ECD", width=2)
    draw.text((145, 860), "Recordatorio", font=font(29, True), fill=text)
    draw.text((145, 925), "Hoy · 19:30", font=font(22), fill="#FFE500")
    draw.text((145, 970), "Preparar el siguiente paso.", font=font(22), fill="#C6D4F0")
    rounded(draw, (685, 1415, 790, 1520), 35, primary)
    centered(draw, (738, 1468), "+", font(45), "#05131B")
    draw.text((155, 1560), "⌕   Notas", font=font(20), fill=primary)
    draw.text((365, 1560), "♥   Favoritas", font=font(20), fill=muted)
    draw.text((610, 1560), "⚙", font=font(26), fill=muted)
    image.save(OUT / "tema-neon.png", optimize=True)


def save_reminder():
    image, draw, _, surface, primary, text, muted = phone("#F7F5FA", "#FFFFFF", "#6750A4", "#28242E", "#706B78")
    centered(draw, (450, 175), "Editar nota", font(34, True), text)
    draw.text((115, 280), "Plan de mañana", font=font(38, True), fill=text)
    rounded(draw, (115, 355, 785, 650), 26, surface, outline="#DCD7E2", width=2)
    draw.text((145, 390), "Revisar las prioridades y avanzar", font=font(24), fill=text)
    draw.text((145, 435), "con calma.", font=font(24), fill=text)
    draw.text((115, 710), "Recordatorio", font=font(26, True), fill=text)
    rounded(draw, (115, 760, 785, 855), 26, "#EDE7F6", outline="#6750A4", width=2)
    draw.text((150, 790), "▣", font=font(28), fill=primary)
    draw.text((205, 795), "18/08/2026 19:30", font=font(25, True), fill=primary)
    rounded(draw, (115, 900, 785, 1000), 28, primary)
    centered(draw, (450, 950), "Elegir fecha y hora", font(26, True), "#FFFFFF")
    draw.text((115, 1095), "Notificación local activada", font=font(23, True), fill="#237A4B")
    draw.text((115, 1140), "Android te avisará en el momento elegido.", font=font(20), fill=muted)
    rounded(draw, (115, 1350, 785, 1445), 28, "#6750A4")
    centered(draw, (450, 1397), "✓  Guardar nota", font(25, True), "#FFFFFF")
    image.save(OUT / "recordatorio.png", optimize=True)


if __name__ == "__main__":
    save_intro()
    save_home()
    save_neon()
    save_reminder()
    print(f"Generated {len(list(OUT.glob('*.png')))} screenshots in {OUT}")
