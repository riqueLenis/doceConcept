// Obter total do carrinho via localStorage (assumindo que vem da página anterior)
let cartTotal = parseFloat(localStorage.getItem("cartTotal")) || 0;
if (cartTotal === 0) {
  alert("Carrinho vazio. Redirecionando para a loja.");
  window.location.href = "index.html";
}

// Atualizar total na tela
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById(
    "total-display"
  ).textContent = `Total: R$ ${cartTotal.toFixed(2)}`;
});

// Máscaras para inputs
document.getElementById("card-number").addEventListener("input", function (e) {
  let value = e.target.value
    .replace(/\D/g, "")
    .replace(/(\d{4})(?=\d)/g, "$1 ");
  e.target.value = value;
});

document.getElementById("expiry-date").addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length >= 2) {
    value = value.substring(0, 2) + "/" + value.substring(2, 4);
  }
  e.target.value = value;
});

document.getElementById("cpf").addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  e.target.value = value;
});

// Validação simples de data de validade
document.getElementById("expiry-date").addEventListener("blur", function (e) {
  let value = e.target.value.replace(/\D/g, "");
  let month = parseInt(value.substring(0, 2));
  let year = parseInt(value.substring(2, 4));
  let currentYear = new Date().getFullYear() % 100;
  if (month < 1 || month > 12 || year < currentYear) {
    alert("Data de validade inválida.");
    e.target.focus();
  }
});

// Formulário de pagamento (simulado)
document
  .getElementById("payment-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const payBtn = document.getElementById("pay-btn");
    const loading = document.getElementById("loading");

    // Simular validação básica
    if (!this.checkValidity()) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    payBtn.disabled = true;
    loading.style.display = "block";

    // Simular processamento
    setTimeout(() => {
      alert(
        "Pagamento aprovado! Obrigada pela compra na Elegância Feminina. Seu pedido foi confirmado. Um e-mail com detalhes foi enviado."
      );
      localStorage.removeItem("cart");
      localStorage.removeItem("cartTotal");
      window.location.href = "obrigado.html"; // Ou redirecione para uma página de confirmação
    }, 2000);
  });

// WhatsApp
function openWhatsApp() {
  window.open(
    "https://wa.me/5511999999999?text=Olá! Preciso de ajuda com o pagamento.",
    "_blank"
  );
}
