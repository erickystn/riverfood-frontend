// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DefaultLayout } from './components/DefaultLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login'; // O nosso super login unificado
import { AdminLayout } from './components/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { NewProduct } from './pages/admin/NewProduct';
import { ProductList } from './pages/admin/ProductList';
import { EditProduct } from './pages/admin/EditProduct';
import { Profile } from './pages/admin/Profile';
import { Search } from './pages/Search';
import { NotFound } from './pages/NotFound';
import { Checkout } from './pages/Checkout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MeusPedidos } from './pages/MeusPedidos';

export function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ROTA UNIFICADA DE LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* =========================================
            MUNDO B2B: RESTAURANTE (Protegido e Blindado)
            ========================================= */}
        <Route path="/restaurante" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="produtos" element={<ProductList />} />
          <Route path="produtos/novo" element={<NewProduct />} />
          <Route path="produtos/editar/:id" element={<EditProduct />} />
          <Route path="perfil" element={<Profile />} />
        </Route>

        {/* =========================================
            MUNDO B2C: CLIENTE / CONSUMIDOR
            ========================================= */}
        <Route path="/" element={<DefaultLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          {/* ÁREA PRIVADA DO CLIENTE */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/meus-pedidos" element={<MeusPedidos />} />
            {/* <Route path="/perfil" element={<Perfil />} />  */}
          </Route>
        </Route>

        {/* ROTA CORINGA: Deve ser sempre a ÚLTIMA */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;