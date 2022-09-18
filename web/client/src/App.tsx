import Router from './ui/Router/Router';
import { UiStateProvider } from './hooks/useUiState';
import './App.css';

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
