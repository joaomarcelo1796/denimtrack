// === VERIFICAÇÃO DE SEGURANÇA E SESSÃO ===
const token = localStorage.getItem("token");
if (!token) {
    window.location.replace("login.html");
}

// 1. Pega os dados do usuário, limpando espaços invisíveis e forçando minúsculo
const nivelUsuario = localStorage.getItem("nivel") ? localStorage.getItem("nivel").trim().toLowerCase() : "";
const nomeUsuario = localStorage.getItem("nome") ? localStorage.getItem("nome").trim().toLowerCase() : "";

// 2. O "Espião" para termos 100% de certeza no Console (F12)
console.log(`👤 Usuário logado: ${nomeUsuario} | 🔑 Nível de Acesso: [${nivelUsuario}]`);

async function carregarProcessos() {
    try {
        const resposta = await fetch("https://denimtrack.com.br/api/processos");
        let processos = await resposta.json();

        // === FILTRO SELETIVO DE PRIVACIDADE PARA CLIENTE ===
        if (nivelUsuario === "cliente") {
            processos = processos.filter(
                p => p.cliente.trim().toLowerCase() === nomeUsuario
            );
        }

        // === DINÂMICA DE VISIBILIDADE DAS ABAS DA SIDEBAR ===
        document.querySelectorAll(".sidebar ul li").forEach(li => {
            const textoItem = li.textContent.trim();
            if (textoItem.includes("Processos") && nivelUsuario === "cliente") {
                li.style.display = "none";
            }
        });

        // === CONTROLE DO MENU ADMIN ===
        const menuAdmin = document.getElementById("menuAdmin");
        if (menuAdmin) {
            menuAdmin.style.display = (nivelUsuario === "admin") ? "block" : "none";
        }

        // === PROCESSAMENTO E EXIBIÇÃO DE MÉTRICAS ===
        const total = processos.length;
        const concluidos = processos.filter(p => p.status === "Concluído").length;
        const ativos = total - concluidos;

        // Usa 'if' para evitar erros no console caso esses IDs não existam no HTML
        if (document.getElementById("total")) document.getElementById("total").innerText = total;
        if (document.getElementById("concluidos")) document.getElementById("concluidos").innerText = concluidos;
        if (document.getElementById("ativos")) document.getElementById("ativos").innerText = ativos;

        // === MONITOR DE ALERTAS ===
        const listaAlertas = document.getElementById("listaAlertas");
        if (listaAlertas) {
            listaAlertas.innerHTML = "";
            processos.forEach((processo) => {
                const identificador = processo.chave_servico || `#${processo.id}`;
                if (processo.etapa_atual === 3) {
                    listaAlertas.innerHTML += `
                        <div class="alerta alerta-warning">
                            ⚠ A ordem de serviço ${identificador} está na última etapa de processamento.
                        </div>
                    `;
                }
                if (processo.etapa_atual === 4) {
                    listaAlertas.innerHTML += `
                        <div class="alerta alerta-success">
                            ✅ A ordem de serviço ${identificador} foi finalizada e está pronta!
                        </div>
                    `;
                }
            });
        }

        // === RENDERIZAÇÃO ADAPTATIVA DA TABELA DE DADOS ===
        const tabela = document.getElementById("tabelaProcessos");
        const thead = document.querySelector(".processos table thead");
        
        if (!tabela || !thead) return; // Se a página não tiver tabela, ele para a função aqui com segurança
        
        tabela.innerHTML = "";

        if (nivelUsuario === "cliente") {
            thead.innerHTML = `
                <tr>
                    <th style="text-align: left; padding-left: 15px;">Acompanhamento de Ordens de Serviço</th>
                </tr>
            `;
        } else {
            thead.innerHTML = `
                <tr>
                    <th>Cliente</th>
                    <th>Cód. Serviço</th>
                    <th>Produtos Vinculados</th>
                    <th>Status & Progresso</th>
                    <th>Ações Gerenciais</th>
                </tr>
            `;
        }

        processos.forEach((processo) => {
            const progressoPorcentagem = (processo.etapa_atual || 1) * 25;
            const codServico = processo.chave_servico || "Pendente";
            const itensString = processo.produtos || "Nenhum detalhe técnico anexado.";

            if (nivelUsuario === "cliente") {
                tabela.innerHTML += `
                    <tr>
                        <td style="text-align: left; padding: 15px; line-height: 1.8;">
                            <span style="background: #1e293b; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">Serviço ${codServico}</span> 
                            | <span style="color: #475569; font-weight: 500;">${itensString}</span> 
                            | <strong style="color: #2563eb;">${processo.status} — ${progressoPorcentagem}%</strong>
                            <div class="barra-container" style="margin-top: 10px; max-width: 400px; background: #e2e8f0; border-radius: 4px; height: 8px; overflow: hidden;">
                                <div class="barra-progresso" style="width: ${progressoPorcentagem}%; background: #2563eb; height: 100%;"></div>
                            </div>
                        </td>
                    </tr>
                `;
            } else {
                // LÓGICA DE BOTÕES: ADMIN VS FUNCIONÁRIO
                let botoesAcao = "";
                
                if (nivelUsuario === "admin") {
                    botoesAcao = `
                        <button onclick="avancarEtapa(${processo.id})" style="margin-right: 5px; cursor: pointer;">Avançar</button>
                        <button onclick="editarProcesso(${processo.id}, '${processo.status}')" style="background-color: #f59e0b; margin-right: 5px; cursor: pointer;">Editar</button>
                        <button onclick="excluirProcesso(${processo.id})" style="background-color: #ef4444; cursor: pointer;">Excluir</button>
                    `;
                } else {
                    botoesAcao = `
                        <button onclick="avancarEtapa(${processo.id})" style="cursor: pointer;">Avançar Etapa</button>
                    `;
                }

                tabela.innerHTML += `
                    <tr>
                        <td><strong>${processo.cliente}</strong></td>
                        <td><span style="color: #475569; font-weight: 700;">${codServico}</span></td>
                        <td><span style="font-size: 13px; color: #64748b; font-style: italic;">${itensString}</span></td>
                        <td>
                            <div class="barra-container">
                                <div class="barra-progresso" style="width: ${progressoPorcentagem}%"></div>
                            </div>
                            <span style="font-size: 12px; font-weight: bold;">${processo.status} (${progressoPorcentagem}%)</span>
                        </td>
                        <td>${botoesAcao}</td>
                    </tr>
                `;
            }
        });

    } catch (erro) {
        console.error("Erro crítico na carga de dados:", erro);
    }
}

