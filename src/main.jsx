import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom' // <--- 1. Import this
import './index.css'
import App from './App.jsx'

const body = document.body;

if (localStorage.getItem("crt") !== "false") {
  body.dataset.crt = "on";
}

if (localStorage.getItem("scanlines") !== "false") {
  body.dataset.scanlines = "on";
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter> {/* <--- 2. Wrap your App component here */}
      <App />
    </HashRouter>
  </StrictMode>,
)