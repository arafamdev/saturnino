import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/app/App.jsx'
import ThemeProvider from '@/app/providers/theme/ThemeProvider.jsx'

import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
