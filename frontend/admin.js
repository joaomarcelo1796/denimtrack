// admin.js - Código Blindado (Isolado e à prova de falhas)

async function carregarPainelAdmin() {
    try {
        // 1. Variáveis isoladas dentro da função para não bater com o auth.js
        const nivelLocal = localStorage.getItem("nivel") ? localStorage.getItem("nivel").trim().toLowerCase() : "";
        
        // 2. Trava de segurança exclusiva da página Admin
        if (nivelLocal !== "admin") {
            alert("⛔ Acesso Restrito: Apenas administradores têm permissão para acessar esta área.");
            window.location.replace("dashboard.html");
            return; // Interrompe a execução
        }

        console.log("👑 Painel de Administração carregando dados...");

        // 3. Carregar Clientes do Banco de Dados
        const resUsuarios = await fetch("https://denimtrack.com.br/api/usuarios");
        if (resUsuarios.ok) {
            const usuarios = await resUsuarios.json();
            const tabelaClientes = document.getElementById("tabelaClientes");
            
            if (tabelaClientes) {
                tabelaClientes.innerHTML = "";
                usuarios.forEach(user => {
                    tabelaClientes.innerHTML += `
                        <tr>
                            <td>${user.nome}</td>
                            <td>${user.email}</td>
                            <td><span style="background: #e2e8f0; padding: 5px 10px; border-radius: 8px; font-size: 12px; font-weight: bold;">${user.nivel.toUpperCase()}</span></td>
                        </tr>
                    `;
                });
            }
        } else {
            console.warn("Rota de usuários falhou ou ainda não existe no backend.");
        }

        // 4. Carregar Todos os Processos
        const resProcessos = await fetch("https://denimtrack.com.br/api/processos");
        if (resProcessos.ok) {
            const processos = await resProcessos.json();
            const tabelaProcessos = document.getElementById("tabelaTodosProcessos");
            
            if (tabelaProcessos) {
                tabelaProcessos.innerHTML = "";
                processos.forEach(processo => {
                    tabelaProcessos.innerHTML += `
                        <tr>
                            <td>#${processo.id}</td>
                            <td>${processo.cliente}</td>
                            <td>${processo.quantidade} un.</td>
                            <td>${processo.tipo_lavagem}</td>
                            <td>${processo.status}</td>
                        </tr>
                    `;
                });
            }
        }
    } catch (erro) {
        console.error("Erro ao carregar os dados do Admin:", erro);
    }
}

// Inicialização automática
carregarPainelAdmin();