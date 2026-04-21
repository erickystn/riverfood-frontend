// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Leaf, 
  Storefront, 
  Envelope, 
  Lock, 
  Storefront as StoreIcon 
} from '@phosphor-icons/react';
import { toast } from 'react-toastify';

import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export function Login() {
  const navigate = useNavigate();
  const setLogin = useAuthStore((state) => state.setLogin);

  // Estados locais para o formulário
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nomeRestaurante, setNomeRestaurante] = useState(''); // Usado apenas no cadastro
  const [isLoading, setIsLoading] = useState(false);
  const isLogged = useAuthStore((state) => state.isLogged);

  // SE JÁ ESTIVER LOGADO: Redireciona para o dashboard antes mesmo de renderizar o formulário
  if (isLogged) {
    return <Navigate to="/restaurante/dashboard" replace />;
  }

  // Função para lidar com a Autenticação Real
  async function handleAuthenticate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Fluxo de LOGIN
        const response = await api.post('/usuarios/logar', {
          usuario: email, // O teu back espera 'usuario' como chave para o email
          senha: password
        });

        const { id, nome, usuario, token } = response.data;

        // Guarda no Zustand (isso dispara o persist para o LocalStorage)
        setLogin({ id, nome, usuario }, token);

        toast.success(`Bem-vindo, ${nome}!`);
        navigate('/restaurante/dashboard');
      } else {
        // Fluxo de CADASTRO (Implementação futura baseada no teu POST /usuarios/cadastrar)
        await api.post('/usuarios/cadastrar', {
          nome: nomeRestaurante,
          usuario: email,
          senha: password
        });

        setNomeRestaurante("");
        setEmail("");
        setPassword("");
        
        toast.success("Conta criada com sucesso! Faça login para aceder.");
        setIsLogin(true); // Muda para o modo login
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro na autenticação. Verifique os dados.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-surface-bg font-sans">
      
      {/* LADO ESQUERDO: Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-river-dark relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white hover:text-river-light transition-colors mb-12">
            <ArrowLeft size={20} weight="bold" />
            <span className="font-medium text-sm">Voltar para a Vitrine</span>
          </Link>
          
          <div className="flex items-center gap-1 text-4xl font-black text-white tracking-tight mb-6">
            RIVER<span className="text-river-green">FOOD</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white leading-tight max-w-md">
            A plataforma de gestão para restaurantes que priorizam a saúde.
          </h1>
        </div>

        <div className="relative z-10 text-river-light/80 text-sm">
          &copy; {new Date().getFullYear()} River Food. Dashboard Administrativo.
        </div>
      </div>

      {/* LADO DIREITO: Formulários */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 relative">
        
        {/* Link de volta (Mobile) */}
        <Link to="/" className="lg:hidden absolute top-8 left-8 text-surface-muted hover:text-river-dark transition-colors">
          <ArrowLeft size={24} weight="bold" />
        </Link>

        <div className="w-full max-w-md bg-surface-card p-8 rounded-3xl shadow-xl border border-slate-100">
          
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-river-light text-river-dark rounded-full flex items-center justify-center mb-4">
              {isLogin ? <Storefront size={24} weight="fill" /> : <Leaf size={24} weight="fill" />}
            </div>
            <h2 className="text-2xl font-bold text-surface-text">
              {isLogin ? 'Aceder ao Painel' : 'Registar Restaurante'}
            </h2>
            <p className="text-surface-muted mt-2 text-sm">
              {isLogin ? 'Entre com as suas credenciais de parceiro.' : 'Crie a sua conta e comece a gerir o seu cardápio.'}
            </p>
          </div>

          <form onSubmit={handleAuthenticate} className="flex flex-col gap-4">
            
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-surface-muted uppercase ml-1">Nome do Restaurante</label>
                <div className="relative">
                  <StoreIcon size={18} className="absolute left-4 top-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    value={nomeRestaurante}
                    onChange={(e) => setNomeRestaurante(e.target.value)}
                    placeholder="Ex: Saladas & Grãos" 
                    className="w-full bg-surface-bg border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-river-green transition-all"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-surface-muted uppercase ml-1">Email de Usuário</label>
              <div className="relative">
                <Envelope size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@restaurante.com" 
                  className="w-full bg-surface-bg border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-river-green transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-surface-muted uppercase ml-1">Palavra-passe</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-surface-bg border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-river-green transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-river-dark hover:bg-river-green text-white font-black py-4 rounded-xl transition-all mt-4 shadow-lg shadow-river-dark/10 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isLogin ? 'Entrar Agora' : 'Criar Conta'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-surface-muted">
            {isLogin ? "Ainda não é parceiro? " : "Já tem acesso ao painel? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-river-green font-bold hover:text-river-dark transition-colors"
            >
              {isLogin ? "Cadastre-se aqui" : "Faça o login"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}