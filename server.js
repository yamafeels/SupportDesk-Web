import express from 'express';
import Firebird from 'node-firebird';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const options = {
    host: '127.0.0.1',
    port: 3050,
    database: 'C:/banco_suporte_web/SUPORTE.FDB',
    user: 'SYSDBA',
    password: 'masterkey',
    lowercase_keys: false,
    role: null,
    pageSize: 4096
};

// Rota de Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    Firebird.attach(options, (err, db) => {
        if (err) return res.status(500).json({ error: err.message });

        const sql = 'SELECT ID, NOME, EMAIL FROM SUP_USUARIOS WHERE EMAIL = ? AND SENHA = ?';
        db.query(sql, [email, password], (err, result) => {
            db.detach();
            if (err) return res.status(500).json({ error: err.message });

            if (result.length > 0) {
                res.json({ success: true, user: result[0] });
            } else {
                res.status(401).json({ success: false, message: 'E-mail ou senha incorretos!' });
            }
        });
    });
});

// Rota para buscar os chamados
app.get('/api/tickets', (req, res) => {
    Firebird.attach(options, (err, db) => {
        if (err) return res.status(500).json({ error: err.message });

        db.query('SELECT * FROM SUP_TICKETS ORDER BY DATA_ATENDIMENTO DESC, HORA_ATENDIMENTO DESC', (err, result) => {
            db.detach();
            if (err) return res.status(500).json({ error: err.message });
            res.json(result);
        });
    });
});

// Rota para salvar novo chamado
app.post('/api/tickets', (req, res) => {
    const { id, client, contact, module, type, subject, clientReport, technicalReport, time } = req.body;

    Firebird.attach(options, (err, db) => {
        if (err) return res.status(500).json({ error: err.message });

        const sql = `INSERT INTO SUP_TICKETS (ID, CLIENTE, CONTATO, MODULO, CANAL, ASSUNTO, RELATO_CLIENTE, RELATO_TECNICO, HORA_ATENDIMENTO) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(sql, [id, client, contact, module, type, subject, clientReport, technicalReport, time], (err, result) => {
            db.detach();
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Chamado salvo no Firebird com sucesso!' });
        });
    });
});

app.listen(3001, () => {
    console.log('🚀 Servidor Back-end rodando na porta 3001!');
});