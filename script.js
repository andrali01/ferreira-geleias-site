/* ==================================
   FERREIRÁ GELEIAS ARTESANAIS
   ================================== */

// Número de WhatsApp da loja (formato internacional, sem espaços/símbolos)
const WHATSAPP_NUMERO = "5511999999999";

// Catálogo de geleias
// linha: "classica" | "saudavel" | "edicao"
const PRODUTOS = [
  { id: 1, nome: "Morango Tradicional", linha: "classica", preco: 24.90, emoji: "🍓", desc: "O clássico de sempre, com pedaços de morango e ponto certo de doçura.", tag: "Presentear" },
  { id: 2, nome: "Manga Verde — Receita de Família", linha: "classica", preco: 26.90, emoji: "🥭", desc: "A receita que deu origem à Ferreirá, feita como há gerações.", tag: "Nossa história" },
  { id: 3, nome: "Amora", linha: "classica", preco: 27.90, emoji: "🫐", desc: "Sabor intenso e adocicado, ótima para harmonizar com queijos.", tag: "Harmonizar" },
  { id: 4, nome: "Abacaxi com Coco e Pimenta Rosa", linha: "edicao", preco: 32.90, emoji: "🍍", desc: "Combinação autoral e tropical, em edição limitada.", tag: "Edição Limitada" },
  { id: 5, nome: "Manga com Alho Negro", linha: "edicao", preco: 32.90, emoji: "🥭", desc: "Doce e defumado, uma combinação ousada e exclusiva.", tag: "Edição Limitada" },
  { id: 6, nome: "Morango Zero Açúcar", linha: "saudavel", preco: 28.90, emoji: "🍓", desc: "Sem açúcar e sem adoçante industrial, mesmo sabor de sempre.", tag: "Consumir com saúde" },
  { id: 7, nome: "Amora Zero Açúcar", linha: "saudavel", preco: 29.90, emoji: "🫐", desc: "Leve, saudável e cheia de sabor.", tag: "Consumir com saúde" },
  { id: 8, nome: "Manga Zero Açúcar", linha: "saudavel", preco: 28.90, emoji: "🥭", desc: "A tradição da manga, agora sem açúcar.", tag: "Consumir com saúde" },
];

let carrinho = JSON.parse(localStorage.getItem("ferreira_carrinho") || "[]");

// ===== RENDER DE PRODUTOS =====
const produtosGrid = document.getElementById("produtosGrid");

function renderProdutos(filtro = "todos") {
  const lista = filtro === "todos" ? PRODUTOS : PRODUTOS.filter(p => p.linha === filtro);
  produtosGrid.innerHTML = lista.map(p => `
    <div class="produto-card">
      <div class="produto-emoji">${p.emoji}</div>
      <span class="produto-tag ${p.linha === "edicao" ? "tag-edicao" : ""}">${p.tag}</span>
      <h3>${p.nome}</h3>
      <p class="produto-desc">${p.desc}</p>
      <span class="produto-preco">R$ ${p.preco.toFixed(2).replace(".", ",")}</span>
      <button type="button" class="produto-add" data-id="${p.id}">Adicionar ao carrinho</button>
    </div>
  `).join("");
}

renderProdutos();

document.getElementById("filtros").addEventListener("click", (e) => {
  const btn = e.target.closest(".filtro-btn");
  if (!btn) return;
  document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderProdutos(btn.dataset.filtro);
});

produtosGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".produto-add");
  if (!btn) return;
  adicionarAoCarrinho(Number(btn.dataset.id));
});

// ===== CARRINHO =====
function salvarCarrinho() {
  localStorage.setItem("ferreira_carrinho", JSON.stringify(carrinho));
}

function adicionarAoCarrinho(id) {
  const item = carrinho.find(i => i.id === id);
  if (item) {
    item.qtd += 1;
  } else {
    const produto = PRODUTOS.find(p => p.id === id);
    carrinho.push({ id: produto.id, nome: produto.nome, preco: produto.preco, emoji: produto.emoji, qtd: 1 });
  }
  salvarCarrinho();
  atualizarCarrinhoUI();
  abrirCarrinho();
}

