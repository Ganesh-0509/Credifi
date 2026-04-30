from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.units import inch
from datetime import datetime
import io

def generate_regulator_pdf(fairness_data, summary_data, drift_data, compliance_summary):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.hexColor('#10b981'),
        alignment=1,
        spaceAfter=30
    )
    
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.grey,
        alignment=1,
        spaceAfter=50
    )
    
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.black,
        spaceBefore=20,
        spaceAfter=12
    )

    elements = []

    # --- Cover Page ---
    elements.append(Spacer(1, 2*inch))
    elements.append(Paragraph("Credifi AI Forensic Audit Report", title_style))
    elements.append(Paragraph(f"Institution: {summary_data.get('institution', 'Global Trust Bank')}", subtitle_style))
    elements.append(Paragraph(f"Model Version: 2.0.0 (Neural Node Alpha)", styles['Normal']))
    elements.append(Paragraph(f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    elements.append(Paragraph(f"Audit Scope: Full Forensic Integrity & Bias Analysis", styles['Normal']))
    elements.append(PageBreak())

    # --- Executive Summary ---
    elements.append(Paragraph("1. Executive Summary", header_style))
    elements.append(Paragraph(f"This report provides an automated compliance audit of the Credifi decisioning engine. "
                             f"A total of {summary_data.get('total_applications', 0)} decisions were analyzed. "
                             f"Global approval rate stands at {summary_data.get('approval_rate', 0)*100:.1f}%.", styles['Normal']))
    elements.append(Spacer(1, 12))

    # --- Fairness Metrics Table ---
    elements.append(Paragraph("2. Fairness Metrics Breakdown", header_style))
    elements.append(Paragraph("Industry-standard gaps measured against parity thresholds.", styles['Italic']))
    elements.append(Spacer(1, 12))
    
    m = fairness_data.get('metrics', {})
    fairness_table_data = [
        ['Metric', 'Formula', 'Value', 'Status'],
        ['Demographic Parity', "P(Y'=1|A=a) - P(Y'=1|A=b)", f"{m.get('demographic_parity_difference', 0)*100:.1f}%", 'PASS' if m.get('demographic_parity_difference', 1) < 0.1 else 'FAIL'],
        ['Equal Opportunity', "P(Y'=1|Y=1,A=a) - P(Y'=1|Y=1,A=b)", f"{m.get('true_positive_rate_difference', 0)*100:.1f}%", 'PASS' if m.get('true_positive_rate_difference', 1) < 0.1 else 'FAIL'],
        ['FPR Gap', "P(Y'=1|Y=0,A=a) - P(Y'=1|Y=0,A=b)", f"{m.get('false_positive_rate_difference', 0)*100:.1f}%", 'PASS' if m.get('false_positive_rate_difference', 1) < 0.1 else 'FAIL']
    ]
    
    t = Table(fairness_table_data, colWidths=[1.5*inch, 2.5*inch, 1*inch, 1*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.hexColor('#f3f4f6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (3, 1), (3, -1), colors.whitesmoke),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 24))

    # --- 4/5ths Rule Table ---
    elements.append(Paragraph("3. 4/5ths Rule Compliance Summary", header_style))
    elements.append(Paragraph("Adverse impact analysis for protected attributes.", styles['Italic']))
    elements.append(Spacer(1, 12))
    
    compliance_data = [['Attribute', 'Highest Group', 'Lowest Group', 'Ratio', 'Status']]
    for item in compliance_summary:
        compliance_data.append([
            item.get('attribute'),
            item.get('highest_group'),
            item.get('lowest_group'),
            f"{item.get('ratio', 0)*100:.1f}%",
            item.get('status')
        ])
    
    ct = Table(compliance_data, colWidths=[1*inch, 1.5*inch, 1.5*inch, 1*inch, 1*inch])
    ct.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.hexColor('#f3f4f6')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ]))
    elements.append(ct)
    elements.append(Spacer(1, 24))

    # --- Drift Analysis ---
    elements.append(Paragraph("4. Model Integrity & Drift Analysis", header_style))
    elements.append(Paragraph(f"Detection Status: {drift_data.get('drift_detected', False)}", styles['Normal']))
    elements.append(Paragraph(f"Drift Score: {drift_data.get('drift_score', 0):.4f}", styles['Normal']))
    elements.append(Paragraph(f"Recommendation: {drift_data.get('recommended_action', 'N/A')}", styles['Normal']))
    elements.append(Spacer(1, 12))
    
    psi_data = [['Feature', 'PSI Value', 'Alert Status']]
    for f, psi in drift_data.get('details', {}).get('feature_psi', {}).items():
        psi_data.append([f, f"{psi:.4f}", 'SHIFTING' if psi > 0.1 else 'STABLE'])
    
    pt = Table(psi_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch])
    pt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.hexColor('#f3f4f6')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    elements.append(pt)
    elements.append(PageBreak())

    # --- Appendix ---
    elements.append(Paragraph("Appendix: Methodology", header_style))
    elements.append(Paragraph("<b>Demographic Parity:</b> Ensures that the probability of a positive outcome is independent of a protected attribute. We measure the absolute difference in approval rates.", styles['Normal']))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("<b>Equal Opportunity:</b> Measures parity in True Positive Rates (Recall). This ensures that qualified members of all groups are approved at similar rates.", styles['Normal']))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("<b>Population Stability Index (PSI):</b> Quantifies how much a variable has shifted in distribution between two samples. PSI > 0.1 indicates moderate drift; PSI > 0.25 indicates significant drift.", styles['Normal']))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("<b>SHAP (SHapley Additive exPlanations):</b> A game-theoretic approach to explain individual neural outputs by attributing the impact of each input feature to the final probability.", styles['Normal']))

    doc.build(elements)
    buffer.seek(0)
    return buffer
