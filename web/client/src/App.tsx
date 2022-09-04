import React from 'react';
import './App.css';
import { UiStateProvider } from './hooks/useUiState';
import GameCanvas from './ui/GameCanvas/GameCanvas';
import Router from './ui/Router/Router';

function App() {
  return (
    <>
      <UiStateProvider>
        <Router />
        
        {/* <React.StrictMode> */}
          {/* UI will be placed here */}
        {/* </React.StrictMode> */}
      </UiStateProvider>
    </>
  );
}

export default App;
