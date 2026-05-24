// === auth.js | CONTROLE DE ACESSO CENTRALIZADO ===

// 1. Resgata os dados da sessão imediatamente
const token = localStorage.getItem("token");
const nivel = localStorage.getItem("nivel");
const nomeUsuario = localStorage.getItem("nome");

// 2. Trava Principal: Se não houver token, bloqueia e expulsa ANTES da página carregar
if (!token) {
    console.warn("Acesso negado: Tentativa de acesso sem autenticação.");
    // O 'replace' substitui o histórico, impedindo que o botão "voltar" do navegador funcione
    window.location.replace("login.html"); 
}

// 3. Função Global de Logout
window.fazerLogout = function() {
    // Limpa os dados de acesso
    localStorage.removeItem("token");
    localStorage.removeItem("nivel");
    localStorage.removeItem("nome");
    
    // Opcional: localStorage.clear(); // Use se quiser apagar TUDO do navegador

    // Redireciona para o login com segurança
    window.location.replace("login.html");
};

// 4. Injeção Automática de Interface (Bônus de UX)
// Quando a página terminar de carregar, se existir um elemento com id "nomeUsuarioDisplay", ele preenche com o nome.
document.addEventListener("DOMContentLoaded", () => {
    const displayElement = document.getElementById("nomeUsuarioDisplay");
    if (displayElement && nomeUsuario) {
        displayElement.innerText = `Olá, ${nomeUsuario}`;
    }
});