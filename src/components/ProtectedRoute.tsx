import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function ProtectedRoute() {
  const { isLogged } = useAuthStore();
  const location = useLocation();

  // Se não estiver logado, mandamos para o login, 
  // mas salvamos de onde ele veio (state) para poder voltar depois!
  if (!isLogged) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // O Outlet é onde as páginas "filhas" vão aparecer
  return <Outlet />;
}