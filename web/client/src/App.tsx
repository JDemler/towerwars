import './App.css';
import { UiStateProvider } from './hooks/useUiState';
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
