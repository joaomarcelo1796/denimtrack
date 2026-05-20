// Como é uma página pública, NÃO fazemos verificação de token ou nível aqui!

async function buscarRastreio() {
    const codigo = document.getElementById("codigoRastreio").value.trim().toUpperCase();
    const resultadoDiv = document.getElementById("resultadoRastreio");

    // Validação básica se o usuário clicou sem digitar nada
    if (!codigo) {
        resultadoDiv.style.display = "block";
        resultadoDiv.innerHTML = `<p style="color: #ef4444; font-weight: bold; text-align: center;">Por favor, digite um código válido.</p>`;
        return;
    }

    // Feedback visual de carregamento
    resultadoDiv.style.display = "block";
    resultadoDiv.innerHTML = `<p style="text-align: center; color: #64748b;">Buscando informações...</p>`;

    try {
        const resposta = await fetch(`http://52.15.207.64:3000/processos/rastreio/${codigo}`);
        const dados = await resposta.json();

        if (resposta.ok) {
            const porcentagem = (dados.etapa_atual || 1) * 25;
            
            // Desenha o card de sucesso na tela
            resultadoDiv.innerHTML = `
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <h3 style="margin-bottom: 10px; color: #0f172a; font-size: 18px;">Serviço: <span style="color: #2563eb;">${dados.chave_servico}</span></h3>
                    
                    <p style="font-size: 14px; color: #475569; margin-bottom: 15px; line-height: 1.5;">
                        <strong>Produtos vinculados:</strong><br> ${dados.produtos}
                    </p>
                    
                    <p style="font-size: 15px; color: #2563eb; font-weight: bold; margin-bottom: 8px;">
                        Status Atual: ${dados.status}
                    </p>
                    
                    <div class="barra-container" style="background: #e2e8f0; border-radius: 6px; height: 12px; overflow: hidden; width: 100%;">
                        <div class="barra-progresso" style="width: ${porcentagem}%; background: #10b981; height: 100%; transition: width 0.5s ease-in-out;"></div>
                    </div>
                    <p style="text-align: right; font-size: 12px; font-weight: bold; color: #10b981; margin-top: 5px;">${porcentagem}% Concluído</p>
                </div>
            `;
        } else {
            // Desenha a mensagem de erro (Código não encontrado)
            resultadoDiv.innerHTML = `<p style="color: #ef4444; font-weight: bold; text-align: center;">⚠ ${dados.erro}</p>`;
        }
    } catch (erro) {
        console.error("Erro no rastreio:", erro);
        resultadoDiv.innerHTML = `<p style="color: #ef4444; font-weight: bold; text-align: center;">Erro ao conectar com o servidor. Tente novamente mais tarde.</p>`;
    }
}