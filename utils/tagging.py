import os
from fpdf import FPDF

def generate_report(tags, output_path):
    """
    Generate a PDF report for the tennis serve analysis.
    
    Args:
    - tags: A dictionary of tags and their corresponding values.
    - output_path: Path to save the generated PDF report.
    """
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    pdf.cell(200, 10, txt="Tennis Serve Analysis Report", ln=True, align='C')
    pdf.ln(10)
    
    for tag, value in tags.items():
        pdf.cell(200, 10, txt=f"{tag}: {value}", ln=True, align='L')
    
    pdf.output(output_path)
    print(f"Report saved to {output_path}")
