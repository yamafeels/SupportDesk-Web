// Importa o framework Express para criar a API e gerenciar as rotas do servidor
import express from 'express';

// Importa a biblioteca 'pg' para realizar a conexão do Node.js com a base de dados PostgreSQL
import pg from 'pg';

// Importa o middleware CORS para permitir que o React (Front-end) acesse o servidor (Back-end)
import cors from 'cors';

// Extrai a classe Pool da biblioteca do PostgreSQL (gerencia conexões simultâneas)
const { Pool } = pg;

// Inicializa a aplicação Express
const app = express();

// Habilita o CORS no servidor para evitar bloqueios de requisição no navegador
app.use(cors());

// Configura o servidor para interpretar dados enviados no formato JSON no corpo (body) das requisições
app.use(express.json());

// Configuração dos parâmetros de conexão com a base de dados PostgreSQL
const pool = new Pool({
    user: 'postgres',           // Nome do utilizador padrão do PostgreSQL
    host: 'localhost',          // Endereço do servidor onde a base de dados está instalada (máquina local)
    database: 'banco_suporte_web', // Nome da base de dados criada no PostgreSQL
    password: 'masterkey',      // Senha definida durante a instalação do PostgreSQL
    port: 5432,                 // Porta de rede padrão do serviço PostgreSQL
});

// ==========================================
// ROTA 1: LOGIN DE USUÁRIOS (POST /api/login)
// ==========================================
app.post('/api/login', async (req, res) => {
    // Extrai o e-mail e a senha enviados pelo formulário no React
    const { email, password } = req.body;

    try {
        // Executa a consulta SQL no PostgreSQL procurando por um utilizador com o e-mail e a senha informados
        const result = await pool.query(
            'SELECT id, nome, email FROM sup_usuarios WHERE email = $1 AND senha = $2',
            [email, password]
        );

        // Se encontrar pelo menos uma linha correspondente, o login é aprovado
        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            // Caso contrário, retorna o código de erro HTTP 401 (Não Autorizado)
            res.status(401).json({ success: false, message: 'E-mail ou senha incorretos!' });
        }
    } catch (err) {
        // Exibe no console do VS Code se houver falha de banco de dados e retorna erro HTTP 500
        console.error('Erro na consulta do login:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ====================================================
// ROTA 2: LISTAR TODOS OS CHAMADOS (GET /api/tickets)
// ====================================================
// Rota para buscar os membros da equipe e seus status
app.get('/api/team', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sup_equipe ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar equipe:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Rota para o usuário atualizar o próprio status e atividade
app.put('/api/team/:id', async (req, res) => {
    const { id } = req.params;
    const { status, atividade } = req.body;

    try {
        await pool.query(
            'UPDATE sup_equipe SET status = $1, atividade = $2 WHERE id = $3',
            [status, atividade, id]
        );
        res.json({ message: 'Status atualizado com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar status:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ===================================================
// ROTA 3: SALVAR NOVO CHAMADO (POST /api/tickets)
// ===================================================
app.post('/api/tickets', async (req, res) => {
    // Desestrutura todos os campos do chamado enviados pelo formulário do React
    const { id, client, contact, module, type, subject, clientReport, technicalReport, time } = req.body;

    try {
        // Instrução SQL para inserir um novo registro na tabela 'sup_tickets'
        const sql = `
            INSERT INTO sup_tickets (id, cliente, contato, modulo, canal, assunto, relato_cliente, relato_tecnico, hora_atendimento) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        // Envia os parâmetros na ordem correspondente para prevenir ataques de SQL Injection
        await pool.query(sql, [id, client, contact, module, type, subject, clientReport, technicalReport, time]);
        
        console.log("✅ Chamado gravado no PostgreSQL!");
        // Retorna resposta de sucesso para o Front-end
        res.json({ message: 'Chamado salvo no PostgreSQL com sucesso!' });
    } catch (err) {
        console.error('Erro ao salvar ticket no PostgreSQL:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Inicia o servidor Node.js na porta 3001 e exibe a mensagem de confirmação no terminal
app.listen(3001, () => {
    console.log('🚀 Servidor Back-end rodando na porta 3001 e conectado ao PostgreSQL!');
});