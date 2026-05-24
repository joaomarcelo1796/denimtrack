const token = localStorage.getItem("token");
const nivelUsuario = localStorage.getItem("nivel") ? localStorage.getItem("nivel").trim().toLowerCase() : "";

// Trava de segurança absoluta: Se não for admin, volta pro Dashboard
if (!token || nivelUsuario !== "admin") {
    alert("Acesso negado. Área restrita para Administradores.");
    window.location.href = "dashboard.html";
}

async function carregarPainelAdmin() {
    try {
        // 1. Carregar Clientes (Exige criação da rota GET /usuarios no back-end)
        const resUsuarios = await fetch("https://denimtrack.com.br/api/usuarios");
        if (resUsuarios.ok) {
            const usuarios = await resUsuarios.json();
            const tabelaClientes = document.getElementById("tabelaClientes");
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

        // 2. Carregar Todos os Processos
        const resProcessos = await fetch("https://denimtrack.com.br/api/processos");
        if (resProcessos.ok) {
            const processos = await resProcessos.json();
            const tabelaProcessos = document.getElementById("tabelaTodosProcessos");
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
    } catch (erro) {
        console.error("Erro ao carregar os dados do Admin:", erro);
    }
}
// === VERIFICAÇÃO DE NÍVEL (Exclusivo para páginas Admin) ===
// Como o auth.js já rodou e garantiu que a pessoa está logada, aqui só testamos o cargo.

if (nivel !== "admin") {
    alert("⛔ Acesso Restrito: Apenas administradores têm permissão para acessar esta área.");
    // Como ele está logado mas não é admin, jogamos ele de volta para a tela de operações normais
    window.location.replace("dashboard.html"); 
}
carregarPainelAdmin();