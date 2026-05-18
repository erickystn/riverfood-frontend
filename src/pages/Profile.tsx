// src/pages/Profile.tsx
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { User, Envelope, FloppyDisk, Lock } from '@phosphor-icons/react';
import riverfoodLogo from '../assets/riverfood-logo.png';

export function Profile() {
  const user = useAuthStore((state) => state.user);

  // Estados dos dados do usuário
  const [nome, setNome] = useState('');
  const [usuarioEmail, setUsuarioEmail] = useState('');
  const [foto, setFoto] = useState('');
  
  // Estados de Senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaNovaSenha, setConfirmaNovaSenha] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadProfileData() {
      try {
        const response = await api.get('/usuarios/perfil');
        setNome(response.data.nome || '');
        setUsuarioEmail(response.data.usuario || '');
        setFoto(response.data.foto || '');
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      }
    }
    if (user) loadProfileData();
  }, [user]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    // --- MODO DE SEGURANÇA ATIVADO ---
    const isChangingPassword = senhaAtual || novaSenha || confirmaNovaSenha;

    if (isChangingPassword) {
      // 1. Validações de preenchimento
      if (!senhaAtual) {
        toast.warning("Para alterar a senha, você precisa digitar a Senha Atual.");
        setIsLoading(false);
        return; 
      }
      if (!novaSenha || novaSenha.length < 6) {
        toast.warning("A nova senha precisa ter pelo menos 6 caracteres.");
        setIsLoading(false);
        return;
      }
      if (novaSenha !== confirmaNovaSenha) {
        toast.error("As novas senhas não coincidem!");
        setIsLoading(false);
        return;
      }

      // 2. O "Login Fantasma" para validar se a pessoa realmente sabe a senha antiga
      try {
        // Usa o e-mail original logado (user?.usuario) para não dar erro 
        // caso ele tenha alterado o campo de e-mail no formulário junto com a senha
        await api.post('/usuarios/logar', { usuario: user?.usuario, senha: senhaAtual });
      } catch (error) {
        toast.error("A senha atual está incorreta.");
        setIsLoading(false);
        return; 
      }
    }

    // --- FLUXO NORMAL DE ATUALIZAÇÃO ---
    try {
      const payload: any = {
        id: user?.id, // Pode manter ou tirar dependendo se seu back precisa
        nome,
        usuario: usuarioEmail,
        foto
      };

      // Só anexa a nova senha se o modo de segurança passou liso
      if (isChangingPassword) {
        payload.senha = novaSenha;
      }

      await api.put('/usuarios/atualizar', payload); 
      
      toast.success("Perfil atualizado com sucesso!");
      
      // Limpa os campos de senha por segurança visual
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmaNovaSenha('');

    } catch (error: any) {
      const msg = error.response?.data?.message || "Erro ao salvar alterações.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  const isRestaurante = user?.tipo === 'RESTAURANTE';
  const avatarSource = foto && foto.trim() !== "" ? foto : riverfoodLogo;

  return (
    <div className="max-w-5xl mx-auto py-16 px-4 min-h-[75vh] animate-fade-in flex flex-col gap-8">
      
      {/* Header da Página */}
      <div>
        <h1 className="text-3xl font-black text-river-dark tracking-tight">Meu Perfil</h1>
        <p className="text-sm text-surface-muted mt-1">Gerencie as informações da sua conta.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 flex flex-col md:flex-row gap-12 items-start">
        
        {/* Lado Esquerdo - Foto de Perfil */}
        <div className="w-full md:w-1/3 flex flex-col items-center text-center">
          <div className="w-48 h-48 rounded-[2rem] bg-slate-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center p-2 mb-4">
             <img 
               src={avatarSource} 
               alt={nome} 
               className="w-full h-full object-cover rounded-xl"
               onError={(e) => { (e.target as HTMLImageElement).src = riverfoodLogo; }}
             />
          </div>
          <span className="text-xs font-bold text-river-green uppercase tracking-wider px-3 py-1 bg-river-light/30 rounded-full">
            {isRestaurante ? 'Parceiro Oficial' : 'Cliente RiverFood'}
          </span>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="w-full md:w-2/3">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Nome */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <User size={18} />
                  {isRestaurante ? 'Nome do Restaurante' : 'Seu Nome Completo'}
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-river-green focus:bg-white transition-all text-slate-700 font-medium"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Envelope size={18} />
                  E-mail de Acesso
                </label>
                <input
                  type="email"
                  value={usuarioEmail}
                  onChange={(e) => setUsuarioEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-river-green focus:bg-white transition-all text-slate-700 font-medium"
                  required
                />
              </div>
            </div>

            {/* Segurança */}
            <div className="pt-6 border-t border-slate-100">
              <label className="flex items-center gap-2 text-sm font-bold text-river-green mb-4">
                <Lock size={18} />
                Segurança <span className="text-xs text-slate-400 font-normal">(Opcional)</span>
              </label>
              <div className="space-y-4">
                {/* 💡 CAMPO DE SENHA ATUAL ADICIONADO AQUI */}
                <input
                  type="password"
                  placeholder="Senha Atual"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-river-green focus:bg-white transition-all text-slate-700"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="password"
                    placeholder="Nova Senha"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-river-green focus:bg-white transition-all text-slate-700"
                  />
                  <input
                    type="password"
                    placeholder="Confirme a Nova Senha"
                    value={confirmaNovaSenha}
                    onChange={(e) => setConfirmaNovaSenha(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-river-green focus:bg-white transition-all text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Botão de Salvar */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto bg-river-dark hover:bg-river-green text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Salvar Alterações
                    <FloppyDisk size={20} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}