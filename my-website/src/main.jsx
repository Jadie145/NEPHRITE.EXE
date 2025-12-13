import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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
    <App />
  </StrictMode>,
)
