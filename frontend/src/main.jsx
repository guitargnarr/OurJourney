import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppEnhanced from './AppEnhanced.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppEnhanced />
  </StrictMode>,
)
