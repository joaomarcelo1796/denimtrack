const express = require("express");
const db = require("../database");

const router = express.Router();


// CADASTRAR PROCESSO
router.post("/", (req, res) => {

    const {
        cliente,
        quantidade,
        tipo_lavagem,
        prazo_entrega
    } = req.body;

    const data_cadastro = new Date().toLocaleDateString();

    db.run(
        `
        INSERT INTO processos
        (
            cliente,
            quantidade,
            tipo_lavagem,
            data_cadastro,
            prazo_entrega
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            cliente,
            quantidade,
            tipo_lavagem,
            data_cadastro,
            prazo_entrega
        ],

        function(err) {

            if (err) {

                return res.status(400).json({
                    erro: "Erro ao cadastrar processo"
                });

            }

            res.json({
                mensagem: "Processo cadastrado com sucesso!"
            });

        }
    );

});

// LISTAR PROCESSOS
router.get("/", (req, res) => {

    db.all(
        `
        SELECT * FROM processos
        ORDER BY id DESC
        `,
        [],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    erro: "Erro ao buscar processos"
                });

            }

            res.json(rows);

        }
    );

});
// ATUALIZAR ETAPA
router.put("/:id", (req, res) => {

    const { id } = req.params;

    db.get(
        `
        SELECT * FROM processos WHERE id = ?
        `,
        [id],
        (err, processo) => {

            if (err || !processo) {

                return res.status(404).json({
                    erro: "Processo não encontrado"
                });

            }

            let novaEtapa = processo.etapa_atual + 1;

            if (novaEtapa > 4) {
                novaEtapa = 4;
            }

            let novoStatus = "Em andamento";

            if (novaEtapa === 4) {
                novoStatus = "Concluído";
            }

            db.run(
                `
                UPDATE processos
                SET etapa_atual = ?, status = ?
                WHERE id = ?
                `,
                [novaEtapa, novoStatus, id],

                function(err) {

                    if (err) {

                        return res.status(500).json({
                            erro: "Erro ao atualizar processo"
                        });

                    }

                    res.json({
                        mensagem: "Etapa atualizada!"
                    });

                }
            );

        }
    );

});

// EXCLUIR PROCESSO
router.delete("/:id", (req, res) => {

    const { id } = req.params;

    db.run(
        `
        DELETE FROM processos
        WHERE id = ?
        `,
        [id],

        function(err) {

            if (err) {

                return res.status(500).json({
                    erro: "Erro ao excluir processo"
                });

            }

            res.json({
                mensagem: "Processo excluído!"
            });

        }

    );

});
module.exports = router;