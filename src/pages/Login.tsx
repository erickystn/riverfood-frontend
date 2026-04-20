// src/pages/Login.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Leaf, Storefront } from '@phosphor-icons/react';

export function Login() {
  // Estado para alternar entre Login e Cadastro
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex bg-surface-bg font-sans">
      
      {/* LADO ESQUERDO: Branding (Some no telemóvel, divide 50% no desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-river-dark relative flex-col justify-between p-12 overflow-hidden">
        {/* Efeito de fundo */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white hover:text-river-light transition-colors mb-12">
            <ArrowLeft size={20} weight="bold" />
            <span className="font-medium text-sm">Voltar para o app</span>
          </Link>
          
          <div className="flex items-center gap-1 text-4xl font-black text-white tracking-tight mb-6">
            RIVER<span className="text-river-green">FOOD</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white leading-tight max-w-md">
            O painel de controle para restaurantes inteligentes.
          </h1>
        </div>

        <div className="relative z-10 text-river-light/80 text-sm">
          &copy; {new Date().getFullYear()} River Food. Tecnologia para sua saúde.
        </div>
      </div>

      {/* LADO DIREITO: Formulários */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 relative">
        
        {/* Botão de voltar para o mobile (já que a barra lateral some) */}
        <Link to="/" className="lg:hidden absolute top-8 left-8 flex items-center gap-2 text-surface-muted hover:text-river-dark transition-colors">
          <ArrowLeft size={20} weight="bold" />
        </Link>

        <div className="w-full max-w-md bg-surface-card p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          
          {/* Cabeçalho do Form */}
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-river-light text-river-dark rounded-full flex items-center justify-center mb-4">
              {isLogin ? <Storefront size={24} weight="fill" /> : <Leaf size={24} weight="fill" />}
            </div>
            <h2 className="text-2xl font-bold text-surface-text">
              {isLogin ? 'Bem-vindo de volta' : 'Junte-se à revolução'}
            </h2>
            <p className="text-surface-muted mt-2 text-sm">
              {isLogin ? 'Aceda ao seu painel de parceiro River Food.' : 'Crie sua conta de restaurante e gere NutriScores.'}
            </p>
          </div>

          {/* O Formulário em si */}
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-surface-text mb-1">Nome do Restaurante</label>
                <input 
                  type="text" 
                  placeholder="Ex: Saladas & Cia" 
                  className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 text-surface-text focus:outline-none focus:border-river-green focus:ring-1 focus:ring-river-green transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-text mb-1">Email (Seu Usuário)</label>
              <input 
                type="email" 
                placeholder="contato@restaurante.com" 
                className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 text-surface-text focus:outline-none focus:border-river-green focus:ring-1 focus:ring-river-green transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-surface-text">Senha</label>
                {isLogin && <a href="#" className="text-xs text-river-green hover:text-river-dark font-medium">Esqueceu?</a>}
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 text-surface-text focus:outline-none focus:border-river-green focus:ring-1 focus:ring-river-green transition-all"
              />
            </div>

            <button className="w-full bg-river-dark hover:bg-river-green text-white font-bold py-3.5 rounded-xl transition-all mt-4 shadow-md">
              {isLogin ? 'Entrar no Painel' : 'Criar Conta'}
            </button>
          </form>

          {/* Toggle entre Login e Register */}
          <div className="mt-8 text-center text-sm text-surface-muted">
            {isLogin ? "Ainda não é parceiro? " : "Já tem uma conta? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-river-green font-bold hover:text-river-dark transition-colors"
            >
              {isLogin ? "Cadastre seu restaurante" : "Faça login"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}