import { StrictMode, useState, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LandingPage from './components/UI/landingPage.jsx'

function Root() {
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showSongSelector, setShowSongSelector] = useState(false);
  const [initialSong, setInitialSong] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null);
  const landingPageMusicControlRef = useRef(null);

  const handleFreePlayStart = () => {
    // Show song selector modal
    setCurrentLevel(null);
    setShowSongSelector(true);
  };

  const handleCampaignStart = (level, song) => {
    // Start game with pre-selected song
    setInitialSong(song);
    setCurrentLevel(level);
    setShowLandingPage(false);
  };

  const handleSongSelected = () => {
    // Hide landing page and let game start
    setCurrentLevel(null);
    setShowLandingPage(false);
  };

  const handleMainMenu = () => {
    // Show landing page again
    setShowLandingPage(true);
    setShowSongSelector(false);
    setInitialSong(null);
    setCurrentLevel(null);
  };

  return (
    <StrictMode>
      <App 
        showSongSelector={showSongSelector}
        setShowSongSelector={setShowSongSelector}
        onSongSelected={handleSongSelected}
        onMainMenu={handleMainMenu}
        isGameActive={!showLandingPage}
        landingPageMusicControl={landingPageMusicControlRef.current}
        initialSong={initialSong}
        currentLevel={currentLevel}
      />
      {showLandingPage && (
        <LandingPage 
          onFreePlayStart={handleFreePlayStart}
          onCampaignStart={handleCampaignStart}
          onMusicControlReady={(control) => {
            landingPageMusicControlRef.current = control;
          }}
        />
      )}
    </StrictMode>
  );
}

createRoot(document.getElementById('root')).render(<Root />)
