// === CONTROLE DE TELAS (UX) ===
document.getElementById("btnIrCadastro").addEventListener("click", () => {
    document.getElementById("telaLogin").style.display = "none";
    document.getElementById("telaCadastro").style.display = "block";
});

document.getElementById("btnVoltarLogin").addEventListener("click", () => {
    document.getElementById("telaCadastro").style.display = "none";
    document.getElementById("telaLogin").style.display = "block";
});

// === LÓGICA DE LOGIN ===
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const mensagem = document.getElementById("mensagemLogin");

    const resposta = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
        localStorage.setItem("token", dados.token);
        localStorage.setItem("nivel", dados.usuario.nivel); // O nível real vem do banco!
        localStorage.setItem("nome", dados.usuario.nome);
        
        mensagem.style.color = "green";
        mensagem.innerText = "Acessando o sistema...";
        window.location.href = "dashboard.html";
    } else {
        mensagem.style.color = "#ef4444"; // Vermelho para erro
        mensagem.innerText = dados.erro;
    }
});

// === LÓGICA DE CADASTRO ===
document.getElementById("cadastroForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const nome = document.getElementById("nomeCad").value;
    const email = document.getElementById("emailCad").value;
    const senha = document.getElementById("senhaCad").value;
    const nivel = document.getElementById("nivelCad").value;
    const mensagem = document.getElementById("mensagemCadastro");

    const resposta = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha, nivel })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
        mensagem.style.color = "green";
        mensagem.innerText = "Conta criada com sucesso! Volte e faça o login.";
        document.getElementById("cadastroForm").reset(); // Limpa os campos
    } else {
        mensagem.style.color = "#ef4444";
        mensagem.innerText = dados.erro;
    }
});