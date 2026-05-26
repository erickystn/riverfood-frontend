// src/pages/admin/Fleet.tsx
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Motorcycle, Plus, UserPlus, IdentificationCard, LockKey,
  EnvelopeSimple, PencilSimple, Trash
} from '@phosphor-icons/react';

interface Entregador {
  id: number;
  nome: string;
  usuario: string;
  foto?: string;
}

export function Fleet() {
  const [entregadores, setEntregadores] = useState<Entregador[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Controle de Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Controle de Edição vs Criação
  const [entregadorEmEdicao, setEntregadorEmEdicao] = useState<Entregador | null>(null);
  
  // Form State
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  useEffect(() => {
    fetchEntregadores();
  }, []);

  async function fetchEntregadores() {
    try {
      setLoading(true);
      const response = await api.get('/usuarios/meus-entregadores');
      setEntregadores(response.data);
    } catch (error) {
      toast.error("Erro ao carregar sua frota.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreateModal() {
    setEntregadorEmEdicao(null);
    setNome(''); setUsuario(''); setSenha('');
    setIsModalOpen(true);
  }

  function handleOpenEditModal(entregador: Entregador) {
    setEntregadorEmEdicao(entregador);
    setNome(entregador.nome);
    setUsuario(entregador.usuario);
    setSenha(''); // Senha vazia por padrão na edição
    setIsModalOpen(true);
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    
    if (!nome || !usuario) {
      toast.warning("Nome e login são obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (entregadorEmEdicao) {
        // Fluxo de EDIÇÃO
        const payload = senha ? { nome, usuario, senha } : { nome, usuario };
        await api.patch(`/usuarios/entregador/${entregadorEmEdicao.id}`, payload);
        toast.success("Dados do motoboy atualizados!");
      } else {
        // Fluxo de CRIAÇÃO
        if (!senha) { toast.warning("A senha é obrigatória para novos cadastros."); return; }
        await api.post('/usuarios/entregador', { nome, usuario, senha, foto: '' });
        toast.success("Motoboy cadastrado com sucesso!");
      }
      
      setIsModalOpen(false);
      fetchEntregadores();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao salvar dados.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteEntregador(id: number) {
    if (!window.confirm("Deseja realmente remover este entregador da sua frota?")) return;
    
    try {
      await api.delete(`/usuarios/entregador/${id}`);
      toast.success("Motoboy removido da frota.");
      fetchEntregadores();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao remover entregador.");
    }
  }

  return (
    <div className="space-y-8 animate-fade-in relative max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Motorcycle size={32} className="text-river-green" weight="fill" />
            Minha Frota
          </h1>
          <p className="text-slate-500 font-medium mt-1">Gerencie os acessos e dados dos seus motoboys.</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-river-dark text-white font-black uppercase tracking-widest text-sm px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} weight="bold" />
          Novo Motoboy
        </button>
      </header>

      {/* LISTAGEM DOS MOTOBOYS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-river-green border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold">Buscando equipe...</p>
          </div>
        ) : entregadores.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Motorcycle size={48} weight="thin" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Nenhum motoboy cadastrado</h3>
            <p className="text-slate-500 max-w-xs mx-auto">Adicione sua equipe de entrega para poder despachar os pedidos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {entregadores.map(entregador => (
              <div key={entregador.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all group relative overflow-hidden">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xl shrink-0">
                  {entregador.nome.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden flex-1">
                  <h4 className="font-bold text-slate-800 truncate pr-16">{entregador.nome}</h4>
                  <p className="text-xs font-medium text-slate-500 truncate">{entregador.usuario}</p>
                </div>
                
                {/* BOTÕES DE AÇÃO (Escondidos por padrão, aparecem no Hover) */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 pl-4">
                  <button 
                    onClick={() => handleOpenEditModal(entregador)}
                    className="p-2.5 bg-white text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl shadow-sm border border-slate-200 transition-colors"
                    title="Editar Motoboy"
                  >
                    <PencilSimple size={16} weight="bold" />
                  </button>
                  <button 
                    onClick={() => handleDeleteEntregador(entregador.id)}
                    className="p-2.5 bg-white text-score-E hover:bg-score-E hover:text-white rounded-xl shadow-sm border border-slate-200 transition-colors"
                    title="Excluir Motoboy"
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-6 mx-auto">
              <UserPlus size={32} weight="fill" />
            </div>
            <h3 className="text-xl font-black text-center text-slate-800 mb-2">
              {entregadorEmEdicao ? 'Editar Motoboy' : 'Cadastrar Motoboy'}
            </h3>
            <p className="text-center text-sm text-slate-500 mb-6">
              {entregadorEmEdicao ? 'Atualize os dados de acesso da sua equipe.' : 'Crie um login para o entregador acessar o painel.'}
            </p>
            
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><IdentificationCard size={16} /> Nome Completo</label>
                <input 
                  type="text" 
                  value={nome} onChange={e => setNome(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold text-slate-700 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><EnvelopeSimple size={16} /> Login de Acesso</label>
                <input 
                  type="text" 
                  value={usuario} onChange={e => setUsuario(e.target.value)}
                  placeholder="Ex: joao@meurestaurante.com"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold text-slate-700 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><LockKey size={16} /> {entregadorEmEdicao ? 'Nova Senha (Opcional)' : 'Senha Temporária'}</label>
                <input 
                  type="password" 
                  value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder={entregadorEmEdicao ? "Deixe em branco para manter a atual" : "********"}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold text-slate-700 transition-all placeholder:font-normal"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Dados'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}