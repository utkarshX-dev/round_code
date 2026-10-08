# ROUNDCode — Round Table DTU Coding & Skill Development Platform

> **Code. Compete. Grow Together.**  
> The official private competitive coding and skill-development platform built exclusively for **Round Table, Delhi Technological University (DTU)**.

---

## 🏛️ 1. Project Overview

**ROUNDCode** centralizes the algorithmic preparation and technical development of Round Table DTU members across cohorts. Combining the competitive rigor of **LeetCode** and **Codeforces**, the developer identity of **GitHub developer profiles**, and the visual polish of **modern SaaS dashboards**, ROUNDCode provides:

- **Weekly Problem of the Week (POTW):** Exactly 3 algorithmic problems per week (Easy: 1 pt, Medium: 2 pts, Hard: 3 pts = Max 6 pts).
- **Synchronized Deadlines:** Backend-enforced submission deadlines preventing late entries.
- **Strict Registration Gateway:** Only verified emails ending in `@dtu.ac.in` can register; accounts require administrative review and credential dispatch.
- **Personal Email Login:** Authentication uses Personal Email + Password while preserving DTU email as profile identity.
- **Code Submission & Proof:** Monaco code editor supporting C++, Python, and JavaScript, paired with asymptotic complexity analysis and external proof (Drive/Verdict URLs).
- **Administrative Review:** Partial scoring in increments of 0.5, question-level feedback, and single-submission lock enforcement.
- **Rating System & Penalties:** Starts at 0.0; points accrue dynamically; members missing weekly POTWs incur a **-2.0 rating penalty** (mathematically bounded at 0).
- **Deterministic Leaderboards:** Weekly, Monthly, and All-Time standings with podium highlights (🥇, 🥈, 🥉).
- **Weekly Participation Heatmap:** GitHub-style submission activity heatmap with interactive tooltips.
- **Developer Profiles:** Showcase of skills, rating trajectory line chart, live projects, coding handles, and submission records.
- **Super Admin Privilege:** Dedicated admin governance and manual rating adjustments with mandatory audit logs.

---

## 🛠️ 2. Technology Stack

- **Frontend:**
  - Next.js (App Router, React 19)
  - Tailwind CSS v4 (Custom Dark Developer Theme `#080C14` with glassmorphic cards and glowing badges)
  - Monaco Editor (`@monaco-editor/react`) for code editing with syntax highlighting and copy functionality
  - Recharts for rating history line charts
  - Lucide React for modern developer icons
- **Backend:**
  - Node.js & Express.js (REST API architecture)
  - Mongoose (MongoDB)
  - Zero-Config Development: Built-in `mongodb-memory-server` fallback for instant local run, with full MongoDB Atlas support in production
  - JWT Access Tokens & HTTP-only cookies
  - bcryptjs password hashing
  - Nodemailer for registration approvals, rejections, and expiring reset tokens
  - Express Middleware (Helmet, CORS, Rate Limiting, Error Handler)

---

## 📐 3. Architecture

```text
                                  ROUNDCode
                              (Round Table DTU)

                       ┌─────────────────────────┐
                       │  Next.js Client (App)   │
                       │   Dark Developer SaaS   │
                       └────────────┬────────────┘
                                    │
                                    │ REST API (JSON / Bearer & Cookies)
                                    ▼
                       ┌─────────────────────────┐
                       │     Express Backend     │
                       │                         │
                       │ • Auth & DTU Gateway    │
                       │ • POTW Scheduling       │
                       │ • Submission Engine     │
                       │ • Rating & Penalty Cron │
                       │ • In-App Notifications  │
                       │ • Super Admin Audit     │
                       └────────────┬────────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
          ┌────────────────────┐        ┌────────────────────┐
          │      MongoDB       │        │     Nodemailer     │
          │ Atlas / In-Memory  │        │   SMTP Dispatch    │
          └────────────────────┘        └────────────────────┘
```

---

## 🔒 4. Key Business Rules & Compliance

| Rule | Requirement | Backend Enforcement |
|---|---|---|
| **DTU Domain** | Only `@dtu.ac.in` emails allowed | Checked via regex `/^[a-zA-Z0-9._%+-]+@dtu\.ac\.in$/` |
| **Login ID** | Personal Email + Password | Personal email is login key; DTU email is identity |
| **POTW Structure** | Exactly 3 questions | Validated: 1 Easy (1 pt), 1 Medium (2 pt), 1 Hard (3 pt) = 6 pts |
| **Active POTW** | Only 1 active POTW at a time | Prevents overlapping weekly active challenges |
| **Submissions** | All 3 solved together | Incomplete submissions (<3 problems) rejected |
| **Deadlines** | Hard deadline cutoff | Rejected if `currentTime >= deadline` |
| **Submission Lock** | Once submitted, locked | Cannot edit code or links; explicit admin reopening required |
| **Scoring** | Partial credit in 0.5 steps | Validated: `0 <= awardedScore <= maxScore` in 0.5 increments |
| **Missed POTW Penalty** | Unsubmitted POTW = -2.0 | Automated worker deducts 2 pts, bounded by `Math.max(0, ...)` |
| **Super Admin** | Role hierarchy & manual ratings | Only Super Admin can manage admins and manually change ratings |

