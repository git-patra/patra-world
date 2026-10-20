"""Generate the concise software engineering CV; requires ReportLab."""
from pathlib import Path

import reportlab
from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable, KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "output/pdf/Anugrah-Patra-Resume-2026.pdf"
INK = colors.HexColor("#182638")
MUTED = colors.HexColor("#536174")
ACCENT = colors.HexColor("#24577D")
WIDTH = A4[0] - 92  # Document margins plus the frame's internal padding.

# Embed ReportLab's bundled fonts for consistent rendering across PDF viewers.
FONT_DIR = Path(reportlab.__file__).resolve().parent / "fonts"
pdfmetrics.registerFont(TTFont("CVSans", str(FONT_DIR / "Vera.ttf")))
pdfmetrics.registerFont(TTFont("CVSans-Bold", str(FONT_DIR / "VeraBd.ttf")))
pdfmetrics.registerFontFamily("CVSans", normal="CVSans", bold="CVSans-Bold")

styles = {
    "name": ParagraphStyle("Name", fontName="CVSans-Bold", fontSize=25, leading=29, textColor=INK),
    "role": ParagraphStyle("Role", fontName="CVSans", fontSize=11.5, leading=16, textColor=ACCENT),
    "contact": ParagraphStyle("Contact", fontName="CVSans", fontSize=9, leading=13, textColor=MUTED),
    "section": ParagraphStyle("Section", fontName="CVSans-Bold", fontSize=9, leading=12, textColor=ACCENT, spaceBefore=12, spaceAfter=4),
    "body": ParagraphStyle("Body", fontName="CVSans", fontSize=9.5, leading=13.5, textColor=INK, spaceAfter=3),
    "job": ParagraphStyle("Job", fontName="CVSans-Bold", fontSize=9.5, leading=13, textColor=INK),
    "date": ParagraphStyle("Date", fontName="CVSans", fontSize=8.3, leading=13, textColor=MUTED, alignment=TA_RIGHT),
    "bullet": ParagraphStyle("Bullet", fontName="CVSans", fontSize=9.3, leading=13, textColor=INK, leftIndent=9, firstLineIndent=-8, spaceAfter=2.5),
}
story = []


def para(text, style="body"):
    return Paragraph(text, styles[style])


def add(text, style="body"):
    story.append(para(text, style))


def section(title):
    story.append(KeepTogether([
        para(title, "section"),
        HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#D7DFE7"), spaceAfter=6),
    ]))


def job(title, company, dates, bullets):
    heading = Table(
        [[para(f"{title} | {company}", "job"), para(dates, "date")]],
        colWidths=[WIDTH - 120, 120],
    )
    heading.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(KeepTogether([heading, *[para("- " + t, "bullet") for t in bullets]]))
    story.append(Spacer(1, 6))


add("ANUGRAH PATRA", "name")
add("Software Engineer", "role")
story.append(Spacer(1, 5))
add("Bandung, Indonesia  |  +62 821-1716-0084  |  anugrahpatra.24@gmail.com", "contact")
add(
    '<link href="https://patraworld.site/" color="#24577D">patraworld.site</link>'
    '  |  <link href="https://orenpos.store/" color="#24577D">orenpos.store</link>',
    "contact",
)

section("PROFILE")
add(
    "Software Engineer with experience across web applications, backend services, fintech, "
    "and ERP. Currently focused on chat applications, Ethereum integrations, and browser "
    "mini-games, with hands-on delivery from UI design to implementation and deployment."
)

section("CORE SKILLS")
add(
    "<b>Backend:</b> Go, Java, Node.js, REST APIs, PostgreSQL, MySQL, Redis<br/>"
    "<b>Frontend &amp; games:</b> TypeScript, React, Next.js, Tailwind CSS, design systems<br/>"
    "<b>Integration &amp; delivery:</b> OpenIM, WebSocket, Ethereum, Alchemy, Git, Docker"
)

section("EXPERIENCE")
job("Full Stack Engineer", "PT Citra International Digital", "Nov 2025 - Present", [
    "Built chat application features and services using OpenIM, Go, and WebSocket.",
    "Integrated Ethereum functionality into applications using Alchemy APIs.",
    "Built browser mini-games end-to-end, from gameplay and UI design to frontend, backend, testing, and deployment.",
    "Created a shared design system and reusable UI components for consistent game interfaces.",
])
job("Backend Engineer", "Paper.id", "Jan 2023 - Oct 2025", [
    "Developed backend services for PaperCard, Horizon Card, Pioneer Card, and Open API.",
    "Integrated BRI, CIMB, and Ayoconnect, and customized invoicing workflows for Kopi Kenangan.",
    "Built approval workflows and maintained APIs for financial and invoicing products.",
])
job("Senior Backend Developer", "PT Eigen Tri Mathema", "Jan 2021 - Jan 2023", [
    "Built ERP backend services, APIs, and integrations across business modules.",
    "Contributed to backend architecture, database query improvements, and code reviews.",
])
job("Web Developer", "Freelance", "Apr 2020 - Dec 2020", [
    "Built and deployed custom web applications for small businesses and university projects.",
])
job("IT Support", "PT Kurnia Parama Adhara", "Jul 2018 - Feb 2020", [
    "Maintained computers, local networks, and ERP applications; resolved day-to-day user issues.",
])

section("PERSONAL PROJECTS")
add(
    "<b>Oren POS</b> - Built a POS platform for F&amp;B operations, covering sales, inventory, "
    "cashier workflows, and reporting. Used in my Jajaneun Chili Oil business."
)
add(
    "<b>Patra World</b> - Built an explorable portfolio with a walkable world and a playable "
    "football mini-game."
)

section("EDUCATION & CERTIFICATION")
add(
    "<b>Information Systems</b> | Universitas Terbuka | Jul 2023 - Present<br/>"
    "<b>Computer Networking</b> | SMKN 4 Padalarang | Jul 2015 - May 2018<br/>"
    "<b>MTCNA</b> | MikroTik Certified Network Associate | 2017"
)


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("CVSans", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(40, 21, "Anugrah Patra | Software Engineer")
    canvas.drawRightString(A4[0] - 40, 21, str(doc.page))
    canvas.restoreState()


OUT.parent.mkdir(parents=True, exist_ok=True)
SimpleDocTemplate(
    str(OUT), pagesize=A4, leftMargin=40, rightMargin=40, topMargin=33,
    bottomMargin=35, title="Anugrah Patra - Software Engineer",
    author="Anugrah Patra", subject="Software engineering resume",
).build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
