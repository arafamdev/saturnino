import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/app/App.jsx'
import PwaProvider from '@/features/pwa/context/PwaProvider'
import ThemeProvider from '@/app/providers/theme/ThemeProvider.jsx'

import '@/i18n'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <PwaProvider>
        <App />
      </PwaProvider>
    </ThemeProvider>
  </StrictMode>,
)
