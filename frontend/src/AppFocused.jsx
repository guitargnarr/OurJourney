import { useState, useEffect } from 'react'
import axios from 'axios'
import { formatDistanceToNow, format } from 'date-fns'
import { Heart, Calendar, Lightbulb, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Login from './Login'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_ENDPOINT = `${API_URL}/api`

function AppFocused() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeView, setActiveView] = useState('ideas')
  const [ideas, setIdeas] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [dayEvents, setDayEvents] = useState([])
  
  // Form states
  const [newIdea, setNewIdea] = useState({ title: '', content: '' })
  const [editingIdea, setEditingIdea] = useState(null)
  const [showDayModal, setShowDayModal] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', content: '', time: '' })

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('ourjourney_token')
    if (token) {
      setIsAuthenticated(true)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [])

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (activeView === 'ideas') {
        loadIdeas()
      } else {
        loadCalendarMonth()
      }
    }
  }, [isAuthenticated, activeView, currentMonth])

  const handleLogin = (token) => {
    setIsAuthenticated(true)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  const handleLogout = () => {
    localStorage.removeItem('ourjourney_token')
    setIsAuthenticated(false)
    delete axios.defaults.headers.common['Authorization']
  }

  // ============= IDEAS FUNCTIONS =============
  
  const loadIdeas = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINT}/ideas`)
      setIdeas(res.data || [])
    } catch (error) {
      console.error('Error loading ideas:', error)
    }
  }

  const createIdea = async () => {
    if (!newIdea.title.trim()) return
    try {
      await axios.post(`${API_ENDPOINT}/ideas`, newIdea)
      setNewIdea({ title: '', content: '' })
      loadIdeas()
    } catch (error) {
      console.error('Error creating idea:', error)
    }
  }

  const updateIdea = async (id, updates) => {
    try {
      await axios.put(`${API_ENDPOINT}/ideas/${id}`, updates)
      setEditingIdea(null)
      loadIdeas()
    } catch (error) {
      console.error('Error updating idea:', error)
    }
  }

  const deleteIdea = async (id) => {
    if (!confirm('Delete this idea?')) return
    try {
      await axios.delete(`${API_ENDPOINT}/ideas/${id}`)
      loadIdeas()
    } catch (error) {
      console.error('Error deleting idea:', error)
    }
  }

  // ============= CALENDAR FUNCTIONS =============
  
  const loadCalendarMonth = async () => {
    try {
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth() + 1
      const res = await axios.get(`${API_ENDPOINT}/calendar/month/${year}/${month}`)
      setCalendarEvents(res.data.events || [])
    } catch (error) {
      console.error('Error loading calendar:', error)
    }
  }

  const loadDayEvents = async (date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const res = await axios.get(`${API_ENDPOINT}/calendar/day/${dateStr}`)
      setDayEvents(res.data || [])
    } catch (error) {
      console.error('Error loading day events:', error)
    }
  }

  const createEvent = async () => {
    if (!newEvent.title.trim() || !selectedDate) return
    try {
      await axios.post(`${API_ENDPOINT}/calendar/events`, {
        title: newEvent.title,
        content: newEvent.content,
        target_date: format(selectedDate, 'yyyy-MM-dd'),
        target_time: newEvent.time || null
      })
      setNewEvent({ title: '', content: '', time: '' })
      loadDayEvents(selectedDate)
      loadCalendarMonth()
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  const deleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return
    try {
      await axios.delete(`${API_ENDPOINT}/calendar/events/${id}`)
      loadDayEvents(selectedDate)
      loadCalendarMonth()
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  // Calendar helpers
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const hasEvents = (date) => {
    if (!date) return false
    const dateStr = format(date, 'yyyy-MM-dd')
    return calendarEvents.some(e => e.target_date && e.target_date.startsWith(dateStr))
  }

  const openDayModal = async (date) => {
    setSelectedDate(date)
    setShowDayModal(true)
    await loadDayEvents(date)
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'system-ui' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={24} color="#f43f5e" fill="#f43f5e" />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>OurJourney</h1>
          </div>
          
          {/* View Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveView('ideas')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: activeView === 'ideas' ? '#8b5cf6' : 'white',
                color: activeView === 'ideas' ? 'white' : '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Lightbulb size={16} /> Ideas
            </button>
            <button
              onClick={() => setActiveView('calendar')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: activeView === 'calendar' ? '#8b5cf6' : 'white',
                color: activeView === 'calendar' ? 'white' : '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Calendar size={16} /> Calendar
            </button>
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* IDEAS VIEW */}
        {activeView === 'ideas' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              💡 Ideas Bank
            </h2>
            
            {/* Add New Idea */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <input
                type="text"
                placeholder="What's your idea?"
                value={newIdea.title}
                onChange={(e) => setNewIdea({...newIdea, title: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  marginBottom: '0.75rem'
                }}
              />
              <textarea
                placeholder="Add notes or details..."
                value={newIdea.content}
                onChange={(e) => setNewIdea({...newIdea, content: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
              <button
                onClick={createIdea}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Plus size={18} /> Add Idea
              </button>
            </div>
            
            {/* Ideas List */}
            <div style={{ display: 'grid', gap: '1rem' }}>
              {ideas.map(idea => (
                <div key={idea.id} style={{
                  backgroundColor: 'white',
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #e5e7eb'
                }}>
                  {editingIdea === idea.id ? (
                    // Edit mode
                    <div>
                      <input
                        type="text"
                        value={idea.title}
                        onChange={(e) => {
                          const updated = ideas.map(i => 
                            i.id === idea.id ? {...i, title: e.target.value} : i
                          )
                          setIdeas(updated)
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          fontSize: '1rem',
                          marginBottom: '0.5rem'
                        }}
                      />
                      <textarea
                        value={idea.content || ''}
                        onChange={(e) => {
                          const updated = ideas.map(i => 
                            i.id === idea.id ? {...i, content: e.target.value} : i
                          )
                          setIdeas(updated)
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          minHeight: '60px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button
                          onClick={() => updateIdea(idea.id, { title: idea.title, content: idea.content })}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingIdea(null)
                            loadIdeas()
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            {idea.title}
                          </h3>
                          {idea.content && (
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', whiteSpace: 'pre-wrap' }}>
                              {idea.content}
                            </p>
                          )}
                          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem' }}>
                            Added {formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => setEditingIdea(idea.id)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#f3f4f6',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit2 size={16} color="#6b7280" />
                          </button>
                          <button
                            onClick={() => deleteIdea(idea.id)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#fee2e2',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={16} color="#991b1b" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* CALENDAR VIEW */}
        {activeView === 'calendar' && (
          <div>
            {/* Month Navigation */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <ChevronLeft size={20} />
              </button>
              
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
            
            {/* Calendar Grid */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1rem',
              border: '1px solid #e5e7eb'
            }}>
              {/* Day headers */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '1px',
                marginBottom: '0.5rem'
              }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    padding: '0.5rem'
                  }}>
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Days grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '1px',
                backgroundColor: '#e5e7eb'
              }}>
                {getDaysInMonth().map((date, index) => {
                  const isToday = date && format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  const hasEventsToday = hasEvents(date)
                  
                  return (
                    <div
                      key={index}
                      onClick={() => date && openDayModal(date)}
                      style={{
                        backgroundColor: isToday ? '#f3e8ff' : 'white',
                        minHeight: '80px',
                        padding: '0.5rem',
                        cursor: date ? 'pointer' : 'default',
                        position: 'relative'
                      }}
                    >
                      {date && (
                        <>
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: isToday ? 'bold' : 'normal'
                          }}>
                            {date.getDate()}
                          </div>
                          {hasEventsToday && (
                            <div style={{
                              position: 'absolute',
                              bottom: '0.5rem',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '6px',
                              height: '6px',
                              backgroundColor: '#8b5cf6',
                              borderRadius: '50%'
                            }} />
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Day Modal */}
      {showDayModal && selectedDate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                {format(selectedDate, 'EEEE, MMMM d')}
              </h3>
              <button
                onClick={() => {
                  setShowDayModal(false)
                  setSelectedDate(null)
                  setNewEvent({ title: '', content: '', time: '' })
                }}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Events for this day */}
            <div style={{ marginBottom: '1rem' }}>
              {dayEvents.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No events scheduled</p>
              ) : (
                dayEvents.map(event => (
                  <div key={event.id} style={{
                    padding: '0.75rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: '500' }}>
                          {event.target_time && (
                            <span style={{ color: '#8b5cf6', marginRight: '0.5rem' }}>
                              {event.target_time.slice(0, 5)}
                            </span>
                          )}
                          {event.title}
                        </div>
                        {event.content && (
                          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            {event.content}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        style={{
                          padding: '0.25rem',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#991b1b'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Add new event */}
            <div style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '1rem'
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                Add Event
              </h4>
              <input
                type="text"
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  marginBottom: '0.5rem'
                }}
              />
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  marginBottom: '0.5rem'
                }}
              />
              <textarea
                placeholder="Notes (optional)"
                value={newEvent.content}
                onChange={(e) => setNewEvent({...newEvent, content: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  minHeight: '60px',
                  resize: 'vertical'
                }}
              />
              <button
                onClick={createEvent}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppFocused