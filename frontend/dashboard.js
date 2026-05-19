const token = localStorage.getItem("token");

if (!token) {

    window.location.href = "login.html";

}

async function carregarProcessos() {

    const resposta = await fetch(
        "http://localhost:3000/processos"
    );

    const processos = await resposta.json();

    const total = processos.length;

    const concluidos = processos.filter(
        p => p.status === "Concluído"
    ).length;

    const ativos = total - concluidos;

    document.getElementById("total").innerText = total;

    document.getElementById("concluidos").innerText = concluidos;

    document.getElementById("ativos").innerText = ativos;

    const listaAlertas = document.getElementById("listaAlertas");

listaAlertas.innerHTML = "";

processos.forEach((processo) => {

    if (processo.etapa_atual === 3) {

        listaAlertas.innerHTML += `
            <div class="alerta alerta-warning">
                ⚠ Processo ${processo.cliente}
                está próximo da conclusão
            </div>
        `;

    }

    if (processo.etapa_atual === 4) {

        listaAlertas.innerHTML += `
            <div class="alerta alerta-success">
                ✅ Processo ${processo.cliente}
                foi concluído
            </div>
        `;

    }

});

    const tabela = document.getElementById("tabelaProcessos");

    tabela.innerHTML = "";

    processos.forEach((processo) => {

        tabela.innerHTML += `
            <tr>

                <td>${processo.cliente}</td>

                <td>${processo.status}</td>

                <td>

                    <div class="barra-container">

                        <div
                            class="barra-progresso"
                            style="width: ${processo.etapa_atual * 25}%"
                        >
                        </div>

                    </div>

                    <span>
                        ${processo.etapa_atual * 25}%
                    </span>

                </td>

                <td>

                    <button
                        onclick="avancarEtapa(${processo.id})"
                    >
                        Avançar Etapa
                    </button>

                    <button
                       onclick="excluirProcesso(${processo.id})"
                    >
                       Excluir
                    </button>

                </td>

            </tr>
        `;

    });

}


async function avancarEtapa(id) {

    await fetch(
        `http://localhost:3000/processos/${id}`,
        {
            method: "PUT"
        }
    );

    carregarProcessos();

}

async function excluirProcesso(id) {

    const confirmar = confirm(
        "Deseja excluir este processo?"
    );

    if (!confirmar) return;

    await fetch(
        `http://localhost:3000/processos/${id}`,
        {
            method: "DELETE"
        }
    );

    carregarProcessos();

}

carregarProcessos();