function alterarQtd(id, delta) {
  const item = carrinho.find(i => i.id === id);
  if (!item) return;
  item.qtd += delta;
  if (item.qtd <= 0) {
    carrinho = carrinho.filter(i => i.id !== id);
  }
  salvarCarrinho();
  atualizarCarrinhoUI();
}

function removerItem(id) {
  carrinho = carrinho.filter(i => i.id !== id);
  salvarCarrinho();
  atualizarCarrinhoUI();
}

function atualizarCarrinhoUI() {
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");

  const totalQtd = carrinho.reduce((s, i) => s + i.qtd, 0);
  const totalPreco = carrinho.reduce((s, i) => s + i.qtd * i.preco, 0);

  cartCount.textContent = totalQtd;
  cartTotal.textContent = "R$ " + totalPreco.toFixed(2).replace(".", ",");

  if (carrinho.length === 0) {
    cartItems.innerHTML = `<p class="cart-empty">Seu carrinho está vazio.</p>`;
    return;
  }

  cartItems.innerHTML = carrinho.map(i => `
    <div class="cart-item">
      <div class="cart-item-emoji">${i.emoji}</div>
      <div class="cart-item-info">
        <h4>${i.nome}</h4>
        <span>R$ ${i.preco.toFixed(2).replace(".", ",")} un.</span>
      </div>
      <div class="cart-item-qty">
        <button type="button" data-action="menos" data-id="${i.id}">−</button>
        <span>${i.qtd}</span>
        <button type="button" data-action="mais" data-id="${i.id}">+</button>
      </div>
      <button type="button" class="cart-item-remove" data-action="remover" data-id="${i.id}">✕</button>
    </div>
  `).join("");
}

document.getElementById("cartItems").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const acao = btn.dataset.action;
  if (acao === "mais") alterarQtd(id, 1);
  if (acao === "menos") alterarQtd(id, -1);
  if (acao === "remover") removerItem(id);
});

// ===== ABRIR/FECHAR PAINEL DO CARRINHO =====
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");

function abrirCarrinho() {
  cartPanel.classList.add("active");
  cartOverlay.classList.add("active");
}
function fecharCarrinho() {
  cartPanel.classList.remove("active");
  cartOverlay.classList.remove("active");
}

document.getElementById("cartBtn").addEventListener("click", abrirCarrinho);
document.getElementById("cartClose").addEventListener("click", fecharCarrinho);
cartOverlay.addEventListener("click", fecharCarrinho);

// ===== CHECKOUT VIA WHATSAPP =====
document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio. Adicione geleias antes de finalizar o pedido.");
    return;
  }
  const linhas = carrinho.map(i => `• ${i.qtd}x ${i.nome} — R$ ${(i.qtd * i.preco).toFixed(2).replace(".", ",")}`);
  const total = carrinho.reduce((s, i) => s + i.qtd * i.preco, 0);
  const mensagem = [
    "Olá! Gostaria de fazer o seguinte pedido na Ferreirá:",
    "",
    ...linhas,
    "",
    `Total: R$ ${total.toFixed(2).replace(".", ",")}`,
  ].join("\n");

  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
});

// ===== MENU MOBILE =====
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
  mainNav.classList.toggle("open");
});

mainNav.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => mainNav.classList.remove("open"));
});

// ===== FORMULÁRIO DE CONTATO (sem backend) =====
document.getElementById("contatoForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const formMsg = document.getElementById("formMsg");
  formMsg.textContent = "Mensagem enviada! Em breve entraremos em contato.";
  e.target.reset();
  setTimeout(() => { formMsg.textContent = ""; }, 5000);
});

// ===== ANO NO RODAPÉ =====
document.getElementById("anoAtual").textContent = new Date().getFullYear();

// ===== INICIALIZAÇÃO =====
atualizarCarrinhoUI();
