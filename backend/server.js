const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
app.use(cors());
app.use(express.json());

// Importação das rotas modulares
const processosRoutes = require("./routes/processosRoutes");
const authRoutes = require("./routes/authRoutes");

// Atribuição dos prefixos de rotas
app.use("/processos", processosRoutes);
app.use("/auth", authRoutes);

// Rota global do Administrador: Listar utilizadores cadastrados
app.get("/usuarios", (req, res) => {
    db.all(`SELECT id, nome, email, nivel FROM usuarios`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: "Erro ao buscar a lista de usuários." });
        }
        res.json(rows);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando perfeitamente na porta ${PORT}`);
});