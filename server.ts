import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { 
  getDatabaseMetadata, 
  executeSqlQuery, 
  generateMySqlDump 
} from './server/databaseEngine';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// In-memory backend store seeded with production-grade data
interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'analyst';
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin: string;
}

const users: StoredUser[] = [
  {
    id: 'user-admin-1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@trendscope.ai',
    role: 'admin',
    status: 'active',
    createdAt: '2026-08-10',
    lastLogin: 'Just now',
  },
  {
    id: 'user-analyst-2',
    name: 'Dr. Priya Nair',
    email: 'priya.nair@healthanalytics.in',
    role: 'analyst',
    status: 'active',
    createdAt: '2026-08-14',
    lastLogin: '2 hours ago',
  },
  {
    id: 'user-demo-3',
    name: 'Rohan Patel',
    email: 'rohan.patel@enterprise.in',
    role: 'user',
    status: 'active',
    createdAt: '2026-09-01',
    lastLogin: 'Yesterday',
  },
];

let activityLogs = [
  { id: 'act-1', action: 'Prediction Model Run', timestamp: '10 mins ago', user: 'Aarav Sharma', details: 'Computed 3-period moving average on Respiratory Surge Dataset', iconType: 'prediction' },
  { id: 'act-2', action: 'Dataset Uploaded', timestamp: '42 mins ago', user: 'Dr. Priya Nair', details: 'Imported 24 records: Student Academic & Attendance Performance', iconType: 'upload' },
  { id: 'act-3', action: 'Visual Dashboard Created', timestamp: '2 hours ago', user: 'Rohan Patel', details: 'Configured Multi-axis Revenue & Margin Area Chart', iconType: 'chart' },
  { id: 'act-4', action: 'System Health Check', timestamp: '4 hours ago', user: 'System Service', details: 'All analytical pipelines operating at 99.98% reliability', iconType: 'admin' },
];

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'TrendScope Predictive Engine',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());

  if (user) {
    user.lastLogin = 'Just now';
    return res.json({ success: true, user, token: `tk_${user.id}_${Date.now()}` });
  }

  // Auto-provision demo account if arbitrary demo email entered
  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Demo User',
    email: email || 'demo@trendscope.ai',
    role: role || (email.includes('admin') ? 'admin' : 'user'),
    status: 'active',
    createdAt: new Date().toISOString().split('T')[0],
    lastLogin: 'Just now',
  };
  users.push(newUser);

  activityLogs.unshift({
    id: `act-${Date.now()}`,
    action: 'User Session Initiated',
    timestamp: 'Just now',
    user: newUser.name,
    details: `Signed in as ${newUser.role.toUpperCase()}`,
    iconType: 'login',
  });

  return res.json({ success: true, user: newUser, token: `tk_${newUser.id}_${Date.now()}` });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, role } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Account with this email already exists' });
  }

  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    role: role || 'user',
    status: 'active',
    createdAt: new Date().toISOString().split('T')[0],
    lastLogin: 'Just now',
  };
  users.push(newUser);

  return res.json({ success: true, user: newUser, token: `tk_${newUser.id}_${Date.now()}` });
});

app.get('/api/admin/users', (req, res) => {
  res.json({ users });
});

app.patch('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const { role, status } = req.body;
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (role) user.role = role;
  if (status) user.status = status;
  return res.json({ success: true, user });
});

app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  users.splice(idx, 1);
  return res.json({ success: true, message: 'User deleted' });
});

app.get('/api/admin/stats', (req, res) => {
  res.json({
    totalUsers: users.length,
    activeSessions: 3,
    storageUsedMb: 14.8,
    systemHealth: 'healthy',
    totalPredictionsGenerated: 1842,
    activityLogs,
  });
});

// ==========================================
// MySQL Relational Database Explorer API
// ==========================================
app.get('/api/database/meta', (req, res) => {
  try {
    const meta = getDatabaseMetadata();
    res.json(meta);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch database meta' });
  }
});

app.post('/api/database/query', (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ error: 'SQL query string is required' });
    }
    const result = executeSqlQuery(sql);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Query execution error' });
  }
});

app.get('/api/database/dump.sql', (req, res) => {
  try {
    const sqlDump = generateMySqlDump();
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', 'attachment; filename="trendscope_mysql_dump.sql"');
    res.send(sqlDump);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to generate MySQL dump' });
  }
});

app.get('/api/database/tables/:table', (req, res) => {
  try {
    const { table } = req.params;
    const result = executeSqlQuery(`SELECT * FROM ${table} LIMIT 500`);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch table records' });
  }
});

// Vite Middleware for SPA development & static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TrendScope server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
