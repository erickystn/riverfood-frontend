import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 1. Importe o CSS do Toast e o Container
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* 2. Coloque o Container aqui, assim ele fica global */}
    <ToastContainer theme="colored" />
  </StrictMode>,
)
