import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initializeDatabase, db } from './database.postgres.session.js';
import { format, addDays, startOfWeek, differenceInDays } from 'date-fns';
import { getCustodyStatus, getMonthCustody, getNextDateNights } from './custodySchedule.js';

dotenv.config();

// --- JWT Config ---
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRY = '7d';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['*'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// ============= SECURITY: Rate Limiting =============
const rateLimitStore = new Map();

function rateLimit(windowMs = 60000, maxRequests = 100) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    const entry = rateLimitStore.get(key);
    if (entry && now < entry.resetTime) {
      entry.count++;
      if (entry.count > maxRequests) {
        return res.status(429).json({
          error: 'Too many requests. Please try again later.',
          resetIn: Math.ceil((entry.resetTime - now) / 1000)
        });
      }
    } else {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    }

    next();
  };
}

app.use(rateLimit(60000, 100)); // 100 requests per minute per IP

// ============= SECURITY: Field Allowlist (Prevent SQL Injection) =============
const ALLOWED_ENTRY_FIELDS = new Set([
  'type', 'title', 'content', 'category', 'mood',
  'target_date', 'target_time', 'end_date', 'tags',
  'author', 'status', 'progress', 'location',
  'recurrence', 'reminder_minutes'
]);

function sanitizeUpdateFields(updates) {
  const sanitized = {};
  for (const [key, value] of Object.entries(updates)) {
    if (ALLOWED_ENTRY_FIELDS.has(key)) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Initialize database on startup
await initializeDatabase();

// --- Hash shared password (awaited, no race condition) ---
// Prefer AUTH_PASSWORD_HASH (pre-hashed bcrypt) to avoid re-hashing on every startup.
// Falls back to hashing AUTH_PASSWORD at boot if no pre-hashed value is provided.
let hashedPassword = null;
if (process.env.AUTH_PASSWORD_HASH) {
  hashedPassword = process.env.AUTH_PASSWORD_HASH;
} else if (process.env.AUTH_PASSWORD) {
  hashedPassword = await bcrypt.hash(process.env.AUTH_PASSWORD, 10);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ============= AUTH MIDDLEWARE =============
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing auth token' });
  }

  const token = authHeader.slice(7);
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ============= ENTRIES ROUTES =============

// Get all entries with optional filtering
app.get('/api/entries', requireAuth, async (req, res) => {
  try {
    const { type, status, category, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM entries WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (type) {
      query += ` AND type = $${paramIndex++}`;
      params.push(type);
    }
    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));
    
    const entries = await db.all(query, params);
    res.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new entry
app.post('/api/entries', requireAuth, async (req, res) => {
  try {
    const { type, title, content, category, mood, target_date, tags, author } = req.body;
    
    const result = await db.query(
      `INSERT INTO entries (type, title, content, category, mood, target_date, tags, author)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [type, title, content, category, mood, target_date, tags ? JSON.stringify(tags) : null, author]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update entry
app.put('/api/entries/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // SECURITY: Sanitize fields to prevent SQL injection via field names
    const updates = sanitizeUpdateFields(req.body);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Build dynamic update query with ONLY allowed fields
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      setClause.push(`${key} = $${paramIndex++}`);
      values.push(key === 'tags' ? JSON.stringify(value) : value);
    });

    values.push(id);

    const result = await db.query(
      `UPDATE entries SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating entry:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete entry
app.delete('/api/entries/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM entries WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= CALENDAR ROUTES =============

// Get events for a specific month
app.get('/api/calendar/month/:year/:month', requireAuth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    
    const result = await db.query(
      `SELECT * FROM entries 
       WHERE type IN ('date', 'event') 
       AND target_date BETWEEN $1 AND $2
       ORDER BY target_date ASC, target_time ASC`,
      [startDate, endDate]
    );
    
    res.json({ events: result.rows });
  } catch (error) {
    console.error('Error fetching month events:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get events for a specific day
app.get('/api/calendar/day/:date', requireAuth, async (req, res) => {
  try {
    const { date } = req.params;
    
    const result = await db.query(
      `SELECT * FROM entries 
       WHERE type IN ('date', 'event') 
       AND target_date::date = $1::date
       ORDER BY target_time ASC`,
      [date]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching day events:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create calendar event
app.post('/api/calendar/events', requireAuth, async (req, res) => {
  try {
    const { title, content, target_date, target_time, location } = req.body;
    
    const result = await db.query(
      `INSERT INTO entries (type, title, content, target_date, target_time, location)
       VALUES ('date', $1, $2, $3, $4, $5)
       RETURNING *`,
      [title, content || '', target_date, target_time, location]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update calendar event
app.put('/api/calendar/events/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, target_date, target_time, location } = req.body;
    
    const result = await db.query(
      `UPDATE entries 
       SET title = $1, content = $2, target_date = $3, target_time = $4, location = $5
       WHERE id = $6 AND type IN ('date', 'event')
       RETURNING *`,
      [title, content, target_date, target_time, location, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete calendar event  
app.delete('/api/calendar/events/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `DELETE FROM entries WHERE id = $1 AND type IN ('date', 'event') RETURNING id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= IDEAS ROUTES =============

// Get all ideas
app.get('/api/ideas', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM entries 
       WHERE type = 'idea' 
       ORDER BY created_at DESC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching ideas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create idea
app.post('/api/ideas', requireAuth, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    const result = await db.query(
      `INSERT INTO entries (type, title, content)
       VALUES ('idea', $1, $2)
       RETURNING *`,
      [title, content || '']
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating idea:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update idea
app.put('/api/ideas/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    
    const result = await db.query(
      `UPDATE entries 
       SET title = $1, content = $2
       WHERE id = $3 AND type = 'idea'
       RETURNING *`,
      [title, content, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating idea:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete idea
app.delete('/api/ideas/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `DELETE FROM entries WHERE id = $1 AND type = 'idea' RETURNING id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    
    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting idea:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= RITUALS ROUTES =============

app.get('/api/rituals/current', requireAuth, async (req, res) => {
  try {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    const weekOf = format(weekStart, 'yyyy-MM-dd');
    
    const ritual = await db.get('SELECT * FROM rituals WHERE week_of = $1', [weekOf]);
    res.json(ritual || null);
  } catch (error) {
    console.error('Error fetching ritual:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rituals', requireAuth, async (req, res) => {
  try {
    const { gratitude, challenges, excitement, mood_score, reflections } = req.body;
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    const weekOf = format(weekStart, 'yyyy-MM-dd');
    
    const result = await db.query(
      `INSERT INTO rituals (week_of, gratitude, challenges, excitement, mood_score, reflections)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (week_of) DO UPDATE SET
         gratitude = $2, challenges = $3, excitement = $4, mood_score = $5, reflections = $6
       RETURNING *`,
      [weekOf, gratitude, challenges, excitement, mood_score, reflections]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving ritual:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= INSIGHTS ROUTES =============

app.get('/api/insights', requireAuth, async (req, res) => {
  try {
    const thirtyDaysAgo = format(addDays(new Date(), -30), 'yyyy-MM-dd');
    
    // Get recent activity counts
    const stats = await db.get(`
      SELECT 
        COUNT(CASE WHEN type = 'goal' THEN 1 END) as goals_count,
        COUNT(CASE WHEN type = 'memory' THEN 1 END) as memories_count,
        COUNT(CASE WHEN type = 'feeling' THEN 1 END) as feelings_count,
        COUNT(*) as total_entries
      FROM entries
      WHERE created_at >= $1
    `, [thirtyDaysAgo]);
    
    // Get completed goals
    const completedGoals = await db.all(
      `SELECT * FROM entries 
       WHERE type = 'goal' AND status = 'completed' AND completed_at >= $1
       ORDER BY completed_at DESC LIMIT 5`,
      [thirtyDaysAgo]
    );
    
    // Get recent memories
    const recentMemories = await db.all(
      `SELECT * FROM entries 
       WHERE type = 'memory' AND created_at >= $1
       ORDER BY created_at DESC LIMIT 5`,
      [thirtyDaysAgo]
    );
    
    res.json({
      stats,
      completedGoals,
      recentMemories,
      period: '30_days'
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= CUSTODY ROUTES =============

app.get('/api/custody/status', (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const status = getCustodyStatus(targetDate);
    res.json(status);
  } catch (error) {
    console.error('Error getting custody status:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/custody/month', (req, res) => {
  try {
    const { year, month } = req.query;
    const schedule = getMonthCustody(parseInt(year), parseInt(month));
    res.json(schedule);
  } catch (error) {
    console.error('Error getting month custody:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/custody/date-nights', (req, res) => {
  try {
    const nights = getNextDateNights();
    res.json(nights);
  } catch (error) {
    console.error('Error getting date nights:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= AUTH ROUTE =============

// Dedicated login rate limiter: 5 attempts per minute per IP
const loginRateLimit = rateLimit(60000, 5);

app.post('/api/auth/login', loginRateLimit, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || !hashedPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, hashedPassword);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ sub: 'shared' }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.json({ success: true, token });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✨ OurJourney backend running on port ${PORT}`);
  console.log(`📊 PostgreSQL database connected`);
  console.log(`🚀 Ready to track your relationship journey!`);
});