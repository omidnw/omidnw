#!/usr/bin/env python3
"""Build the 1200×630 sharing card from the same logo used by the site."""
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "client/public"
FONT_DIR = Path("/System/Library/Fonts/Supplemental")
REGULAR = FONT_DIR / "Arial.ttf"
BOLD = FONT_DIR / "Arial Bold.ttf"

with tempfile.TemporaryDirectory(prefix="ork-preview-") as temporary:
    logo = Path(temporary) / "logo.png"
    subprocess.run(["magick", str(PUBLIC / "images/ork-logo.png"), "-trim", "+repage", "-resize", "176x", str(logo)], check=True)
    command = ["magick", "-size", "1200x630", "xc:#080D0E",
               "-fill", "#12312F", "-draw", "rectangle 0,0 1199,7",
               str(logo), "-geometry", "+72+58", "-composite",
               "-gravity", "NorthWest"]
    def text(value, x, y, size, color, bold=False):
        command.extend(["-font", str(BOLD if bold else REGULAR), "-pointsize", str(size),
                        "-fill", color, "-annotate", f"+{x}+{y}", value])
    text("SOFTWARE ENGINEERING · QUALITY AUTOMATION", 72, 194, 18, "#79D8CA")
    text("Omid Reza Keshtkar", 68, 235, 76, "#EDF5F4", True)
    text("Senior Software QA Engineer & Full-Stack Developer", 72, 341, 29, "#C0CFCD")
    text("Reliable software. Intelligent automation.", 72, 400, 25, "#94ABA8")
    command.extend(["-stroke", "#24403D", "-strokewidth", "1", "-draw", "line 72,493 1128,493", "-stroke", "none"])
    text("omidrezakeshtkar.dev", 72, 526, 24, "#79D8CA")
    command.extend(["-colorspace", "sRGB", "-depth", "8", "-quality", "90", "-strip", str(PUBLIC / "images/og-image.jpg")])
    subprocess.run(command, check=True)
