// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function ProtectedRoute() {
  // Agora pegamos o 'user' também para saber o tipo!
  const { isLogged, user } = useAuthStore();
  const location = useLocation();

  // REGRA 1: Não está logado de jeito nenhum? Vai para o login.
  if (!isLogged) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // REGRA 2: A BLINDAGEM DO CLIENTE
  // Se quem está logado for um RESTAURANTE tentando bisbilhotar área de cliente, 
  // joga ele de volta para a "Cozinha" dele.
  if (user?.tipo === 'RESTAURANTE') {
    return <Navigate to="/restaurante/dashboard" replace />;
  }

  // Se passou pelas duas regras, é um CLIENTE autenticado.
  return <Outlet />;
}