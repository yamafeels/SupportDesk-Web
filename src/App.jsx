import React, { useState, useEffect } from 'react';
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
  Plus,
  Sun,
  Moon,
  Lock,
  Mail,
  LogOut
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('tickets');
  
  // Estado de Autenticação / Login
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userSession');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [team, setTeam] = useState([
    { id: 1, name: 'Marilia Kuriyama', status: 'Disponível', activity: 'Livre para atendimento', avatar: 'MK' },
    { id: 2, name: 'Marcos Silva', status: 'Atendimento', activity: 'Chamado #1042 - Empresa Alfa', avatar: 'MS' },
    { id: 3, name: 'Ana Souza', status: 'Pausa', activity: 'Almoço (Retorna às 14:00)', avatar: 'AS' },
    { id: 4, name: 'Carlos Lima', status: 'Offline', activity: 'Desconectado', avatar: 'CL' },
  ]);

  const [subjectsList, setSubjectsList] = useState([
    { id: 1, title: 'Rejeição de NF-e / NFC-e', module: 'Faturamento/NF-e' },
    { id: 2, title: 'Divergência em Saldo de Estoque', module: 'Estoque' },
    { id: 3, title: 'Erro na Emissão de Boletos', module: 'Financeiro' },
    { id: 4, title: 'Lente do Leitor / Comunicação PDV', module: 'PDV/Caixa' },
    { id: 5, title: 'Configuração de Certificado Digital A1/A3', module: 'Fiscal/SPED' },
  ]);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newTicket, setNewTicket] = useState({
    client: '',
    contact: '',
    module: 'Faturamento/NF-e',
    type: 'Chat',
    subject: '',
    clientReport: '',
    technicalReport: ''
  });

  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [newSubjectModule, setNewSubjectModule] = useState('Faturamento/NF-e');
  const [filterText, setFilterText] = useState('');
  const [selectedTicketModal, setSelectedTicketModal] = useState(null);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

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
        localStorage.setItem('userSession', JSON.stringify(data.user));
      } else {
        setLoginError(data.message || 'Erro ao realizar login.');
      }
    } catch (err) {
      setLoginError('Não foi possível conectar ao servidor API.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('userSession');
  };

  const fetchTickets = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/tickets');
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const formatted = data.map(item => ({
          id: item.ID,
          client: item.CLIENTE,
          contact: item.CONTATO,
          module: item.MODULO,
          type: item.CANAL,
          subject: item.ASSUNTO,
          clientReport: item.RELATO_CLIENTE || 'Sem descrição.',
          technicalReport: item.RELATO_TECNICO || 'Sem relato técnico.',
          status: item.STATUS_CHAMADO || 'Concluído',
          time: item.HORA_ATENDIMENTO || ''
        }));
        setTickets(formatted);
      }
    } catch (err) {
      console.error('Erro ao conectar na API Firebird:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.client || !newTicket.subject) return;

    const protocol = `PROT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticketData = {
      id: protocol,
      client: newTicket.client,
      contact: newTicket.contact || 'Não informado',
      module: newTicket.module,
      type: newTicket.type,
      subject: newTicket.subject,
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
        fetchTickets();
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
      console.error('Erro ao salvar no Firebird:', err);
    }
  };

  // RENDERIZAÇÃO DA TELA DE LOGIN (Caso não esteja logado)
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

          {loginError && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs text-center font-semibold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">E-mail corporativo</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="email" 
                  required 
                  placeholder="usuario@kdt.inf.br" 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'}`} 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••" 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'}`} 
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-sm">
              Entrar no Sistema
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Credenciais de teste: <span className="font-mono text-indigo-400">akira@kdt.inf.br</span> / <span className="font-mono text-indigo-400">123456</span>
          </div>
        </div>
      </div>
    );
  }

  // RENDERIZAÇÃO DO SISTEMA (Caso já esteja logado)
  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* Header */}
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
            <button onClick={() => setActiveTab('subjects')} className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${activeTab === 'subjects' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'}`}>
              <Tag className="w-3.5 h-3.5" /> Gerenciar Assuntos ({subjectsList.length})
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-4 sm:space-x-6">
          <button onClick={toggleDarkMode} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors">
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-300" />}
          </button>

          <div className="flex items-center space-x-3 border-l border-slate-700 pl-4 sm:pl-6">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm text-white">MK</div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-none text-white">{user.NOME}</p>
              <p className="text-xs text-slate-400 mt-1">{user.EMAIL}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors" title="Sair do Sistema">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {activeTab === 'tickets' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status da Equipe */}
            <section className={`rounded-xl shadow-sm border p-5 flex flex-col h-[750px] transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`font-bold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}><Users className="w-5 h-5 text-indigo-500" /> Status da Equipe</h2>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{team.filter(t => t.status === 'Disponível').length} livres</span>
              </div>

              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input type="text" placeholder="Buscar analista..." value={filterText} onChange={(e) => setFilterText(e.target.value)} className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${darkMode ? 'bg-slate-800/60 border-slate-700 text-slate-200 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {team.filter(m => m.name.toLowerCase().includes(filterText.toLowerCase())).map((member) => (
                  <div key={member.id} className={`p-3 rounded-lg border transition-colors flex items-start space-x-3 ${darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center shrink-0 ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-600'}`}>{member.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{member.name}</p>
                      <p className="text-xs text-slate-400 mt-1 truncate">{member.activity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Registro e Histórico */}
            <section className="lg:col-span-2 space-y-6">
              {/* Formulário */}
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
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"><FileText className="w-4 h-4" /> Finalizar e Gravar no Firebird</button>
                  </div>
                </form>
              </div>

              {/* Tabela de Atendimentos */}
              <div className={`rounded-xl shadow-sm border p-5 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}><Clock className="w-5 h-5 text-indigo-500" /> Atendimentos Registrados no Banco Firebird</h2>
                
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
                      {tickets.map((t) => (
                        <tr key={t.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                          <td className="py-3 font-mono font-semibold text-indigo-400">{t.id}</td>
                          <td className={`py-3 font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{t.client}</td>
                          <td className="py-3 text-slate-400">{t.module}</td>
                          <td className="py-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${t.type === 'Chat' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{t.type === 'Chat' ? <MessageSquare className="w-3 h-3" /> : <PhoneCall className="w-3 h-3" />}{t.type}</span></td>
                          <td className="py-3 text-slate-400 max-w-[180px] truncate">{t.subject}</td>
                          <td className="py-3 text-center">
                            <button onClick={() => setSelectedTicketModal(t)} className="p-1 hover:bg-indigo-500/20 text-indigo-400 rounded transition-colors" title="Ver Relato Técnico Completo">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="py-3 text-right text-slate-500">{t.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}