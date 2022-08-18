import React from 'react';
import './App.css';
import { GameStateProvider } from './hooks/useGameState';
import SceneManager from './ui/scenes/SceneManager';

function App() {
  return (
    <GameStateProvider>
      <React.StrictMode>
        <SceneManager />
      </React.StrictMode>
    </GameStateProvider>
  )
}

export default App;