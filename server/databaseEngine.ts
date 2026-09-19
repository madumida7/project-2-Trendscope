import alasql from 'alasql';

export interface ColumnDefinition {
  field: string;
  type: string;
  null: 'YES' | 'NO';
  key: 'PRI' | 'UNI' | '';
  default: string | null;
  extra: string;
}

export interface TableInfo {
  name: string;
  rowCount: number;
  engine: string;
  collation: string;
  comment: string;
  columns: ColumnDefinition[];
}

export interface QueryResult {
  success: boolean;
  sql: string;
  executionTimeMs: number;
  rowCount: number;
  columns: string[];
  rows: Record<string, any>[];
  message?: string;
  error?: string;
}

// Initialize tables and seed initial data
let initialized = false;

export function initDatabase() {
  if (initialized) return;

  try {
    // 1. users table
    alasql(`CREATE TABLE IF NOT EXISTS users (
      id STRING PRIMARY KEY,
      name STRING,
      email STRING,
      role STRING,
      status STRING,
      created_at STRING,
      last_login STRING
    );`);

    // 2. datasets table
    alasql(`CREATE TABLE IF NOT EXISTS datasets (
      id STRING PRIMARY KEY,
      name STRING,
      category STRING,
      row_count INT,
      column_count INT,
      description STRING,
      uploaded_by STRING,
      uploaded_at STRING
    );`);

    // 3. predictions table
    alasql(`CREATE TABLE IF NOT EXISTS predictions (
      id STRING PRIMARY KEY,
      dataset_id STRING,
      metric_name STRING,
      story STRING,
      confidence INT,
      direction STRING,
      projected_value NUMBER,
      baseline_avg NUMBER,
      change_rate NUMBER
    );`);

    // 4. activity_logs table
    alasql(`CREATE TABLE IF NOT EXISTS activity_logs (
      id STRING PRIMARY KEY,
      user_name STRING,
      action STRING,
      details STRING,
      status STRING,
      timestamp STRING
    );`);

    // 5. system_config table
    alasql(`CREATE TABLE IF NOT EXISTS system_config (
      config_key STRING PRIMARY KEY,
      config_value STRING,
      category STRING,
      updated_at STRING
    );`);

    // Seed initial users
    alasql(`INSERT INTO users VALUES 
      ('user-admin-1', 'Alexander Vance', 'admin@trendscope.ai', 'admin', 'active', '2026-08-10', 'Just now'),
      ('user-analyst-2', 'Dr. Sarah Chen', 'sarah.chen@healthanalytics.org', 'analyst', 'active', '2026-08-14', '2 hours ago'),
      ('user-demo-3', 'Jordan Lee', 'jordan@enterprise.io', 'user', 'active', '2026-09-01', 'Yesterday')
    ;`);

    // Seed initial datasets
    alasql(`INSERT INTO datasets VALUES 
      ('dataset-student-perf', 'Student Academic & Attendance Performance', 'student', 24, 8, 'Weekly student subject evaluation scores, study hours, and attendance rates.', 'Prof. Anderson (Admin)', '2026-09-15 08:30 AM'),
      ('dataset-hospital-surge', 'Pediatric Respiratory ER Patient Admissions', 'hospital', 18, 7, 'Winter respiratory surge admissions, ICU occupancy, and bed capacity data.', 'Dr. Vance (Medical Dir)', '2026-09-16 11:20 AM'),
      ('dataset-saas-mrr', 'B2B Enterprise SaaS MRR & Net Retention', 'saas', 16, 7, 'Monthly recurring revenue, churn dynamics, customer acquisition, and net retention.', 'Alexander Vance (CFO)', '2026-09-17 02:45 PM'),
      ('dataset-retail-sales', 'Omnichannel Retail Sales & Margin Velocity', 'business', 20, 7, 'Multi-region revenue velocity, promotional margins, and seasonal demand metrics.', 'Jordan Lee (Ops)', '2026-09-18 09:15 AM')
    ;`);

    // Seed initial predictions
    alasql(`INSERT INTO predictions VALUES 
      ('pred-1', 'dataset-student-perf', 'Mathematics Exam Average', 'Students maintaining >=85% attendance are projected to score 8.4 points higher in upcoming midterms.', 91, 'rising', 84.8, 76.4, 11.0),
      ('pred-2', 'dataset-hospital-surge', 'Weekly ER Admissions', 'Projecting an influx of 142 patient admissions this weekend due to seasonal respiratory peak.', 88, 'spike', 142.0, 118.0, 20.3),
      ('pred-3', 'dataset-saas-mrr', 'Monthly Recurring Revenue', 'Expansion MRR is trending upwards with Net Revenue Retention anticipated to cross 118%.', 94, 'rising', 234500.0, 210000.0, 11.7),
      ('pred-4', 'dataset-retail-sales', 'Gross Margin Velocity', 'Promotional discounts during Q3 may compress profit margins by 3.2% without bundled incentives.', 82, 'falling', 42.1, 45.3, -7.1)
    ;`);

    // Seed initial activity logs
    alasql(`INSERT INTO activity_logs VALUES 
      ('act-1', 'Alexander Vance', 'Prediction Model Run', 'Computed 3-period moving average on Respiratory Surge Dataset', 'success', '10 mins ago'),
      ('act-2', 'Dr. Sarah Chen', 'Dataset Ingested', 'Imported 24 records: Student Academic & Attendance Performance', 'success', '42 mins ago'),
      ('act-3', 'Jordan Lee', 'Visual Dashboard Created', 'Configured Multi-axis Revenue & Margin Area Chart', 'success', '2 hours ago'),
      ('act-4', 'System Service', 'System Health Check', 'All analytical pipelines operating at 99.98% reliability', 'success', '4 hours ago')
    ;`);

    // Seed system configs
    alasql(`INSERT INTO system_config VALUES 
      ('db_engine', 'MySQL 8.0.36 Community / InnoDB Compatible', 'engine', '2026-09-19 10:00:00'),
      ('default_timezone', 'UTC', 'system', '2026-09-19 10:00:00'),
      ('max_upload_size_mb', '25', 'storage', '2026-09-19 10:00:00'),
      ('ai_model', 'TrendScope Statistical & Time-Series v2.4', 'ai', '2026-09-19 10:00:00')
    ;`);

    initialized = true;
  } catch (err) {
    console.error('Failed to initialize in-memory database:', err);
  }
}

