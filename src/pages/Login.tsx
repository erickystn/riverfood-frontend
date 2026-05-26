// src/pages/Login.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Leaf, 
  Storefront, 
  Envelope, 
  Lock, 
  Storefront as StoreIcon,
  User as UserIcon,
  Swap
} from '@phosphor-icons/react';
import { toast } from 'react-toastify';

import { api } from '../services/api';
import { useAuthStore, type TipoUsuario } from '../store/useAuthStore';

export function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const typeParam = searchParams.get('type');
  const initialMode: TipoUsuario = typeParam === 'restaurante' ? 'RESTAURANTE' : 'CLIENTE';

  const setLogin = useAuthStore((state) => state.setLogin);
  const isLogged = useAuthStore((state) => state.isLogged);
  const user = useAuthStore((state) => state.user);

  const [viewMode, setViewMode] = useState<TipoUsuario>(initialMode);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setViewMode(initialMode);
  }, [initialMode]);

  // 💡 1. REDIRECIONAMENTO DE SEGURANÇA (Se já estiver logado)
  if (isLogged && user) {
    if (user.tipo === 'RESTAURANTE') return <Navigate to="/restaurante/dashboard" replace />;
    if (user.tipo === 'ENTREGADOR') return <Navigate to="/entregas" replace />; // Bloqueia o motoboy de ver o painel
    return <Navigate to="/" replace />;
  }

  const toggleViewMode = () => {
    const newMode = viewMode === 'CLIENTE' ? 'RESTAURANTE' : 'CLIENTE';
    setViewMode(newMode);
    setSearchParams({ type: newMode.toLowerCase() });
    setIsLogin(true); 
  };

  async function handleAuthenticate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await api.post('/usuarios/logar', {
          usuario: email,
          senha: password
        });

        const { id, nome, usuario, tipo, token } = response.data;

        setLogin({ id, nome, usuario, tipo }, token);
        toast.success(`Bem-vindo, ${nome}!`);

        // 💡 2. REDIRECIONAMENTO APÓS SUCESSO DE LOGIN
        if (tipo === 'RESTAURANTE') navigate('/restaurante/dashboard');
        else if (tipo === 'ENTREGADOR') navigate('/entregas');
        else navigate('/');
        
      } else {
        await api.post('/usuarios/cadastrar', {
          nome: nome,
          usuario: email,
          senha: password,
          tipo: viewMode 
        });

        setNome("");
        setEmail("");
        setPassword("");
        
        toast.success("Conta criada com sucesso! Faça o login.");
        setIsLogin(true); 
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro na autenticação. Verifique os dados.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  const isCliente = viewMode === 'CLIENTE';
  
  const theme = {
    bgBanner: isCliente 
      ? "bg-[url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200')]" 
      : "bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200')]", 
    title: isCliente ? "Peça comida saudável com consciência." : "A plataforma de gestão para o seu restaurante.",
    icon: isCliente ? <Leaf size={24} weight="fill" /> : <Storefront size={24} weight="fill" />,
    formTitle: isLogin 
      ? (isCliente ? "Acessar sua Conta" : "Acesso ao Painel") 
      : (isCliente ? "Criar Conta de Cliente" : "Registar Restaurante"),
    formSubtitle: isLogin
      ? (isCliente ? "Faça login para fazer seus pedidos." : "Entre com as suas credenciais de parceiro.")
      : (isCliente ? "Junte-se à revolução saudável." : "Digitalize o seu cardápio de forma inteligente."),
    switchPrompt: isCliente ? "É dono de um restaurante?" : "Quer apenas pedir comida?",
    switchAction: isCliente ? "Acessar área de Parceiros" : "Entrar como Cliente",
    namePlaceholder: isCliente ? "Seu Nome Completo" : "Nome do Restaurante",
    InputIcon: isCliente ? UserIcon : StoreIcon
  };

  return (
    <div className="min-h-screen flex bg-surface-bg font-sans">
      
      <div className={`hidden lg:flex lg:w-1/2 ${isCliente ? 'bg-river-green' : 'bg-river-dark'} relative flex-col justify-between p-12 overflow-hidden transition-colors duration-500`}>
        <div className={`absolute inset-0 ${theme.bgBanner} opacity-20 bg-cover bg-center mix-blend-overlay transition-all duration-500`}></div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition-opacity mb-12">
            <ArrowLeft size={20} weight="bold" />
            <span className="font-medium text-sm">Voltar para a Página Principal</span>
          </Link>
          
          <div className="flex items-center gap-1 text-4xl font-black text-white tracking-tight mb-6">
            RIVER<span className={isCliente ? "text-river-dark" : "text-river-green"}>FOOD</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white leading-tight max-w-md">
            {theme.title}
          </h1>
        </div>

        <div className="relative z-10 text-white/80 text-sm font-medium">
          &copy; {new Date().getFullYear()} River Food. {isCliente ? 'Para Clientes.' : 'Para Parceiros.'}
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
        
        <Link to="/" className="lg:hidden absolute top-8 left-8 text-surface-muted hover:text-river-dark transition-colors flex items-center gap-2">
          <ArrowLeft size={24} weight="bold" />
          <span className="text-sm font-bold">Início</span>
        </Link>

        <button 
          onClick={toggleViewMode}
          className="absolute top-8 right-8 flex items-center gap-2 text-xs font-bold text-surface-muted hover:text-river-dark transition-colors border border-slate-200 px-4 py-2 rounded-full shadow-sm hover:shadow-md bg-white"
        >
          <Swap size={16} weight="bold" />
          {theme.switchAction}
        </button>

        <div className="w-full max-w-md bg-surface-card p-8 rounded-3xl shadow-xl border border-slate-100 mt-12 lg:mt-0">
          
          <div className="text-center mb-8">
            <div className={`mx-auto w-12 h-12 ${isCliente ? 'bg-river-green/20 text-river-green' : 'bg-river-light text-river-dark'} rounded-full flex items-center justify-center mb-4 transition-colors`}>
              {theme.icon}
            </div>
            <h2 className="text-2xl font-bold text-surface-text">
              {theme.formTitle}
            </h2>
            <p className="text-surface-muted mt-2 text-sm">
              {theme.formSubtitle}
            </p>
          </div>

          <form onSubmit={handleAuthenticate} className="flex flex-col gap-4">
            
            {!isLogin && (
              <div className="space-y-1 animate-fade-in">
                <label className="text-xs font-bold text-surface-muted uppercase ml-1">
                  {theme.namePlaceholder}
                </label>
                <div className="relative">
                  <theme.InputIcon size={18} className="absolute left-4 top-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder={isCliente ? "Ex: Nome Completo" : "Ex: Fit da Praça"} 
                    className="w-full bg-surface-bg border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-river-green transition-all"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-surface-muted uppercase ml-1">Email</label>
              <div className="relative">
                <Envelope size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com" 
                  className="w-full bg-surface-bg border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-river-green transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-surface-muted uppercase">Palavra-passe</label>
                
                {isLogin && (
                  <button 
                    type="button"
                    onClick={() => toast.info("Funcionalidade de recuperação de palavra-passe em breve!")}
                    className="text-xs font-bold text-river-green hover:text-river-dark transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
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
              className={`w-full ${isCliente ? 'bg-river-green hover:bg-river-dark' : 'bg-river-dark hover:bg-river-green'} text-white font-black py-4 rounded-xl transition-colors mt-2 shadow-lg shadow-river-dark/10 flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isLogin ? 'Entrar Agora' : 'Criar Conta'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-surface-muted">
            <p className="mb-2">
              {isLogin ? "Ainda não tem conta? " : "Já possui acesso? "}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-river-green font-bold hover:text-river-dark transition-colors"
              >
                {isLogin ? "Registe-se aqui" : "Faça o login"}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}