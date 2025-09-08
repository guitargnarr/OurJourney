import { useState, useEffect } from 'react'
import axios from 'axios'
import { format, formatDistanceToNow } from 'date-fns'
import { Heart, Plus, Target, Sparkles, Trophy, Star, ChevronRight, Calendar as CalendarIcon, Lightbulb, Brain, Zap } from 'lucide-react'
import { styles } from './styles'
import Calendar from './Calendar'
import Login from './Login'
import { debugLocalStorage } from './utils/debug'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_ENDPOINT = `${API_URL}/api`

const MOODS = {
  excited: '🤩',
  happy: '😊',
  neutral: '😐',
  thoughtful: '🤔',
  challenging: '😤'
}

function AppSimple() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authToken, setAuthToken] = useState(null)
  const [entries, setEntries] = useState([])
  const [nextAdventure, setNextAdventure] = useState(null)
  const [stats, setStats] = useState(null)
  const [nextDateNights, setNextDateNights] = useState([])
  const [quickInput, setQuickInput] = useState('')
  const [activeView, setActiveView] = useState('dashboard')
  
  // Check for existing auth on mount
  useEffect(() => {
    // Debug localStorage on mount (only in development)
    if (import.meta.env.DEV) {
      debugLocalStorage()
    }
    
    try {
      const token = localStorage.getItem('ourjourney_token')
      if (token) {
        // Verify token is not expired or malformed
        const parts = token.split('.')
        if (parts.length !== 3) {
          console.error('Invalid token format, clearing...')
          localStorage.removeItem('ourjourney_token')
          return
        }
        
        setAuthToken(token)
        setIsAuthenticated(true)
        // Set default auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Error checking authentication:', error)
      // Clear potentially corrupted token
      localStorage.removeItem('ourjourney_token')
    }
  }, [])
  
  // Load dashboard when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard()
    }
  }, [isAuthenticated])
  
  const handleLogin = (token) => {
    setAuthToken(token)
    setIsAuthenticated(true)
    // Set default auth header for all requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  const loadDashboard = async () => {
    try {
      const [entriesRes, insightsRes, dateNightsRes] = await Promise.all([
        axios.get(`${API_ENDPOINT}/entries?limit=20`),
        axios.get(`${API_ENDPOINT}/insights`),
        axios.get(`${API_ENDPOINT}/custody/date-nights`)
      ])
      
      setEntries(entriesRes.data || [])
      // Set next adventure from entries
      const upcomingEvents = entriesRes.data?.filter(e => e.type === 'event' && e.target_date) || []
      setNextAdventure(upcomingEvents[0] || null)
      setStats(insightsRes.data?.stats || {})
      setNextDateNights(dateNightsRes.data || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
      // If we get a 401, clear auth and reload
      if (error.response?.status === 401) {
        console.log('Authentication failed, clearing token...')
        localStorage.removeItem('ourjourney_token')
        setIsAuthenticated(false)
        setAuthToken(null)
        delete axios.defaults.headers.common['Authorization']
      }
    }
  }
  
  const handleLogout = () => {
    localStorage.removeItem('ourjourney_token')
    setIsAuthenticated(false)
    setAuthToken(null)
    delete axios.defaults.headers.common['Authorization']
    // Clear all state
    setEntries([])
    setNextAdventure(null)
    setStats(null)
    setNextDateNights([])
    setQuickInput('')
    setActiveView('dashboard')
  }

  const handleQuickCapture = async (e) => {
    e.preventDefault()
    if (!quickInput.trim()) return

    try {
      const input = quickInput.toLowerCase()
      const originalInput = quickInput
      let type = 'idea'
      let targetDate = null
      let targetTime = null
      let location = null
      
      // Enhanced calendar detection patterns
      const calendarPatterns = [
        /date night|dinner|lunch|breakfast|movie|concert|show|tickets?/i,
        /tomorrow|tonight|weekend|next \w+day|this \w+day/i,
        /at \d{1,2}(:\d{2})?\s?(am|pm)?/i,
        /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}/i,
        /\d{1,2}\/\d{1,2}/i
      ]
      
      // Check if this is specifically a date night request
      const isDateNight = /date night|just us|alone time|romantic/i.test(originalInput)
      
      const isCalendarEvent = calendarPatterns.some(pattern => pattern.test(originalInput))
      
      // Parse dates from natural language
      const parseDate = async (text, requireDateNight = false) => {
        const today = new Date()
        
        // If it's a date night request, find next available date
        if (requireDateNight) {
          try {
            const dateNightsRes = await axios.get(`${API_ENDPOINT}/custody/date-nights`)
            if (dateNightsRes.data && dateNightsRes.data.length > 0) {
              return dateNightsRes.data[0].date
            }
          } catch (error) {
            console.error('Error getting date nights:', error)
          }
        }
        
        if (/tomorrow/i.test(text)) {
          const tomorrow = new Date(today)
          tomorrow.setDate(today.getDate() + 1)
          return tomorrow.toISOString().split('T')[0]
        }
        
        if (/tonight/i.test(text)) {
          return today.toISOString().split('T')[0]
        }
        
        if (/this weekend|saturday|sunday/i.test(text)) {
          const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7
          const weekend = new Date(today)
          weekend.setDate(today.getDate() + daysUntilSaturday)
          if (/sunday/i.test(text)) {
            weekend.setDate(weekend.getDate() + 1)
          }
          return weekend.toISOString().split('T')[0]
        }
        
        // Try to extract MM/DD format
        const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})/)
        if (dateMatch) {
          const month = parseInt(dateMatch[1])
          const day = parseInt(dateMatch[2])
          const year = today.getFullYear()
          const date = new Date(year, month - 1, day)
          if (date < today) {
            date.setFullYear(year + 1)
          }
          return date.toISOString().split('T')[0]
        }
        
        return null
      }
      
      // Parse time from natural language
      const parseTime = (text) => {
        const timeMatch = text.match(/at (\d{1,2})(:(\d{2}))?\s?(am|pm)?/i)
        if (timeMatch) {
          let hours = parseInt(timeMatch[1])
          const minutes = timeMatch[3] || '00'
          const period = timeMatch[4]
          
          if (period) {
            if (period.toLowerCase() === 'pm' && hours < 12) {
              hours += 12
            } else if (period.toLowerCase() === 'am' && hours === 12) {
              hours = 0
            }
          }
          
          return `${String(hours).padStart(2, '0')}:${minutes}`
        }
        
        // Common meal times
        if (/breakfast/i.test(text)) return '09:00'
        if (/lunch/i.test(text)) return '12:00'
        if (/dinner/i.test(text)) return '19:00'
        
        return null
      }
      
      // Parse location
      const parseLocation = (text) => {
        const locationMatch = text.match(/at ([^0-9][^,]+?)(?:\s+at\s+|\s+on\s+|$)/i)
        if (locationMatch && !/(\d{1,2}(:\d{2})?\s?(am|pm)?)/i.test(locationMatch[1])) {
          return locationMatch[1].trim()
        }
        return null
      }
      
      // Determine type and extract data
      if (input.includes('goal') || input.includes('want to') || input.includes('save for')) {
        type = 'goal'
      } else if (isCalendarEvent || isDateNight) {
        type = 'date'
        targetDate = await parseDate(originalInput, isDateNight)
        targetTime = parseTime(originalInput)
        location = parseLocation(originalInput)
        
        // Add note if it's a date night on a free evening
        if (isDateNight && targetDate) {
          const custodyRes = await axios.get(`${API_ENDPOINT}/custody/status/${targetDate}`)
          if (custodyRes.data && !custodyRes.data.isYourDay) {
            // Good to go - it's a free evening!
          }
        }
      } else if (input.includes('plan') || input.includes('going to')) {
        type = 'event'
        targetDate = await parseDate(originalInput)
      } else if (input.includes('remember') || input.includes('today we') || input.includes('just')) {
        type = 'memory'
      } else if (input.includes('feeling') || input.includes('grateful') || input.includes('happy')) {
        type = 'feeling'
      }
      
      // Clean up title (remove parsed date/time/location for calendar events)
      let title = originalInput
      if (type === 'date' && targetTime) {
        title = title.replace(/at \d{1,2}(:\d{2})?\s?(am|pm)?/i, '').trim()
      }
      
      const entryData = {
        type,
        title,
        content: '',
        category: 'General',
        mood: 'neutral'
      }
      
      if (targetDate) entryData.target_date = targetDate
      if (targetTime) entryData.target_time = targetTime
      if (location) entryData.location = location

      await axios.post(`${API_ENDPOINT}/entries`, entryData)
      
      setQuickInput('')
      loadDashboard()
      
      // If calendar event was created, switch to calendar view
      if (type === 'date') {
        setActiveView('calendar')
      }
    } catch (error) {
      console.error('Error creating entry:', error)
    }
  }

  const updateProgress = async (id, progress) => {
    try {
      await axios.put(`${API_ENDPOINT}/entries/${id}`, { progress })
      loadDashboard()
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const goals = entries.filter(e => e.type === 'goal' && e.status === 'active')
  const memories = entries.filter(e => e.type === 'memory')
  const ideas = entries.filter(e => e.type === 'idea').sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Heart size={32} color="#f43f5e" />
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>OurJourney</h1>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Building our story together</p>
            </div>
          </div>
          
          <nav style={styles.nav}>
            <button
              onClick={() => setActiveView('dashboard')}
              style={{
                ...styles.navButton,
                ...(activeView === 'dashboard' ? styles.navButtonActive : {})
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('timeline')}
              style={{
                ...styles.navButton,
                ...(activeView === 'timeline' ? styles.navButtonActive : {})
              }}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveView('calendar')}
              style={{
                ...styles.navButton,
                ...(activeView === 'calendar' ? styles.navButtonActive : {})
              }}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveView('ideas')}
              style={{
                ...styles.navButton,
                ...(activeView === 'ideas' ? styles.navButtonActive : {})
              }}
            >
              Ideas
            </button>
          </nav>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {stats && (
              <div style={{ display: 'flex', gap: '1rem', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Trophy size={16} color="#eab308" />
                  <span>{stats.goals_completed || 0} completed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={16} color="#3b82f6" />
                  <span>{stats.memories_created || 0} memories</span>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Quick Capture */}
      <div style={styles.quickCapture}>
        <div style={styles.quickCaptureContent}>
          <form onSubmit={handleQuickCapture} style={styles.quickCaptureForm}>
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Try: 'Dinner tomorrow at 7pm' or 'Concert tickets for 11/12' or 'Goal: Save $5000'"
              style={styles.quickCaptureInput}
            />
            <button type="submit" style={styles.quickCaptureButton}>
              <Plus size={16} />
              Add
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <main style={styles.main}>
        {activeView === 'dashboard' && (
          <div>
            {/* Next Adventure */}
            {nextAdventure && (
              <div style={styles.anticipationCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Sparkles size={20} />
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>Next Adventure</span>
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                      {nextAdventure.title}
                    </h2>
                    <p style={{ opacity: 0.9 }}>{nextAdventure.content}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
                      {nextAdventure.days_until}
                    </div>
                    <div style={{ fontSize: '14px' }}>days to go!</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Date Night Opportunities */}
            {nextDateNights.length > 0 && (
              <div style={{
                ...styles.card,
                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                color: 'white',
                marginBottom: '1rem'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  💕 Next Date Night Opportunities
                </h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {nextDateNights.map((night, i) => (
                    <div 
                      key={i}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    >
                      <div style={{ fontWeight: '600' }}>
                        {night.dayName}, {new Date(night.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.9 }}>
                        {night.daysAway === 0 ? 'Tonight!' : 
                         night.daysAway === 1 ? 'Tomorrow' : 
                         `In ${night.daysAway} days`}
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '12px', marginTop: '1rem', opacity: 0.9 }}>
                  These evenings you're free (Sage is with mom)
                </p>
              </div>
            )}

            {/* Active Goals */}
            <div style={styles.card}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={20} color="#10b981" />
                Active Goals
              </h3>
              <div>
                {goals.slice(0, 3).map(goal => (
                  <div key={goal.id} style={styles.goalCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h4 style={{ fontWeight: '500', margin: 0 }}>{goal.title}</h4>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{goal.progress}%</span>
                    </div>
                    <div style={styles.progressBar}>
                      <div 
                        style={{
                          ...styles.progressBarFill,
                          width: `${goal.progress}%`
                        }}
                      />
                    </div>
                    <button
                      onClick={() => updateProgress(goal.id, Math.min(100, goal.progress + 10))}
                      style={{
                        marginTop: '8px',
                        padding: '4px 8px',
                        fontSize: '14px',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      +10%
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Memories */}
            <div style={styles.card}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={20} color="#f43f5e" />
                Recent Memories
              </h3>
              <div>
                {memories.slice(0, 4).map(memory => (
                  <div key={memory.id} style={styles.memoryCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontWeight: '500', margin: '0 0 4px 0' }}>{memory.title}</h4>
                        {memory.content && (
                          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{memory.content}</p>
                        )}
                      </div>
                      {memory.mood && (
                        <span style={{ fontSize: '24px' }}>{MOODS[memory.mood]}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                      {formatDistanceToNow(new Date(memory.created_at), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'calendar' && (
          <Calendar />
        )}

        {activeView === 'timeline' && (
          <div style={styles.card}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Our Journey Timeline
            </h2>
            <div>
              {entries.map((entry, index) => (
                <div key={entry.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      ...styles.timelineDot,
                      backgroundColor: entry.type === 'goal' ? '#10b981' :
                                     entry.type === 'event' ? '#3b82f6' :
                                     entry.type === 'memory' ? '#f43f5e' : '#9ca3af'
                    }} />
                    {index < entries.length - 1 && (
                      <div style={styles.timelineLine} />
                    )}
                  </div>
                  <div style={{ flex: 1, paddingBottom: '1rem' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                      {format(new Date(entry.created_at), 'MMM d, yyyy')}
                    </div>
                    <h3 style={{ fontWeight: '500', margin: '0 0 4px 0' }}>{entry.title}</h3>
                    {entry.content && (
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{entry.content}</p>
                    )}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <span style={{
                        fontSize: '12px',
                        padding: '2px 8px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px'
                      }}>
                        {entry.type}
                      </span>
                      {entry.mood && (
                        <span>{MOODS[entry.mood]}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'ideas' && (
          <div>
            {/* Quick Idea Capture Card */}
            <div style={{
              ...styles.card,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <Lightbulb size={28} />
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Quick Idea Capture</h2>
                  <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>Don't let that spark fade away!</p>
                </div>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault()
                const ideaInput = e.target.idea.value
                if (!ideaInput.trim()) return
                
                try {
                  await axios.post(`${API_ENDPOINT}/entries`, {
                    type: 'idea',
                    title: ideaInput,
                    content: '',
                    category: 'Ideas',
                    mood: 'thoughtful'
                  })
                  e.target.idea.value = ''
                  loadDashboard()
                } catch (error) {
                  console.error('Error creating idea:', error)
                }
              }}>
                <textarea
                  name="idea"
                  placeholder="What's on your mind? A date idea, a goal, a place to visit, something to try together..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '12px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '16px',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    marginTop: '12px',
                    padding: '10px 24px',
                    backgroundColor: 'white',
                    color: '#667eea',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Zap size={18} />
                  Capture Idea
                </button>
              </form>
            </div>

            {/* Ideas Grid */}
            <div style={styles.card}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                <Brain size={20} color="#8b5cf6" />
                Your Ideas Bank
                <span style={{ 
                  marginLeft: 'auto', 
                  fontSize: '14px', 
                  color: '#6b7280',
                  fontWeight: 'normal'
                }}>
                  {ideas.length} ideas captured
                </span>
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem'
              }}>
                {ideas.length === 0 ? (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '3rem',
                    color: '#9ca3af'
                  }}>
                    <Lightbulb size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p>No ideas yet. Start capturing your thoughts above!</p>
                  </div>
                ) : (
                  ideas.map(idea => (
                    <div
                      key={idea.id}
                      style={{
                        padding: '1rem',
                        backgroundColor: '#faf5ff',
                        border: '1px solid #e9d5ff',
                        borderRadius: '8px',
                        position: 'relative',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#8b5cf6',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                      }} />
                      
                      <h4 style={{ 
                        fontWeight: '500', 
                        margin: '0 0 8px 0',
                        color: '#6b21a8',
                        paddingRight: '20px'
                      }}>
                        {idea.title}
                      </h4>
                      
                      {idea.content && (
                        <p style={{ 
                          fontSize: '14px', 
                          color: '#7c3aed', 
                          margin: '0 0 12px 0',
                          opacity: 0.8
                        }}>
                          {idea.content}
                        </p>
                      )}
                      
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#a78bfa',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>
                          {formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}
                        </span>
                        
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            if (confirm('Convert this idea to a goal?')) {
                              await axios.put(`${API_ENDPOINT}/entries/${idea.id}`, { 
                                type: 'goal',
                                progress: 0
                              })
                              loadDashboard()
                            }
                          }}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Target size={12} />
                          Make Goal
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Add pulse animation */}
            <style>{`
              @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
              }
            `}</style>
          </div>
        )}
      </main>
    </div>
  )
}

export default AppSimple