// Table schema dictionary for MySQL DESCRIBE compatibility
const TABLE_SCHEMAS: Record<string, ColumnDefinition[]> = {
  users: [
    { field: 'id', type: 'varchar(64)', null: 'NO', key: 'PRI', default: null, extra: '' },
    { field: 'name', type: 'varchar(128)', null: 'NO', key: '', default: null, extra: '' },
    { field: 'email', type: 'varchar(128)', null: 'NO', key: 'UNI', default: null, extra: '' },
    { field: 'role', type: 'varchar(32)', null: 'NO', key: '', default: 'user', extra: '' },
    { field: 'status', type: 'varchar(32)', null: 'NO', key: '', default: 'active', extra: '' },
    { field: 'created_at', type: 'varchar(64)', null: 'NO', key: '', default: null, extra: '' },
    { field: 'last_login', type: 'varchar(64)', null: 'YES', key: '', default: null, extra: '' },
  ],
  datasets: [
    { field: 'id', type: 'varchar(64)', null: 'NO', key: 'PRI', default: null, extra: '' },
    { field: 'name', type: 'varchar(128)', null: 'NO', key: '', default: null, extra: '' },
    { field: 'category', type: 'varchar(64)', null: 'NO', key: '', default: 'general', extra: '' },
    { field: 'row_count', type: 'int', null: 'NO', key: '', default: '0', extra: '' },
    { field: 'column_count', type: 'int', null: 'NO', key: '', default: '0', extra: '' },
    { field: 'description', type: 'text', null: 'YES', key: '', default: null, extra: '' },
    { field: 'uploaded_by', type: 'varchar(128)', null: 'NO', key: '', default: null, extra: '' },
    { field: 'uploaded_at', type: 'varchar(64)', null: 'NO', key: '', default: null, extra: '' },
  ],
  predictions: [
    { field: 'id', type: 'varchar(64)', null: 'NO', key: 'PRI', default: null, extra: '' },
    { field: 'dataset_id', type: 'varchar(64)', null: 'NO', key: '', default: null, extra: '' },
    { field: 'metric_name', type: 'varchar(128)', null: 'NO', key: '', default: null, extra: '' },
    { field: 'story', type: 'text', null: 'NO', key: '', default: null, extra: '' },
    { field: 'confidence', type: 'int', null: 'NO', key: '', default: '80', extra: '' },
    { field: 'direction', type: 'varchar(32)', null: 'NO', key: '', default: 'rising', extra: '' },
    { field: 'projected_value', type: 'double', null: 'NO', key: '', default: '0.0', extra: '' },
    { field: 'baseline_avg', type: 'double', null: 'NO', key: '', default: '0.0', extra: '' },
    { field: 'change_rate', type: 'double', null: 'NO', key: '', default: '0.0', extra: '' },
  ],
  activity_logs: [
    { field: 'id', type: 'varchar(64)', null: 'NO', key: 'PRI', default: null, extra: '' },
    { field: 'user_name', type: 'varchar(128)', null: 'NO', key: '', default: null, extra: '' },
    { field: 'action', type: 'varchar(128)', null: 'NO', key: '', default: null, extra: '' },
    { field: 'details', type: 'text', null: 'YES', key: '', default: null, extra: '' },
    { field: 'status', type: 'varchar(32)', null: 'NO', key: '', default: 'success', extra: '' },
    { field: 'timestamp', type: 'varchar(64)', null: 'NO', key: '', default: null, extra: '' },
  ],
  system_config: [
    { field: 'config_key', type: 'varchar(64)', null: 'NO', key: 'PRI', default: null, extra: '' },
    { field: 'config_value', type: 'text', null: 'NO', key: '', default: null, extra: '' },
    { field: 'category', type: 'varchar(64)', null: 'NO', key: '', default: null, extra: '' },
    { field: 'updated_at', type: 'varchar(64)', null: 'NO', key: '', default: null, extra: '' },
  ],
};

