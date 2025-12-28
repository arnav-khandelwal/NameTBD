import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LandingPage from './components/UI/landingPage.jsx'

function Root() {
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showSongSelector, setShowSongSelector] = useState(false);

  const handleFreePlayStart = () => {
    // Show song selector modal
    setShowSongSelector(true);
  };

  const handleSongSelected = () => {
    // Hide landing page and let game start
    setShowLandingPage(false);
  };

  const handleMainMenu = () => {
    // Show landing page again
    setShowLandingPage(true);
    setShowSongSelector(false);
  };

  return (
    <StrictMode>
      <App 
        showSongSelector={showSongSelector}
        setShowSongSelector={setShowSongSelector}
        onSongSelected={handleSongSelected}
        onMainMenu={handleMainMenu}
        isGameActive={!showLandingPage}
      />
      {showLandingPage && (
        <LandingPage 
          onFreePlayStart={handleFreePlayStart}
        />
      )}
    </StrictMode>
  );
}

createRoot(document.getElementById('root')).render(<Root />)
