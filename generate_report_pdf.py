import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Suppress headers and footers on cover page
            return
        
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#4A5568"))

        # Running Header
        self.drawString(54, 11 * 72 - 36, "WorkPulse — Full-Stack Internship Project Report")
        self.setStrokeColor(colors.HexColor("#CBD5E0"))
        self.setLineWidth(0.5)
        self.line(54, 11 * 72 - 42, 8.5 * 72 - 54, 11 * 72 - 42)

        # Running Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * 72 - 54, 36, page_text)
        self.drawString(54, 36, "Confidential — WorkPulse Management System")
        self.line(54, 48, 8.5 * 72 - 54, 48)

        self.restoreState()

def build_pdf(filename="WorkPulse_Internship_Project_Report.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#1E3A8A")   # Deep Navy
    secondary_color = colors.HexColor("#2563EB") # Royal Blue
    dark_neutral = colors.HexColor("#1F2937")    # Charcoal
    light_bg = colors.HexColor("#F3F4F6")        # Light Gray
    accent_green = colors.HexColor("#059669")

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=primary_color,
        spaceAfter=12
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=16,
        leading=22,
        textColor=secondary_color,
        spaceAfter=24
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=primary_color,
        spaceBefore=16,
        spaceAfter=10,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=secondary_color,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=dark_neutral,
        spaceAfter=8
    )

    body_bold = ParagraphStyle(
        'BodyDarkBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    code_style = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#1F2937"),
        backColor=colors.HexColor("#F1F5F9"),
        borderColor=colors.HexColor("#E2E8F0"),
        borderWidth=0.5,
        borderPadding=6,
        spaceBefore=6,
        spaceAfter=8
    )

    story = []

    # ================= COVER PAGE =================
    story.append(Spacer(1, 40))
    story.append(Paragraph("INTERNSHIP PROJECT REPORT", ParagraphStyle('SubHeaderTag', fontName='Helvetica-Bold', fontSize=12, textColor=accent_green, spaceAfter=8)))
    story.append(Paragraph("WorkPulse: Enterprise Employee Management System", title_style))
    story.append(Paragraph("A Full-Stack Cloud-Native Human Resource & Workforce Operations Platform", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=3, color=primary_color, spaceAfter=30))

    meta_data = [
        [Paragraph("<b>Project Domain:</b>", body_style), Paragraph("Enterprise Full-Stack Web Development & Operations", body_style)],
        [Paragraph("<b>Technology Stack:</b>", body_style), Paragraph("Spring Boot 3, Java 17, PostgreSQL, React 18, Material UI, Docker", body_style)],
        [Paragraph("<b>Architecture:</b>", body_style), Paragraph("RESTful Micro-Ready Monolith + SPA + Cloud Micro-Services", body_style)],
        [Paragraph("<b>Cloud Infrastructure:</b>", body_style), Paragraph("Render (Backend & Database) + Vercel (Frontend Hosting)", body_style)],
        [Paragraph("<b>GitHub Repository:</b>", body_style), Paragraph("<u>https://github.com/Agrim027/WorkPulse-Employee-Management-System</u>", body_style)],
        [Paragraph("<b>Production URL:</b>", body_style), Paragraph("<u>https://workpulse-em-system.vercel.app</u>", body_style)],
        [Paragraph("<b>Backend API Endpoint:</b>", body_style), Paragraph("<u>https://workpulse-backend-c6a7.onrender.com/api/v1</u>", body_style)],
        [Paragraph("<b>Document Version:</b>", body_style), Paragraph("1.0.0 (Final Internship Submission)", body_style)],
    ]
    t_meta = Table(meta_data, colWidths=[140, 364])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_bg),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LINEBELOW', (0,0), (-1,-2), 0.5, colors.HexColor("#E5E7EB")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#D1D5DB")),
    ]))
    story.append(t_meta)

    story.append(Spacer(1, 40))
    story.append(Paragraph("<b>Author / Intern:</b> Software Engineering Intern", body_style))
    story.append(Paragraph("<b>Submission Date:</b> August 19, 2026", body_style))
    story.append(Paragraph("<b>Status:</b> Production Live & Fully Verified", body_style))

    story.append(PageBreak())

    # ================= EXECUTIVE SUMMARY =================
    story.append(Paragraph("1. Executive Summary", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=secondary_color, spaceAfter=12))
    story.append(Paragraph(
        "<b>WorkPulse</b> is a cloud-native, full-stack enterprise Employee Management System (EMS) designed to streamline corporate human resource workflows, organizational structure management, daily attendance logging, and monthly payroll operations.",
        body_style
    ))
    story.append(Paragraph(
        "During this internship, the primary objective was to architect, develop, containerize, and deploy a production-grade Web application leveraging <b>Spring Boot 3 (Java 17)</b> for backend services, <b>Render PostgreSQL</b> for persistent data storage, and <b>React 18 (Vite + Material UI)</b> for a responsive Single Page Application (SPA) frontend interface.",
        body_style
    ))
    story.append(Paragraph(
        "The application incorporates industry-standard security practices, including JWT-based Stateless Authentication, Role-Based Access Control (RBAC with <code>ROLE_ADMIN</code>, <code>ROLE_HR</code>, and <code>ROLE_EMPLOYEE</code>), strict CORS origin pattern matching, automated programmatic database seeding, and production Single Page Application routing fallbacks on Vercel.",
        body_style
    ))

    # Highlights table
    summary_data = [
        [Paragraph("<b>Key Highlight</b>", body_bold), Paragraph("<b>Implementation Summary</b>", body_bold)],
        [Paragraph("Role-Based Access Control", body_style), Paragraph("Granular authorization enforcing Admin, HR, and Employee privileges across UI & APIs.", body_style)],
        [Paragraph("Department Management", body_style), Paragraph("CRUD operations for department structures, codes, and organizational units.", body_style)],
        [Paragraph("Attendance Tracking", body_style), Paragraph("Self-service Check-In/Check-Out, daily logging, multi-criteria filtering, and status chips.", body_style)],
        [Paragraph("Payroll & Compensation", body_style), Paragraph("Automatic Net Salary calculations (Basic + Allowances - Deductions) and monthly slip management.", body_style)],
        [Paragraph("Cloud CI/CD & Hosting", body_style), Paragraph("Automated builds via Render Docker containers and Vercel static asset deployment.", body_style)]
    ]
    t_summary = Table(summary_data, colWidths=[150, 354])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    for i in range(1, len(summary_data)):
        if i % 2 == 0:
            t_summary.setStyle(TableStyle([('BACKGROUND', (0, i), (-1, i), light_bg)]))
    story.append(t_summary)
    story.append(Spacer(1, 14))

    # ================= SYSTEM ARCHITECTURE =================
    story.append(Paragraph("2. System Architecture & Tech Stack", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=secondary_color, spaceAfter=12))
    story.append(Paragraph(
        "WorkPulse follows a classic multi-tier client-server architecture cleanly separating presentation, business logic, security, and persistence layers:",
        body_style
    ))

    tech_stack_data = [
        [Paragraph("<b>Layer</b>", body_bold), Paragraph("<b>Technology Selection</b>", body_bold), Paragraph("<b>Key Responsibilities</b>", body_bold)],
        [Paragraph("Frontend (Client)", body_style), Paragraph("React 18, Vite, Material UI (MUI v5), Axios, React Router 6", body_style), Paragraph("Single Page Application (SPA), state management, responsive UI dashboards, JWT storage.", body_style)],
        [Paragraph("Backend (API)", body_style), Paragraph("Java 17, Spring Boot 3.x, Spring Data JPA, Lombok", body_style), Paragraph("RESTful APIs, business validation, DTO mapping, pagination, transactions.", body_style)],
        [Paragraph("Security Layer", body_style), Paragraph("Spring Security 6, JJWT (io.jsonwebtoken 0.11.5), BCrypt", body_style), Paragraph("Stateless authentication, Bearer JWT validation, password hashing, CORS filters.", body_style)],
        [Paragraph("Database", body_style), Paragraph("Render PostgreSQL (Managed Service)", body_style), Paragraph("Relational data storage, foreign key constraints, transactional consistency.", body_style)],
        [Paragraph("DevOps & Cloud", body_style), Paragraph("Docker, Render Web Services, Vercel Edge Network", body_style), Paragraph("Multi-stage container builds, automated Git push deployments, SPA rewrite routing.", body_style)],
    ]
    t_stack = Table(tech_stack_data, colWidths=[100, 180, 224])
    t_stack.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), secondary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    for i in range(1, len(tech_stack_data)):
        if i % 2 == 0:
            t_stack.setStyle(TableStyle([('BACKGROUND', (0, i), (-1, i), light_bg)]))
    story.append(t_stack)
    story.append(Spacer(1, 14))

    # ================= CORE MODULES =================
    story.append(Paragraph("3. Core Modules & Key Features", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=secondary_color, spaceAfter=12))

    story.append(Paragraph("3.1 Role-Based Operational Dashboards", h2_style))
    story.append(Paragraph(
        "WorkPulse presents tailored dashboard views depending on user authorities:",
        body_style
    ))
    story.append(Paragraph("• <b>Admin / HR Dashboard:</b> Displays organization-wide summaries including Total Employees (Active vs Terminated count), Department structural metrics, monthly payroll totals, and company-wide attendance breakdown (Present, Absent, Leave). Uses <code>GET /api/v1/dashboard/summary</code>.", body_style))
    story.append(Paragraph("• <b>Employee Personal Dashboard:</b> Displays personal quick-action Check-In / Check-Out triggers, recent attendance history, and personal salary slip summaries using <code>GET /api/v1/dashboard/my-summary</code>.", body_style))

    story.append(Paragraph("3.2 Department Management Module", h2_style))
    story.append(Paragraph(
        "Allows administrators and HR managers to define organizational departments (e.g., Engineering, Human Resources, Finance). Enforces unique department codes, description fields, and referential integrity protection to prevent deletion of departments currently assigned to active employees.",
        body_style
    ))

    story.append(Paragraph("3.3 Employee Profile Directory", h2_style))
    story.append(Paragraph(
        "Centralized directory managing employee personal information (Name, Email, Phone, DOB, Gender, Address), employment details (Employee Code, Department, Joining Date), and employment status (<code>ACTIVE</code>, <code>INACTIVE</code>, <code>ON_LEAVE</code>, <code>TERMINATED</code>). Supports full-text search, department filtering, pagination, and soft deletion to preserve historical payroll data.",
        body_style
    ))

    story.append(Paragraph("3.4 Attendance & Daily Time Tracking", h2_style))
    story.append(Paragraph(
        "Supports self-service employee Check-In / Check-Out for the current date, as well as HR administrative logging. Features single-date, date-range, and status filtering (<code>PRESENT</code>, <code>ABSENT</code>, <code>HALF_DAY</code>, <code>LEAVE</code>).",
        body_style
    ))

    story.append(Paragraph("3.5 Payroll & Compensation Management", h2_style))
    story.append(Paragraph(
        "Enables HR administrators to generate monthly salary slips for employees with Basic Salary, Allowances, and Deductions. Net Salary is authoritatively calculated on the backend as <code>Basic + Allowances - Deductions</code>. Supports payment status tracking (<code>PENDING</code>, <code>PAID</code>, <code>CANCELLED</code>).",
        body_style
    ))

    story.append(PageBreak())

    # ================= DATABASE DESIGN =================
    story.append(Paragraph("4. Database Schema & Data Models", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=secondary_color, spaceAfter=12))
    story.append(Paragraph(
        "The relational database schema is structured around 6 key JPA entities connected via foreign key relationships:",
        body_style
    ))

    db_entities_data = [
        [Paragraph("<b>Entity Name</b>", body_bold), Paragraph("<b>Table Name</b>", body_bold), Paragraph("<b>Primary Keys & Foreign Keys</b>", body_bold), Paragraph("<b>Key Attributes & Enum Constraints</b>", body_bold)],
        [Paragraph("User", body_style), Paragraph("users", body_style), Paragraph("PK: id<br/>FK: user_roles (M2M)", body_style), Paragraph("username (unique), email (unique), password (BCrypt), enabled.", body_style)],
        [Paragraph("Role", body_style), Paragraph("roles", body_style), Paragraph("PK: id", body_style), Paragraph("name (ERole: ROLE_ADMIN, ROLE_HR, ROLE_EMPLOYEE), description.", body_style)],
        [Paragraph("Department", body_style), Paragraph("departments", body_style), Paragraph("PK: id", body_style), Paragraph("department_code (unique), name, description, created_at.", body_style)],
        [Paragraph("Employee", body_style), Paragraph("employees", body_style), Paragraph("PK: id<br/>FK: user_id (1to1), department_id (Mto1)", body_style), Paragraph("employee_code (unique), first_name, last_name, email, employment_status.", body_style)],
        [Paragraph("Attendance", body_style), Paragraph("attendances", body_style), Paragraph("PK: id<br/>FK: employee_id (Mto1)", body_style), Paragraph("attendance_date, check_in, check_out, status (EAttendanceStatus), remarks.", body_style)],
        [Paragraph("Salary", body_style), Paragraph("salaries", body_style), Paragraph("PK: id<br/>FK: employee_id (Mto1)", body_style), Paragraph("salary_month, basic_salary, allowances, deductions, net_salary, payment_status.", body_style)],
    ]
    t_db = Table(db_entities_data, colWidths=[80, 80, 150, 194])
    t_db.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('PADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    for i in range(1, len(db_entities_data)):
        if i % 2 == 0:
            t_db.setStyle(TableStyle([('BACKGROUND', (0, i), (-1, i), light_bg)]))
    story.append(t_db)
    story.append(Spacer(1, 14))

    # ================= TECHNICAL CHALLENGES & RESOLUTIONS =================
    story.append(Paragraph("5. Key Engineering Challenges & Solutions Resolved", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=secondary_color, spaceAfter=12))

    challenges_data = [
        [Paragraph("<b>Challenge / Problem</b>", body_bold), Paragraph("<b>Root Cause Analysis</b>", body_bold), Paragraph("<b>Resolution Implemented</b>", body_bold)],
        [
            Paragraph("<b>Production CORS Preflight Failure</b>", body_style),
            Paragraph("Chrome blocked login requests due to strict single-origin mismatch between Vercel dynamic preview URLs and Render backend.", body_style),
            Paragraph("Updated <code>CorsConfig.java</code> to parse comma-separated origins and use <code>setAllowedOriginPatterns</code> for pattern matching (<code>https://*.vercel.app</code>). Explicitly permitted <code>HTTP OPTIONS</code> in <code>SecurityConfig.java</code>.", body_style)
        ],
        [
            Paragraph("<b>Vercel SPA 404 Route Errors</b>", body_style),
            Paragraph("Direct navigation or refreshing routes like <code>/dashboard</code> or <code>/login</code> returned Vercel 404 because static file server looked for real directory files.", body_style),
            Paragraph("Created <code>frontend/vercel.json</code> specifying clean SPA rewrite rules directing all dynamic route requests back to <code>/index.html</code>.", body_style)
        ],
        [
            Paragraph("<b>Admin User Role Assignment</b>", body_style),
            Paragraph("Default registration assigned <code>ROLE_EMPLOYEE</code> to user <code>admin</code>, blocking access to the Admin Dashboard.", body_style),
            Paragraph("Created <code>DataInitializer.java</code> implementing <code>CommandLineRunner</code> to automatically seed roles and upgrade <code>admin</code> to <code>ROLE_ADMIN</code> on backend boot. Updated <code>AuthServiceImpl</code> for registration.", body_style)
        ],
        [
            Paragraph("<b>Department Creation Table Refresh Bug</b>", body_style),
            Paragraph("UI showed 'Department created successfully' toast but table rendered 'No departments found' because code evaluated <code>res.data.content</code> instead of <code>res.data.data</code>.", body_style),
            Paragraph("Systemically refactored all frontend pages and modals to safely unpack <code>res.data.data</code> from the backend's standard <code>ApiResponse</code> container.", body_style)
        ],
    ]
    t_chal = Table(challenges_data, colWidths=[120, 180, 204])
    t_chal.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), secondary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    for i in range(1, len(challenges_data)):
        if i % 2 == 0:
            t_chal.setStyle(TableStyle([('BACKGROUND', (0, i), (-1, i), light_bg)]))
    story.append(t_chal)
    story.append(Spacer(1, 14))

    # ================= DEPLOYMENT & CI/CD =================
    story.append(Paragraph("6. Production Deployment & Cloud Infrastructure", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=secondary_color, spaceAfter=12))

    story.append(Paragraph("6.1 Backend Docker Containerization", h2_style))
    story.append(Paragraph(
        "The Spring Boot backend utilizes a multi-stage <code>Dockerfile</code> to optimize image size and build speed:",
        body_style
    ))
    code_text = """# Stage 1: Build JAR using Maven
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

# Stage 2: Minimal Execution Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]"""
    story.append(Paragraph(code_text.replace('\n', '<br/>').replace(' ', '&nbsp;'), code_style))

    story.append(Paragraph("6.2 Cloud Deployment Verification", h2_style))
    story.append(Paragraph("• <b>Production Backend Service:</b> <u>https://workpulse-backend-c6a7.onrender.com</u> (Render Web Service)", body_style))
    story.append(Paragraph("• <b>Managed Production Database:</b> Render PostgreSQL Service named <code>workpulse-db</code>", body_style))
    story.append(Paragraph("• <b>Production Frontend Application:</b> <u>https://workpulse-em-system.vercel.app</u> (Vercel Global CDN)", body_style))

    story.append(Spacer(1, 10))

    # ================= CONCLUSION & LEARNINGS =================
    story.append(Paragraph("7. Conclusion & Future Scope", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=secondary_color, spaceAfter=12))
    story.append(Paragraph(
        "The WorkPulse Internship Project successfully met all deliverables, resulting in a production-ready, cloud-deployed Employee Management System. Key takeaways include mastering multi-tier architecture design, securing Spring Boot applications with stateless JWT and CORS policies, containerizing Java micro-services with Docker, and building production React SPAs withMaterial UI.",
        body_style
    ))

    story.append(Paragraph("<b>Future Roadmap Enhancements:</b>", body_bold))
    story.append(Paragraph("1. <b>Automated Payslip PDF Downloads:</b> Allow employees to download PDF salary slips directly from their dashboard.", body_style))
    story.append(Paragraph("2. <b>Leave Application Workflow:</b> Implement a formal leave request and approval flow between Employees and HR.", body_style))
    story.append(Paragraph("3. <b>Analytical Export:</b> Export attendance and payroll reports in CSV / Excel formats for accounting teams.", body_style))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated {filename}")

if __name__ == '__main__':
    build_pdf()