export function getDatabaseMetadata(): {
  databaseName: string;
  serverVersion: string;
  engine: string;
  uptime: number;
  tables: TableInfo[];
} {
  initDatabase();
  const tableNames = Object.keys(TABLE_SCHEMAS);
  const tables: TableInfo[] = tableNames.map((tName) => {
    let count = 0;
    try {
      const rows = alasql(`SELECT COUNT(*) AS cnt FROM ${tName}`) as any[];
      count = rows[0]?.cnt || 0;
    } catch {
      count = 0;
    }

    return {
      name: tName,
      rowCount: count,
      engine: 'InnoDB',
      collation: 'utf8mb4_unicode_ci',
      comment: `TrendScope Relational Table (${tName})`,
      columns: TABLE_SCHEMAS[tName] || [],
    };
  });

  return {
    databaseName: 'trendscope_mysql_db',
    serverVersion: '8.0.36 Community (Open Source Relational Engine)',
    engine: 'InnoDB',
    uptime: Math.floor(process.uptime()),
    tables,
  };
}

export function executeSqlQuery(rawSql: string): QueryResult {
  initDatabase();
  const start = performance.now();
  const trimmed = rawSql.trim().replace(/;+$/, '');

  try {
    // Handle SHOW TABLES
    if (/^SHOW\s+TABLES/i.test(trimmed)) {
      const tables = Object.keys(TABLE_SCHEMAS).map((name) => ({
        Tables_in_trendscope_mysql_db: name,
      }));
      return {
        success: true,
        sql: rawSql,
        executionTimeMs: Number((performance.now() - start).toFixed(2)),
        rowCount: tables.length,
        columns: ['Tables_in_trendscope_mysql_db'],
        rows: tables,
      };
    }

    // Handle DESCRIBE <table> or SHOW COLUMNS FROM <table>
    const descMatch = trimmed.match(/^(?:DESCRIBE|DESC|SHOW\s+COLUMNS\s+FROM)\s+([a-zA-Z0-9_]+)/i);
    if (descMatch) {
      const tableName = descMatch[1].toLowerCase();
      const schema = TABLE_SCHEMAS[tableName];
      if (!schema) {
        throw new Error(`Table 'trendscope_mysql_db.${tableName}' doesn't exist`);
      }
      const descRows = schema.map((col) => ({
        Field: col.field,
        Type: col.type,
        Null: col.null,
        Key: col.key,
        Default: col.default,
        Extra: col.extra,
      }));
      return {
        success: true,
        sql: rawSql,
        executionTimeMs: Number((performance.now() - start).toFixed(2)),
        rowCount: descRows.length,
        columns: ['Field', 'Type', 'Null', 'Key', 'Default', 'Extra'],
        rows: descRows,
      };
    }

    // Execute standard SQL query via alasql
    const result = alasql(trimmed);
    const executionTimeMs = Number((performance.now() - start).toFixed(2));

    if (Array.isArray(result)) {
      const columns = result.length > 0 ? Object.keys(result[0]) : [];
      return {
        success: true,
        sql: rawSql,
        executionTimeMs,
        rowCount: result.length,
        columns,
        rows: result,
        message: `${result.length} row(s) in set (${executionTimeMs} ms)`,
      };
    } else {
      // DDL or DML (INSERT / UPDATE / DELETE)
      return {
        success: true,
        sql: rawSql,
        executionTimeMs,
        rowCount: typeof result === 'number' ? result : 1,
        columns: [],
        rows: [],
        message: `Query OK, affected ${result ?? 1} row(s) (${executionTimeMs} ms)`,
      };
    }
  } catch (err: any) {
    const executionTimeMs = Number((performance.now() - start).toFixed(2));
    return {
      success: false,
      sql: rawSql,
      executionTimeMs,
      rowCount: 0,
      columns: [],
      rows: [],
      error: err?.message || String(err),
    };
  }
}

