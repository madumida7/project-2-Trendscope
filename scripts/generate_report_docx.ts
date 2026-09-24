import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  PageBreak,
  ShadingType,
} from 'docx';

function createHeading(text: string, level: any, spaceBefore = 240, spaceAfter = 120): Paragraph {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: spaceBefore, after: spaceAfter },
  });
}

function createParagraph(text: string, options: { bold?: boolean; italics?: boolean; spaceAfter?: number } = {}): Paragraph {
  return new Paragraph({
    spacing: { after: options.spaceAfter ?? 140, line: 276 },
    children: [
      new TextRun({
        text,
        bold: options.bold,
        italics: options.italics,
        font: 'Calibri',
        size: 22, // 11pt
      }),
    ],
  });
}

function createBullet(title: string, desc: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 100, line: 260 },
    children: [
      new TextRun({ text: `${title}: `, bold: true, font: 'Calibri', size: 22 }),
      new TextRun({ text: desc, font: 'Calibri', size: 22 }),
    ],
  });
}

function createSubBullet(title: string, desc: string): Paragraph {
  return new Paragraph({
    bullet: { level: 1 },
    spacing: { after: 80, line: 250 },
    children: [
      new TextRun({ text: `${title}: `, bold: true, font: 'Calibri', size: 21 }),
      new TextRun({ text: desc, font: 'Calibri', size: 21 }),
    ],
  });
}

function createCallout(title: string, body: string): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left: { style: BorderStyle.SINGLE, size: 24, color: '4F46E5' },
      right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: 'F3F4F6', type: ShadingType.CLEAR, color: 'auto' },
            margins: { top: 140, bottom: 140, left: 180, right: 180 },
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [new TextRun({ text: title, bold: true, color: '4338CA', font: 'Calibri', size: 22 })],
              }),
              new Paragraph({
                spacing: { after: 0 },
                children: [new TextRun({ text: body, italics: true, color: '374151', font: 'Calibri', size: 21 })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createCustomTable(headers: string[], rows: string[][], colWidthsPercent: number[]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'D1D5DB' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D1D5DB' },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'D1D5DB' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'D1D5DB' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'E5E7EB' },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'E5E7EB' },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((header, idx) => {
          return new TableCell({
            width: { size: colWidthsPercent[idx], type: WidthType.PERCENTAGE },
            shading: { fill: '1E293B', type: ShadingType.CLEAR, color: 'auto' },
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: header, bold: true, color: 'FFFFFF', font: 'Calibri', size: 20 })],
              }),
            ],
          });
        }),
      }),
      ...rows.map((rowCells, rIdx) => {
        const bg = rIdx % 2 === 0 ? 'FFFFFF' : 'F9FAFB';
        return new TableRow({
          children: rowCells.map((cellText, cIdx) => {
            return new TableCell({
              width: { size: colWidthsPercent[cIdx], type: WidthType.PERCENTAGE },
              shading: { fill: bg, type: ShadingType.CLEAR, color: 'auto' },
              margins: { top: 100, bottom: 100, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: cellText, font: 'Calibri', size: 20, color: '1F2937' })],
                }),
              ],
            });
          }),
        });
      }),
    ],
  });
}

