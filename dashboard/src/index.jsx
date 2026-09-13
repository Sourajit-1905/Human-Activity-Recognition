import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'
import { HARProvider } from './context/HARContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HARProvider>
      <App />
    </HARProvider>
  </StrictMode>,
)