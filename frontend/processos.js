const token = localStorage.getItem("token");

if (!token) {

    window.location.href = "login.html";

}

const nivel = localStorage.getItem("nivel");

if (
    nivel !== "admin" &&
    nivel !== "funcionario"
) {

    alert("Acesso negado!");

    window.location.href = "dashboard.html";

}

console.log("JS funcionando");

const form = document.getElementById("processoForm");

console.log(form);

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    console.log("Form enviado");

    const cliente = document.getElementById("cliente").value;
    const quantidade = document.getElementById("quantidade").value;
    const tipo_lavagem = document.getElementById("tipo_lavagem").value;
    const prazo_entrega = document.getElementById("prazo_entrega").value;

    console.log(cliente);

    const resposta = await fetch(
        "http://localhost:3000/processos",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                cliente,
                quantidade,
                tipo_lavagem,
                prazo_entrega
            })
        }
    );

    const dados = await resposta.json();

    console.log(dados);

    const mensagem = document.getElementById("mensagem");

    if (resposta.ok) {

        mensagem.innerText = "Processo cadastrado com sucesso!";

        form.reset();

    } else {

        mensagem.innerText = dados.erro;

    }

});