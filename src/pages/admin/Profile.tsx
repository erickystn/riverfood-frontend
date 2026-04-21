import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { User, Envelope, Lock, FloppyDisk } from '@phosphor-icons/react';

// Importando a imagem estática conforme seu diretório
import perfilFoto from '../../assets/riverfood-logo.png'; 

export function Profile() {
  const { user, token, setLogin } = useAuthStore();
  
  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.usuario || '');
  
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [loading, setLoading] = useState(false);

async function handleUpdateProfile(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);

  try {
    // 1. Descobrimos a intenção do usuário: Ele quer mudar a senha?
    // Se ele digitou UMA letra que seja em qualquer campo de senha, consideramos que sim.
    const isChangingPassword = senhaAtual || novaSenha || confirmarSenha;

    if (isChangingPassword) {
      // --- MODO DE SEGURANÇA ATIVADO ---
      
      // Validações de preenchimento
      if (!senhaAtual) {
        toast.warning("Para alterar a senha, você precisa digitar a Senha Atual.");
        return; // Interrompe a execução, mas o 'finally' garante que o loading pare.
      }
      if (!novaSenha || novaSenha.length < 6) {
        toast.warning("A nova senha precisa ter pelo menos 6 caracteres.");
        return;
      }
      if (novaSenha !== confirmarSenha) {
        toast.error("As novas senhas não coincidem!");
        return;
      }

      // O "Login Fantasma" para validar se a pessoa realmente sabe a senha antiga
      try {
        await api.post('/usuarios/logar', { usuario: user?.usuario, senha: senhaAtual });
      } catch (error) {
        toast.error("A senha atual está incorreta.");
        return; 
      }
    }

    // 2. MONTAGEM DO PAYLOAD
    // Se isChangingPassword for true, envia a nova. Se false, envia "" (vazio).
    const payload = {
      id: user?.id,
      nome: nome,
      usuario: email,
      senha: isChangingPassword ? novaSenha : "", 
    };

    // 3. ATUALIZAÇÃO REAL NO NESTJS
    const response = await api.put('/usuarios/atualizar', payload);
    
    // 4. ATUALIZA O ZUSTAND (Reflete a mudança de nome/email na hora)
    setLogin({ 
      id: response.data.id, 
      nome: response.data.nome, 
      usuario: response.data.usuario 
    }, token as string);

    toast.success("Perfil atualizado com sucesso!");
    
    // 5. LIMPEZA DOS CAMPOS
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');

  } catch (error: any) {
    toast.error(error.response?.data?.message || "Erro ao atualizar o perfil.");
  } finally {
    // O finally SEMPRE é executado, mesmo se houver um 'return' no meio dos if's
    setLoading(false);
  }
}

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-surface-text">Meu Perfil</h1>
        <p className="text-surface-muted">Gerencie as informações da sua conta.</p>
      </header>

      {/* MUDANÇA 1: Trocamos md:flex-row para lg:flex-row. 
        Agora, abaixo de 1024px, a foto fica em cima e o formulário embaixo, com bastante espaço.
      */}
      <div className="bg-surface-card p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-8 lg:gap-10">
        
        {/* LADO ESQUERDO: FOTO */}
        {/* MUDANÇA 2: Trocamos os breakpoints e removemos a borda direita no mobile */}
        <div className="flex flex-col items-center gap-4 lg:w-1/3 lg:border-r border-slate-100 lg:pr-8">
          
          {/* MUDANÇA 3: Removemos o p-4 para a imagem encostar nas bordas e diminuímos um pouco no mobile (w-40) */}
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center shrink-0">
            <img 
              src={perfilFoto} 
              alt="Logo River Food" 
              // MUDANÇA 4: Trocamos object-contain por object-cover para preencher todo o círculo
              className="w-full h-full object-cover"
            />
          </div>
          
          <p className="text-xs text-surface-muted text-center italic mt-2 max-w-[200px]">
            A alteração de foto estará disponível em uma atualização futura.
          </p>
        </div>

        {/* LADO DIREITO: FORMULÁRIO */}
        <form onSubmit={handleUpdateProfile} className="lg:w-2/3 flex flex-col gap-6">
          
          {/* MUDANÇA 5: O grid de Nome/Email também só divide colunas em telas grandes (lg:) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                <User size={18}/> Nome do Restaurante
              </label>
              <input 
                type="text" value={nome} onChange={e => setNome(e.target.value)} required
                className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-river-green transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                <Envelope size={18}/> E-mail
              </label>
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-river-green transition-colors"
              />
            </div>
          </div>

          <hr className="border-slate-100 my-2" />

          <div>
            <h3 className="font-bold text-surface-text mb-4 flex items-center gap-2">
              <Lock size={20} className="text-river-green"/> Alterar Senha <span className="text-xs font-normal text-surface-muted">(Opcional)</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <input 
                  type="password" placeholder="Senha Atual" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)}
                  className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-river-green transition-colors"
                />
              </div>
              
              {/* O mesmo aqui: os campos de nova senha empilham em telas menores */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <input 
                  type="password" placeholder="Nova Senha" value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                  className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-river-green transition-colors"
                />
                <input 
                  type="password" placeholder="Confirme a Nova Senha" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)}
                  className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-river-green transition-colors"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full mt-4 bg-river-dark hover:bg-river-green text-white font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
            <FloppyDisk size={22} weight="bold" />
          </button>
        </form>
      </div>
    </div>
  );
}