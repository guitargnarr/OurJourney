import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// For Render deployment, modify the connection to use session pooling port
let connectionConfig;

if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  // Modify URL to use session pooling port (5432 -> 6543)
  // This provides IPv4 compatibility
  let dbUrl = process.env.DATABASE_URL;
  
  // Replace port 5432 with 6543 for session pooling
  dbUrl = dbUrl.replace(':5432/', ':6543/');
  // Add pgbouncer=true for session mode
  dbUrl = dbUrl.includes('?') ? `${dbUrl}&pgbouncer=true` : `${dbUrl}?pgbouncer=true`;
  
  console.log('🔗 Using Supabase session pooling for IPv4 compatibility');
  
  connectionConfig = {
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    // Important: Set statement_timeout for session pooling
    statement_timeout: 60000,
    idle_in_transaction_session_timeout: 60000
  };
} else {
  // Local development
  connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: false
  };
}

// Create connection pool
const pool = new Pool(connectionConfig);

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  // Don't exit on error, try to recover
});

// Initialize database schema
export async function initializeDatabase() {
  let retries = 3;
  while (retries > 0) {
    try {
      // Test the connection first
      await pool.query('SELECT NOW()');
      console.log('✅ Database connection verified');
      
      // Main entries table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS entries (
          id SERIAL PRIMARY KEY,
          type TEXT NOT NULL CHECK(type IN ('goal', 'event', 'memory', 'ritual', 'feeling', 'idea', 'date', 'note')),
          title TEXT NOT NULL,
          content TEXT,
          category TEXT,
          mood TEXT CHECK(mood IN ('excited', 'happy', 'neutral', 'thoughtful', 'challenging') OR mood IS NULL),
          author TEXT DEFAULT 'both',
          
          -- Temporal fields
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          target_date DATE,
          target_time TIME,
          end_date DATE,
          completed_at TIMESTAMP,
          
          -- Calendar-specific fields
          location TEXT,
          recurrence TEXT CHECK(recurrence IN ('none', 'weekly', 'monthly', 'yearly') OR recurrence IS NULL),
          reminder_minutes INTEGER DEFAULT 0,
          
          -- Progress tracking
          progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
          status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'archived', 'cancelled')),
          
          -- Engagement tracking
          likes INTEGER DEFAULT 0,
          tags JSONB,
          media_url TEXT
        )
      `);

      // Create indexes for performance
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_entries_type ON entries(type);
        CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);
        CREATE INDEX IF NOT EXISTS idx_entries_target_date ON entries(target_date);
        CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at);
      `);

      // Rituals table for weekly check-ins
      await pool.query(`
        CREATE TABLE IF NOT EXISTS rituals (
          id SERIAL PRIMARY KEY,
          week_of DATE NOT NULL UNIQUE,
          gratitude TEXT,
          challenges TEXT,
          excitement TEXT,
          mood_score INTEGER CHECK(mood_score >= 1 AND mood_score <= 10),
          reflections TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insights table for tracking patterns
      await pool.query(`
        CREATE TABLE IF NOT EXISTS insights (
          id SERIAL PRIMARY KEY,
          period TEXT NOT NULL,
          period_date DATE NOT NULL,
          top_themes JSONB,
          mood_average FLOAT,
          goals_completed INTEGER DEFAULT 0,
          memories_created INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(period, period_date)
        )
      `);

      console.log('✅ Database schema initialized');
      return;
    } catch (error) {
      console.error(`❌ Database initialization attempt ${4 - retries} failed:`, error.message);
      retries--;
      if (retries > 0) {
        console.log(`⏳ Retrying in 5 seconds... (${retries} attempts remaining)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        throw error;
      }
    }
  }
}

// Query helper functions
export const db = {
  // Generic query
  async query(text, params) {
    const result = await pool.query(text, params);
    return result;
  },

  // Get single row
  async get(text, params) {
    const result = await pool.query(text, params);
    return result.rows[0];
  },

  // Get all rows
  async all(text, params) {
    const result = await pool.query(text, params);
    return result.rows;
  },

  // Run insert/update/delete
  async run(text, params) {
    const result = await pool.query(text, params);
    return result;
  },

  // Transaction support
  async transaction(callback) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

// Migration from SQLite (keeping for completeness)
export async function migrateFromSQLite(sqliteData) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Migrate entries
    if (sqliteData.entries && sqliteData.entries.length > 0) {
      for (const entry of sqliteData.entries) {
        await client.query(`
          INSERT INTO entries (
            type, title, content, category, mood, author,
            created_at, target_date, target_time, end_date, completed_at,
            location, recurrence, reminder_minutes,
            progress, status, likes, tags, media_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        `, [
          entry.type, entry.title, entry.content, entry.category, entry.mood, entry.author,
          entry.created_at, entry.target_date, 
          entry.target_time && entry.target_time !== '' ? entry.target_time : null,
          entry.end_date, entry.completed_at,
          entry.location, entry.recurrence || 'none', entry.reminder_minutes || 0,
          entry.progress || 0, entry.status || 'active', entry.likes || 0,
          entry.tags ? JSON.parse(entry.tags) : null, entry.media_url
        ]);
      }
    }
    
    // Migrate rituals
    if (sqliteData.rituals && sqliteData.rituals.length > 0) {
      for (const ritual of sqliteData.rituals) {
        await client.query(`
          INSERT INTO rituals (
            week_of, gratitude, challenges, excitement, mood_score, reflections, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (week_of) DO NOTHING
        `, [
          ritual.week_of, ritual.gratitude, ritual.challenges,
          ritual.excitement, ritual.mood_score, ritual.reflections, ritual.created_at
        ]);
      }
    }
    
    await client.query('COMMIT');
    console.log('✅ Migration completed successfully');
    
    return {
      entriesMigrated: sqliteData.entries?.length || 0,
      ritualsMigrated: sqliteData.rituals?.length || 0
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;