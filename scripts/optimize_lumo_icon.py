from pathlib import Path

from PIL import Image


SOURCE = Path("/home/ubuntu/webdev-static-assets/lumo-notes-icon.png")
TARGETS = {
    Path("/home/ubuntu/lumo-notes/assets/images/icon.png"): 1024,
    Path("/home/ubuntu/lumo-notes/assets/images/android-icon-foreground.png"): 1024,
    Path("/home/ubuntu/lumo-notes/assets/images/splash-icon.png"): 768,
    Path("/home/ubuntu/lumo-notes/assets/images/favicon.png"): 256,
}


def save_optimized(source: Image.Image, destination: Path, side: int) -> None:
    resized = source.resize((side, side), Image.Resampling.LANCZOS)
    palette = resized.quantize(colors=256, method=Image.Quantize.MEDIANCUT)
    palette.save(destination, format="PNG", optimize=True, compress_level=9)


def main() -> None:
    with Image.open(SOURCE) as original:
        source = original.convert("RGB")
        for destination, side in TARGETS.items():
            save_optimized(source, destination, side)
            print(f"{destination.name}: {destination.stat().st_size} bytes")


if __name__ == "__main__":
    main()
