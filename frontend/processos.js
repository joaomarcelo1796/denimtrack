// === 1. VERIFICAÇÃO DE AUTENTICAÇÃO ===
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const nivelUsuario = localStorage.getItem("nivel") ? localStorage.getItem("nivel").trim().toLowerCase() : "";

// Impede clientes de acessar esta tela de entrada de dados
if (nivelUsuario !== "admin" && nivelUsuario !== "funcionario") {
    alert("Acesso negado! Redirecionando para o painel de acompanhamento.");
    window.location.href = "dashboard.html";
}

// === 2. GERENCIAMENTO DE EXIBIÇÃO DO MENU ADMIN ===
const menuAdmin = document.getElementById("menuAdmin");
if (menuAdmin) {
    menuAdmin.style.display = nivelUsuario === "admin" ? "block" : "none";
}

// === 3. LOGICA INTERATIVA DE ADICIONAR PRODUTOS NO ARRAY ===
let produtosArray = [];
const btnAddProduto = document.getElementById("btnAdicionarProduto");
const produtoInput = document.getElementById("produtoInput");
const listaVisual = document.getElementById("listaProdutosAcumulados");

if (btnAddProduto && produtoInput) {
    btnAddProduto.addEventListener("click", () => {
        const produtoTexto = produtoInput.value.trim();
        if (produtoTexto !== "") {
            produtosArray.push(produtoTexto);
            // Atualiza a listagem na tela separando por vírgula
            listaVisual.innerText = "Produtos selecionados: " + produtosArray.join(", ");
            produtoInput.value = ""; 
            produtoInput.focus();
        }
    });
}

// === 4. PROCESSAMENTO E ENVIO DO FORMULÁRIO ===
const form = document.getElementById("processoForm");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const cliente = document.getElementById("cliente").value;
        const quantidade = document.getElementById("quantidade").value;
        const tipo_lavagem = document.getElementById("tipo_lavagem").value;
        const prazo_entrega = document.getElementById("prazo_entrega").value;
        const mensagem = document.getElementById("mensagem");

        // Formata o array acumulado para string limpa ou define valor padrão
        const produtosString = produtosArray.length > 0 ? produtosArray.join(", ") : "Nenhum detalhe de produto adicionado.";

        try {
            const resposta = await fetch("https://denimtrack.com.br/api/processos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    cliente,
                    quantidade,
                    tipo_lavagem,
                    prazo_entrega,
                    produtos: produtosString
                })
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                mensagem.style.color = "green";
                mensagem.innerText = `Sucesso! Serviço registrado sob a chave: ${dados.chave_servico}`;
                
                // Reseta a interface para uma nova inserção
                form.reset();
                produtosArray = [];
                listaVisual.innerText = "Produtos selecionados: Nenhum";
            } else {
                mensagem.style.color = "#ef4444";
                mensagem.innerText = dados.erro || "Falha ao registrar a ordem.";
            }
        } catch (erro) {
            console.error("Erro operacional:", erro);
            mensagem.style.color = "#ef4444";
            mensagem.innerText = "Servidor offline ou inacessível no momento.";
        }
    });
}