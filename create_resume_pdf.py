#!/usr/bin/env python3
"""
Generate Professional Resume PDF for Matthew Scott
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.pdfgen import canvas
from datetime import datetime

def create_resume():
    """Create professional resume PDF"""
    
    # Create PDF
    pdf_file = "resume.pdf"
    doc = SimpleDocTemplate(pdf_file, pagesize=letter,
                            rightMargin=0.5*inch,
                            leftMargin=0.5*inch,
                            topMargin=0.5*inch,
                            bottomMargin=0.5*inch)
    
    # Container for elements
    story = []
    
    # Styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Title'],
        fontSize=24,
        textColor=colors.HexColor('#1e3a8a'),
        spaceAfter=6,
        alignment=TA_CENTER
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=14,
        textColor=colors.HexColor('#475569'),
        alignment=TA_CENTER,
        spaceAfter=12
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading1'],
        fontSize=14,
        textColor=colors.HexColor('#1e3a8a'),
        spaceAfter=6,
        spaceBefore=12,
        leftIndent=0
    )
    
    project_title_style = ParagraphStyle(
        'ProjectTitle',
        parent=styles['Heading2'],
        fontSize=11,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=3,
        leftIndent=0,
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#334155'),
        alignment=TA_JUSTIFY,
        spaceAfter=6,
        leftIndent=0
    )
    
    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=body_style,
        leftIndent=20,
        bulletIndent=10
    )
    
    # Header
    story.append(Paragraph("Matthew D. Scott", title_style))
    story.append(Paragraph("AI/ML Engineer | Open to Opportunities", subtitle_style))
    
    # Contact info
    contact_info = """
    <para align=center>
    <font color="#475569">502-345-0525 | github.com/guitargnar | jaspermatters.com | Louisville, KY</font>
    </para>
    """
    story.append(Paragraph(contact_info, styles['Normal']))
    story.append(Spacer(1, 0.2*inch))
    
    # Professional Summary
    story.append(Paragraph("PROFESSIONAL SUMMARY", heading_style))
    summary_text = """
    Innovative AI/ML Engineer with demonstrated expertise in building production-scale AI systems, 
    from cutting-edge research prototypes to enterprise-ready applications. Proven track record of 
    developing sophisticated AI solutions across cybersecurity, legal technology, business intelligence, 
    and creative domains. Strong focus on system architecture, deployment automation, and turning complex 
    AI concepts into practical business solutions.
    """
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 0.1*inch))
    
    # Technical Skills
    story.append(Paragraph("TECHNICAL SKILLS", heading_style))
    
    skills = [
        ("AI/ML Frameworks", "Scikit-learn, TensorFlow, PyTorch, NLP, Computer Vision, AI Agents"),
        ("Programming", "Python, JavaScript, Node.js, React, Shell scripting, HTML5/CSS3"),
        ("DevOps & Production", "Docker, CI/CD, API Development, Performance Monitoring, Cloud Deployment"),
        ("Specialized Domains", "Cybersecurity, Legal Tech, Music Technology, Business Intelligence")
    ]
    
    for category, skill_list in skills:
        skill_text = f'<b>{category}:</b> {skill_list}'
        story.append(Paragraph(skill_text, body_style))
    
    story.append(Spacer(1, 0.1*inch))
    
    # Key Projects
    story.append(Paragraph("KEY PROJECTS", heading_style))
    
    projects = [
        {
            "title": "ZIGGY: Metacognitive Evolution Simulator",
            "period": "2024-2025",
            "role": "Lead Developer & AI Researcher",
            "tech": "Python, Advanced ML, Cognitive Modeling, System Architecture",
            "bullets": [
                "Designed cutting-edge AI consciousness research system exploring metacognitive evolution",
                "Developed Theory of Mind modeling with belief system dynamics and cognitive consistency",
                "Impact: Demonstrates deep understanding of AI consciousness and synthetic identity"
            ]
        },
        {
            "title": "Mirador: Enterprise AI Agent System",
            "period": "2024-2025",
            "role": "Principal Engineer",
            "tech": "Python, AI Agents, Business Intelligence, Production DevOps",
            "bullets": [
                "Architected production-scale AI system with 95+ components for business opportunity analysis",
                "Implemented comprehensive ROI tracking and strategic planning automation",
                "Impact: Production-ready enterprise AI system demonstrating scalable architecture"
            ]
        },
        {
            "title": "Security Copilot: AI-Powered Threat Detection",
            "period": "2024",
            "role": "Lead Developer",
            "tech": "Python, Cybersecurity AI, API Development, Real-time Processing",
            "bullets": [
                "Built production phishing detection system with comprehensive API framework",
                "Implemented real-world threat scenario testing for enterprise deployment",
                "Impact: Addresses critical cybersecurity needs with practical AI automation"
            ]
        },
        {
            "title": "LegalStream Platform",
            "period": "2024",
            "role": "Full-Stack Developer",
            "tech": "Node.js, Docker, OCR (Tesseract), Full-Stack Development",
            "bullets": [
                "Developed full-stack legal document processing platform with AI-powered analysis",
                "Integrated OCR technology for automated document digitization and analysis",
                "Impact: Demonstrates full-stack AI application development in legal technology"
            ]
        }
    ]
    
    for project in projects:
        # Project title and period
        title_text = f'<b>{project["title"]}</b> | {project["period"]}'
        story.append(Paragraph(title_text, project_title_style))
        
        # Role and tech
        role_text = f'<i>{project["role"]}</i>'
        story.append(Paragraph(role_text, body_style))
        tech_text = f'Technologies: {project["tech"]}'
        story.append(Paragraph(tech_text, body_style))
        
        # Bullets
        for bullet in project["bullets"]:
            story.append(Paragraph(f'• {bullet}', bullet_style))
        
        story.append(Spacer(1, 0.05*inch))
    
    # Additional Projects
    story.append(Paragraph("ADDITIONAL PROJECTS", heading_style))
    
    additional = [
        "• Enhanced Chord Generator - AI-powered music technology with chord progression generation",
        "• AI Talent Optimizer - Automated talent acquisition and job intelligence system",
        "• FretVision Guitar Visualizer - Creative technology blending music theory with visualization",
        "• JasperMatters Job Intelligence Platform - AI-powered career optimization platform"
    ]
    
    for item in additional:
        story.append(Paragraph(item, bullet_style))
    
    story.append(Spacer(1, 0.1*inch))
    
    # Professional Strengths
    story.append(Paragraph("PROFESSIONAL STRENGTHS", heading_style))
    
    strengths = [
        "• Research to Production: Proven ability to take AI research concepts to production-ready systems",
        "• System Architecture: Expertise in designing scalable, maintainable AI systems with DevOps practices",
        "• Domain Versatility: Success across cybersecurity, legal tech, music technology, and business intelligence",
        "• Enterprise Readiness: Understanding of commercial AI development, IP management, and licensing",
        "• Full-Stack Capability: End-to-end development from AI algorithms to user interfaces"
    ]
    
    for strength in strengths:
        story.append(Paragraph(strength, bullet_style))
    
    # Build PDF
    doc.build(story)
    print(f"✅ Resume PDF created: {pdf_file}")
    
    return pdf_file

if __name__ == "__main__":
    # Check if reportlab is installed
    try:
        import reportlab
        create_resume()
    except ImportError:
        print("Installing reportlab...")
        import subprocess
        subprocess.run(["pip3", "install", "reportlab"], check=True)
        print("Reportlab installed. Creating resume...")
        create_resume()