// === OPERAÇÕES LIGADAS AO OBJETO WINDOW (EVITA BUGS DE RENDERIZAÇÃO INLINE) ===

window.avancarEtapa = async function(id) {
    try {
        const resposta = await fetch(`https://denimtrack.com.br/api/processos/${id}`, { method: "PUT" });
        if (!resposta.ok) throw new Error("A requisição falhou no servidor.");
        carregarProcessos();
    } catch (erro) {
        alert("Não foi possível avançar a etapa.");
        console.error(erro);
    }
};

window.excluirProcesso = async function(id) {
    if (!confirm("Tem certeza de que deseja apagar permanentemente esta ordem?")) return;
    try {
        const resposta = await fetch(`https://denimtrack.com.br/api/processos/${id}`, { method: "DELETE" });
        if (!resposta.ok) throw new Error("Erro interno ao deletar.");
        carregarProcessos();
    } catch (erro) {
        alert("Erro ao excluir o processo.");
        console.error(erro);
    }
};

window.editarProcesso = async function(id, statusAtual) {
    const novoStatus = prompt(`Digite o novo status descritivo para a ordem #${id}:`, statusAtual);
    if (!novoStatus || novoStatus.trim() === statusAtual) return;

    try {
        const resposta = await fetch(`https://denimtrack.com.br/api/processos/${id}/editar`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: novoStatus.trim() })
        });
        if (!resposta.ok) throw new Error("O servidor rejeitou as alterações.");
        carregarProcessos();
    } catch (erro) {
        alert("Falha ao salvar as alterações.");
        console.error(erro);
    }
};

// Inicialização automática ao montar a janela
carregarProcessos();