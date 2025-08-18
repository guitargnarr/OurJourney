import { useState, useEffect } from 'react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { Heart, Plus, Target, Calendar, Sparkles } from 'lucide-react'
import Login from './Login'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_ENDPOINT = `${API_URL}/api`

// Simplified mood mapping
const MOODS = {
  excited: '🤩',
  happy: '😊',
  neutral: '😐',
  thoughtful: '🤔'
}

function AppMinimal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [entries, setEntries] = useState([])
  const [quickInput, setQuickInput] = useState('')
  const [inputType, setInputType] = useState('memory')
  const [loading, setLoading] = useState(false)

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('ourjourney_token')
    if (token) {
      setIsAuthenticated(true)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [])

  // Load entries when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadEntries()
    }
  }, [isAuthenticated])

  const handleLogin = (token) => {
    setIsAuthenticated(true)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  const handleLogout = () => {
    localStorage.removeItem('ourjourney_token')
    setIsAuthenticated(false)
    delete axios.defaults.headers.common['Authorization']
    setEntries([])
  }

  const loadEntries = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_ENDPOINT}/entries?limit=50`)
      setEntries(res.data || [])
    } catch (error) {
      console.error('Error loading entries:', error)
      if (error.response?.status === 401) {
        handleLogout()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuickCapture = async (e) => {
    e.preventDefault()
    if (!quickInput.trim()) return

    try {
      const newEntry = {
        type: inputType,
        title: quickInput,
        content: '',
        progress: inputType === 'goal' ? 0 : undefined
      }

      await axios.post(`${API_ENDPOINT}/entries`, newEntry)
      setQuickInput('')
      loadEntries()
    } catch (error) {
      console.error('Error creating entry:', error)
    }
  }

  const updateProgress = async (id, progress) => {
    try {
      await axios.put(`${API_ENDPOINT}/entries/${id}`, { progress })
      loadEntries()
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const deleteEntry = async (id) => {
    if (!confirm('Delete this entry?')) return
    try {
      await axios.delete(`${API_ENDPOINT}/entries/${id}`)
      loadEntries()
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  // Simple type icons
  const getTypeIcon = (type) => {
    switch(type) {
      case 'goal': return <Target size={16} color="#10b981" />
      case 'plan': return <Calendar size={16} color="#3b82f6" />
      case 'date': return <Calendar size={16} color="#ec4899" />
      case 'memory': return <Heart size={16} color="#f43f5e" />
      case 'idea': return <Sparkles size={16} color="#8b5cf6" />
      default: return <Heart size={16} color="#6b7280" />
    }
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #fdf4ff, #ffffff, #f0fdfa)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Simple Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #f3e8ff',
        padding: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={24} color="#f43f5e" fill="#f43f5e" />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>OurJourney</h1>
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

      {/* Quick Capture */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #f3e8ff',
        padding: '1rem',
        position: 'sticky',
        top: '57px',
        zIndex: 9
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <form onSubmit={handleQuickCapture}>
            {/* Type selector buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {['memory', 'goal', 'plan'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setInputType(type)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid',
                    borderColor: inputType === type ? '#8b5cf6' : '#e5e7eb',
                    backgroundColor: inputType === type ? '#f3e8ff' : 'white',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s'
                  }}
                >
                  {type === 'memory' && '💕'} {type === 'goal' && '🎯'} {type === 'plan' && '📅'} {type}
                </button>
              ))}
            </div>
            
            {/* Input field */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder={
                  inputType === 'memory' ? "What happened today?" :
                  inputType === 'goal' ? "What do you want to achieve together?" :
                  "What are you planning?"
                }
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Plus size={18} /> Add
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Feed */}
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            Loading your journey...
          </div>
        ) : entries.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '1rem',
            border: '1px solid #f3e8ff'
          }}>
            <Heart size={48} color="#f3e8ff" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Start Your Journey</h2>
            <p style={{ color: '#6b7280' }}>Add your first memory, goal, or plan above!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {entries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  border: '1px solid',
                  borderColor: entry.type === 'goal' ? '#dcfce7' : 
                               entry.type === 'memory' ? '#ffe4e6' : 
                               entry.type === 'plan' || entry.type === 'date' ? '#dbeafe' : '#f3e8ff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                {/* Entry Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getTypeIcon(entry.type)}
                    <span style={{ 
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      textTransform: 'capitalize'
                    }}>
                      {entry.type}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'transparent',
                      color: '#9ca3af',
                      border: 'none',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>

                {/* Entry Content */}
                <h3 style={{ 
                  fontSize: '1rem',
                  fontWeight: '500',
                  margin: '0 0 0.5rem 0',
                  color: '#1f2937'
                }}>
                  {entry.title}
                </h3>
                
                {entry.content && (
                  <p style={{ 
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: '0 0 0.75rem 0'
                  }}>
                    {entry.content}
                  </p>
                )}

                {/* Goal Progress */}
                {entry.type === 'goal' && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Progress
                      </span>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                        {entry.progress || 0}%
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        backgroundColor: '#10b981',
                        width: `${entry.progress || 0}%`,
                        transition: 'width 0.3s'
                      }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button
                        onClick={() => updateProgress(entry.id, Math.min(100, (entry.progress || 0) + 10))}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        +10%
                      </button>
                      {entry.progress >= 100 && (
                        <span style={{ 
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem'
                        }}>
                          🎉 Complete!
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Entry Footer */}
                <div style={{ 
                  marginTop: '0.75rem',
                  fontSize: '0.75rem',
                  color: '#9ca3af'
                }}>
                  {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                  {entry.mood && ` • ${MOODS[entry.mood] || entry.mood}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default AppMinimal