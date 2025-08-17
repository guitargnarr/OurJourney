# Changelog

All notable changes to OurJourney will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-08-17

### Added
- **Calendar System** - Full monthly calendar view for scheduling dates and events
  - Visual monthly grid with event display
  - Click dates to view/add events
  - Event details include time, location, and descriptions
  - Support for recurring events (weekly, monthly, yearly)
  - Today highlighting for current date reference
  - Navigation between months
  - Integration with existing entries system

### Changed
- Database schema enhanced with calendar-specific fields:
  - `target_time` - Store specific times for events
  - `end_date` - Support multi-day events
  - `location` - Track event locations
  - `recurrence` - Handle repeating events
  - `reminder_minutes` - Future reminder support
- Added new entry type: `date` for calendar-specific events
- Navigation now includes Calendar tab alongside Dashboard and Timeline

### Technical
- New API endpoints for calendar operations:
  - `GET /api/calendar/month/:year/:month` - Get events for a month
  - `GET /api/calendar/day/:date` - Get events for a specific day
  - `POST /api/calendar/event` - Create calendar events
- New React component: `Calendar.jsx` with full event management
- Database migration required (auto-handled on restart)

## [1.0.0] - 2025-08-17

### Initial Release
- **Core Features**
  - SQLite database for persistent storage
  - Quick Capture with natural language processing
  - Dashboard with anticipation engine (countdown timers)
  - Timeline view of relationship journey
  - Progress tracking for goals
  - Memory archive system
  - Weekly ritual prompts (Gottman-inspired)
  - Export functionality for AI insights

- **Technical Stack**
  - Backend: Node.js + Express + SQLite
  - Frontend: React + Vite
  - API: RESTful design
  - Storage: Local SQLite database

- **Research Foundation**
  - Based on Gottman Institute research
  - Incorporates attachment theory principles
  - Positive psychology anticipation concepts