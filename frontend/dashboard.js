const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

async function carregarProcessos() {
    try {
        const resposta = await fetch("https://denimtrack.com.br/api/processos");
        let processos = await resposta.json();

        const nivelUsuario = localStorage.getItem("nivel") ? localStorage.getItem("nivel").trim().toLowerCase() : "";
        const nomeUsuario = localStorage.getItem("nome") ? localStorage.getItem("nome").trim().toLowerCase() : "";

        // === 1. FILTRO SELETIVO DE PRIVACIDADE PARA CLIENTE ===
        if (nivelUsuario === "cliente") {
            processos = processos.filter(
                p => p.cliente.trim().toLowerCase() === nomeUsuario
            );
        }

        // === 2. DINÂMICA DE VISIBILIDADE DAS ABAS DA SIDEBAR ===
        document.querySelectorAll(".sidebar ul li").forEach(li => {
            const textoItem = li.textContent.trim();
            if (textoItem.includes("Processos") && nivelUsuario === "cliente") {
                li.style.display = "none";
            }
        });

        const menuAdmin = document.getElementById("menuAdmin");
        if (menuAdmin) {
            menuAdmin.style.display = nivelUsuario === "admin" ? "block" : "none";
        }

        // === 3. PROCESSAMENTO E EXIBIÇÃO DE METRICAS ===
        const total = processos.length;
        const concluidos = processos.filter(p => p.status === "Concluído").length;
        const ativos = total - concluidos;

        document.getElementById("total").innerText = total;
        document.getElementById("concluidos").innerText = concluidos;
        document.getElementById("ativos").innerText = ativos;

        // === 4. MONITOR DE ALERTAS ===
        const listaAlertas = document.getElementById("listaAlertas");
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

        // === 5. RENDERIZAÇÃO ADAPTATIVA DA TABELA DE DADOS ===
        const tabela = document.getElementById("tabelaProcessos");
        const thead = document.querySelector(".processos table thead");
        tabela.innerHTML = "";

        if (nivelUsuario === "cliente") {
            // Cabeçalho simplificado em modo leitura para o Cliente
            thead.innerHTML = `
                <tr>
                    <th style="text-align: left; padding-left: 15px;">Acompanhamento de Ordens de Serviço</th>
                </tr>
            `;
        } else {
            // Cabeçalho detalhado operacional para Equipe Interna
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
                // Formato customizado do Cliente: Serviço X | Itens | Status - XX%
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
                // Layout com colunas expandidas e botões de ação para Admin/Funcionário
                let botoesAcao = "";
                if (nivelUsuario === "admin") {
                    botoesAcao = `
                        <button onclick="avancarEtapa(${processo.id})" style="margin-right: 5px;">Avançar</button>
                        <button onclick="editarProcesso(${processo.id}, '${processo.status}')" style="background-color: #f59e0b; margin-right: 5px;">Editar</button>
                        <button onclick="excluirProcesso(${processo.id})" style="background-color: #ef4444;">Excluir</button>
                    `;
                } else if (nivelUsuario === "funcionario") {
                    botoesAcao = `
                        <button onclick="avancarEtapa(${processo.id})">Avançar Etapa</button>
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

// === 6. OPERAÇÃO: AVANÇAR ETAPA (+25%) ===
async function avancarEtapa(id) {
    try {
        const resposta = await fetch(`https://denimtrack.com.br/api/processos/${id}`, { method: "PUT" });
        if (!resposta.ok) throw new Error("A requisição falhou no servidor.");
        carregarProcessos();
    } catch (erro) {
        alert("Não foi possível avançar a etapa.");
        console.error(erro);
    }
}

// === 7. OPERAÇÃO: EXCLUIR REGISTRO ===
async function excluirProcesso(id) {
    if (!confirm("Tem certeza de que deseja apagar permanentemente esta ordem?")) return;
    try {
        const resposta = await fetch(`https://denimtrack.com.br/api/processos/${id}`, { method: "DELETE" });
        if (!resposta.ok) throw new Error("Erro interno ao deletar.");
        carregarProcessos();
    } catch (erro) {
        alert("Erro ao excluir o processo.");
        console.error(erro);
    }
}

// === 8. OPERAÇÃO: EDITAR TEXTO DE STATUS (ADMIN) ===
async function editarProcesso(id, statusAtual) {
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
}

// Inicialização automática ao montar a janela
carregarProcessos();