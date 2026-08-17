# WorkPulse — Production Deployment Guide

This guide provides step-by-step instructions for deploying **WorkPulse** to production cloud platforms:
- **Backend & Database**: Render (Spring Boot Web Service + Managed PostgreSQL)
- **Frontend**: Vercel (React 18 + Vite SPA)

---

## Architecture Blueprint

```
+-------------------------------------------------------+
|                 Vercel (Frontend SPA)                 |
|             https://workpulse.vercel.app              |
+-------------------------------------------------------+
                           |
                 HTTPS REST API Calls
                           v
+-------------------------------------------------------+
|             Render (Spring Boot Backend)              |
|        https://workpulse-backend.onrender.com         |
+-------------------------------------------------------+
                           |
                     JDBC Connection
                           v
+-------------------------------------------------------+
|             Render (PostgreSQL Database)              |
+-------------------------------------------------------+
```

---

## Step 1 — Production Database Setup (Render PostgreSQL)

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** $\rightarrow$ **PostgreSQL**.
3. Configure settings:
   - **Name**: `workpulse-db`
   - **Database**: `workpulse_db`
   - **User**: `postgres`
   - **Region**: Oregon (US West) or closest region
   - **Plan**: Free Tier
4. Click **Create Database**.
5. Once active, copy the **Internal Database URL** and **External Database Connection Details**.
6. Connect using `psql` or DBeaver and execute the database initialization script:
   ```bash
   psql "<External_Database_URL>" -f database/schema.sql
   ```

---

## Step 2 — Backend Deployment (Render Web Service)

1. In Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository: `https://github.com/Agrim027/WorkPulse-Employee-Management-System`.
3. Configure settings:
   - **Name**: `workpulse-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Java`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/ems-0.0.1-SNAPSHOT.jar`
   - **Plan**: Free Tier
4. Add the following **Environment Variables**:

| Variable Name | Example Production Value |
| :--- | :--- |
| `DB_URL` | `jdbc:postgresql://<render-db-host>:5432/workpulse_db?sslmode=require` |
| `DB_USERNAME` | `<render-db-username>` |
| `DB_PASSWORD` | `<render-db-password>` |
| `JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` |
| `JWT_EXPIRATION_MS` | `86400000` |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `validate` |

5. Click **Create Web Service**. Once deployed, copy your backend URL (e.g., `https://workpulse-backend.onrender.com`).

---

## Step 3 — Frontend Deployment (Vercel)

1. Log in to [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository: `Agrim027/WorkPulse-Employee-Management-System`.
4. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:

| Variable Name | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | `https://workpulse-backend.onrender.com/api/v1` |

6. Click **Deploy**. Vercel will build and publish your application.

---

## Step 4 — Verification Checklist

- [x] **GitHub Repository**: [https://github.com/Agrim027/WorkPulse-Employee-Management-System](https://github.com/Agrim027/WorkPulse-Employee-Management-System)
- [ ] **Backend Health**: `GET https://workpulse-backend.onrender.com/api/v1/auth/me`
- [ ] **Frontend Application**: Login with default credentials (`adminuser` / `Password123!`)
- [ ] **Role Badge**: Header displays `ADMIN`
- [ ] **Dashboard**: Displays metric cards for Total Employees, Departments, Today's Attendance, Total Payroll (`₹`)
