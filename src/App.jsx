// Importa o React e os hooks básicos de controle de dados (useState) e ações automáticas (useEffect)
import React, { useState, useEffect } from 'react';

// Importa os ícones gráficos da biblioteca lucide-react
import { 
  Users, 
  PhoneCall, 
  MessageSquare, 
  Clock, 
  FileText, 
  PlusCircle, 
  BarChart2, 
  Search,
  Eye,
  X,
  Tag,
  ListFilter,
  Sun,
  Moon,
  Lock,
  Mail,
  LogOut,
  Edit3
} from 'lucide-react';

export default function App() {
  // Guarda qual aba está aberta no momento
  const [activeTab, setActiveTab] = useState('tickets');
  
  // Guarda os dados do usuário que fez login (recupera do navegador se já existir)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userSession');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Campos para digitar o e-mail e senha no login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Controla se a tela está em modo escuro ou claro
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Guarda a lista de analistas da equipe vindos do banco de dados
  const [team, setTeam] = useState([]);
  
  // Guarda o status e o recado atual do próprio usuário logado
  const [myStatus, setMyStatus] = useState('Disponível');
  const [myActivity, setMyActivity] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false); // Controla se a caixinha de editar status está aberta

  // Lista de assuntos padrão para selecionar no chamado
  const [subjectsList, setSubjectsList] = useState([
    { id: 1, title: 'Rejeição de NF-e / NFC-e', module: 'Faturamento/NF-e' },
    { id: 2, title: 'Divergência em Saldo de Estoque', module: 'Estoque' },
    { id: 3, title: 'Erro na Emissão de Boletos', module: 'Financeiro' },
    { id: 4, title: 'Lente do Leitor / Comunicação PDV', module: 'PDV/Caixa' },
    { id: 5, title: 'Configuração de Certificado Digital A1/A3', module: 'Fiscal/SPED' },
  ]);

  // Guarda a lista de chamados vindos do banco PostgreSQL
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Guarda os dados digitados no formulário de novo chamado
  const [newTicket, setNewTicket] = useState({
    client: '',
    contact: '',
    module: 'Faturamento/NF-e',
    type: 'Chat',
    subject: 'Rejeição de NF-e / NFC-e',
    clientReport: '',
    technicalReport: ''
  });

  // Texto digitado no campo de busca de analistas
  const [filterText, setFilterText] = useState('');
  // Guarda o chamado que foi clicado para abrir na janela modal
  const [selectedTicketModal, setSelectedTicketModal] = useState(null);

  // Função para alternar o tema escuro/claro e salvar no navegador
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  // Busca a lista da equipe no servidor (API)
  const fetchTeam = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/team');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTeam(data);
        // Atualiza os campos com o status atual do usuário logado
        const myRecord = data.find(m => m.nome.toLowerCase() === (user?.nome || user?.NOME || '').toLowerCase());
        if (myRecord) {
          setMyStatus(myRecord.status);
          setMyActivity(myRecord.atividade);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar equipe:', err);
    }
  };

  // Envia a alteração do seu próprio status para o banco de dados
  const handleUpdateMyStatus = async (e) => {
    e.preventDefault();
    const myRecord = team.find(m => m.nome.toLowerCase() === (user?.nome || user?.NOME || '').toLowerCase());
    const memberId = myRecord ? myRecord.id : 1;

    try {
      const res = await fetch(`http://localhost:3001/api/team/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: myStatus, atividade: myActivity })
      });

      if (res.ok) {
        fetchTeam(); // Recarrega a lista
        setIsEditingStatus(false); // Fecha a caixinha de edição
      }
    } catch (err) {
      alert('Erro ao atualizar status.');
    }
  };

  // Envia o e-mail e senha para verificar o login na API
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('userSession', JSON.stringify(data.user)); // Salva a sessão no navegador
      } else {
        setLoginError(data.message || 'Erro ao realizar login.');
      }
    } catch (err) {
      setLoginError('Não foi possível conectar ao servidor API.');
    }
  };

  // Encerra a sessão do usuário
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('userSession');
  };

  // Busca todos os chamados salvos no PostgreSQL
  const fetchTickets = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/tickets');
      const data = await res.json();
      
      if (Array.isArray(data)) {
        // Formata os nomes dos campos para minúsculas
        const formatted = data.map(item => ({
          id: item.id || item.ID,
          client: item.cliente || item.CLIENTE,
          contact: item.contato || item.CONTATO,
          module: item.modulo || item.MODULO,
          type: item.canal || item.CANAL,
          subject: item.assunto || item.ASSUNTO,
          clientReport: item.relato_cliente || item.RELATO_CLIENTE || 'Sem descrição.',
          technicalReport: item.relato_tecnico || item.RELATO_TECNICO || 'Sem relato técnico.',
          status: item.status_chamado || item.STATUS_CHAMADO || 'Concluído',
          time: item.hora_atendimento || item.HORA_ATENDIMENTO || ''
        }));
        setTickets(formatted);
      }
    } catch (err) {
      console.error('Erro ao conectar na API:', err);
    } finally {
      setLoading(false);
    }
  };

  // Executa automaticamente a busca de chamados e equipe assim que entra no sistema
  useEffect(() => {
    fetchTickets();
    fetchTeam();
  }, [user]);

  // Salva um novo chamado no banco de dados ao clicar em "Finalizar e Gravar"
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.client.trim()) {
      alert('Por favor, informe o nome do Cliente!');
      return;
    }

    const selectedSubject = newTicket.subject || subjectsList[0]?.title || 'Atendimento Geral';
    const protocol = `PROT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const ticketData = {
      id: protocol,
      client: newTicket.client,
      contact: newTicket.contact || 'Não informado',
      module: newTicket.module,
      type: newTicket.type,
      subject: selectedSubject,
      clientReport: newTicket.clientReport || 'Sem descrição adicional.',
      technicalReport: newTicket.technicalReport || 'Sem relato técnico informado.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const res = await fetch('http://localhost:3001/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });

      if (res.ok) {
        alert('✅ Atendimento salvo com sucesso no PostgreSQL!');
        fetchTickets(); // Atualiza a tabela
        // Limpa os campos do formulário
        setNewTicket({ 
          client: '', 
          contact: '', 
          module: 'Faturamento/NF-e', 
          type: 'Chat', 
          subject: subjectsList[0]?.title || '', 
          clientReport: '', 
          technicalReport: '' 
        });
      }
    } catch (err) {
      alert('❌ Erro de conexão com a API.');
    }
  };

  // Define a cor de destaque da caixinha de acordo com o status selecionado
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Disponível':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Em Atendimento':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'Em Ligação':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30'; // Destaque em vermelho
      case 'Pausa Café':
      case 'Em Pausa':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Em Férias':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Expediente Encerrado':
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  // TELA 1: EXIBIDA QUANDO NÃO ESTÁ LOGADO (TELA DE LOGIN)
  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
        <div className={`w-full max-w-md p-8 rounded-2xl shadow-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white"><BarChart2 className="w-7 h-7" /></div>
            <div>
              <h1 className="font-bold text-xl leading-none">SupportDesk Web</h1>
              <span className="text-xs text-slate-400">Portal de Atendimento ERP</span>
            </div>
          </div>

          <h2 className="text-lg font-bold text-center mb-1">Acessar Conta</h2>
          <p className="text-xs text-slate-400 text-center mb-6">Informe suas credenciais para visualizar seus chamados.</p>

          {/* Exibe erro de login caso ocorra */}
          {loginError && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs text-center font-semibold">
              {loginError}
            </div>
          )}

          {/* Form de login */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">E-mail corporativo</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input type="email" required placeholder="marilia@kdt.com.br" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input type="password" required placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-sm">
              Entrar no Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  // TELA 2: EXIBIDA APÓS FAZER LOGIN (PAINEL PRINCIPAL)
  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Barra superior de navegação (Header) */}
      <header className="bg-slate-900 border-b border-slate-800 text-white shadow-md px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg"><BarChart2 className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="font-bold text-lg leading-none">SupportDesk Web</h1>
              <span className="text-xs text-slate-400">Gestão de Tickets & Presença</span>
            </div>
          </div>

          <nav className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <button onClick={() => setActiveTab('tickets')} className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${activeTab === 'tickets' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'}`}>
              <ListFilter className="w-3.5 h-3.5" /> Meus Atendimentos
            </button>
          </nav>
        </div>

        {/* Botão de tema e dados do usuário logado */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          <button onClick={toggleDarkMode} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors">
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-300" />}
          </button>

          <div className="flex items-center space-x-3 border-l border-slate-700 pl-4 sm:pl-6">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm text-white">MK</div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-none text-white">{user.nome || user.NOME}</p>
              <p className="text-xs text-slate-400 mt-1">{user.email || user.EMAIL}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors" title="Sair do Sistema">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo central da página */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {activeTab === 'tickets' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* PAINEL DA ESQUERDA: STATUS DA EQUIPE */}
            <section className={`rounded-xl shadow-sm border p-5 flex flex-col h-[750px] transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`font-bold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}><Users className="w-5 h-5 text-indigo-500" /> Status da Equipe</h2>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{team.filter(t => t.status === 'Disponível').length} livres</span>
              </div>

              {/* Caixinha para você mudar seu próprio status */}
              <div className={`p-3 rounded-lg border mb-4 transition-colors ${darkMode ? 'bg-indigo-950/30 border-indigo-900/50' : 'bg-indigo-50/60 border-indigo-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Seu Status Atual</span>
                  <button onClick={() => setIsEditingStatus(!isEditingStatus)} className="text-[11px] text-indigo-400 hover:underline font-semibold">
                    {isEditingStatus ? 'Cancelar' : 'Alterar'}
                  </button>
                </div>

                {isEditingStatus ? (
                  <form onSubmit={handleUpdateMyStatus} className="space-y-2">
                    {/* Opções de seleção de status */}
                    <select value={myStatus} onChange={(e) => setMyStatus(e.target.value)} className={`w-full px-2 py-1 border rounded text-xs focus:outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
                      <option value="Disponível">🟢 Disponível</option>
                      <option value="Em Atendimento">🔵 Em Atendimento</option>
                      <option value="Em Ligação">🔴 Em Ligação</option>
                      <option value="Pausa Café">☕ Pausa Café</option>
                      <option value="Em Pausa">🟡 Em Pausa / Almoço</option>
                      <option value="Em Férias">🌴 Em Férias</option>
                      <option value="Expediente Encerrado">⚫ Expediente Encerrado</option>
                    </select>

                    {/* Campo para escrever recado rápido */}
                    <input type="text" placeholder="O que você está fazendo? (Recado curto)" value={myActivity} onChange={(e) => setMyActivity(e.target.value)} maxLength={60} className={`w-full px-2 py-1 border rounded text-xs focus:outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`} />

                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 rounded text-xs transition-colors">
                      Salvar Status
                    </button>
                  </form>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusBadge(myStatus)}`}>{myStatus}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 truncate">{myActivity || 'Sem recado definido.'}</p>
                  </div>
                )}
              </div>

              {/* Campo de pesquisa de analistas */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input type="text" placeholder="Buscar analista..." value={filterText} onChange={(e) => setFilterText(e.target.value)} className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${darkMode ? 'bg-slate-800/60 border-slate-700 text-slate-200 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
              </div>

              {/* Lista dos membros exibida na tela */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {team.filter(m => m.nome.toLowerCase().includes(filterText.toLowerCase())).map((member) => (
                  <div key={member.id} className={`p-3 rounded-lg border transition-colors flex items-start space-x-3 ${darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center shrink-0 ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-600'}`}>{member.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <p className={`text-sm font-semibold truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{member.nome}</p>
                        <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold shrink-0 ${getStatusBadge(member.status)}`}>{member.status}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{member.atividade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* LADO DIREITO: FORMULÁRIO E TABELA DE CHAMADOS */}
            <section className="lg:col-span-2 space-y-6">
              
              {/* Formulário para registrar novo chamado */}
              <div className={`rounded-xl shadow-sm border p-5 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className={`font-bold flex items-center gap-2 mb-4 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}><PlusCircle className="w-5 h-5 text-indigo-500" /> Registrar Novo Atendimento</h2>
                
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Empresa / Cliente *</label>
                      <input type="text" required placeholder="Ex: Mercado Central LTDA" value={newTicket.client} onChange={(e) => setNewTicket({...newTicket, client: e.target.value})} className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`} />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Contato / Solicitante</label>
                      <input type="text" placeholder="Ex: Carlos Oliveira" value={newTicket.contact} onChange={(e) => setNewTicket({...newTicket, contact: e.target.value})} className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Módulo ERP *</label>
                      <select value={newTicket.module} onChange={(e) => setNewTicket({...newTicket, module: e.target.value})} className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
                        <option value="Faturamento/NF-e">Faturamento / NF-e</option>
                        <option value="Estoque">Estoque / Inventário</option>
                        <option value="Financeiro">Financeiro / Contas</option>
                        <option value="PDV/Caixa">PDV / Frente de Loja</option>
                        <option value="Fiscal/SPED">Fiscal / SPED</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Canal de Atendimento</label>
                      <div className="flex gap-2 pt-0.5">
                        <button type="button" onClick={() => setNewTicket({...newTicket, type: 'Chat'})} className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border ${newTicket.type === 'Chat' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}><MessageSquare className="w-3.5 h-3.5" /> Chat</button>
                        <button type="button" onClick={() => setNewTicket({...newTicket, type: 'Ligação'})} className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border ${newTicket.type === 'Ligação' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}><PhoneCall className="w-3.5 h-3.5" /> Ligação</button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Assunto / Ocorrência Pré-definida *</label>
                    <select value={newTicket.subject} onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})} className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
                      <option value="">-- Selecione um Assunto Padrão --</option>
                      {subjectsList.map((item) => (
                        <option key={item.id} value={item.title}>[{item.module}] — {item.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Relato do Cliente (Ocorrência)</label>
                      <textarea rows={3} placeholder="O que o cliente alegou ou relatou..." value={newTicket.clientReport} onChange={(e) => setNewTicket({...newTicket, clientReport: e.target.value})} className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`} />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Relato Técnico / Solução</label>
                      <textarea rows={3} placeholder="Procedimento técnico executado, rotinas ou tabelas alteradas..." value={newTicket.technicalReport} onChange={(e) => setNewTicket({...newTicket, technicalReport: e.target.value})} className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`} />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"><FileText className="w-4 h-4" /> Finalizar e Gravar</button>
                  </div>
                </form>
              </div>

              {/* Tabela de chamados do banco */}
              <div className={`rounded-xl shadow-sm border p-5 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}><Clock className="w-5 h-5 text-indigo-500" /> Atendimentos Registrados (PostgreSQL)</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b font-medium ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-400'}`}>
                        <th className="pb-3">Protocolo</th>
                        <th className="pb-3">Cliente</th>
                        <th className="pb-3">Módulo</th>
                        <th className="pb-3">Canal</th>
                        <th className="pb-3">Assunto</th>
                        <th className="pb-3 text-center">Detalhes</th>
                        <th className="pb-3 text-right">Hora</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                      {tickets.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-slate-500">Nenhum chamado registrado no PostgreSQL até o momento.</td>
                        </tr>
                      ) : (
                        tickets.map((t) => (
                          <tr key={t.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                            <td className="py-3 font-mono font-semibold text-indigo-400">{t.id}</td>
                            <td className={`py-3 font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{t.client}</td>
                            <td className="py-3 text-slate-400">{t.module}</td>
                            <td className="py-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${t.type === 'Chat' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{t.type === 'Chat' ? <MessageSquare className="w-3 h-3" /> : <PhoneCall className="w-3 h-3" />}{t.type}</span></td>
                            <td className="py-3 text-slate-400 max-w-[180px] truncate">{t.subject}</td>
                            <td className="py-3 text-center">
                              {/* Botão para abrir o modal de detalhes */}
                              <button onClick={() => setSelectedTicketModal(t)} className="p-1 hover:bg-indigo-500/20 text-indigo-400 rounded transition-colors" title="Ver Relato Técnico Completo">
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                            <td className="py-3 text-right text-slate-500">{t.time}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </main>

      {/* Janela Modal que abre ao clicar no botão "olho" para ver detalhes */}
      {selectedTicketModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl shadow-xl max-w-2xl w-full p-6 relative border ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            <button onClick={() => setSelectedTicketModal(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-sm font-bold bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-md">{selectedTicketModal.id}</span>
              <span className="text-xs text-slate-400">{selectedTicketModal.time}</span>
            </div>

            <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedTicketModal.subject}</h3>
            <p className="text-sm text-slate-400 mb-6">{selectedTicketModal.client} — Contato: <span className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{selectedTicketModal.contact}</span> ({selectedTicketModal.module})</p>

            <div className="space-y-4 text-sm">
              <div className={`p-3.5 rounded-lg border ${darkMode ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ocorrência (Relato do Cliente)</h4>
                <p className={`whitespace-pre-wrap ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{selectedTicketModal.clientReport}</p>
              </div>

              <div className={`p-3.5 rounded-lg border ${darkMode ? 'bg-indigo-950/40 border-indigo-900/50' : 'bg-indigo-50/50 border-indigo-100'}`}>
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Relato Técnico / Solução</h4>
                <p className={`font-mono text-xs leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-indigo-200' : 'text-slate-800'}`}>{selectedTicketModal.technicalReport}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedTicketModal(null)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}