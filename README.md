# 🎧 SupportDesk Web — Portal de Gestão de Tickets & Presença ERP

O **SupportDesk Web** é um sistema full-stack desenvolvido para otimizar o fluxo de trabalho de equipes de suporte técnico e atendimento a sistemas ERP. A aplicação permite o registro de chamados, controle do histórico de ocorrências e o acompanhamento do status e atividade dos analistas em tempo real.

---

## 🚀 Funcionalidades

- 🔒 **Autenticação de Usuários:** Login seguro com validação de credenciais no banco de dados.
- 📞 **Gestão de Chamados (Tickets):**
  - Registro detalhado de atendimentos (Empresa/Cliente, Contato, Módulo ERP, Canal de Atendimento, Ocorrência e Solução Técnica).
  - Geração automática de protocolo único de atendimento.
  - Visualização rápida e expansão de detalhes técnicos em janela modal.
- 👥 **Painel de Presença & Status da Equipe:**
  - Atualização dinâmica do status individual de cada analista (*Disponível*, *Em Atendimento*, *Em Ligação*, *Pausa Café*, *Em Pausa*, *Em Férias*, *Expediente Encerrado*).
  - Campo para recado/atividade curta personalizada em tempo real.
  - Busca e filtragem rápida de analistas por nome.
- 🌙 **Interface Moderna & Responsiva:**
  - Suporte completo a **Dark Mode** (Modo Escuro) e Modo Claro, com persistência de preferência no navegador.

---

## 🛠️ Tecnologias Utilizadas

### **Front-end**
- **React.js** (Componentização, Hooks e gerenciamento de estado)
- **Tailwind CSS** (Estilização responsiva e moderna)
- **Lucide React** (Pacote de ícones de interface)

### **Back-end**
- **Node.js** com **Express** (API RESTful)
- **CORS** (Segurança e integração de origens)

### **Banco de Dados**
- **PostgreSQL** (Persistência relacional para usuários, tickets e equipe)

---

## 🗄️ Estrutura do Banco de Dados (PostgreSQL)

O banco de dados `banco_suporte_web` contém as seguintes tabelas principais:

- `sup_usuarios`: Dados dos analistas para autenticação.
- `sup_tickets`: Registros dos chamados finalizados e pendentes.
- `sup_equipe`: Status e atividades da equipe em tempo real.

---

## 💻 Como Rodar o Projeto na Sua Máquina

### **Pré-requisitos**
- Node.js instalado (v18+)
- PostgreSQL rodando localmente (Porta `5432`)

### **1. Configurar o Banco de Dados**
Crie um banco de dados no PostgreSQL chamado `banco_suporte_web` e execute as tabelas `sup_usuarios`, `sup_tickets` e `sup_equipe`.

### **2. Configurar e Iniciar o Back-end**
1. Abra a pasta do projeto no terminal.
2. Certifique-se de instalar as dependências:
   ```bash
   npm install express pg cors

### **3. Inicie a API Node.js:**
1. node server.js
   ```bash
   A API rodará na porta http://localhost:3001

### **4. Iniciar o Front-end (React)**

1. Em um segundo terminal, rode o comando abaixo para iniciar o projeto:
   ```bash
   npm run dev

2. Abra o link gerado no navegador (geralmente http://localhost:5173).
  
Certifique-se de instalar as dependências se ainda não tiver instalado:
  ```bash
npm install express pg cors

