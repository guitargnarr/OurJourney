export const styles = {
  // Main container
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #fff1f2, #ffffff, #f0fdfa)',
  },
  
  // Header
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid #fecaca',
    position: 'sticky',
    top: 0,
    zIndex: 40,
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Navigation
  nav: {
    display: 'flex',
    gap: '1rem',
  },
  navButton: {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: 'transparent',
  },
  navButtonActive: {
    backgroundColor: '#ffe4e6',
    color: '#be123c',
  },
  
  // Quick capture
  quickCapture: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: '64px',
    zIndex: 30,
  },
  quickCaptureContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0.75rem 1rem',
  },
  quickCaptureForm: {
    display: 'flex',
    gap: '0.5rem',
  },
  quickCaptureInput: {
    flex: 1,
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    outline: 'none',
  },
  quickCaptureButton: {
    padding: '0.5rem 1.5rem',
    backgroundColor: '#f43f5e',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.3s',
  },
  
  // Main content
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  
  // Cards
  card: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '1.5rem',
  },
  
  // Anticipation card
  anticipationCard: {
    background: 'linear-gradient(to right, #a855f7, #ec4899)',
    borderRadius: '1rem',
    padding: '1.5rem',
    color: 'white',
    marginBottom: '1.5rem',
  },
  
  // Progress bar
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: '9999px',
    transition: 'width 0.3s',
  },
  
  // Memory card
  memoryCard: {
    backgroundColor: '#fff1f2',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '0.75rem',
  },
  
  // Goal card
  goalCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '0.75rem',
  },
  
  // Timeline
  timelineDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  timelineLine: {
    width: '2px',
    height: '64px',
    backgroundColor: '#e5e7eb',
  },
  
  // Ritual prompt
  ritualPrompt: {
    background: 'linear-gradient(to right, #e0e7ff, #f3e8ff)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    border: '1px solid #c7d2fe',
    marginBottom: '1.5rem',
  },
}