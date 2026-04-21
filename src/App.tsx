// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DefaultLayout } from './components/DefaultLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login'; // O nosso login de restaurante
import { AdminLayout } from './components/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { NewProduct } from './pages/admin/NewProduct';
import { ProductList } from './pages/admin/ProductList';
import { EditProduct } from './pages/admin/EditProduct';
import { Profile } from './pages/admin/Profile';

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

        {/* LOGIN: Sem moldura */}
        <Route path="/restaurante/login" element={<Login />} />
        
        {/* =========================================
            MUNDO B2B: RESTAURANTE (Totalmente desacoplado)
            ========================================= */}
        {/* ADMINISTRAÇÃO: Com Sidebar e Proteção de Rota [cite: 135] */}
        <Route path="/restaurante" element={<AdminLayout />}>
        <Route path="produtos/editar/:id" element={<EditProduct />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="produtos" element={<ProductList/>} />
          <Route path="produtos/novo" element={<NewProduct/>} />
          <Route path="perfil" element={<Profile />} />
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