const express  = require('express');
const cors     = require('cors');
require('dotenv').config();

const authRoutes      = require('./routes/auth');
const userRoutes      = require('./routes/user');
const sosRoutes       = require('./routes/sos');
const vigilanceRoutes = require('./routes/vigilance');

const app = express();

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'WEARMS API', timestamp: new Date().toISOString() });
});

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/user',      userRoutes);
app.use('/api/sos',       sosRoutes);
app.use('/api/vigilance', vigilanceRoutes);

// ── 404 handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ───────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status  = err.statusCode || 500;
  const message = err.message    || 'Internal Server Error';
  res.status(status).json({ error: message });
});

module.exports = app;
