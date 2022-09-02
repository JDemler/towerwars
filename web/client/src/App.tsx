import React from 'react';
import './App.css';
import GameCanvas from './ui/GameCanvas/GameCanvas';

function App() {
  return (
    <>
      <GameCanvas />
      
      <React.StrictMode>
        {/* UI will be placed here */}
      </React.StrictMode>
    </>
  );
}

export default App;
