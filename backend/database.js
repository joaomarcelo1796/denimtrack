const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Define o caminho do arquivo do banco de dados
const dbPath = path.resolve(__dirname, "denimtrack.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados SQLite:", err.message);
    } else {
        console.log("Banco SQLite conectado!");
    }
});

// Criação das tabelas necessárias
db.serialize(() => {
    // 1. Tabela de Usuários
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        nivel TEXT NOT NULL
    )`, (err) => {
        if (err) console.error("Erro ao criar tabela de usuários:", err.message);
    });

    // 2. Tabela de Processos (Atualizada)
    db.run(`CREATE TABLE IF NOT EXISTS processos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente TEXT NOT NULL,
        quantidade INTEGER NOT NULL,
        tipo_lavagem TEXT NOT NULL,
        prazo_entrega TEXT NOT NULL,
        status TEXT NOT NULL,
        etapa_atual INTEGER NOT NULL,
        chave_servico TEXT,
        produtos TEXT
    )`, (err) => {
        if (err) console.error("Erro ao criar tabela de processos:", err.message);
    });
});

module.exports = db;