---

## 🚀 5. Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

Clone the repository and install backend and frontend dependencies:

```bash
# Clone
git clone https://github.com/roundtable-dtu/roundcode.git
cd roundcode

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install

cd ..
```

---

## 🧪 6. Running Tests & Database Seeding

### Automated Test Suite

A comprehensive test suite verifies all Section 97 business rules:

```bash
cd backend
npm test
```

### Seed Development Database

Populate 1 Super Admin, 2 Admins, 5 Members, 2 POTWs (1 closed, 1 active), submissions, and rating history:

```bash
cd backend
npm run seed
```

---

## 💻 7. Running the Application Locally

### Run Both Backend & Frontend Simultaneously (Recommended)

From the project root directory:

```bash
# Using npm
npm run dev

# Or on Windows PowerShell:
.\run-dev.ps1

# Or on Windows Command Prompt / Double-click:
run-dev.bat

# Or on Linux / macOS:
./run-dev.sh
```

> **Note:** To launch backend and frontend in separate PowerShell windows, run:
> ```powershell
> .\run-dev.ps1 -SeparateWindows
> ```

### Run Individually

**Backend (Port 5000):**
```bash
npm run dev:backend
# or: cd backend && npm run dev
```

**Frontend (Port 3000):**
```bash
npm run dev:frontend
# or: cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 8. Pre-configured Credentials (Seed Data)

| Role | Name | Personal Login Email | Password |
|---|---|---|---|
| **Super Admin** | Dr. Akhil Sharma (President RT) | `superadmin@roundtabledtu.in` | `Password@123` |
| **Admin 1** | Utkarsh Bhandari (Tech Lead) | `admin.utkarsh@roundtabledtu.in` | `Password@123` |
| **Admin 2** | Ananya Verma (DSA Head) | `ananya.admin@roundtabledtu.in` | `Password@123` |
| **Member 1 (Rank #1)** | Priya Malik | `priya.malik@gmail.com` | `Password@123` |
| **Member 2** | Rohan Sharma | `rohan.sharma@gmail.com` | `Password@123` |

---

## 📡 9. API Reference Summary

- `POST /api/auth/register` — Submit membership registration request
- `POST /api/auth/login` — Member/Admin login with Personal Email & Password
- `POST /api/auth/forgot-password` — Dispatch cryptographically secure reset link
- `POST /api/auth/reset-password` — Set new password using token
- `GET /api/potws/current` — Get current active weekly challenge
- `POST /api/potws` — Admin creates 3-question POTW (Easy: 1, Med: 2, Hard: 3)
- `POST /api/submissions` — Member submits all 3 solutions with Monaco code & links
- `GET /api/submissions/pending` — Admin retrieves pending submissions queue
- `PATCH /api/submissions/:id/review` — Admin awards partial scores and feedback
- `PATCH /api/submissions/:id/reopen` — Admin reopens submission with audit note
- `GET /api/leaderboard/weekly` — Current POTW leaderboard
- `GET /api/leaderboard/monthly` — Calendar month leaderboard
- `GET /api/leaderboard/all-time` — All-time rating standings
- `PATCH /api/admin/ratings/:id` — Super Admin manual rating adjustment with audit reason
- `POST /api/admin/admins` — Super Admin appoints new administrator

---

## 🌐 10. Production Deployment

### Frontend (Vercel)
1. Connect repository to Vercel.
2. Root directory: `frontend`.
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://<your-backend-url>/api`.

### Backend (Render / Railway)
1. Deploy `backend` folder as a Web Service.
2. Build command: `npm install`.
3. Start command: `node src/server.js`.
4. Configure environment variables in dashboard:
   - `MONGO_URI=mongodb+srv://<user>:<pwd>@cluster.mongodb.net/roundcode`
   - `JWT_SECRET=<your-32-char-random-secret>`
   - `CLIENT_URL=https://<your-vercel-domain>.vercel.app`
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`

---

## 🛡️ License

Built with ❤️ for **Round Table, Delhi Technological University (DTU)**.  
Preserved for future generations of student developers and competitive programmers.