export function generateMySqlDump(): string {
  initDatabase();
  const timestamp = new Date().toISOString();
  let dump = `-- ========================================================\n`;
  dump += `-- TrendScope MySQL Open-Source Database Dump\n`;
  dump += `-- Server version: MySQL 8.0.36-Community-InnoDB\n`;
  dump += `-- Database: trendscope_mysql_db\n`;
  dump += `-- Generated at: ${timestamp}\n`;
  dump += `-- ========================================================\n\n`;
  dump += `/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;\n`;
  dump += `/*!40101 SET NAMES utf8mb4 */;\n`;
  dump += `/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;\n`;
  dump += `/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;\n\n`;
  dump += `CREATE DATABASE IF NOT EXISTS \`trendscope_mysql_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
  dump += `USE \`trendscope_mysql_db\`;\n\n`;

  const tableNames = Object.keys(TABLE_SCHEMAS);

  for (const tName of tableNames) {
    const cols = TABLE_SCHEMAS[tName];
    dump += `-- --------------------------------------------------------\n`;
    dump += `-- Table structure for table \`${tName}\`\n`;
    dump += `-- --------------------------------------------------------\n\n`;
    dump += `DROP TABLE IF EXISTS \`${tName}\`;\n`;
    dump += `CREATE TABLE \`${tName}\` (\n`;

    const colLines = cols.map((col) => {
      let line = `  \`${col.field}\` ${col.type.toUpperCase()}`;
      if (col.null === 'NO') line += ' NOT NULL';
      if (col.default !== null) line += ` DEFAULT '${col.default}'`;
      if (col.key === 'PRI') line += ' PRIMARY KEY';
      return line;
    });

    dump += colLines.join(',\n') + '\n';
    dump += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

    // Dump records
    try {
      const rows = alasql(`SELECT * FROM ${tName}`) as any[];
      if (rows && rows.length > 0) {
        dump += `-- Dumping data for table \`${tName}\`\n`;
        dump += `INSERT INTO \`${tName}\` VALUES\n`;
        const rowStrings = rows.map((r) => {
          const valStrings = cols.map((c) => {
            const v = r[c.field];
            if (v === null || v === undefined) return 'NULL';
            if (typeof v === 'number') return v;
            return `'${String(v).replace(/'/g, "''")}'`;
          });
          return `  (${valStrings.join(', ')})`;
        });
        dump += rowStrings.join(',\n') + ';\n\n';
      }
    } catch {
      // Continue
    }
  }

  dump += `/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;\n`;
  dump += `/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;\n`;
  dump += `/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;\n`;
  dump += `-- Dump completed on ${timestamp}\n`;

  return dump;
}
