# OurJourney - Relationship Journey Tracker

A research-based relationship tool that combines the visual appeal of a vision board with the power of SQLite for temporal tracking and insights.

## 🎯 Key Features

### Research-Based Design
- **Anticipation Engine**: Countdown to your next adventure (always have something to look forward to)
- **Progress Tracking**: Visual progress bars for goals (celebrate growth together)
- **Weekly Rituals**: Gottman-inspired check-in prompts (build connection habits)
- **Memory Archive**: Completed items become cherished memories (build your story)
- **Pattern Insights**: Export data for AI visualization (understand your journey)

### Core Functionality
- **Quick Capture** (<30 seconds): Natural language input that auto-detects types
- **Smart Categorization**: Automatically identifies goals, events, memories, feelings
- **Timeline View**: See your relationship journey over time
- **Calendar System**: Visual monthly calendar for scheduling dates and events
- **Export for ChatGPT**: One-click export for relationship insights

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Install backend dependencies**:
```bash
cd OurJourney
npm install
```

2. **Install frontend dependencies**:
```bash
cd frontend
npm install
```

### Running the App

1. **Start the backend** (in main directory):
```bash
npm start
# Backend runs on http://localhost:3001
```

2. **Start the frontend** (in frontend directory):
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

3. **Open in browser**: http://localhost:5173

## 📱 Usage Guide

### Quick Capture
Type naturally in the input bar:
- "Goal: Save $5000 for vacation" → Creates a goal with progress tracking
- "Planning dinner date Friday" → Creates an event with countdown
- "Remember our sunset walk today" → Creates a memory
- "Feeling grateful for us" → Creates a feeling entry

### Views
- **Dashboard**: See next adventure, active goals, recent memories
- **Timeline**: Visual journey of your relationship
- **Calendar**: Monthly view with all scheduled dates and events
- **Goals**: Track all goals with progress bars (access via Dashboard)

### Calendar Features
- **Monthly Grid View**: See your entire month at a glance
- **Event Creation**: Click "Add Event" to schedule dates with:
  - Date and time selection
  - Location tracking
  - Description notes
  - Recurring event options (weekly, monthly, yearly)
- **Day Details**: Click any date to see all events for that day
- **Visual Planning**: Events show directly on calendar with times
- **Today Highlighting**: Current date marked for easy reference

### Weekly Ritual
Every Sunday, you'll see a prompt for your weekly check-in:
- What made you grateful this week?
- Any challenges to discuss?
- What are you excited about?

### Export Insights
Click "Export Insights" to get formatted text for ChatGPT/Claude to create:
- Word clouds of your themes
- Mood journey visualizations
- Goal celebration summaries

## 🗄️ Database Schema

The SQLite database tracks everything with temporal awareness:

```sql
entries (
  id, type, title, content, category, mood,
  created_at, target_date, target_time, end_date, completed_at,
  location, recurrence, reminder_minutes,
  progress, status, likes, tags, media_url
)

rituals (
  id, week_of, gratitude, challenges, 
  excitement, mood_score, reflections
)

insights (
  id, period, period_date, top_themes,
  mood_average, goals_completed, memories_created
)
```

## 🎨 Technology Stack

- **Backend**: Node.js + Express + SQLite
- **Frontend**: React + Vite
- **Database**: SQLite with temporal queries
- **Styling**: Custom CSS with Tailwind-like utilities
- **Icons**: Lucide React

## 💡 What Makes This Different

Unlike the original vision board that used localStorage:
1. **Real persistence** - SQLite database survives browser clears
2. **Temporal awareness** - Countdowns, deadlines, progress tracking
3. **History tracking** - Nothing gets lost, everything timestamped
4. **Query power** - Complex insights and pattern recognition
5. **Weekly rituals** - Proactive relationship maintenance

## 🔮 Future Enhancements

- Photo uploads for memories
- Shared access between partners
- Mobile app version
- AI-powered relationship insights
- Anniversary and milestone tracking
- Mood visualization charts

## 🙏 Inspiration

Based on research from:
- The Gottman Institute (relationship rituals)
- Attachment theory (secure base)
- Positive psychology (anticipation and gratitude)
- Your original vision board design

---

Built with love for building love 💕