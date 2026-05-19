const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email =
        document.getElementById("email").value;

    const senha =
        document.getElementById("senha").value;

    const resposta = await fetch(
        "http://localhost:3000/auth/login",
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                senha
            })

        }
    );

    const dados = await resposta.json();

    const mensagem =
        document.getElementById("mensagem");

    if (resposta.ok) {

        localStorage.setItem(
            "token",
            dados.token
        );

        localStorage.setItem(
            "nivel",
            dados.usuario.nivel
        );

        mensagem.innerText =
            "Login realizado com sucesso!";

        window.location.href =
            "dashboard.html";

    } else {

        mensagem.innerText =
            dados.erro;

    }

});



const btnCadastro =
    document.getElementById("btnCadastro");

btnCadastro.addEventListener(
    "click",

    async () => {

        const nome =
            document.getElementById("nome").value;

        const email =
            document.getElementById("email").value;

        const senha =
            document.getElementById("senha").value;

        const nivel =
            document.getElementById("nivel").value;

        const resposta = await fetch(
            "http://localhost:3000/auth/register",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    nome,
                    email,
                    senha,
                    nivel
                })

            }
        );

        const dados =
            await resposta.json();

        const mensagem =
            document.getElementById("mensagem");

        if (resposta.ok) {

            mensagem.innerText =
                "Usuário cadastrado com sucesso!";

        } else {

            mensagem.innerText =
                dados.erro;

        }

    }

);