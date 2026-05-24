// dashboard.js - Código Blindado (Sem conflitos com auth.js)

async function carregarProcessos() {
    try {
        // As variáveis vieram para DENTRO da função. Zero chance de colisão!
        const nivelLocal = localStorage.getItem("nivel") ? localStorage.getItem("nivel").trim().toLowerCase() : "";
        const nomeLocal = localStorage.getItem("nome") ? localStorage.getItem("nome").trim().toLowerCase() : "";
        
        console.log(`👤 Usuário logado: ${nomeLocal} | 🔑 Nível de Acesso: [${nivelLocal}]`);

        const resposta = await fetch("https://denimtrack.com.br/api/processos");
        let processos = await resposta.json();

        // === FILTRO SELETIVO DE PRIVACIDADE PARA CLIENTE ===
        if (nivelLocal === "cliente") {
            processos = processos.filter(
                p => p.cliente.trim().toLowerCase() === nomeLocal
            );
        }

        // === DINÂMICA DE VISIBILIDADE DAS ABAS DA SIDEBAR ===
        document.querySelectorAll(".sidebar ul li").forEach(li => {
            const textoItem = li.textContent.trim();
            if (textoItem.includes("Processos") && nivelLocal === "cliente") {
                li.style.display = "none";
            }
        });

        // === CONTROLE DO MENU ADMIN ===
        const menuAdmin = document.getElementById("menuAdmin");
        if (menuAdmin) {
            menuAdmin.style.display = (nivelLocal === "admin") ? "block" : "none";
        }

        // === PROCESSAMENTO E EXIBIÇÃO DE MÉTRICAS ===
        const total = processos.length;
        const concluidos = processos.filter(p => p.status === "Concluído").length;
        const ativos = total - concluidos;

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
                            ⚠️ A ordem de serviço ${identificador} está na última etapa de processamento.
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
        
        if (!tabela || !thead) return;
        
        tabela.innerHTML = "";

        if (nivelLocal === "cliente") {
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

            if (nivelLocal === "cliente") {
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
                let botoesAcao = "";
                
                if (nivelLocal === "admin") {
                    boto