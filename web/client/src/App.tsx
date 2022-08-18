import React from 'react';
import './App.css';
import { GameStateProvider } from './hooks/useGameState';
import SceneManager from './ui/scenes/SceneManager';

function App() {
  return (
    <GameStateProvider>
      {/* Strict Mode is not enabled for the GameState provider */}
      {/* Since React 18, strict mode causes hooks to be run twice causing data in the GameState Context to be loaded twice. */}
      <React.StrictMode>
        <SceneManager />
      </React.StrictMode>
    </GameStateProvider>
  )
}

export default App;