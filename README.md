# WorkPulse — Employee Management System

[![Java](https://img.shields.io/badge/Java-17_LTS-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![Material UI](https://img.shields.io/badge/MUI-5.x-0081CB.svg)](https://mui.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791.svg)](https://www.postgresql.org/)

**WorkPulse** is a full-stack, enterprise-grade Employee Management System (EMS) designed for modern organizations to manage employee records, department structures, security roles, daily attendance logs, employee self check-in/check-out, monthly salary slips, and executive analytical dashboards.

---

## Key Features

* 🔐 **Secure Authentication & JWT**: Stateless authentication using JSON Web Tokens (JWT) and BCrypt password encryption.
* 🛡️ **Role-Based Access Control (RBAC)**: Strict authority tiers across `ROLE_ADMIN`, `ROLE_HR`, and `ROLE_EMPLOYEE`.
* 👥 **Employee Management**: Complete CRUD operations, multi-attribute search, department filters, pagination, and soft deletion (`TERMINATED`).
* 🏢 **Department & Role Hierarchy**: Organization unit definitions and system role management with deletion safety constraints.
* 📅 **Attendance Management & Self Check-In**: Admin/HR daily attendance management plus employee self check-in and check-out.
* 💰 **Payroll & Salary Management**: Server-side Net Salary calculation ($\text{Basic} + \text{Allowances} - \text{Deductions}$) formatted in Indian Rupee (`₹ / INR`).
* 📊 **Executive & Personal Dashboards**: Real-time aggregated organizational stats for Admin/HR and personal self-service stats for Employees.
* 🔒 **IDOR Guard Security**: Indirect Object Reference protection ensuring employees can only view their own profile, attendance, and salary slips.

---

## Technology Stack

### Frontend
* **React 18** SPA Architecture
* **Vite 5** Build Tool & Dev Server
* **Material UI (MUI v5)** UI Component Library
* **Axios** HTTP Client with Bearer Token Interceptor
* **React Router DOM v6** Declarative Client-Side Routing

### Backend
* **Java 17 LTS**
* **Spring Boot 3.2.5** (Spring Web, Spring Data JPA, Spring Security)
* **JWT (jjwt 0.11.5)** Token Authorization
* **PostgreSQL Driver & Hibernate ORM** Data Persistence
* **Apache Maven 3.x** Build & Dependency Management

### Database
* **PostgreSQL** Relational Database

---

## System Architecture

```text
React 18 SPA (Material UI)
       │
       ▼
Axios Interceptor (Bearer JWT Header)
       │
       ▼
Spring Security Filter Chain (JwtAuthTokenFilter)
       │
       ▼
REST Controllers (/api/v1/*)
       │
       ▼
Service Layer (Business Logic & IDOR Guards)
       │
       ▼
Spring Data JPA Repositories
       │
       ▼
PostgreSQL Database
```

---

## Role & Permission Matrix

| Feature Module | ADMIN | HR | EMPLOYEE |
| :--- | :---: | :---: | :---: |
| **Executive Dashboard** | Full | Full | Restricted (Personal Summary Only) |
| **Employee Directory** | Full CRUD | Full CRUD | Own Profile Only (IDOR Protected) |
| **Department Management** | Full CRUD | Full CRUD | Restricted |
| **Role Management** | Full CRUD | Restricted | Restricted |
| **Attendance Management** | Full CRUD | Full CRUD | Own Logs + Self Check-In / Check-Out |
| **Salary / Payroll Management** | Full CRUD | Full CRUD | Own Salary Slips Only |

---

## REST API Reference

| Endpoint | Method | Required Role | Description |
| :--- | :---: | :---: | :--- |
| `/api/v1/auth/register` | `POST` | Public | Register new user account |
| `/api/v1/auth/login` | `POST` | Public | Authenticate user & return JWT token |
| `/api/v1/employees` | `GET` | `ADMIN`, `HR` | Paginated employee list search/filter |
| `/api/v1/employees/{id}` | `GET` | Authenticated | Get employee profile (IDOR Protected) |
| `/api/v1/employees` | `POST` | `ADMIN`, `HR` | Create employee record |
| `/api/v1/employees/{id}` | `PUT` | `ADMIN`, `HR` | Update employee record |
| `/api/v1/employees/{id}` | `DELETE` | `ADMIN`, `HR` | Soft delete employee (`TERMINATED`) |
| `/api/v1/departments` | `GET` | Authenticated | List all departments |
| `/api/v1/departments` | `POST` | `ADMIN`, `HR` | Create department |
| `/api/v1/departments/{id}` | `PUT` | `ADMIN`, `HR` | Update department |
| `/api/v1/departments/{id}` | `DELETE` | `ADMIN`, `HR` | Delete department (Safe check) |
| `/api/v1/roles` | `GET` | Authenticated | List all security roles |
| `/api/v1/roles` | `POST` | `ADMIN` | Create system role |
| `/api/v1/attendance` | `GET` | `ADMIN`, `HR` | Paginated attendance list & filters |
| `/api/v1/attendance/my-attendance` | `GET` | Authenticated | Get personal attendance logs |
| `/api/v1/attendance/check-in` | `POST` | Authenticated | Self check-in for today |
| `/api/v1/attendance/check-out` | `POST` | Authenticated | Self check-out for today |
| `/api/v1/salaries` | `GET` | `ADMIN`, `HR` | Paginated salary records & filters |
| `/api/v1/salaries/my-salaries` | `GET` | Authenticated | Get personal salary slips |
| `/api/v1/salaries` | `POST` | `ADMIN`, `HR` | Create salary slip (Calculates Net Salary) |
| `/api/v1/dashboard/summary` | `GET` | `ADMIN`, `HR` | Organization aggregate metrics |
| `/api/v1/dashboard/my-summary` | `GET` | Authenticated | Personal employee dashboard summary |

---

## Local Setup & Installation

### Prerequisites
* **Java 17 LTS**
* **Node.js v18+** & **npm**
* **PostgreSQL 14+ / 18+**

### 1. Database Setup
Create the PostgreSQL database using `psql` or pgAdmin:
```sql
CREATE DATABASE workpulse_db;
```
Optionally load initial schema from `database/schema.sql`.

### 2. Backend Configuration & Startup
Create `backend/.env` (or set shell environment variables):
```bash
# In PowerShell:
$env:DB_PASSWORD="your_postgres_password"
.\mvnw.cmd spring-boot:run
```
The backend server starts at `http://localhost:8080`.

### 3. Frontend Setup & Startup
Navigate to the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Building for Production

To create an optimized production build for the frontend:
```bash
cd frontend
npm run build
```
Output static bundle will be generated in `frontend/dist`.

---

## Verification & Testing

Run backend JUnit regression tests:
```bash
cd backend
.\mvnw.cmd clean test
```
* **Backend Test Result**: 25 Tests Run, 0 Failures, 0 Errors, 0 Skipped.
* **Frontend Build Result**: `npm run build` compiled in 5.26s with 0 errors.

---

## Repository Structure

```text
WorkPulse/
├── backend/                  # Java Spring Boot 3.x REST API Application
│   ├── src/main/java/        # Controllers, Services, Repositories, Entities, DTOs
│   ├── src/test/java/        # JUnit Test Suite
│   └── pom.xml               # Maven configuration
├── frontend/                 # React 18 + Vite SPA Application
│   ├── src/components/       # Material UI UI Components & Modals
│   ├── src/pages/            # Application Screens & Views
│   ├── src/services/         # Axios API Services
│   └── package.json          # Node dependencies
├── database/                 # PostgreSQL Schema & Documentation
│   ├── schema.sql            # DDL Schema Script
│   └── DATABASE.md           # Database ER & Entity Specs
├── docs/                     # Project Report & Documentation
│   └── PROJECT_REPORT.md     # Technical & Academic Project Report
├── .gitignore                # Environment & Secrets Exclusion
└── README.md                 # Project Overview & Setup Guide
```

---

## License & Author
Developed as a full-stack enterprise employee management system.
