import { useState, useEffect } from 'react'
import axios from 'axios'
import { format, formatDistanceToNow, differenceInDays, startOfWeek } from 'date-fns'
import { 
  Heart, Plus, Target, Calendar, Sparkles, Clock, 
  TrendingUp, MessageCircle, Trophy, Star, ChevronRight,
  Zap, Users, Gift
} from 'lucide-react'
import './App.css'

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`

// Mood emojis
const MOODS = {
  excited: '🤩',
  happy: '😊',
  neutral: '😐',
  thoughtful: '🤔',
  challenging: '😤'
}

function App() {
  const [entries, setEntries] = useState([])
  const [nextAdventure, setNextAdventure] = useState(null)
  const [weeklyRitual, setWeeklyRitual] = useState(null)
  const [stats, setStats] = useState(null)
  const [quickInput, setQuickInput] = useState('')
  const [activeView, setActiveView] = useState('dashboard')
  const [showRitualPrompt, setShowRitualPrompt] = useState(false)

  // Load data on mount
  useEffect(() => {
    loadDashboard()
    checkWeeklyRitual()
    const interval = setInterval(loadDashboard, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const loadDashboard = async () => {
    try {
      // Load multiple data points in parallel
      const [entriesRes, adventureRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/entries?limit=20`),
        axios.get(`${API_URL}/anticipation/next`),
        axios.get(`${API_URL}/insights/stats`)
      ])
      
      setEntries(entriesRes.data)
      setNextAdventure(adventureRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    }
  }

  const checkWeeklyRitual = async () => {
    try {
      const res = await axios.get(`${API_URL}/rituals/current`)
      setWeeklyRitual(res.data)
      
      // Show prompt if Sunday and not completed
      const today = new Date().getDay()
      if (today === 0 && !res.data.gratitude) {
        setShowRitualPrompt(true)
      }
    } catch (error) {
      console.error('Error checking ritual:', error)
    }
  }

  const handleQuickCapture = async (e) => {
    e.preventDefault()
    if (!quickInput.trim()) return

    try {
      // Smart parsing of input
      const input = quickInput.toLowerCase()
      let type = 'idea'
      let targetDate = null
      
      // Detect type based on keywords
      if (input.includes('goal') || input.includes('want to')) {
        type = 'goal'
      } else if (input.includes('plan') || input.includes('going to')) {
        type = 'event'
        // Try to extract date
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        targetDate = format(tomorrow, 'yyyy-MM-dd')
      } else if (input.includes('remember') || input.includes('today')) {
        type = 'memory'
      } else if (input.includes('feeling') || input.includes('feel')) {
        type = 'feeling'
      }

      const newEntry = {
        type,
        title: quickInput,
        content: '',
        category: 'General',
        mood: 'neutral',
        target_date: targetDate,
        author: 'both'
      }

      await axios.post(`${API_URL}/entries`, newEntry)
      setQuickInput('')
      loadDashboard()
    } catch (error) {
      console.error('Error creating entry:', error)
    }
  }

  const updateProgress = async (id, progress) => {
    try {
      await axios.put(`${API_URL}/entries/${id}`, { progress })
      loadDashboard()
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const completeEntry = async (id) => {
    try {
      await axios.post(`${API_URL}/entries/${id}/complete`)
      loadDashboard()
    } catch (error) {
      console.error('Error completing entry:', error)
    }
  }

  const exportInsights = async () => {
    try {
      const res = await axios.get(`${API_URL}/insights/export`)
      navigator.clipboard.writeText(res.data.export_text)
      alert('Insights copied to clipboard! Paste into ChatGPT for visualization.')
    } catch (error) {
      console.error('Error exporting insights:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-teal-50 hero-gradient">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between animate-fade-in-up">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-rose-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800 text-shimmer">OurJourney</h1>
                <p className="text-sm text-gray-600">Building our story together</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeView === 'dashboard' 
                    ? 'bg-rose-100 text-rose-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('timeline')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeView === 'timeline' 
                    ? 'bg-rose-100 text-rose-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setActiveView('goals')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeView === 'goals' 
                    ? 'bg-rose-100 text-rose-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                Goals
              </button>
            </nav>

            {/* Stats */}
            {stats && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span>{stats.goals_completed} completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-blue-500" />
                  <span>{stats.memories_created} memories</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Quick Capture Bar */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <form onSubmit={handleQuickCapture} className="flex gap-2">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Quick capture: Type a goal, plan, memory, or feeling..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            {/* Anticipation Card */}
            {nextAdventure && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-sm font-medium">Next Adventure</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-1">{nextAdventure.title}</h2>
                    <p className="text-white/80">{nextAdventure.content}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold">{nextAdventure.days_until}</div>
                    <div className="text-sm">days to go!</div>
                  </div>
                </div>
              </div>
            )}

            {/* Weekly Ritual Prompt */}
            {showRitualPrompt && weeklyRitual && (
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-6 border border-indigo-200">
                <div className="flex items-center gap-3 mb-4">
                  <MessageCircle className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl font-semibold">Weekly Check-in Time!</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Take 5 minutes together to reflect on your week and connect.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                    <span>What made you grateful this week?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                    <span>Any challenges to discuss?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                    <span>What are you excited about?</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowRitualPrompt(false)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Start Check-in
                </button>
              </div>
            )}

            {/* Active Goals */}
            <div className="card-elite bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Active Goals
                </h3>
              </div>
              <div className="space-y-3">
                {entries
                  .filter(e => e.type === 'goal' && e.status === 'active')
                  .slice(0, 3)
                  .map(goal => (
                    <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{goal.title}</h4>
                        <span className="text-sm text-gray-500">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateProgress(goal.id, Math.min(100, goal.progress + 10))}
                          className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          +10%
                        </button>
                        {goal.progress >= 100 && (
                          <button
                            onClick={() => completeEntry(goal.id)}
                            className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            Complete ✓
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Recent Memories */}
            <div className="card-elite bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-600" />
                  Recent Memories
                </h3>
                <button
                  onClick={exportInsights}
                  className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                >
                  Export Insights
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {entries
                  .filter(e => e.type === 'memory')
                  .slice(0, 4)
                  .map(memory => (
                    <div key={memory.id} className="bg-rose-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">{memory.title}</h4>
                          {memory.content && (
                            <p className="text-sm text-gray-600 mt-1">{memory.content}</p>
                          )}
                        </div>
                        {memory.mood && (
                          <span className="text-2xl">{MOODS[memory.mood]}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(memory.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'timeline' && (
          <div className="card-elite bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Our Journey Timeline</h2>
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <div key={entry.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      entry.type === 'goal' ? 'bg-green-500' :
                      entry.type === 'event' ? 'bg-blue-500' :
                      entry.type === 'memory' ? 'bg-rose-500' :
                      'bg-gray-400'
                    }`} />
                    {index < entries.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="text-sm text-gray-500 mb-1">
                      {format(new Date(entry.created_at), 'MMM d, yyyy')}
                    </div>
                    <h3 className="font-medium">{entry.title}</h3>
                    {entry.content && (
                      <p className="text-sm text-gray-600 mt-1">{entry.content}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">
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

        {activeView === 'goals' && (
          <div className="space-y-4">
            <div className="card-elite bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Our Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entries
                  .filter(e => e.type === 'goal')
                  .map(goal => (
                    <div key={goal.id} className={`border rounded-lg p-4 ${
                      goal.status === 'completed' ? 'bg-green-50 border-green-200' : 'border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{goal.title}</h3>
                          {goal.content && (
                            <p className="text-sm text-gray-600 mt-1">{goal.content}</p>
                          )}
                        </div>
                        {goal.status === 'completed' ? (
                          <Trophy className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <span className="text-sm font-medium">{goal.progress}%</span>
                        )}
                      </div>
                      {goal.status === 'active' && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateProgress(goal.id, Math.min(100, goal.progress + 10))}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                            >
                              Progress +10%
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
