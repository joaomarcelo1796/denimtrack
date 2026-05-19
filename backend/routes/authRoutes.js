const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../database");

const router = express.Router();

router.post("/register", async (req, res) => {

    const { nome, email, senha, nivel } = req.body;

    try {

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        db.run(
            `
            INSERT INTO usuarios (nome, email, senha, nivel)
            VALUES (?, ?, ?, ?)
            `,
            [nome, email, senhaCriptografada, nivel],
            function(err) {

                if (err) {
                    return res.status(400).json({
                        erro: "Erro ao cadastrar usuário"
                    });
                }

                res.json({
                    mensagem: "Usuário cadastrado com sucesso!"
                });

            }
        );

    } catch (error) {

        res.status(500).json({
            erro: "Erro interno do servidor"
        });

    }

});
const jwt = require("jsonwebtoken");


// LOGIN
router.post("/login", (req, res) => {

    const { email, senha, nivel } = req.body;
    
    db.get(
        `
        SELECT * FROM usuarios WHERE email = ?
        `,
        [email],
        async (err, usuario) => {

            if (err) {
                return res.status(500).json({
                    erro: "Erro no servidor"
                });
            }

            if (!usuario) {
                return res.status(404).json({
                    erro: "Usuário não encontrado"
                });
            }

            const senhaCorreta = await bcrypt.compare(
                senha,
                usuario.senha
            );

            if (!senhaCorreta) {
                return res.status(401).json({
                    erro: "Senha incorreta"
                });
            }

            const token = jwt.sign(
                {
                    id: usuario.id,
                    nivel: usuario.nivel
                },
                "segredo_super_secreto",
                {
                    expiresIn: "1d"
                }
            );

            res.json({
                mensagem: "Login realizado com sucesso!",
                token,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    nivel: usuario.nivel
                }
            });

        }
    );

});
module.exports = router;