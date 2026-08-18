# WorkPulse — Production Deployment Guide

This guide provides step-by-step instructions for deploying **WorkPulse** to production cloud platforms:
- **Backend & Database**: Render (Docker Web Service + Managed PostgreSQL)
- **Frontend**: Vercel (React 18 + Vite SPA)

---

## Architecture Blueprint

```
+-------------------------------------------------------+
|                 Vercel (Frontend SPA)                 |
|            <VERCEL_FRONTEND_URL>                      |
+-------------------------------------------------------+
                           |
                 HTTPS REST API Calls
                           v
+-------------------------------------------------------+
|        Render (Spring Boot Docker Backend)            |
|       https://workpulse-backend.onrender.com          |
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
5. Once active, note the connection details for configuring the backend Web Service.

---

## Step 2 — Backend Deployment (Render Web Service)

1. In Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository: `https://github.com/Agrim027/WorkPulse-Employee-Management-System`.
3. Configure settings:
   - **Provider**: Render Web Service
   - **Name**: `workpulse-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Region**: Oregon
   - **Dockerfile**: `backend/Dockerfile`
   - **Plan**: Free Tier
4. Add the following **Environment Variables**:

| Variable Name | Value Placeholder / Value |
| :--- | :--- |
| `DB_URL` | `jdbc:postgresql://<RENDER_DATABASE_HOST>:5432/<RENDER_DATABASE_NAME>?sslmode=require` |
| `DB_USERNAME` | `<RENDER_DATABASE_USERNAME>` |
| `DB_PASSWORD` | `<RENDER_DATABASE_PASSWORD>` |
| `JWT_SECRET` | `<PRODUCTION_JWT_SECRET>` |
| `JWT_EXPIRATION_MS` | `86400000` |
| `FRONTEND_ALLOWED_ORIGIN` | `<VERCEL_FRONTEND_URL>` |

> **Note on PORT**: The `PORT` environment variable is supplied automatically by Render (e.g., port 10000). The Spring Boot configuration resolves `server.port` via `${PORT:${SERVER_PORT:8080}}`, so no manual `PORT` variable needs to be set.

> **CRITICAL SECURITY REQUIREMENT**: The production `JWT_SECRET` must be a high-entropy secret (at least 256 bits / 32 bytes hex or base64 string) generated securely in your deployment environment. **NEVER** commit real production JWT secrets, database passwords, or credentials to Git.

5. Click **Create Web Service**. Once deployed, copy your backend service URL (e.g., `https://workpulse-backend.onrender.com`).

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
| `VITE_API_BASE_URL` | `https://<RENDER_BACKEND_APP>.onrender.com/api/v1` |

6. Click **Deploy**. Vercel will build and publish your application.

---

## Step 4 — Verification Checklist

- [x] **GitHub Repository**: [https://github.com/Agrim027/WorkPulse-Employee-Management-System](https://github.com/Agrim027/WorkPulse-Employee-Management-System)
- [ ] **Backend Health**: `GET https://<RENDER_BACKEND_APP>.onrender.com/api/v1/auth/me`
- [ ] **Frontend Application**: Access deployed Vercel frontend URL
- [ ] **Authentication**: Login with configured credentials
- [ ] **Dashboard**: Verify API connectivity and UI responsiveness
