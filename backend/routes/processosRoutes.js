const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const db = require("../database");

// 1. Rota para listar todos os processos
router.get("/", (req, res) => {
    db.all("SELECT * FROM processos", [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

// 2. Rota para cadastrar um novo processo com Chave Automática e Produtos
router.post("/", (req, res) => {
    const { cliente, quantidade, tipo_lavagem, prazo_entrega, produtos } = req.body;
    
    // Cria um código aleatório exclusivo de 4 dígitos hexadecimais em letras maiúsculas
    const chave_servico = "SRV-" + crypto.randomBytes(2).toString("hex").toUpperCase();

    db.run(
        `INSERT INTO processos (cliente, quantidade, tipo_lavagem, prazo_entrega, status, etapa_atual, chave_servico, produtos) 
         VALUES (?, ?, ?, ?, 'Em Andamento', 1, ?, ?)`,
        [cliente, quantidade, tipo_lavagem, prazo_entrega, chave_servico, produtos],
        function (err) {
            if (err) return res.status(500).json({ erro: err.message });
            res.status(201).json({ id: this.lastID, chave_servico, mensagem: "Processo criado com sucesso!" });
        }
    );
});

// 3. Rota para avançar a etapa operacional (+25% de progresso)
router.put("/:id", (req, res) => {
    const id = req.params.id;
    db.get("SELECT etapa_atual FROM processos WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (!row) return res.status(404).json({ erro: "Processo não encontrado" });
        
        let novaEtapa = row.etapa_atual + 1;
        let novoStatus = "Em Andamento";
        
        if (novaEtapa >= 4) {
            novaEtapa = 4;
            novoStatus = "Concluído";
        }

        db.run(
            "UPDATE processos SET etapa_atual = ?, status = ? WHERE id = ?",
            [novaEtapa, novoStatus, id],
            function (err) {
                if (err) return res.status(500).json({ erro: err.message });
                res.json({ mensagem: "Etapa operacional avançada com sucesso!" });
            }
        );
    });
});

// 4. Rota para deletar permanentemente um processo
router.delete("/:id", (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM processos WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: "Processo removido com sucesso." });
    });
});

// 5. Rota para edição manual de status por texto livre (Exclusivo do Admin)
router.put("/:id/editar", (req, res) => {
    const id = req.params.id;
    const { status } = req.body;

    db.run(
        `UPDATE processos SET status = ? WHERE id = ?`,
        [status, id],
        function (err) {
            if (err) {
                return res.status(500).json({ erro: "Erro ao modificar o status no banco." });
            }
            if (this.changes === 0) {
                return res.status(404).json({ erro: "Processo não localizado." });
            }
            res.json({ mensagem: "Status do processo atualizado com sucesso!" });
        }
    );
});

// === ROTA PÚBLICA: Rastrear serviço pelo código (Sem necessidade de login) ===
router.get("/rastreio/:chave", (req, res) => {
    // O .toUpperCase() garante que, mesmo que o cliente digite minúsculo, o banco ache a chave
    const chave = req.params.chave.toUpperCase(); 

    // Note que NÃO estamos puxando o nome do cliente por segurança, apenas os dados do serviço
    db.get(
        "SELECT chave_servico, produtos, status, etapa_atual FROM processos WHERE chave_servico = ?",
        [chave],
        (err, row) => {
            if (err) return res.status(500).json({ erro: "Erro ao buscar o serviço no banco." });
            if (!row) return res.status(404).json({ erro: "Código não encontrado. Verifique se digitou corretamente." });
            
            res.json(row);
        }
    );
});
module.exports = router;