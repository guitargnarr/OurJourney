import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppFocused from './AppFocused.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppFocused />
  </StrictMode>,
)
