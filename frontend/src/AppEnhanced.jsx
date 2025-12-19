import { useState, useEffect } from 'react'
import axios from 'axios'
import { formatDistanceToNow, format, differenceInDays, addDays } from 'date-fns'
import {
  Heart, Calendar, Lightbulb, Plus, Edit2, Trash2, X,
  ChevronLeft, ChevronRight, Camera, MessageCircle, Cloud,
  Sun, CloudRain, Gift, Sparkles
} from 'lucide-react'
import Login from './Login'
import PrivacyPolicy from './PrivacyPolicy'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_ENDPOINT = `${API_URL}/api`

// Anniversary date - users can configure this in settings
// For now, we'll hide the day counter to make the app generic
const ANNIVERSARY_DATE = null // Disabled for generic app

// Weather API (using wttr.in - no API key needed!)
const getWeather = async (date) => {
  try {
    const dateStr = format(date, 'yyyy-MM-dd')
    const response = await fetch(`https://wttr.in/?format=%c+%t+%C`)
    const text = await response.text()
    return text.trim()
  } catch {
    return null
  }
}

function AppEnhanced() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeView, setActiveView] = useState('ideas')
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [ideas, setIdeas] = useState([])
  const [notes, setNotes] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [dayEvents, setDayEvents] = useState([])
  const [weather, setWeather] = useState({})
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  
  // Form states
  const [newIdea, setNewIdea] = useState({ title: '', content: '', image: null })
  const [newNote, setNewNote] = useState({ message: '', for_partner1: true })
  const [editingIdea, setEditingIdea] = useState(null)
  const [showDayModal, setShowDayModal] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', content: '', time: '' })
  const [uploadingImage, setUploadingImage] = useState(false)

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('ourjourney_token')
    if (token) {
      setIsAuthenticated(true)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed'))
    }
    
    // Listen for PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    })
  }, [])

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (activeView === 'ideas') {
        loadIdeas()
      } else if (activeView === 'notes') {
        loadNotes()
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
  
  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`User ${outcome} the install prompt`)
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  // Calculate anniversary info
  const getAnniversaryInfo = () => {
    const today = new Date()
    const daysTogether = differenceInDays(today, ANNIVERSARY_DATE)
    const monthsTogether = Math.floor(daysTogether / 30)
    const nextMonthAnniversary = addDays(ANNIVERSARY_DATE, (monthsTogether + 1) * 30)
    const daysUntilNext = differenceInDays(nextMonthAnniversary, today)
    
    return {
      daysTogether,
      monthsTogether,
      daysUntilNext,
      isAnniversaryToday: daysTogether % 30 === 0
    }
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
      const ideaData = {
        title: newIdea.title,
        content: newIdea.content
      }
      
      // If there's an image, upload to Cloudinary (or simple base64 storage)
      if (newIdea.image) {
        ideaData.media_url = newIdea.image // Store base64 for now
      }
      
      await axios.post(`${API_ENDPOINT}/ideas`, ideaData)
      setNewIdea({ title: '', content: '', image: null })
      loadIdeas()
    } catch (error) {
      console.error('Error creating idea:', error)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.size < 5000000) { // 5MB limit
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewIdea({...newIdea, image: reader.result})
      }
      reader.readAsDataURL(file)
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

  // ============= LOVE NOTES FUNCTIONS =============
  
  const loadNotes = async () => {
    try {
      // Load notes (entries with type 'note')
      const res = await axios.get(`${API_ENDPOINT}/entries?type=note`)
      setNotes(res.data || [])
    } catch (error) {
      console.error('Error loading notes:', error)
    }
  }

  const createNote = async () => {
    if (!newNote.message.trim()) return
    try {
      await axios.post(`${API_ENDPOINT}/entries`, {
        type: 'note',
        title: newNote.for_partner1 ? 'For Partner 1 💕' : 'For Partner 2 💙',
        content: newNote.message,
        author: newNote.for_partner1 ? 'partner2' : 'partner1'
      })
      setNewNote({ message: '', for_partner1: true })
      loadNotes()
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  const deleteNote = async (id) => {
    if (!confirm('Delete this note?')) return
    try {
      await axios.delete(`${API_ENDPOINT}/entries/${id}`)
      loadNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  // ============= CALENDAR FUNCTIONS =============
  
  const loadCalendarMonth = async () => {
    try {
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth() + 1
      const res = await axios.get(`${API_ENDPOINT}/calendar/month/${year}/${month}`)
      setCalendarEvents(res.data.events || [])
      
      // Load weather for upcoming events
      const upcomingEvents = res.data.events?.filter(e => 
        new Date(e.target_date) >= new Date() && 
        differenceInDays(new Date(e.target_date), new Date()) <= 7
      )
      
      for (const event of upcomingEvents || []) {
        const weather = await getWeather(new Date(event.target_date))
        setWeather(prev => ({...prev, [event.target_date]: weather}))
      }
    } catch (error) {
      console.error('Error loading calendar:', error)
    }
  }

  const loadDayEvents = async (date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const res = await axios.get(`${API_ENDPOINT}/calendar/day/${dateStr}`)
      setDayEvents(res.data || [])
      
      // Get weather for this day
      if (differenceInDays(date, new Date()) <= 7 && differenceInDays(date, new Date()) >= 0) {
        const dayWeather = await getWeather(date)
        setWeather(prev => ({...prev, [dateStr]: dayWeather}))
      }
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
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
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
  
  const isSpecialDay = (date) => {
    if (!date) return false
    const daysTogether = differenceInDays(date, ANNIVERSARY_DATE)
    return daysTogether > 0 && daysTogether % 30 === 0 // Monthly anniversary
  }

  const openDayModal = async (date) => {
    setSelectedDate(date)
    setShowDayModal(true)
    await loadDayEvents(date)
  }

  const anniversary = getAnniversaryInfo()

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} onShowPrivacy={() => setShowPrivacy(true)} />
  }

  if (showPrivacy) {
    return <PrivacyPolicy onClose={() => setShowPrivacy(false)} />
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'system-ui' }}>
      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <div style={{
          backgroundColor: '#14b8a6',
          color: 'white',
          padding: '0.75rem',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span>📱 Install OurJourney as an app!</span>
          <button
            onClick={handleInstallPWA}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'white',
              color: '#14b8a6',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Install
          </button>
          <button
            onClick={() => setShowInstallPrompt(false)}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Anniversary Banner */}
      {anniversary.isAnniversaryToday && (
        <div style={{
          background: 'linear-gradient(90deg, #14b8a6, #f97316)',
          color: 'white',
          padding: '1rem',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          🎉 Happy {anniversary.monthsTogether} Month Anniversary! 🎉
        </div>
      )}
      
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
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={24} color="#f43f5e" fill="#f43f5e" />
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>OurJourney</h1>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                Building our story together 💕
              </p>
            </div>
          </div>
          
          {/* View Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveView('ideas')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: activeView === 'ideas' ? '#14b8a6' : 'white',
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
                backgroundColor: activeView === 'calendar' ? '#14b8a6' : 'white',
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
            <button
              onClick={() => setActiveView('notes')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: activeView === 'notes' ? '#14b8a6' : 'white',
                color: activeView === 'notes' ? 'white' : '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <MessageCircle size={16} /> Notes
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setShowPrivacy(true)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                textDecoration: 'underline'
              }}
            >
              Privacy
            </button>
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
        </div>
      </header>
      
      {/* Anniversary countdown if within 7 days */}
      {anniversary.daysUntilNext <= 7 && anniversary.daysUntilNext > 0 && (
        <div style={{
          backgroundColor: '#fef3c7',
          padding: '0.75rem',
          textAlign: 'center',
          fontSize: '0.875rem'
        }}>
          <Gift size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          {anniversary.daysUntilNext} days until your {anniversary.monthsTogether + 1} month anniversary!
        </div>
      )}

      {/* Main Content */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* IDEAS VIEW with Photo Support */}
        {activeView === 'ideas' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              💡 Ideas Bank
            </h2>
            
            {/* Add New Idea with Photo */}
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
                  resize: 'vertical',
                  marginBottom: '0.75rem'
                }}
              />
              
              {/* Photo upload */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <label style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  <Camera size={18} />
                  Add Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                {newIdea.image && (
                  <span style={{ fontSize: '0.875rem', color: '#10b981' }}>
                    ✓ Photo added
                  </span>
                )}
              </div>
              
              <button
                onClick={createIdea}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#14b8a6',
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
            
            {/* Ideas List with Photos */}
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
                    // View mode with photo
                    <div>
                      {idea.media_url && (
                        <img
                          src={idea.media_url}
                          alt={idea.title}
                          style={{
                            width: '100%',
                            maxHeight: '200px',
                            objectFit: 'cover',
                            borderRadius: '0.5rem',
                            marginBottom: '1rem'
                          }}
                        />
                      )}
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
        
        {/* LOVE NOTES VIEW */}
        {activeView === 'notes' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              💌 Love Notes
            </h2>
            
            {/* Add New Note */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              border: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #fce7f3 0%, #ddd6fe 100%)'
            }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: '#6b7280' }}>
                Leave a surprise note that will appear later 💕
              </p>
              <textarea
                placeholder="Write your love note..."
                value={newNote.message}
                onChange={(e) => setNewNote({...newNote, message: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  minHeight: '100px',
                  resize: 'vertical',
                  backgroundColor: 'white'
                }}
              />
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="radio"
                    checked={newNote.for_partner1}
                    onChange={() => setNewNote({...newNote, for_partner1: true})}
                  />
                  For Partner 1 💕
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="radio"
                    checked={!newNote.for_partner1}
                    onChange={() => setNewNote({...newNote, for_partner1: false})}
                  />
                  For Partner 2 💙
                </label>
              </div>
              <button
                onClick={createNote}
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f97316',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <MessageCircle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Leave Note
              </button>
            </div>
            
            {/* Notes List */}
            <div style={{ display: 'grid', gap: '1rem' }}>
              {notes.map(note => (
                <div key={note.id} style={{
                  backgroundColor: 'white',
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  border: '2px solid',
                  borderColor: note.title.includes('Partner 1') ? '#fce7f3' : '#dbeafe'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        {note.title}
                      </p>
                      <p style={{ fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                        {note.content}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem' }}>
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>
                        {note.title.includes('Partner 1') ? '💕' : '💙'}
                      </span>
                      <button
                        onClick={() => deleteNote(note.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          color: '#ef4444',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Delete note"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* CALENDAR VIEW with Weather */}
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
                  const isAnniversary = isSpecialDay(date)
                  
                  return (
                    <div
                      key={index}
                      onClick={() => date && openDayModal(date)}
                      style={{
                        backgroundColor: isToday ? '#f3e8ff' : isAnniversary ? '#fef3c7' : 'white',
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
                            {isAnniversary && ' 🎉'}
                          </div>
                          {hasEventsToday && (
                            <div style={{
                              position: 'absolute',
                              bottom: '0.5rem',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '6px',
                              height: '6px',
                              backgroundColor: '#14b8a6',
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
      
      {/* Day Modal with Weather */}
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
            
            {/* Weather for this day */}
            {weather[format(selectedDate, 'yyyy-MM-dd')] && (
              <div style={{
                backgroundColor: '#e0f2fe',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                <Cloud size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Weather: {weather[format(selectedDate, 'yyyy-MM-dd')]}
              </div>
            )}
            
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
                            <span style={{ color: '#14b8a6', marginRight: '0.5rem' }}>
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
                  backgroundColor: '#14b8a6',
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

export default AppEnhanced