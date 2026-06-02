import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/index.css';
import './i18n';
import { DevicePreview } from './app/components/DevicePreview';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DevicePreview>
      <App />
    </DevicePreview>
  </React.StrictMode>
);