export async function generateDocument() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22,
            color: '1F2937',
          },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 32, // 16pt
            bold: true,
            color: '1E3A8A', // Deep Blue
            font: 'Calibri',
          },
          paragraph: {
            spacing: { before: 360, after: 160 },
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 26, // 13pt
            bold: true,
            color: '2563EB', // Royal Blue
            font: 'Calibri',
          },
          paragraph: {
            spacing: { before: 240, after: 120 },
          },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 23, // 11.5pt
            bold: true,
            color: '374151',
            font: 'Calibri',
          },
          paragraph: {
            spacing: { before: 180, after: 80 },
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 100 },
                children: [
                  new TextRun({
                    text: 'TrendScope: Project Technical & Architectural Report | MCA 2025-2027',
                    italics: true,
                    size: 18,
                    color: '6B7280',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Page ', size: 18, color: '6B7280' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '6B7280' }),
                  new TextRun({ text: ' of ', size: 18, color: '6B7280' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: '6B7280' }),
                ],
              }),
            ],
          }),
        },
        children: [
          // ==========================================
          // COVER PAGE
          // ==========================================
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 600, after: 100 },
            children: [
              new TextRun({
                text: 'DR. G.R. DAMODARAN COLLEGE OF SCIENCE (AUTONOMOUS)',
                bold: true,
                size: 26,
                color: '1E3A8A',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: 'DEPARTMENT OF COMPUTER SCIENCE & APPLICATIONS (MCA)',
                bold: true,
                size: 22,
                color: '4B5563',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: 'TRENDSCOPE: CLOUD-NATIVE PREDICTIVE ANALYTICS & TIME-SERIES FORECASTING STUDIO',
                bold: true,
                size: 34,
                color: '1E40AF',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: 'A Comprehensive Project Report Submitted for the Master of Computer Applications (MCA) Degree Program',
                italics: true,
                size: 22,
                color: '6B7280',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 100 },
            children: [
              new TextRun({ text: 'Submitted By (MCA Group Project Team):', bold: true, size: 22, color: '374151' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [
              new TextRun({ text: '1. M. JANANI  (Register No: 25MCA029)', bold: true, size: 22, color: '111827' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [
              new TextRun({ text: '2. D. MADHUMITHA  (Register No: 25MCA018)', bold: true, size: 22, color: '111827' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: '3. G. NANDHINI  (Register No: 25MCA035)', bold: true, size: 22, color: '111827' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({ text: 'Department Contact Email: 25mca029@grd.edu.in', size: 20, color: '4B5563' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 100 },
            children: [
              new TextRun({ text: 'Under the Academic Guidance & Engineering Architecture of:', bold: true, size: 20, color: '4B5563' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
            children: [
              new TextRun({ text: 'Faculty of Computer Applications, Dr. G.R. Damodaran College of Science, Coimbatore, Tamil Nadu, India', size: 20, color: '6B7280' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'Academic Year: 2025 - 2027 | Deployment: Render Cloud & Google Cloud Platform', bold: true, size: 20, color: '1E3A8A' }),
            ],
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // ==========================================
          // TABLE OF CONTENTS
          // ==========================================
          createHeading('TABLE OF CONTENTS', HeadingLevel.HEADING_1, 200, 200),
          createCustomTable(
            ['Chapter', 'Topic / Section Title', 'Sub-Sections Included'],
            [
              ['1.0', 'Project Overview', '1.1 Project Title | 1.2 Problem Statement | 1.3 Objectives'],
              ['2.0', 'Requirements & Design', '2.1 Functional Requirements | 2.2 Hardware/Software Specs | 2.3 System Architecture | 2.4 Database Design & Schemas'],
              ['3.0', 'Implementation', '3.1 Technology Stack Justification | 3.2 Module Breakdown (7 Modules) | 3.3 Visual Screen Layouts & Data Flows'],
              ['4.0', 'GitHub, AI Usage & Team Contribution', '4.1 GitHub Repository & CI/CD | 4.2 AI Tools & Engineering Prompts | 4.3 Individual Responsibilities'],
              ['5.0', 'Learning, Conclusion & Future Enhancements', '5.1 Technical Reflections | 5.2 Project Conclusion | 5.3 Scalability & Future Roadmap'],
              ['6.0', 'References & Bibliography', 'IEEE / ACM Standard Academic Citations & Software Manuals'],
            ],
            [15, 45, 40]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ==========================================
          // CHAPTER 1: PROJECT OVERVIEW
          // ==========================================
          createHeading('1. PROJECT OVERVIEW', HeadingLevel.HEADING_1),

          createHeading('1.1 Project Title', HeadingLevel.HEADING_2),
          createParagraph(
            'The project is titled "TrendScope: Cloud-Native Predictive Analytics, In-Memory Relational SQL Engine, and Time-Series Storytelling Studio". It represents an integrated full-stack enterprise analytics platform that unifies real-time exploratory data visualization, automated statistical time-series forecasting, and an open-source MySQL relational database studio accessible entirely through a web browser.'
          ),
          createCallout(
            'Core Philosophy of TrendScope',
            'To demystify predictive data science for executive decision-makers by automatically translating complex statistical curves and regression vectors into concise, actionable human-language narratives paired with empirical confidence scores.'
          ),

          createHeading('1.2 Problem Statement', HeadingLevel.HEADING_2),
          createParagraph(
            'In modern enterprise environments across academia, healthcare, SaaS, and retail, organizations capture massive volumes of longitudinal time-series data. However, standard workflows suffer from several systemic bottlenecks:'
          ),
          createBullet(
            'High Technical Barrier to Entry',
            'Business stakeholders and clinical administrators rarely possess the programming expertise required to build Python/R statistical pipelines or manage local database daemon installations.'
          ),
          createBullet(
            'Disjointed Toolchains',
            'Organizations rely on spreadsheets (Excel, Google Sheets) for basic math, separate database administration tools (phpMyAdmin, DBeaver) for SQL queries, and specialized BI suites (Tableau, PowerBI) for reporting, resulting in siloed data and security vulnerabilities.'
          ),
          createBullet(
            'The "Black-Box" Metric Dilemma',
            'Traditional charting libraries plot lines and bars but offer no interpretive context. Executives are left asking what a curve signifies, why a dip occurred, and what concrete action must be taken.'
          ),
          createBullet(
            'Prohibitive Licensing & Infrastructure Overhead',
            'Enterprise BI platforms require costly per-seat licenses, complex local installation prerequisites, and dedicated server configurations that smaller institutions cannot maintain.'
          ),

          createHeading('1.3 Objectives', HeadingLevel.HEADING_2),
          createParagraph('The primary and secondary engineering objectives established for TrendScope include:'),
          createBullet(
            'Primary Objective 1 - Cloud-Native Accessibility',
            'Develop a zero-installation, browser-based analytics workspace operating on high-availability cloud infrastructure (Render & Google Cloud Platform) with instantaneous cold-start execution.'
          ),
          createBullet(
            'Primary Objective 2 - Automated Statistical Narrative Generation',
            'Engineer an algorithmic engine capable of calculating 3-period moving averages, rate-of-change velocities, and standard-deviation spike detections, compiling them into plain-English storytelling cards.'
          ),
          createBullet(
            'Primary Objective 3 - Zero-Prerequisite Relational SQL Engine',
            'Implement an ANSI-standard MySQL 8.0-compatible relational query engine directly within the Node.js application process, providing a full Web SQL Console, schema browser, and .sql dump exporter without requiring a local XAMPP/WAMP stack.'
          ),
          createBullet(
            'Secondary Objective 4 - Rigorous Data Hygiene Profiling',
            'Provide automatic tabular CSV ingestion that parses data types, calculates column cardinality, detects null density, and generates an empirical Data Hygiene Score (0-100%).'
          ),
          createBullet(
            'Secondary Objective 5 - Auditability & Role Governance',
            'Provide an enterprise Role-Based Access Control (RBAC) structure (Admin, Analyst, User) with chronological audit activity logging to ensure complete system transparency.'
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ==========================================
          // CHAPTER 2: REQUIREMENTS & DESIGN
          // ==========================================
          createHeading('2. REQUIREMENTS & DESIGN', HeadingLevel.HEADING_1),

          createHeading('2.1 Functional Requirements', HeadingLevel.HEADING_2),
          createParagraph('The system functional specifications are divided into discrete operational modules:'),
          createCustomTable(
            ['Req ID', 'Requirement Description', 'Priority', 'Validation Criteria'],
            [
              ['FR-01', 'Multi-domain dataset switching across pre-seeded clinical, academic, and SaaS benchmarks.', 'High', 'Dataset changes update all KPI cards and charts in < 50ms.'],
              ['FR-02', 'Automated CSV ingestion with client-side tabular parsing and column type inference.', 'High', 'Uploads files up to 25MB with live progress feedback.'],
              ['FR-03', 'Data Hygiene Quality Scoring evaluating null counts, duplicate records, and cardinality.', 'Medium', 'Outputs a 0-100% score with breakdown badges.'],
              ['FR-04', 'Interactive multi-modal data visualizations (Line, Bar, Area, and Composition breakdown).', 'High', 'Smooth SVG rendering with dynamic theme color synchronization.'],
              ['FR-05', 'Predictive modeling engine executing Moving Average and Linear Velocity vectors.', 'High', 'Generates projected values, confidence ratings, and natural-language stories.'],
              ['FR-06', 'In-browser MySQL 8.0 relational database studio with live SQL query console.', 'High', 'Parses SELECT, INSERT, UPDATE, SHOW TABLES, and DESCRIBE in < 5ms.'],
              ['FR-07', 'Automated MySQL dump generator streaming production-ready .sql backup files.', 'Medium', 'Exports complete DDL and DML scripts compatible with phpMyAdmin.'],
              ['FR-08', 'Enterprise Role-Based Access Control (RBAC) with Admin, Analyst, and User tiering.', 'Medium', 'Enforces permission boundaries on destructive actions.'],
              ['FR-09', 'Chronological system audit trail recording every analytical model execution and dataset upload.', 'Medium', 'Persists user names, actions, details, and timestamps.'],
              ['FR-10', 'Boardroom Executive Report generator providing print-to-PDF and CSV export capabilities.', 'High', 'Opens formatted modal with executive summary and print styles.'],
              ['FR-11', 'Responsive design supporting desktop, tablet, and mobile viewports with dark/light themes.', 'High', 'Full CSS grid/flexbox responsiveness across all breakpoints.'],
              ['FR-12', 'Sub-millisecond query performance measurement with high-resolution execution timers.', 'Low', 'Displays query timing accurate to two decimal places.'],
            ],
            [12, 48, 15, 25]
          ),

          createHeading('2.2 Software & Hardware Requirements', HeadingLevel.HEADING_2),
          createParagraph('The minimal and recommended system requirements for running and maintaining TrendScope:'),
          createBullet('Server Runtime Environment', 'Node.js LTS (v18.x, v20.x, or v22.x) with npm package manager.'),
          createBullet('Backend Architecture', 'Express.js v4.21.2 with tsx TypeScript execution runtime and esbuild bundler.'),
          createBullet('Database Technology', 'In-process ANSI SQL Relational Engine (AlaSQL v4.5.3) adhering to MySQL 8.0.36 syntax.'),
          createBullet('Frontend Client Framework', 'React v18.3.18 SPA configured with Vite v6.0.5 build tooling and TypeScript v5.7.2.'),
          createBullet('Styling & Design System', 'Tailwind CSS v4.0 with automated dark mode class detection and CSS variable palettes.'),
          createBullet('Data Visualization Engine', 'Recharts v2.15.0 declarative SVG rendering library with Lucide React v0.468.0 icons.'),
          createBullet('Cloud Hosting Tier', 'Render Cloud Web Service (Linux Container) & Google Cloud Platform (Cloud Run).'),
          createBullet('Client Hardware Prerequisites', 'Any modern web browser (Chrome, Firefox, Safari, Edge) on a device with >= 2GB RAM.'),

          createHeading('2.3 System Design & Architecture', HeadingLevel.HEADING_2),
          createParagraph(
            'TrendScope utilizes a unified full-stack decoupled architecture. Rather than running separate development servers for the frontend client and the backend REST API, Express.js acts as the parent process mounting Vite middleware during development and serving pre-compiled static assets in production.'
          ),
          createCallout(
            'Architectural Workflow Diagram',
            '[Client Web Browser (React + Tailwind)] <==> [Vite SPA Router / UI Views]\n' +
            '                                 │ (HTTP / JSON REST API)\n' +
            '                                 ▼\n' +
            '[Express.js Server Layer (server.ts - Port 3000)]\n' +
            '  ├── /api/database/query  <==> [AlaSQL In-Memory Relational Engine]\n' +
            '  ├── /api/database/meta   <==> [Schema & Performance Catalogs]\n' +
            '  ├── /api/database/dump   <==> [MySQL 8.0 .sql Exporter]\n' +
            '  └── /api/health          <==> [Server Telemetry & Uptime Monitor]'
          ),

          createHeading('2.4 Database Design (Relational Schemas & Normalization)', HeadingLevel.HEADING_2),
          createParagraph(
            'The database is structured following Third Normal Form (3NF) principles to eliminate transitive dependencies and redundant storage. Five core relational entities model the platform state:'
          ),
          createCustomTable(
            ['Table Name', 'Primary Key', 'Attributes & Data Types', 'Relational Purpose'],
            [
              ['users', 'id (VARCHAR 64)', 'name, email, role, status, created_at, last_login', 'Maintains authorized personnel accounts and RBAC permissions.'],
              ['datasets', 'id (VARCHAR 64)', 'name, category, row_count, column_count, description, uploaded_by, uploaded_at', 'Catalog of active and historical longitudinal datasets.'],
              ['predictions', 'id (VARCHAR 64)', 'dataset_id (FK), metric_name, story, confidence, direction, projected_value, baseline_avg, change_rate', 'Stores statistical forecast vectors and natural language insights.'],
              ['activity_logs', 'id (VARCHAR 64)', 'user_name, action, details, status, timestamp', 'Chronological immutable audit records for regulatory governance.'],
              ['system_config', 'config_key (VARCHAR 64)', 'config_value, category, updated_at', 'Key-value algorithmic parameters (thresholds, horizons, sensitivity).'],
            ],
            [18, 18, 38, 26]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ==========================================
          // CHAPTER 3: IMPLEMENTATION
          // ==========================================
          createHeading('3. IMPLEMENTATION', HeadingLevel.HEADING_1),

          createHeading('3.1 Technology Stack Justification', HeadingLevel.HEADING_2),
          createParagraph('Every technology selected for TrendScope was chosen to maximize speed, reliability, and ease of deployment:'),
          createBullet(
            'React 18 & TypeScript',
            'Enforces compile-time type safety across complex time-series payloads, preventing runtime null-pointer exceptions and ensuring strict interface adherence across components.'
          ),
          createBullet(
            'Vite 6 Build System',
            'Delivers sub-second Hot Module Replacement (HMR) and utilizes Rollup under the hood for highly optimized production asset tree-shaking.'
          ),
          createBullet(
            'AlaSQL In-Process Engine',
            'Enables authentic relational database operations directly within Node.js without requiring external database server socket connections, zero network latency, and zero cloud hosting costs.'
          ),
          createBullet(
            'Tailwind CSS v4',
            'Eliminates bloated external CSS files, providing instant responsive layouts, accessibility-compliant contrast ratios, and seamless light/dark theme transitions.'
          ),
          createBullet(
            'Express.js & tsx',
            'Minimalist server framework that provides high-throughput JSON REST endpoints and serves compiled Single Page Application assets via unified single-port architecture.'
          ),

          createHeading('3.2 Module Breakdown (7 Core Modules)', HeadingLevel.HEADING_2),

          createHeading('Module 1: Executive Analytics Dashboard (DashboardView.tsx)', HeadingLevel.HEADING_3),
          createParagraph(
            'Acts as the initial landing view, instantly aggregating key performance indicators: Total Observations, Active Trends, Predictive Forecasts, and Overall Statistical Confidence. It parses time-series arrays and renders contextual insight cards highlighting highest performing indicators, lowest trends, and sudden anomaly spikes.'
          ),

          createHeading('Module 2: Dataset Ingestion & Profiling Module (UploadView.tsx)', HeadingLevel.HEADING_3),
          createParagraph(
            'Provides drag-and-drop CSV file ingestion. Features an automated profiling pipeline that audits every column, calculates null counts, distinct cardinality, assigns semantic types (numeric, temporal, categorical), and computes an empirical Hygiene Quality Score (0-100%).'
          ),

          createHeading('Module 3: Multi-Modal Visualization Studio (VisualizationView.tsx)', HeadingLevel.HEADING_3),
          createParagraph(
            'Allows users to examine multidimensional time-series metrics across four distinct rendering modes: Line Trends, Comparative Bar Graphs, Area Volume Charts, and Composition breakdowns. Dynamically updates chart palette accents according to the selected global theme.'
          ),

          createHeading('Module 4: Predictive Forecasting & Storytelling Studio (PredictionView.tsx)', HeadingLevel.HEADING_3),
          createParagraph(
            'Executes statistical 3-period moving average extrapolation and linear velocity rate calculations. Outputs forecast metrics alongside confidence intervals and writes concise executive strategy paragraphs explaining the underlying momentum of the data.'
          ),

          createHeading('Module 5: MySQL Database Web Studio & SQL Console (DatabaseStudioView.tsx)', HeadingLevel.HEADING_3),
          createParagraph(
            'An open-source relational database management environment accessible at /database. Features a real-time table browser, schema inspector, interactive SQL query console, sub-millisecond execution timer, sample query shortcuts, and an automated .sql dump generator.'
          ),

          createHeading('Module 6: Governance & Audit Trail Control Hub (AdminView.tsx)', HeadingLevel.HEADING_3),
          createParagraph(
            'Implements enterprise team administration and role assignment (Admin, Analyst, User). Displays an immutable chronological audit trail detailing user actions, data imports, and model runs to guarantee operational compliance.'
          ),

          createHeading('Module 7: Executive Report Modal Generator (ExecutiveReportModal.tsx)', HeadingLevel.HEADING_3),
          createParagraph(
            'Generates boardroom-ready executive summaries with a single click. Features custom print styling allowing immediate browser printing or PDF saving, alongside raw CSV data export capabilities.'
          ),

          createHeading('3.3 Application Screen Walkthroughs & Layout Structure', HeadingLevel.HEADING_2),
          createParagraph(
            'The user interface is designed with a responsive two-column layout: a collapsible left navigation sidebar paired with a dynamic content canvas and sticky top navigation bar. Key interface states include:'
          ),
          createBullet('Navbar Header', 'Displays institutional branding, active dataset quick-switch selector, global search bar, dark/light toggle, theme palette selector, executive report trigger, and user profile badge (M. Janani - Project Lead).'),
          createBullet('Sidebar Navigation', 'Six direct view triggers with active highlight indicators: Executive Dashboard, Upload & Profile, Interactive Charts, Prediction Stories, MySQL Studio, and Admin Hub.'),
          createBullet('Database Studio Split-Screen', 'Left pane houses the interactive SQL query console with syntax shortcuts; right pane provides live table schema definitions and tabulated result sets.'),

          new Paragraph({ children: [new PageBreak()] }),

          // ==========================================
          // CHAPTER 4: GITHUB, AI USAGE & TEAM CONTRIBUTION
          // ==========================================
          createHeading('4. GITHUB, AI USAGE & TEAM CONTRIBUTION', HeadingLevel.HEADING_1),

          createHeading('4.1 GitHub Repository & Continuous Deployment', HeadingLevel.HEADING_2),
          createParagraph(
            'The project source code is centrally version-controlled on GitHub with an automated continuous deployment (CD) pipeline linked directly to Render Cloud:'
          ),
          createBullet('Public Live Deployment URL', 'https://trendscope-uohq.onrender.com'),
          createBullet('Development Cloud Run URL', 'https://ais-dev-4pxnhkcbdk2b5hsyj4l2of-269945098752.asia-southeast1.run.app'),
          createBullet('Continuous Integration & Deployment', 'Every Git push to the primary branch automatically triggers Render Cloud build webhooks. The remote server clones the repository, runs npm install, executes vite build, and launches node server.ts without downtime.'),
          createBullet('Build Optimization (.npmrc)', 'Configured with custom npm flags to prevent peer-dependency conflicts during remote cloud container compilation.'),

          createHeading('4.2 AI Tools Used & Prompt Engineering Methodology', HeadingLevel.HEADING_2),
          createParagraph(
            'The project leveraged state-of-the-art Generative AI and Developer Tooling to accelerate development, architectural design, and documentation:'
          ),
          createBullet(
            'Google AI Studio (Gemini 2.5 / Gemini 3.8 Flash)',
            'Used as the core engineering assistant for scaffolding TypeScript component interfaces, debugging asynchronous state synchronization, and authoring mathematical time-series moving-average algorithms.'
          ),
          createBullet(
            'Prompt Engineering & Architectural Guardrails',
            'Employed iterative system prompts emphasizing zero-pill visual discipline, strict TypeScript type checking, anti-AI slop design constitution, and real ANSI SQL query parsing rather than mock data.'
          ),
          createBullet(
            'Algorithmic Narrative Modeling',
            'Engineered heuristic prompt templates that translate statistical parameters (mean, standard deviation, slope) into clear, context-aware business recommendations.'
          ),

          createHeading('4.3 Individual Contributions & Task Allocations', HeadingLevel.HEADING_2),
          createParagraph(
            'For the MCA group project submission at Dr. G.R. Damodaran College of Science, engineering and research responsibilities were divided collaboratively among the team members:'
          ),
          createCustomTable(
            ['Team Member & Register No.', 'Assigned Engineering Role', 'Specific Responsibilities & Deliverables'],
            [
              ['M. JANANI\n(Reg No: 25MCA029)', 'Team Lead & Predictive Modeling Architect', 'Unified full-stack architecture (server.ts), time-series moving average algorithms, rate-of-change velocity metrics, confidence score calculations, and cloud deployment on Render.'],
              ['D. MADHUMITHA\n(Reg No: 25MCA018)', 'Relational Database Engineer', 'AlaSQL in-memory relational database design, ANSI SQL query parser, table schema design (users, datasets, predictions, logs), sub-millisecond execution timer, and .sql dump exporter.'],
              ['G. NANDHINI\n(Reg No: 25MCA035)', 'Frontend UI/UX & Data Visualization Lead', 'Tailwind CSS v4 design system, interactive Recharts SVG graphs (Line, Bar, Area, Breakdown), dark/light theme switching, and Executive Report modal with print/PDF features.'],
              ['Joint Group Contribution\n(All Members)', 'System Integration, Testing & Documentation', 'Cross-browser testing, dataset validation, academic documentation, viva presentation slides, and continuous integration testing.'],
            ],
            [25, 25, 50]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ==========================================
          // CHAPTER 5: LEARNING, CONCLUSION & FUTURE ENHANCEMENTS
          // ==========================================
          createHeading('5. LEARNING, CONCLUSION & FUTURE ENHANCEMENTS', HeadingLevel.HEADING_1),

          createHeading('5.1 Individual Learning & Technical Reflections', HeadingLevel.HEADING_2),
          createParagraph(
            'Developing TrendScope provided deep technical immersion in full-stack cloud software engineering. Key learnings include:'
          ),
          createBullet(
            'Full-Stack TypeScript Unification',
            'Mastered the sharing of TypeScript interfaces (User, Dataset, TableInfo) across both client and server layers, guaranteeing end-to-end data integrity.'
          ),
          createBullet(
            'In-Memory Relational Engine Integration',
            'Gained comprehensive insight into database internals, learning how SQL query strings are tokenized, parsed into Abstract Syntax Trees (ASTs), and executed against memory-mapped data structures.'
          ),
          createBullet(
            'Cloud Deployment & Cold-Start Optimization',
            'Overcame remote container compilation hurdles on Render Cloud, implementing custom build scripts and optimizing asset bundle sizes for rapid web delivery.'
          ),
          createBullet(
            'AI-Augmented Software Development',
            'Learned how to effectively collaborate with modern LLMs (Gemini API) to accelerate prototyping while maintaining rigorous code quality and architectural standards.'
          ),

          createHeading('5.2 Conclusion', HeadingLevel.HEADING_2),
          createParagraph(
            'TrendScope successfully fulfills all established academic and engineering objectives. It bridges the gap between raw data manipulation and high-level strategic decision-making. By uniting interactive multi-modal charts, an in-browser MySQL relational studio, and an automated predictive storytelling engine into a single cloud-native web application, TrendScope demonstrates that advanced predictive analytics can be accessible, transparent, and completely free of prohibitive software licensing overhead.'
          ),

          createHeading('5.3 Future Enhancements & Scalability Roadmap', HeadingLevel.HEADING_2),
          createParagraph('Future planned iterations for TrendScope include:'),
          createBullet(
            'Phase 1: Direct PostgreSQL / Cloud SQL Connector',
            'Extend the database studio with real-time remote TCP/SSL socket connections to live enterprise Cloud SQL, PostgreSQL, and Snowflake instances.'
          ),
          createBullet(
            'Phase 2: Deep Machine Learning Models (ARIMA / Prophet / LSTM)',
            'Complement moving-average heuristics with server-side Python microservices executing Autoregressive Integrated Moving Average (ARIMA) and LSTM neural network models.'
          ),
          createBullet(
            'Phase 3: Multi-User Real-Time Collaboration',
            'Integrate WebSocket communication to allow multiple analysts to simultaneously inspect datasets and share live dashboard views with synchronized cursor annotations.'
          ),
          createBullet(
            'Phase 4: Automated Natural Language Querying (NL2SQL)',
            'Incorporate Gemini AI to allow users to ask conversational questions (e.g., "Show me top 5 students in math with attendance > 90%") that automatically compile into executable SQL.'
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ==========================================
          // CHAPTER 6: REFERENCES
          // ==========================================
          createHeading('6. REFERENCES & BIBLIOGRAPHY', HeadingLevel.HEADING_1),
          createParagraph('Academic textbooks, research publications, and official software documentation referenced:'),
          createBullet(
            '[1] Silberschatz, A., Korth, H. F., & Sudarshan, S. (2020)',
            'Database System Concepts (7th Edition). McGraw-Hill Education, New York. ISBN: 978-0078022159.'
          ),
          createBullet(
            '[2] Hyndman, R. J., & Athanasopoulos, G. (2021)',
            'Forecasting: Principles and Practice (3rd Edition). OTexts, Melbourne, Australia. Available online at OTexts.com/fpp3.'
          ),
          createBullet(
            '[3] React Documentation & Core Architecture',
            'Meta Open Source. React 18: Concurrent Rendering & Server Components. Available: https://react.dev.'
          ),
          createBullet(
            '[4] Express.js REST Framework Documentation',
            'OpenJS Foundation. Fast, unopinionated, minimalist web framework for Node.js. Available: https://expressjs.com.'
          ),
          createBullet(
            '[5] AlaSQL Open-Source Project (2024)',
            'Client-Side and In-Process Relational SQL Database for JavaScript & TypeScript. Available: https://github.com/AlaSQL/alasql.'
          ),
          createBullet(
            '[6] Tailwind CSS Design Framework (2025)',
            'Tailwind Labs Inc. Utility-First CSS Framework Specification (Version 4.0). Available: https://tailwindcss.com.'
          ),
          createBullet(
            '[7] Recharts Declarative Charting System',
            'Recharts Community. Composable SVG Data Visualization Library for React. Available: https://recharts.org.'
          ),
          createBullet(
            '[8] IEEE Standard for Software Quality Assurance Processes (IEEE Std 730-2014)',
            'IEEE Computer Society. Software and Systems Engineering Standards Committee, New York, USA.'
          ),
          createBullet(
            '[9] Render Cloud Documentation (2025)',
            'Render Services Inc. Automated Cloud Application Deployment and Container Orchestration. Available: https://render.com/docs.'
          ),
          createBullet(
            '[10] Google DeepMind & Google AI Studio (2025)',
            'Gemini API Developer Documentation: Structured Outputs, Time-Series Modeling, and Reasoning Patterns. Available: https://ai.google.dev.'
          ),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const filePath = path.join(outDir, 'TrendScope_Project_Report.docx');
  fs.writeFileSync(filePath, buffer);
  console.log(`Document generated successfully at: ${filePath} (${buffer.length} bytes)`);
}

generateDocument().catch(console.error);
