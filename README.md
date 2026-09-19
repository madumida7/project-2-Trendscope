# TrendScope – Enterprise Data Visualization & Predictive Intelligence Platform

[![Live Application](https://img.shields.io/badge/Live%20App-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://trendscope-uohq.onrender.com)
[![MySQL Studio](https://img.shields.io/badge/Database%20Studio-%2Fdatabase-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://trendscope-uohq.onrender.com/database)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **Live Production URL:** [https://trendscope-uohq.onrender.com](https://trendscope-uohq.onrender.com)  
> **Direct MySQL Database Studio:** [https://trendscope-uohq.onrender.com/database](https://trendscope-uohq.onrender.com/database)

---

## 🌟 Executive Overview

**TrendScope** is an intelligent, full-stack data analytics, visualization, and predictive intelligence platform designed for decision-makers, business analysts, and researchers. It bridges the gap between raw numeric datasets and human-understandable strategic decisions through automated data profiling, dynamic multi-chart visualizations, time-series forecasting, and an integrated open-source **MySQL Web Database Studio**.

Whether ingesting multi-dimensional CSV datasets or analyzing complex enterprise metrics, TrendScope provides real-time statistical summaries, confidence-rated predictive models, and complete relational database transparency directly inside your browser.

---

## 🚀 Key Architectural Modules

### 1. 📊 Executive Analytics Dashboard
- **Metric Cards with Velocity Indicators**: Real-time tracking of critical key performance indicators (KPIs), baseline averages, and percentage growth trends.
- **Dynamic Multi-Axis Visualizations**: Synchronized time-series graphs, area trends, and categorical breakdowns powered by Recharts.
- **Domain-Specific Benchmarks**: Instant switching across pre-configured industry datasets (Healthcare, Higher Education, B2B SaaS, and Retail Commerce).

### 2. 🔮 Predictive Modeling Engine & Time-Series Storytelling
- **Statistical Projection Engine**: Mathematical forecasting incorporating moving averages, trend direction vectors (`rising`, `spike`, `falling`), and historical deviations.
- **Narrative Story Generation**: Automated translation of statistical anomalies and regression curves into concise, actionable executive summaries.
- **Confidence Scoring Matrix**: Every prediction is paired with a quantitative reliability score (e.g., 91% confidence interval) to assist risk assessment.

### 3. 🗄️ MySQL Database Web Studio (`/database`)
- **Direct Standalone Web Access**: Openable individually in any browser tab via [https://trendscope-uohq.onrender.com/database](https://trendscope-uohq.onrender.com/database).
- **Relational InnoDB Architecture**: Pre-seeded relational database (`trendscope_mysql_db`) with normalized schemas for users, datasets, predictions, activity logs, and system settings.
- **Interactive SQL Query Console**: Real-time SQL terminal supporting standard ANSI/MySQL queries (`SELECT`, `INSERT`, `UPDATE`, `SHOW TABLES`, `DESCRIBE <table>`) with sub-millisecond execution times.
- **Table Inspector & Schema Viewer**: Live grid inspection, column definitions, data types, primary keys, and instant text filtering.
- **Automated MySQL Dump Export**: One-click download of a standard, production-ready `.sql` file compatible with phpMyAdmin, MySQL Workbench, and DBeaver.

### 4. 📁 Automated Dataset Ingestion & Profiling
- **Universal Drag-and-Drop Ingestion**: Upload custom `.csv` files with automatic column detection, type inference (numeric, string, timestamp), and missing value detection.
- **Data Quality & Hygiene Scoring**: Automatic completeness ratings, cardinality auditing, and variance checks before analysis.

### 5. 🛡️ Platform Administration & Governance
- **Role-Based Access Control (RBAC)**: Support for Admin, Analyst, and User permission levels.
- **Audit Logs & Activity Tracking**: Chronological logging of all prediction model executions, data uploads, and visual dashboard modifications.
- **Executive Report Generation**: One-click generation of structured executive summaries with exportable insights.

### 6. 🎨 Aesthetic & UX Customization
- **High-Contrast Dark & Light Modes**: Seamless toggle between deep dark mode and crisp light layouts.
- **6 Bespoke Theme Palettes**: Dynamic color coordination across Indigo, Emerald, Violet, Amber, Rose, and Cyan.

---

## 📐 Pre-Loaded Benchmark Datasets

TrendScope includes 4 comprehensive industry benchmark datasets ready for immediate exploration:

| Dataset Name | Domain | Metrics Tracked | Use Case |
| :--- | :--- | :--- | :--- |
| **Student Academic & Attendance Performance** | Education | Attendance %, Exam Scores, Study Hours | Analyzing correlation between student attendance and grade outcomes |
| **Pediatric Respiratory ER Patient Surge** | Healthcare | Weekly Admissions, ICU Occupancy, Bed Capacity | Forecasting winter emergency room surge capacity |
| **B2B Enterprise SaaS MRR & Net Retention** | Finance / Tech | MRR, Churn Rate, Expansion MRR, Net Revenue Retention | Monitoring recurring revenue expansion and retention dynamics |
| **Omnichannel Retail Sales & Margin Velocity** | E-Commerce | Gross Margins, Sales Velocity, Promotional Lift | Evaluating regional product discount impacts on profitability |

---

## 🛠️ Technology Stack

- **Frontend Application**:
  - React 18 with TypeScript
  - Tailwind CSS for modern utility-first layout and responsive typography
  - Recharts for interactive SVG charting
  - Lucide React for consistent icon design
- **Backend Service & Engine**:
  - Node.js & Express.js REST API
  - AlaSQL for in-memory relational SQL execution, table management, and dump generation
  - Vite & esbuild for fast bundle compilation
- **Hosting & Cloud Architecture**:
  - Render.com (Production Node Web Service)
  - Google Cloud Run (Containerized Microservice)

---

## 💻 Local Development Setup

Follow these steps to run TrendScope locally on your machine:

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/trendscope.git
cd trendscope
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Start the Development Server
```bash
npm run dev
```

The application will start at:
- **Web App**: `http://localhost:3000`
- **Database Studio**: `http://localhost:3000/database`

---

## 🚢 Deployment Guide (Render.com)

To deploy your own instance to Render for free:

1. Fork or push this repository to your **GitHub** account.
2. Sign in to **[Render.com](https://render.com/)** and click **New +** ➔ **Web Service**.
3. Connect your GitHub repository.
4. Configure the service settings:
   - **Language**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Start Command**: `node dist/server.cjs`
   - **Instance Type**: **Free ($0 / month)**
5. Click **Deploy Web Service**.

---

## 📄 API & Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check |
| `GET` | `/api/database/meta` | Retrieves metadata, table definitions, and row counts |
| `POST` | `/api/database/query` | Executes arbitrary SQL queries and returns execution stats |
| `GET` | `/api/database/tables/:table` | Fetches rows for a specified relational table |
| `GET` | `/api/database/dump.sql` | Generates and downloads a complete MySQL 8.0 `.sql` dump file |

---

## 📜 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it for personal, academic, or commercial purposes.

---

<p align="center">
  Built with ❤️ for data intelligence and visualization.  
  <br />
  <strong><a href="https://trendscope-uohq.onrender.com">Launch TrendScope Live &rarr;</a></strong>
</p>
