import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppEnhanced from './AppEnhanced.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AppEnhanced />
    </ErrorBoundary>
  </StrictMode>,
)
