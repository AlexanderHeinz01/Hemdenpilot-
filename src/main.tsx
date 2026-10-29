import {createRoot} from 'react-dom/client';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-500-italic.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/cormorant-garamond/latin-600-italic.css';
import '@fontsource/plus-jakarta-sans/latin-400.css';
import '@fontsource/plus-jakarta-sans/latin-500.css';
import '@fontsource/plus-jakarta-sans/latin-600.css';
import App from './App.tsx';
import './index.css';
import { captureSession } from './services/session';

// UTM-Parameter und Preistest-Variante vor dem ersten Rendern übernehmen
captureSession();

createRoot(document.getElementById('root')!).render(<App />);
