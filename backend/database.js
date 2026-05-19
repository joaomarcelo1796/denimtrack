const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./denimtrack.db", (err) => {
    if (err) {
        console.log("Erro ao conectar banco:", err.message);
    } else {
        console.log("Banco SQLite conectado!");
    }
});

db.serialize(() => {

    // Tabela de usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            nivel TEXT NOT NULL
        )
    `);

    // Tabela de processos
    db.run(`
        CREATE TABLE IF NOT EXISTS processos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente TEXT NOT NULL,
            quantidade INTEGER NOT NULL,
            tipo_lavagem TEXT NOT NULL,
            data_cadastro TEXT,
            prazo_entrega TEXT,
            etapa_atual INTEGER DEFAULT 0,
            status TEXT DEFAULT 'Em andamento'
        )
    `);

});

module.exports = db;