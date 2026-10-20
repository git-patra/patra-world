"""Generate the detailed two-page software engineering CV; requires ReportLab."""
from pathlib import Path

import reportlab
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer,
)

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "output/pdf/Anugrah-Patra-Resume-2026.pdf"
INK = colors.HexColor("#182638")
MUTED = colors.HexColor("#536174")
ACCENT = colors.HexColor("#24577D")

# Embed ReportLab's bundled fonts for consistent rendering across PDF viewers.
FONT_DIR = Path(reportlab.__file__).resolve().parent / "fonts"
pdfmetrics.registerFont(TTFont("CVSans", str(FONT_DIR / "Vera.ttf")))
pdfmetrics.registerFont(TTFont("CVSans-Bold", str(FONT_DIR / "VeraBd.ttf")))
pdfmetrics.registerFontFamily("CVSans", normal="CVSans", bold="CVSans-Bold")

styles = {
    "name": ParagraphStyle("Name", fontName="CVSans-Bold", fontSize=25, leading=29, textColor=INK),
    "role": ParagraphStyle("Role", fontName="CVSans", fontSize=11.5, leading=16, textColor=ACCENT),
    "contact": ParagraphStyle("Contact", fontName="CVSans", fontSize=9, leading=13, textColor=MUTED),
    "section": ParagraphStyle("Section", fontName="CVSans-Bold", fontSize=9.5, leading=13, textColor=ACCENT, spaceBefore=11, spaceAfter=4),
    "body": ParagraphStyle("Body", fontName="CVSans", fontSize=9.5, leading=13.5, textColor=INK, spaceAfter=3),
    "job": ParagraphStyle("Job", fontName="CVSans-Bold", fontSize=10, leading=14, textColor=INK, spaceAfter=2),
    "detail": ParagraphStyle("Detail", fontName="CVSans", fontSize=8.8, leading=12.5, textColor=MUTED, spaceAfter=5),
    "bullet": ParagraphStyle("Bullet", fontName="CVSans", fontSize=9.4, leading=13.5, textColor=INK, leftIndent=9, firstLineIndent=-8, spaceAfter=3),
    "skills": ParagraphStyle("Skills", fontName="CVSans", fontSize=9, leading=13, textColor=INK, spaceAfter=3),
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


def job(title, company, dates, bullets, stack=None):
    # Linear text flow keeps roles, dates and descriptions in reading order.
    block = [
        para(f"{title} | {company}", "job"),
        para(dates, "detail"),
        *[para("- " + t, "bullet") for t in bullets],
    ]
    if stack:
        block.append(para("<b>Technologies:</b> " + stack, "detail"))
    story.append(KeepTogether(block))
    story.append(Spacer(1, 7))


add("ANUGRAH PATRA", "name")
add("Software Engineer", "role")
story.append(Spacer(1, 5))
add("Bandung, Indonesia  |  +62 821-1716-0084  |  anugrahpatra.24@gmail.com", "contact")
add(
    '<link href="https://patraworld.site/" color="#24577D">patraworld.site</link>'
    '  |  <link href="https://orenpos.store/" color="#24577D">orenpos.store</link>',
    "contact",
)

section("PROFESSIONAL SUMMARY")
add(
    "Software Engineer experienced in web applications, fintech, ERP, and "
    "distributed systems. Focused on real-time chat, Ethereum/Alchemy integration, and browser "
    "mini-games, from UI and design systems to backend services, testing, and deployment. "
    "Also build and operate a POS product for F&amp;B businesses."
)

section("TECHNICAL SKILLS")
add(
    "<b>Languages &amp; backend:</b> Go, Java, Node.js, TypeScript, PHP, Spring Boot, NestJS, Laravel<br/>"
    "<b>Frontend &amp; games:</b> React, Next.js, Flutter, Cocos Creator, PixiJS, Tailwind CSS, design systems<br/>"
    "<b>Architecture &amp; messaging:</b> Microservices, event-driven architecture, REST, gRPC, WebSocket, "
    "Protobuf, Kafka, RabbitMQ, OpenIM<br/>"
    "<b>Data &amp; delivery:</b> PostgreSQL, MySQL, MongoDB, Redis, Git, Docker, Kubernetes, GitHub Actions, GCP, AWS<br/>"
    "<b>Web3 &amp; observability:</b> Ethereum, Alchemy, smart-contract integration, OpenTelemetry, Prometheus, Grafana<br/>"
    "<b>Quality:</b> Unit, integration, smoke, and end-to-end testing",
    "skills",
)

section("PROFESSIONAL EXPERIENCE")
job("Full Stack Engineer", "PT Citra International Digital", "Nov 2025 - Present", [
    "Built chat application features with Go and OpenIM, connecting mobile and web clients through REST, gRPC, and WebSocket; used Kafka for service communication and event handling.",
    "Integrated Ethereum features through Alchemy APIs, including wallet flows, transaction processing, and smart-contract interaction.",
    "Developed browser mini-games end-to-end, covering gameplay logic, UI design, Go backend services, React/TypeScript frontends, and release preparation.",
    "Connected game clients and services through REST, WebSocket, and Protobuf, using PostgreSQL and Redis in the backend.",
    "Created a shared design system and reusable UI components to keep game interfaces, interaction states, and responsive layouts consistent.",
    "Debugged client/server integration and validated releases with smoke, integration, and end-to-end tests in Docker-based environments.",
])
job("Backend Engineer", "Paper.id", "Jan 2023 - Oct 2025", [
    "Built and maintained backend capabilities for PaperCard, Horizon Card, Pioneer Card, e-Meterai, Open API, and client-specific financial workflows.",
    "Integrated BRI, CIMB, and Ayoconnect, and customized invoicing workflows for Kopi Kenangan through external API and service integrations.",
    "Developed microservices, multi-step approval flows, and reusable REST APIs to support client automation and connected financial records.",
    "Improved database queries, API contracts, failure handling, and cross-service data consistency; investigated integration issues by tracing requests across services.",
    "Worked with product, QA, and DevOps on requirements, code reviews, testing, release verification, and production issue resolution.",
])

story.append(PageBreak())
section("PROFESSIONAL EXPERIENCE (CONTINUED)")
job("Senior Backend Developer", "PT Eigen Tri Mathema", "Jan 2021 - Jan 2023", [
    "Built backend microservices and REST APIs for multi-module ERP applications, translating business workflows into services, data models, and module integrations.",
    "Contributed to system architecture, database-query optimization, and performance tuning, with attention to data consistency across business processes.",
    "Reviewed code, documented implementation decisions, and guided junior developers on backend development and maintainable service patterns.",
    "Collaborated with frontend, QA, and DevOps on implementation, defect investigation, regression checks, and release follow-up.",
], "Microservices, REST APIs, SQL, data modeling, system architecture")
job("Web Developer", "Freelance", "Apr 2020 - Dec 2020", [
    "Built web applications for small businesses and university projects, including responsive interfaces, content management, authentication, forms, and database-backed workflows.",
    "Managed requirements, implementation, domain and hosting setup, database configuration, deployment, and post-launch maintenance.",
])
job("IT Support", "PT Kurnia Parama Adhara", "Jul 2018 - Feb 2020", [
    "Maintained PCs, routers, printers, local networks, and ERP applications; diagnosed hardware and software issues and supported daily operations.",
    "Handled software installation, equipment setup, upgrades, preventive maintenance, and documentation of recurring issues and resolutions.",
])

section("PERSONAL PROJECTS")
job("Founder &amp; Full Stack Engineer", "Oren POS / Jajaneun Chili Oil", "Active project", [
    "Built a POS platform covering sales, inventory, product and stock management, cashier operations, and reporting for day-to-day F&amp;B workflows.",
    "Delivered web and mobile experiences with React, Next.js, and Flutter, including operational dashboards and cross-platform cashier workflows.",
    "Maintain and deploy the platform while operating Jajaneun Chili Oil, using direct business feedback to prioritize improvements and validate features.",
], "React, Next.js, Flutter")
job("Developer", "Patra World", "Personal portfolio", [
    "Built an explorable portfolio with a walkable Canvas 2D world, project showcases, and a playable football mini-game using React, Tailwind CSS, and shadcn/ui.",
    "Implemented game interaction states and responsive controls; packaged the site for static hosting and deployed it through versioned SSH releases.",
])

section("EDUCATION & CERTIFICATION")
add(
    "<b>Bachelor's Degree, Information Systems (in progress)</b> | Universitas Terbuka | Jul 2023 - Present<br/>"
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
