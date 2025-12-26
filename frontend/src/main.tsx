import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('[DEBUG] main.tsx: Starting app initialization')
const rootElement = document.getElementById('root')
console.log('[DEBUG] main.tsx: Root element found:', rootElement)
createRoot(rootElement!).render(<App />)
console.log('[DEBUG] main.tsx: App rendered')
