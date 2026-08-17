const fs = require('fs');
const path = require('path');
const puppeteer = require('../frontend/node_modules/puppeteer-core');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>WorkPulse — Employee Management System Project Report</title>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  
  <!-- Mermaid JS -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>

  <style>
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 10.5pt;
      line-height: 1.6;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* Cover Page */
    .cover-page {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100vh;
      min-height: 800px;
      padding: 40px 20px;
      border: 3px double #1976d2;
      text-align: center;
    }

    .cover-header {
      margin-top: 40px;
    }

    .cover-badge {
      display: inline-block;
      padding: 6px 16px;
      background-color: #e3f2fd;
      color: #1976d2;
      font-weight: 700;
      font-size: 11pt;
      border-radius: 20px;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .cover-title {
      font-size: 32pt;
      font-weight: 800;
      color: #0f172a;
      margin: 10px 0;
      letter-spacing: -0.5px;
    }

    .cover-subtitle {
      font-size: 18pt;
      font-weight: 600;
      color: #1976d2;
      margin-top: 5px;
      margin-bottom: 20px;
    }

    .cover-divider {
      width: 120px;
      height: 4px;
      background-color: #1976d2;
      margin: 20px auto;
      border-radius: 2px;
    }

    .cover-doc-type {
      font-size: 14pt;
      font-weight: 500;
      color: #475569;
      margin-top: 15px;
    }

    .cover-footer {
      margin-bottom: 30px;
      font-size: 10pt;
      color: #64748b;
    }

    .cover-meta {
      margin-top: 40px;
      text-align: center;
      font-size: 11pt;
      line-height: 1.8;
      color: #334155;
    }

    /* Headings */
    h1, h2, h3, h4 {
      color: #0f172a;
      font-weight: 700;
      letter-spacing: -0.3px;
    }

    h1 {
      font-size: 20pt;
      border-bottom: 2px solid #1976d2;
      padding-bottom: 6px;
      margin-top: 30px;
      margin-bottom: 15px;
      page-break-after: avoid;
    }

    h2 {
      font-size: 15pt;
      color: #1e3a8a;
      margin-top: 24px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }

    h3 {
      font-size: 12pt;
      color: #1976d2;
      margin-top: 18px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }

    p {
      margin-top: 0;
      margin-bottom: 12px;
      text-align: justify;
    }

    ul, ol {
      margin-top: 0;
      margin-bottom: 14px;
      padding-left: 24px;
    }

    li {
      margin-bottom: 4px;
    }

    strong {
      color: #0f172a;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
    }

    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    /* Code & Snippets */
    code {
      font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
      font-size: 9pt;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    pre {
      background-color: #0f172a;
      color: #f8fafc;
      padding: 14px;
      border-radius: 6px;
      font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
      font-size: 8.5pt;
      overflow-x: auto;
      margin: 14px 0;
      page-break-inside: avoid;
    }

    pre code {
      background-color: transparent;
      color: inherit;
      padding: 0;
      border: none;
    }

    /* Diagrams */
    .mermaid-container {
      display: flex;
      justify-content: center;
      margin: 20px 0;
      padding: 15px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      page-break-inside: avoid;
    }

    .mermaid {
      width: 100%;
      text-align: center;
    }

    .abstract-box {
      background-color: #f0f9ff;
      border-left: 4px solid #0284c7;
      padding: 16px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }

    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div class="cover-header">
      <div class="cover-badge">Academic & Technical Project Report</div>
      <div class="cover-title">WorkPulse</div>
      <div class="cover-subtitle">Employee Management System</div>
      <div class="cover-divider"></div>
      <div class="cover-doc-type">Full-Stack Enterprise Web Application</div>
    </div>

    <div class="cover-meta">
      <p><strong>Technology Stack:</strong> Java 17 LTS, Spring Boot 3, Spring Security, JWT, PostgreSQL, React 18, Vite, Material UI</p>
      <p><strong>Architecture:</strong> Decoupled Monolithic REST API &amp; Single Page Application (SPA)</p>
      <p><strong>Security Standard:</strong> BCrypt Hashing, Stateless JWT, RBAC, IDOR Guards</p>
      <p><strong>Currency Standard:</strong> Indian Rupee (₹ / INR)</p>
    </div>

    <div class="cover-footer">
      <p><strong>WorkPulse Project Team</strong></p>
      <p>August 2026</p>
    </div>
  </div>

  <!-- EXECUTIVE ABSTRACT -->
  <h1>Executive Abstract</h1>
  <div class="abstract-box">
    <p><strong>WorkPulse</strong> is an enterprise-grade, full-stack Employee Management System (EMS) designed to streamline organizational human resource workflows, personnel record keeping, departmental structure, attendance tracking, and payroll processing.</p>
    <p>Built using a decoupled client-server architecture, WorkPulse pairs a robust <strong>Java 17 Spring Boot 3.x</strong> backend with a modern <strong>React 18 + Vite</strong> single-page application (SPA) styled using <strong>Material UI</strong>. Security is established via <strong>Spring Security</strong> and stateless <strong>JSON Web Tokens (JWT)</strong> with <strong>BCrypt</strong> password encryption and strict <strong>Role-Based Access Control (RBAC)</strong> across three authority tiers: <code>ROLE_ADMIN</code>, <code>ROLE_HR</code>, and <code>ROLE_EMPLOYEE</code>. Data persistence is managed by <strong>Spring Data JPA</strong> and <strong>PostgreSQL</strong> with complete referential integrity, indexes, and soft-deletion strategies.</p>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 1 -->
  <h1>1. Introduction &amp; Objectives</h1>
  
  <h2>1.1 Problem Statement</h2>
  <p>Modern organizations face significant administrative overhead when attempting to manage employee profiles, department hierarchies, daily attendance, and monthly salary slips using disconnected spreadsheets or legacy manual systems. Manual tracking leads to data inconsistencies, unauthorized access, lack of auditability, security vulnerabilities, and inefficient payroll calculations.</p>

  <h2>1.2 System Objectives</h2>
  <p>The primary objective of WorkPulse is to deliver a secure, centralized, responsive, and automated web portal that provides:</p>
  <ol>
    <li><strong>Secure Authentication &amp; RBAC</strong>: Stateless JWT-based authentication ensuring strict authorization for Administrators, HR personnel, and Employees.</li>
    <li><strong>Comprehensive Employee Directory</strong>: Full CRUD management with multi-attribute search, department filtering, status tracking (<code>ACTIVE</code>, <code>INACTIVE</code>, <code>ON_LEAVE</code>, <code>TERMINATED</code>), and server-side pagination.</li>
    <li><strong>Organizational Hierarchy</strong>: Management of departments and security roles.</li>
    <li><strong>Attendance Tracking &amp; Self-Service</strong>: Dedicated daily attendance logging, date filtering, and self check-in / check-out capabilities for employees.</li>
    <li><strong>Payroll &amp; Salary Management</strong>: Authoritative server-side Net Salary calculation (&nbsp;<i>Net Salary = Basic + Allowances &minus; Deductions</i>&nbsp;) with Indian Rupee (<strong>₹</strong>) formatting.</li>
    <li><strong>Executive &amp; Self-Service Dashboards</strong>: Aggregated organization metrics for Admin/HR and personalized status cards for employees.</li>
  </ol>

  <!-- SECTION 2 -->
  <h1>2. Technology Stack</h1>
  
  <h2>2.1 Backend Frameworks &amp; Libraries</h2>
  <ul>
    <li><strong>Language &amp; Runtime</strong>: Java 17 LTS</li>
    <li><strong>Framework</strong>: Spring Boot 3.2.5</li>
    <li><strong>Security &amp; Auth</strong>: Spring Security 6.x, io.jsonwebtoken (jjwt 0.11.5), BCrypt Password Encoder</li>
    <li><strong>Persistence &amp; ORM</strong>: Spring Data JPA, Hibernate ORM 6.4</li>
    <li><strong>Database Driver</strong>: PostgreSQL JDBC Driver</li>
    <li><strong>Validation</strong>: Jakarta Bean Validation (<code>@NotBlank</code>, <code>@Email</code>, <code>@Min</code>)</li>
    <li><strong>Build System</strong>: Apache Maven 3.x (with Maven Wrapper <code>mvnw</code>)</li>
  </ul>

  <h2>2.2 Frontend Frameworks &amp; Libraries</h2>
  <ul>
    <li><strong>Core Library</strong>: React 18</li>
    <li><strong>Build Tool</strong>: Vite 5.x</li>
    <li><strong>UI Framework</strong>: Material UI (MUI v5)</li>
    <li><strong>HTTP Client</strong>: Axios (with centralized Bearer Token interceptor)</li>
    <li><strong>Routing</strong>: React Router DOM v6</li>
    <li><strong>Typography &amp; Styling</strong>: Vanilla CSS &amp; MUI Emotion Styling Engine</li>
  </ul>

  <h2>2.3 Database Management System</h2>
  <ul>
    <li><strong>Engine</strong>: PostgreSQL 18+ / 14+</li>
    <li><strong>Dialect</strong>: <code>org.hibernate.dialect.PostgreSQLDialect</code></li>
  </ul>

  <div class="page-break"></div>

  <!-- SECTION 3 -->
  <h1>3. System Architecture &amp; Component Interaction</h1>
  <p>WorkPulse adopts a classic 3-tier monolithic REST API architecture with a completely decoupled SPA frontend.</p>

  <div class="mermaid-container">
    <div class="mermaid">
graph TD
    User["Web Browser / Client (React 18 SPA)"] -->|HTTP / REST JSON| Router["React Router DOM & Protected Routes"]
    Router -->|Axios HTTP Requests| APIInterceptor["Axios Interceptor (Bearer JWT Header)"]
    APIInterceptor -->|HTTPS / HTTP| SpringSecurity["Spring Security Filter Chain & JwtAuthTokenFilter"]
    SpringSecurity -->|Authentication Principal| Controllers["REST Controllers (/api/v1/*)"]
    Controllers -->|DTO Validation| Services["Service Layer (Business Logic)"]
    Services -->|JPA Transactions| Repositories["Spring Data JPA Repositories"]
    Repositories -->|SQL Queries| DB[("PostgreSQL Database")]
    </div>
  </div>

  <!-- SECTION 4 -->
  <h1>4. Database Design &amp; Schema Specification</h1>
  <p>The relational schema comprises seven core tables enforcing foreign key integrity, compound unique constraints, and B-tree indexes.</p>

  <h2>4.1 Entity Relationship Diagram</h2>
  <div class="mermaid-container">
    <div class="mermaid">
erDiagram
    roles ||--o{ user_roles : "assigned to"
    users ||--o{ user_roles : "holds"
    users ||--o| employees : "linked to"
    departments ||--o{ employees : "contains"
    employees ||--o{ attendance : "logs"
    employees ||--o{ salaries : "receives"

    roles {
        bigint id PK
        varchar name UK
        varchar description
    }
    users {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password
        boolean enabled
    }
    departments {
        bigint id PK
        varchar department_code UK
        varchar name UK
    }
    employees {
        bigint id PK
        varchar employee_code UK
        varchar first_name
        varchar last_name
        varchar email UK
        varchar employment_status
        bigint department_id FK
        bigint user_id FK
    }
    attendance {
        bigint id PK
        bigint employee_id FK
        date attendance_date
        varchar status
        time check_in
        time check_out
    }
    salaries {
        bigint id PK
        bigint employee_id FK
        numeric basic_salary
        numeric allowances
        numeric deductions
        numeric net_salary
        varchar salary_month
        varchar payment_status
    }
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 5 -->
  <h1>5. Functional Module Breakdown</h1>

  <h2>5.1 Authentication &amp; Security Module</h2>
  <ul>
    <li><strong>JWT Token Lifecycle</strong>: Upon valid credentials submission to <code>/api/v1/auth/login</code>, the server generates a signed HMAC-SHA256 JWT containing the username and granted authorities (<code>ROLE_ADMIN</code>, <code>ROLE_HR</code>, <code>ROLE_EMPLOYEE</code>).</li>
    <li><strong>Stateless Authorization</strong>: <code>JwtAuthTokenFilter</code> intercepts every incoming request, validates signature and expiration, builds <code>UsernamePasswordAuthenticationToken</code>, and injects it into <code>SecurityContextHolder</code>.</li>
  </ul>

  <h2>5.2 Employee Management Module</h2>
  <ul>
    <li><strong>CRUD &amp; Pagination</strong>: Admin and HR users can create, view, update, and soft-delete employees via paginated queries (<code>Page&lt;EmployeeResponse&gt;</code>).</li>
    <li><strong>Soft Deletion</strong>: Deactivating an employee updates <code>employment_status</code> to <code>TERMINATED</code> rather than physically deleting rows, preserving historic attendance and payroll records.</li>
    <li><strong>IDOR Protection</strong>: Employees requesting <code>/api/v1/employees/{id}</code> can only view their own profile; requests for other employee IDs trigger <code>403 Access Denied</code>.</li>
  </ul>

  <h2>5.3 Department &amp; Role Management Module</h2>
  <ul>
    <li><strong>Department Hierarchy</strong>: Manage department codes, names, and descriptions with uniqueness constraints. Deleting a department with active employees is blocked to prevent orphaned records.</li>
    <li><strong>Security Roles</strong>: Role creation and assignment restricted exclusively to <code>ROLE_ADMIN</code>.</li>
  </ul>

  <h2>5.4 Attendance Module</h2>
  <ul>
    <li><strong>Daily Attendance Management</strong>: Admin and HR can log, update, or filter attendance records by employee, date range, or status (<code>PRESENT</code>, <code>ABSENT</code>, <code>HALF_DAY</code>, <code>LEAVE</code>).</li>
    <li><strong>Employee Self Check-In / Check-Out</strong>: Employees perform self check-in (<code>POST /api/v1/attendance/check-in</code>) and check-out (<code>POST /api/v1/attendance/check-out</code>) without passing employee IDs in request bodies; identity is derived directly from the authenticated JWT.</li>
  </ul>

  <h2>5.5 Salary &amp; Payroll Module</h2>
  <ul>
    <li><strong>Authoritative Net Salary</strong>: Net salary is calculated on the backend (<code>basicSalary + allowances - deductions</code>) using <code>BigDecimal</code> arithmetic to eliminate floating-point precision errors.</li>
    <li><strong>INR Formatting</strong>: All monetary values are rendered on the UI using Indian Rupee formatting (<code>₹53,000.00</code>).</li>
    <li><strong>Payment Statuses</strong>: <code>PENDING</code>, <code>PAID</code>, and <code>CANCELLED</code>.</li>
  </ul>

  <h2>5.6 Executive &amp; Employee Dashboards</h2>
  <ul>
    <li><strong>Admin / HR Summary</strong>: <code>/api/v1/dashboard/summary</code> delivers high-level organization statistics: Total/Active/Terminated Employees, Department Count, Today's Attendance breakdown, and Total/Paid Payroll totals.</li>
    <li><strong>Employee Self-Service Summary</strong>: <code>/api/v1/dashboard/my-summary</code> provides personal profile details, today's attendance status, and latest salary slip.</li>
  </ul>

  <!-- SECTION 6 -->
  <h1>6. Security &amp; Configuration Audit</h1>
  <table>
    <thead>
      <tr>
        <th>Security Domain</th>
        <th>Implementation Standard</th>
        <th>Verification Result</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Password Hashing</strong></td>
        <td>BCrypt Work Factor 10</td>
        <td><strong>PASS</strong> &mdash; Passwords never stored in plaintext</td>
      </tr>
      <tr>
        <td><strong>Session Security</strong></td>
        <td>Stateless JWT (No Server Sessions)</td>
        <td><strong>PASS</strong> &mdash; <code>SessionCreationPolicy.STATELESS</code></td>
      </tr>
      <tr>
        <td><strong>Authorization</strong></td>
        <td>Spring Security <code>@PreAuthorize</code> Method Security</td>
        <td><strong>PASS</strong> &mdash; Evaluated at controller layer</td>
      </tr>
      <tr>
        <td><strong>IDOR Guard</strong></td>
        <td>Principal ID Ownership Matching</td>
        <td><strong>PASS</strong> &mdash; Employees cannot access peer data</td>
      </tr>
      <tr>
        <td><strong>CORS Policy</strong></td>
        <td>Explicit Allowed Origins (<code>localhost:5173</code>)</td>
        <td><strong>PASS</strong> &mdash; Cross-origin requests controlled</td>
      </tr>
      <tr>
        <td><strong>Secrets Isolation</strong></td>
        <td><code>.gitignore</code> + Environment Variables</td>
        <td><strong>PASS</strong> &mdash; No DB/JWT secrets in Git</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- SECTION 7 -->
  <h1>7. Verification &amp; Testing</h1>

  <h2>7.1 Backend Automated Test Suite</h2>
  <p>Automated regression tests were executed using JUnit 5 and Spring Boot Test Runner:</p>
  <ul>
    <li><code>SecurityTests</code> (4 tests) &mdash; <strong>PASS</strong></li>
    <li><code>AttendanceServiceTests</code> (8 tests) &mdash; <strong>PASS</strong></li>
    <li><code>DepartmentServiceTests</code> (3 tests) &mdash; <strong>PASS</strong></li>
    <li><code>EmployeeServiceTests</code> (5 tests) &mdash; <strong>PASS</strong></li>
    <li><code>SalaryServiceTests</code> (5 tests) &mdash; <strong>PASS</strong></li>
  </ul>
  <p><strong>Total Test Result</strong>: 25 Tests Run, 0 Failures, 0 Errors, 0 Skipped.</p>

  <h2>7.2 Frontend Production Build</h2>
  <pre><code>npm run build</code></pre>
  <ul>
    <li><strong>Vite Version</strong>: 5.4.21</li>
    <li><strong>Modules Transformed</strong>: 1,048 modules</li>
    <li><strong>Build Time</strong>: 5.26 seconds</li>
    <li><strong>Output</strong>: <code>dist/assets/index-DLsEpwlr.js</code> compiled cleanly with 0 errors.</li>
  </ul>

  <!-- SECTION 8 -->
  <h1>8. Conclusion &amp; Future Scope</h1>

  <h2>8.1 Conclusion</h2>
  <p>The <strong>WorkPulse Employee Management System</strong> successfully delivers a robust, secure, and user-friendly platform that meets all functional and technical requirements established during Phase 1&ndash;11. The application adheres strictly to modern web architecture best practices, offering complete role-based security, data consistency, responsive layout design, and full auditability.</p>

  <h2>8.2 Future Scope</h2>
  <p>Potential future enhancements for WorkPulse include:</p>
  <ol>
    <li><strong>Automated PDF Pay Slip Generation</strong>: Allowing employees to download PDF receipts for monthly salary slips.</li>
    <li><strong>Notification Engine</strong>: Integration of email/SMS alerts for check-in reminders and salary credit updates.</li>
    <li><strong>Leave Management &amp; Approval Workflows</strong>: Formal leave request and multi-tier approval module.</li>
  </ol>

  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose'
    });
  </script>
</body>
</html>`;

async function generatePDF() {
  const docsDir = path.join(__dirname);
  const htmlPath = path.join(docsDir, 'report_render.html');
  const pdfPath = path.join(docsDir, 'WorkPulse_Project_Report.pdf');

  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log('HTML written to', htmlPath);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });

  // Wait 2 seconds for Mermaid rendering
  await new Promise(resolve => setTimeout(resolve, 2000));

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size: 8pt; font-family: 'Inter', sans-serif; color: #94a3b8; width: 100%; text-align: right; padding-right: 15mm;">WorkPulse &mdash; Employee Management System Project Report</div>`,
    footerTemplate: `<div style="font-size: 8pt; font-family: 'Inter', sans-serif; color: #94a3b8; width: 100%; text-align: center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
    margin: {
      top: '18mm',
      bottom: '18mm',
      left: '15mm',
      right: '15mm'
    }
  });

  await browser.close();
  console.log('PDF generated successfully at', pdfPath);

  // Clean up temporary HTML file
  if (fs.existsSync(htmlPath)) {
    fs.unlinkSync(htmlPath);
  }
}

generatePDF().catch(err => {
  console.error('Failed to generate PDF:', err);
  process.exit(1);
});
