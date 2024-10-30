import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../pages/adminpages/eventM'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
