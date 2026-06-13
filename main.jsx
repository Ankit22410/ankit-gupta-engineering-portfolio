import { StrictMode }  from 'react'
import { createRoot }  from 'react-dom/client'
import App             from './App.jsx'

const style = document.createElement('style')
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
  body { background: #020408; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  #root { min-height: 100vh; }
`
document.head.appendChild(style)

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>,
)