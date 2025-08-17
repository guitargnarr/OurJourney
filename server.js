import express from 'express';
import cors from 'cors';
import { initializeDatabase, openDb, queries } from './database.js';
import { format, addDays, startOfWeek, differenceInDays } from 'date-fns';
import { getCustodyStatus, getMonthCustody, getNextDateNights } from './custodySchedule.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
await initializeDatabase();

// ============= ENTRIES ROUTES =============

// Get all entries with optional filtering
app.get('/api/entries', async (req, res) => {
  try {
    const { type, status, category, limit = 50 } = req.query;
    const db = await openDb();
    
    let query = 'SELECT * FROM entries WHERE 1=1';
    const params = [];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const entries = await db.all(query, params);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new entry
app.post('/api/entries', async (req, res) => {
  try {
    const db = await openDb();
    const { type, title, content, category, mood, target_date, tags, author } = req.body;
    
    const result = await db.run(
      `INSERT INTO entries (type, title, content, category, mood, target_date, tags, author)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, title, content, category, mood, target_date, JSON.stringify(tags || []), author]
    );
    
    const newEntry = await db.get('SELECT * FROM entries WHERE id = ?', result.lastID);
    res.json(newEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update entry (including progress)
app.put('/api/entries/:id', async (req, res) => {
  try {
    const db = await openDb();
    const { id } = req.params;
    const updates = req.body;
    
    // Build dynamic update query
    const fields = Object.keys(updates).filter(k => k !== 'id');
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => f === 'tags' ? JSON.stringify(updates[f]) : updates[f]);
    
    await db.run(
      `UPDATE entries SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );
    
    const updated = await db.get('SELECT * FROM entries WHERE id = ?', id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete an entry (move to memories)
app.post('/api/entries/:id/complete', async (req, res) => {
  try {
    const db = await openDb();
    const { id } = req.params;
    
    await db.run(
      `UPDATE entries 
       SET status = 'completed', 
           completed_at = CURRENT_TIMESTAMP,
           progress = 100
       WHERE id = ?`,
      [id]
    );
    
    const completed = await db.get('SELECT * FROM entries WHERE id = ?', id);
    res.json(completed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= CUSTODY ROUTES =============

// Get custody status for a specific date
app.get('/api/custody/status/:date', (req, res) => {
  try {
    const status = getCustodyStatus(req.params.date);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get next available date nights
app.get('/api/custody/next-date-nights', (req, res) => {
  try {
    const { from, count } = req.query;
    const dateNights = getNextDateNights(
      from || new Date(),
      parseInt(count) || 5
    );
    res.json(dateNights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= ANTICIPATION ROUTES =============

// Get next adventure with countdown
app.get('/api/anticipation/next', async (req, res) => {
  try {
    const db = await openDb();
    const nextEvent = await db.get(queries.getNextAdventure);
    
    if (nextEvent) {
      const daysUntil = differenceInDays(new Date(nextEvent.target_date), new Date());
      res.json({
        ...nextEvent,
        days_until: daysUntil,
        countdown_text: daysUntil === 0 ? 'Today!' : 
                       daysUntil === 1 ? 'Tomorrow!' : 
                       `${daysUntil} days`
      });
    } else {
      res.json(null);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming events
app.get('/api/anticipation/upcoming', async (req, res) => {
  try {
    const db = await openDb();
    const events = await db.all(
      `SELECT *, 
       CAST((julianday(target_date) - julianday('now')) AS INTEGER) as days_until
       FROM entries 
       WHERE type IN ('event', 'goal') 
       AND target_date > DATE('now')
       AND status = 'active'
       ORDER BY target_date ASC
       LIMIT 5`
    );
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= RITUALS ROUTES =============

// Get or create weekly ritual
app.get('/api/rituals/current', async (req, res) => {
  try {
    const db = await openDb();
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd');
    
    let ritual = await db.get(
      'SELECT * FROM rituals WHERE week_of = ?',
      [weekStart]
    );
    
    if (!ritual) {
      // Create empty ritual for this week
      const result = await db.run(
        'INSERT INTO rituals (week_of) VALUES (?)',
        [weekStart]
      );
      ritual = await db.get('SELECT * FROM rituals WHERE id = ?', result.lastID);
    }
    
    res.json(ritual);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update weekly ritual
app.put('/api/rituals/:id', async (req, res) => {
  try {
    const db = await openDb();
    const { id } = req.params;
    const { gratitude, challenges, excitement, mood_score, reflections } = req.body;
    
    await db.run(
      `UPDATE rituals 
       SET gratitude = ?, challenges = ?, excitement = ?, 
           mood_score = ?, reflections = ?
       WHERE id = ?`,
      [gratitude, challenges, excitement, mood_score, reflections, id]
    );
    
    const updated = await db.get('SELECT * FROM rituals WHERE id = ?', id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= CALENDAR ROUTES =============

// Get events for a specific month
app.get('/api/calendar/month/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const db = await openDb();
    
    // Get all events for the month
    const events = await db.all(
      `SELECT * FROM entries 
       WHERE (type IN ('event', 'date') 
       AND strftime('%Y-%m', target_date) = ?)
       OR (end_date IS NOT NULL 
       AND target_date <= date(?, '+1 month', '-1 day')
       AND end_date >= date(?))
       ORDER BY target_date, target_time`,
      [`${year}-${month.padStart(2, '0')}`, `${year}-${month.padStart(2, '0')}-01`, `${year}-${month.padStart(2, '0')}-01`]
    );
    
    // Add custody information for the month
    const custodySchedule = getMonthCustody(parseInt(year), parseInt(month) - 1);
    
    res.json({
      events,
      custody: custodySchedule
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get events for a specific day
app.get('/api/calendar/day/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const db = await openDb();
    
    const events = await db.all(
      `SELECT * FROM entries 
       WHERE (type IN ('event', 'date', 'goal') 
       AND DATE(target_date) = DATE(?))
       OR (end_date IS NOT NULL 
       AND DATE(?) BETWEEN DATE(target_date) AND DATE(end_date))
       ORDER BY target_time`,
      [date, date]
    );
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a calendar event
app.post('/api/calendar/event', async (req, res) => {
  try {
    const db = await openDb();
    const { 
      title, content, target_date, target_time, 
      end_date, location, recurrence, reminder_minutes 
    } = req.body;
    
    const result = await db.run(
      `INSERT INTO entries 
       (type, title, content, target_date, target_time, end_date, 
        location, recurrence, reminder_minutes, category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['date', title, content, target_date, target_time, end_date, 
       location, recurrence || 'none', reminder_minutes || 0, 'Calendar']
    );
    
    const newEvent = await db.get('SELECT * FROM entries WHERE id = ?', result.lastID);
    res.json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= INSIGHTS ROUTES =============

// Get timeline data
app.get('/api/insights/timeline', async (req, res) => {
  try {
    const db = await openDb();
    const timeline = await db.all(queries.getTimelineEntries);
    res.json(timeline);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get relationship statistics
app.get('/api/insights/stats', async (req, res) => {
  try {
    const db = await openDb();
    
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_entries,
        COUNT(DISTINCT DATE(created_at)) as active_days,
        SUM(CASE WHEN type = 'goal' AND status = 'completed' THEN 1 ELSE 0 END) as goals_completed,
        SUM(CASE WHEN type = 'memory' THEN 1 ELSE 0 END) as memories_created,
        SUM(CASE WHEN type = 'event' AND status = 'completed' THEN 1 ELSE 0 END) as adventures_completed,
        AVG(CASE WHEN type = 'goal' THEN progress ELSE NULL END) as avg_goal_progress
      FROM entries
    `);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate insights for export
app.get('/api/insights/export', async (req, res) => {
  try {
    const db = await openDb();
    
    // Get various insights
    const recentThemes = await db.all(`
      SELECT tags, COUNT(*) as count 
      FROM entries 
      WHERE tags IS NOT NULL 
      GROUP BY tags 
      ORDER BY count DESC 
      LIMIT 5
    `);
    
    const moodTrend = await db.all(`
      SELECT mood, COUNT(*) as count
      FROM entries
      WHERE mood IS NOT NULL
      GROUP BY mood
      ORDER BY count DESC
    `);
    
    const completedGoals = await db.all(`
      SELECT title, completed_at
      FROM entries
      WHERE type = 'goal' AND status = 'completed'
      ORDER BY completed_at DESC
      LIMIT 10
    `);
    
    // Format for ChatGPT/Claude
    const exportText = `
# Our Relationship Journey Insights

## Recent Themes
${recentThemes.map(t => `- ${t.tags}: ${t.count} mentions`).join('\n')}

## Mood Distribution
${moodTrend.map(m => `- ${m.mood}: ${m.count} entries`).join('\n')}

## Recently Completed Goals
${completedGoals.map(g => `- ${g.title} (${g.completed_at})`).join('\n')}

Please create:
1. A word cloud visualization of our themes
2. A mood journey chart over time
3. A celebration message for our completed goals
4. Suggestions for future goals based on our patterns
    `.trim();
    
    res.json({ 
      export_text: exportText,
      raw_data: { recentThemes, moodTrend, completedGoals }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✨ OurJourney backend running on http://localhost:${PORT}`);
  console.log(`📊 SQLite database initialized`);
  console.log(`🚀 Ready to track your relationship journey!`);
});