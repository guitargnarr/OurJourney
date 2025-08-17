import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Open database connection
export async function openDb() {
  return open({
    filename: join(__dirname, 'ourjourney.db'),
    driver: sqlite3.Database
  });
}

// Initialize database schema
export async function initializeDatabase() {
  const db = await openDb();
  
  // Main entries table - stores everything
  await db.exec(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('goal', 'event', 'memory', 'ritual', 'feeling', 'idea', 'date')),
      title TEXT NOT NULL,
      content TEXT,
      category TEXT,
      mood TEXT CHECK(mood IN ('excited', 'happy', 'neutral', 'thoughtful', 'challenging', NULL)),
      author TEXT DEFAULT 'both',
      
      -- Temporal fields for countdown and tracking
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      target_date DATE,
      target_time TEXT, -- Store time separately for calendar events
      end_date DATE, -- For multi-day events
      completed_at DATETIME,
      
      -- Calendar-specific fields
      location TEXT,
      recurrence TEXT, -- 'none', 'weekly', 'monthly', 'yearly'
      reminder_minutes INTEGER DEFAULT 0,
      
      -- Progress tracking for goals
      progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'archived', 'cancelled')),
      
      -- Engagement tracking
      likes INTEGER DEFAULT 0,
      tags TEXT, -- JSON array of tags
      media_url TEXT,
      
      -- Metadata
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Weekly rituals table - for check-ins
  await db.exec(`
    CREATE TABLE IF NOT EXISTS rituals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_of DATE NOT NULL UNIQUE,
      gratitude TEXT,
      challenges TEXT,
      excitement TEXT,
      mood_score INTEGER CHECK(mood_score >= 1 AND mood_score <= 10),
      reflections TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insights table - auto-generated patterns
  await db.exec(`
    CREATE TABLE IF NOT EXISTS insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period TEXT NOT NULL CHECK(period IN ('week', 'month', 'year')),
      period_date DATE NOT NULL,
      top_themes TEXT, -- JSON array
      mood_average REAL,
      goals_completed INTEGER DEFAULT 0,
      events_attended INTEGER DEFAULT 0,
      memories_created INTEGER DEFAULT 0,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(period, period_date)
    )
  `);

  // Create indexes for performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(created_at);
    CREATE INDEX IF NOT EXISTS idx_entries_type ON entries(type);
    CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);
    CREATE INDEX IF NOT EXISTS idx_entries_target ON entries(target_date);
    CREATE INDEX IF NOT EXISTS idx_rituals_week ON rituals(week_of);
  `);

  console.log('✅ Database initialized successfully');
  return db;
}

// Helper queries
export const queries = {
  // Get next upcoming event/adventure
  getNextAdventure: `
    SELECT * FROM entries 
    WHERE type = 'event' 
    AND target_date > DATE('now')
    AND status = 'active'
    ORDER BY target_date ASC 
    LIMIT 1
  `,
  
  // Get active goals with progress
  getActiveGoals: `
    SELECT * FROM entries
    WHERE type = 'goal'
    AND status = 'active'
    ORDER BY progress DESC, created_at DESC
  `,
  
  // Get recent memories
  getRecentMemories: `
    SELECT * FROM entries
    WHERE type = 'memory'
    ORDER BY created_at DESC
    LIMIT 10
  `,
  
  // Get this week's ritual status
  getWeeklyRitual: `
    SELECT * FROM rituals
    WHERE week_of = DATE('now', 'weekday 0', '-7 days')
  `,
  
  // Get entries for timeline
  getTimelineEntries: `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as count,
      GROUP_CONCAT(type) as types,
      AVG(CASE WHEN mood = 'excited' THEN 5
               WHEN mood = 'happy' THEN 4
               WHEN mood = 'neutral' THEN 3
               WHEN mood = 'thoughtful' THEN 2
               WHEN mood = 'challenging' THEN 1
               ELSE 3 END) as mood_avg
    FROM entries
    WHERE created_at > DATE('now', '-30 days')
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `
};