// === auth.js | CONTROLE DE ACESSO CENTRALIZADO ===

const token = localStorage.getItem("token");
const nivel = localStorage.getItem("nivel");
const nomeUsuario = localStorage.getItem("nome");

// Descobre o nome da página atual (ex: "/login.html" ou "/dashboard.html")
const paginaAtual = window.location.pathname;

// 1. TRAVA DE SEGURANÇA: Se NÃO tem token e NÃO está na página de login, joga pro login
if (!token && !paginaAtual.includes("login.html")) {
    console.warn("Acesso negado: Redirecionando para o login.");
    window.location.replace("login.html");
}

// 2. ATALHO INTELIGENTE: Se TEM token e o cara tentar abrir o login de novo, pula direto pro dashboard
if (token && paginaAtual.includes("login.html")) {
    window.location.replace("dashboard.html");
}

// 3. Função Global de Logout
window.fazerLogout = function() {
    localStorage.clear(); // Limpa tudo
    window.location.replace("login.html");
};

// 4. Injeção Automática de Nome de Usuário (Bônus)
document.addEventListener("DOMContentLoaded", () => {
    const displayElement = document.getElementById("nomeUsuarioDisplay");
    if (displayElement && nomeUsuario) {
        displayElement.innerText = `Olá, ${nomeUsuario}`;
    }
});