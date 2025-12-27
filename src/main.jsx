import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LandingPage from './components/UI/landingPage.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App /> 
    {/* to display landing page uncomment the line below  */}
    <LandingPage />

  </StrictMode>,
)
