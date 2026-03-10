from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Image
import os
from datetime import datetime

def export_feedback_pdf(feedback, output_path="serve_feedback.pdf"):
    # Create a PDF with A4 size
    doc = SimpleDocTemplate(output_path, pagesize=A4,
                            rightMargin=40, leftMargin=40,
                            topMargin=60, bottomMargin=40)

    styles = getSampleStyleSheet()
    story = []

    # Add logo from assets
    logo_path = os.path.join("assets", "Logo.png")
    if os.path.exists(logo_path):
        img = Image(logo_path, width=120, height=60)
        story.append(img)
        story.append(Spacer(1, 20))

    # Title
    story.append(Paragraph("<b>Tennis Serve Analyzer - Phase-wise Feedback</b>", styles['Title']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"<i>Exported on: {datetime.now().strftime('%d %b %Y %H:%M')}</i>", styles['Normal']))
    story.append(Spacer(1, 24))

    # Format feedback by phase
    for section in feedback.split("\n\n"):
        lines = section.strip().splitlines()
        if not lines:
            continue
        title = lines[0]
        content = "\n".join(lines[1:])
        story.append(Paragraph(f"<b>{title}</b>", styles['Heading3']))
        story.append(Spacer(1, 6))
        story.append(Paragraph(content.replace("\n", "<br/>"), styles['Normal']))
        story.append(Spacer(1, 12))

    # Build PDF
    doc.build(story)
