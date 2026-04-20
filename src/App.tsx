// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DefaultLayout } from './components/DefaultLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login'; // O nosso login de restaurante

// Componente bobo só para marcar lugar na tela do cliente
function EmBreveCliente() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg">
      <h1 className="text-2xl font-bold text-surface-muted">Login de Cliente em construção 🚧</h1>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* =========================================
            MUNDO B2B: RESTAURANTE (Totalmente desacoplado)
            ========================================= */}
        <Route path="/restaurante">
          <Route path="login" element={<Login />} />
          {/* Futuras rotas: /restaurante/dashboard, /restaurante/produtos */}
        </Route>

        {/* =========================================
            MUNDO B2C: CLIENTE / CONSUMIDOR
            ========================================= */}
        {/* Placeholder do Cliente */}
        <Route path="/login-cliente" element={<EmBreveCliente />} />

        <Route path="/" element={<DefaultLayout />}>
          <Route index element={<Home />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;