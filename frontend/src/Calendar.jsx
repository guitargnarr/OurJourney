import { useState, useEffect } from 'react'
import axios from 'axios'
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, Calendar as CalendarIcon } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_ENDPOINT = `${API_URL}/api`

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December']

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [events, setEvents] = useState([])
  const [custodyData, setCustodyData] = useState([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [dayEvents, setDayEvents] = useState([])
  
  // Form state for new events
  const [newEvent, setNewEvent] = useState({
    title: '',
    content: '',
    target_date: '',
    target_time: '',
    location: '',
    recurrence: 'none'
  })

  useEffect(() => {
    loadMonthEvents()
  }, [currentDate])

  useEffect(() => {
    if (selectedDate) {
      loadDayEvents(selectedDate)
    }
  }, [selectedDate])

  const loadMonthEvents = async () => {
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const res = await axios.get(`${API_ENDPOINT}/calendar/month/${year}/${month}`)
      setEvents(res.data.events || [])
      setCustodyData(res.data.custody || [])
    } catch (error) {
      console.error('Error loading month events:', error)
    }
  }

  const loadDayEvents = async (date) => {
    try {
      const dateStr = formatDateForAPI(date)
      const res = await axios.get(`${API_ENDPOINT}/calendar/day/${dateStr}`)
      setDayEvents(res.data || [])
    } catch (error) {
      console.error('Error loading day events:', error)
    }
  }

  const formatDateForAPI = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_ENDPOINT}/calendar/event`, {
        ...newEvent,
        target_date: selectedDate ? formatDateForAPI(selectedDate) : newEvent.target_date
      })
      
      setShowEventForm(false)
      setNewEvent({
        title: '',
        content: '',
        target_date: '',
        target_time: '',
        location: '',
        recurrence: 'none'
      })
      
      loadMonthEvents()
      if (selectedDate) {
        loadDayEvents(selectedDate)
      }
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    
    return days
  }

  const getEventsForDay = (day) => {
    if (!day) return []
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateStr = formatDateForAPI(date)
    return events.filter(event => event.target_date === dateStr)
  }
  
  const getCustodyForDay = (day) => {
    if (!day) return null
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateStr = formatDateForAPI(date)
    return custodyData.find(c => c.date === dateStr)
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const isToday = (day) => {
    if (!day) return false
    const today = new Date()
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear()
  }

  const calendarStyles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    navButton: {
      padding: '0.5rem',
      border: 'none',
      background: '#f3f4f6',
      borderRadius: '0.5rem',
      cursor: 'pointer',
    },
    weekdays: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '0.5rem',
      marginBottom: '0.5rem',
    },
    weekday: {
      textAlign: 'center',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#6b7280',
      padding: '0.5rem',
    },
    days: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '0.5rem',
    },
    day: {
      minHeight: '90px',
      padding: '0.5rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      position: 'relative',
      backgroundColor: '#ffffff',
      transition: 'all 0.2s',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    dayToday: {
      backgroundColor: '#fef3c7',
      borderColor: '#fbbf24',
    },
    daySelected: {
      backgroundColor: '#ede9fe',
      borderColor: '#8b5cf6',
    },
    dayNumber: {
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: '0.25rem',
    },
    eventDot: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      backgroundColor: '#8b5cf6',
      margin: '1px',
      display: 'inline-block',
    },
    eventForm: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '1rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      zIndex: 50,
      width: '90%',
      maxWidth: '500px',
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 40,
    },
    input: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      marginBottom: '1rem',
      fontSize: '1rem',
    },
    button: {
      padding: '0.5rem 1rem',
      backgroundColor: '#8b5cf6',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
      marginRight: '0.5rem',
    },
    cancelButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#e5e7eb',
      color: '#374151',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
    },
  }

  return (
    <div>
      <div style={calendarStyles.container}>
        {/* Calendar Header */}
        <div style={calendarStyles.header}>
          <button onClick={() => navigateMonth(-1)} style={calendarStyles.navButton}>
            <ChevronLeft size={20} />
          </button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={() => navigateMonth(1)} style={calendarStyles.navButton}>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekdays */}
        <div style={calendarStyles.weekdays}>
          {WEEKDAYS.map(day => (
            <div key={day} style={calendarStyles.weekday}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div style={calendarStyles.days}>
          {getDaysInMonth().map((day, index) => {
            const dayEvents = getEventsForDay(day)
            const custody = getCustodyForDay(day)
            const isSelectedDay = selectedDate && 
              selectedDate.getDate() === day &&
              selectedDate.getMonth() === currentDate.getMonth()
            
            return (
              <div
                key={index}
                style={{
                  ...calendarStyles.day,
                  ...(day ? {} : { border: 'none', cursor: 'default' }),
                  ...(isToday(day) ? calendarStyles.dayToday : {}),
                  ...(isSelectedDay ? calendarStyles.daySelected : {}),
                  ...(custody?.isYourDay ? { backgroundColor: '#e0f2fe' } : {}),
                }}
                onClick={() => {
                  if (day) {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                    setSelectedDate(date)
                  }
                }}
              >
                {day && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={calendarStyles.dayNumber}>{day}</div>
                      {custody && (
                        <div style={{
                          fontSize: '0.65rem',
                          padding: '2px 4px',
                          borderRadius: '3px',
                          backgroundColor: custody.isYourDay ? '#0ea5e9' : '#f3f4f6',
                          color: custody.isYourDay ? 'white' : '#6b7280',
                          fontWeight: '500'
                        }}>
                          {custody.isYourDay ? 'Sage' : 'Free'}
                        </div>
                      )}
                    </div>
                    {dayEvents.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {dayEvents
                          .sort((a, b) => {
                            // Sort by time if available, otherwise by title
                            if (a.target_time && b.target_time) {
                              return a.target_time.localeCompare(b.target_time)
                            }
                            return 0
                          })
                          .slice(0, 2)
                          .map((event, i) => (
                            <div 
                              key={event.id || i} 
                              style={{ 
                                fontSize: '0.7rem', 
                                lineHeight: '1.1',
                                padding: '2px 4px',
                                backgroundColor: event.type === 'date' ? '#e0e7ff' : '#fef3c7',
                                borderRadius: '3px',
                                color: '#4b5563', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap' 
                              }}
                            >
                              {event.target_time && (
                                <span style={{ fontWeight: '600', marginRight: '4px' }}>
                                  {event.target_time}
                                </span>
                              )}
                              {event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title}
                            </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div style={{ 
                            fontSize: '0.65rem', 
                            color: '#9ca3af',
                            padding: '2px 4px',
                            fontStyle: 'italic'
                          }}>
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Add Event Button */}
        <button
          onClick={() => setShowEventForm(true)}
          style={{
            ...calendarStyles.button,
            marginTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Plus size={16} />
          Add Event
        </button>
      </div>

      {/* Selected Day Events */}
      {selectedDate && dayEvents.length > 0 && (
        <div style={{ ...calendarStyles.container, marginTop: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Events for {selectedDate.toLocaleDateString()}
          </h3>
          {dayEvents.map(event => (
            <div key={event.id} style={{
              padding: '1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              marginBottom: '0.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{event.title}</h4>
                  {event.content && (
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{event.content}</p>
                  )}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                    {event.target_time && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={14} />
                        {event.target_time}
                      </span>
                    )}
                    {event.location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={14} />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: event.type === 'goal' ? '#dcfce7' : '#e0e7ff',
                  color: event.type === 'goal' ? '#166534' : '#3730a3',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                }}>
                  {event.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <>
          <div style={calendarStyles.overlay} onClick={() => setShowEventForm(false)} />
          <div style={calendarStyles.eventForm}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Add New Event
            </h3>
            <form onSubmit={handleCreateEvent}>
              <input
                type="text"
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                style={calendarStyles.input}
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={newEvent.content}
                onChange={(e) => setNewEvent({ ...newEvent, content: e.target.value })}
                style={{ ...calendarStyles.input, minHeight: '80px' }}
              />
              <input
                type="date"
                value={newEvent.target_date || (selectedDate ? formatDateForAPI(selectedDate) : '')}
                onChange={(e) => setNewEvent({ ...newEvent, target_date: e.target.value })}
                style={calendarStyles.input}
                required
              />
              <input
                type="time"
                placeholder="Time (optional)"
                value={newEvent.target_time}
                onChange={(e) => setNewEvent({ ...newEvent, target_time: e.target.value })}
                style={calendarStyles.input}
              />
              <input
                type="text"
                placeholder="Location (optional)"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                style={calendarStyles.input}
              />
              <select
                value={newEvent.recurrence}
                onChange={(e) => setNewEvent({ ...newEvent, recurrence: e.target.value })}
                style={calendarStyles.input}
              >
                <option value="none">No repeat</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <div>
                <button type="submit" style={calendarStyles.button}>
                  Create Event
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowEventForm(false)}
                  style={calendarStyles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

export default Calendar