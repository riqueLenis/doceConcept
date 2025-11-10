// ===== Produtos (dados simulados + localStorage) =====
let products = JSON.parse(localStorage.getItem("products")) || [
  {
    id: 1,
    imgs: ["https://via.placeholder.com/300x250/f5f1ef/333333?text=Vestido+Vermelho"],
    title: "Vestido Vermelho",
    desc: "Vestido elegante para ocasiões especiais.",
    size: "M",
    details: "Tecido leve, lavagem delicada.",
    price: 129.99,
  },
  {
    id: 2,
    imgs: ["https://via.placeholder.com/300x250/f5f1ef/333333?text=Blusa+Azul"],
    title: "Blusa Azul",
    desc: "Blusa casual confortável.",
    size: "P",
    details: "Algodão 100%.",
    price: 79.99,
  },
  {
    id: 3,
    imgs: ["https://via.placeholder.com/300x250/f5f1ef/333333?text=Saia+Floral"],
    title: "Saia Floral",
    desc: "Saia florida para o verão.",
    size: "G",
    details: "Estampa exclusiva, não usar alvejante.",
    price: 89.99,
  },
];

// Normalizar produtos legacy (converter img -> imgs)
products = products.map((p) => {
  if (p.img && !p.imgs) {
    p.imgs = [p.img];
    delete p.img;
  }
  return p;
});

let cart = JSON.parse(localStorage.getItem("cart")) || [];
// Atualiza total persistido (usado pela página de pagamentos)
function updateCartPersistence() {
  localStorage.setItem("cart", JSON.stringify(cart));
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  localStorage.setItem("cartTotal", String(total));
}

// ===== Render de produtos =====
function renderProducts() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  grid.innerHTML = "";
  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    const cover = product.imgs && product.imgs.length
      ? product.imgs[0]
      : "https://via.placeholder.com/300x250/f5f1ef/333333?text=Sem+Imagem";
    card.innerHTML = `
      <img src="${cover}" alt="${product.title}" class="product-img" onclick="openProduct(${product.id})" />
      <div class="product-info">
        <h3 class="product-title">${product.title}</h3>
        <p class="product-desc">${product.desc}</p>
        <p class="product-desc"><strong>Tamanho:</strong> ${product.size || '-'} </p>
        <p class="product-price">R$ ${product.price.toFixed(2)}</p>
        <button class="add-to-cart" onclick="addToCart(${product.id})">Adicionar ao Carrinho</button>
      </div>`;
    grid.appendChild(card);
  });
}

// ===== Carrinho =====
function addToCart(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: product.id, title: product.title, price: product.price, quantity: 1 });
  }
  updateCartPersistence();
  showSuccess("Produto adicionado ao carrinho!");
}

function showSuccess(msg) {
  const success = document.getElementById("success-msg");
  if (!success) return;
  success.textContent = msg;
  success.style.display = "block";
  setTimeout(() => (success.style.display = "none"), 3000);
}

function toggleCart() {
  const modal = document.getElementById("cart-modal");
  if (!modal) return;
  modal.style.display = modal.style.display === "flex" ? "none" : "flex";
  renderCart();
}

function renderCart() {
  const items = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if (!items || !totalEl) return;
  items.innerHTML = "";
  let total = 0;
  cart.forEach((item) => {
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.innerHTML = `<span>${item.title} (x${item.quantity})</span><span>R$ ${(item.price * item.quantity).toFixed(2)}</span>`;
    items.appendChild(itemEl);
    total += item.price * item.quantity;
  });
  totalEl.innerHTML = `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
}

function togglePayment() {
  const cartModal = document.getElementById("cart-modal");
  const payModal = document.getElementById("payment-modal");
  if (cartModal) cartModal.style.display = "none";
  if (payModal) payModal.style.display = "flex";
}

// Pagamento (simulado)
const paymentForm = document.getElementById("payment-form");
if (paymentForm) {
  paymentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Pagamento processado com sucesso! Obrigada pela compra.");
    const payModal = document.getElementById("payment-modal");
    if (payModal) payModal.style.display = "none";
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  });
}

// ===== Admin / Login =====
function toggleLogin() {
  const loginModal = document.getElementById("login-modal");
  if (loginModal) loginModal.style.display = "flex";
}

function login() {
  const password = document.getElementById("admin-password").value;
  if (password === "admin123") {
    const loginModal = document.getElementById("login-modal");
    if (loginModal) loginModal.style.display = "none";
    document.getElementById("admin-dashboard").style.display = "block";
    document.getElementById("products").style.display = "none";
    renderAdminProducts();
  } else {
    alert("Senha incorreta!");
  }
}

function logout() {
  document.getElementById("admin-dashboard").style.display = "none";
  document.getElementById("products").style.display = "block";
  renderProducts();
}

const adminForm = document.getElementById("admin-form");
if (adminForm) {
  adminForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const imageFiles = document.getElementById("product-images").files;
    const title = document.getElementById("product-title").value;
    const desc = document.getElementById("product-desc").value;
    const size = document.getElementById("product-size").value;
    const details = document.getElementById("product-details").value;
    const price = parseFloat(document.getElementById("product-price").value);
    // Edição ou criação
    if (window.__editingProductId) {
      const prodIndex = products.findIndex(p => p.id === window.__editingProductId);
      if (prodIndex !== -1) {
        const current = products[prodIndex];
        const finalizeUpdate = (newImgs) => {
          const updated = {
            ...current,
            imgs: newImgs || current.imgs,
            title, desc, size, details, price
          };
          products[prodIndex] = updated;
          localStorage.setItem("products", JSON.stringify(products));
          // Se o produto está no carrinho, atualizar título e preço
          cart = cart.map(item => item.id === updated.id ? { ...item, title: updated.title, price: updated.price } : item);
          updateCartPersistence();
          renderAdminProducts();
          renderProducts();
          adminForm.reset();
          // Sair do modo edição
          window.__editingProductId = null;
          const submitBtn = document.getElementById('admin-submit');
          const cancelBtn = document.getElementById('admin-cancel');
          if (submitBtn) submitBtn.textContent = 'Adicionar Produto';
          if (cancelBtn) cancelBtn.style.display = 'none';
          showSuccess("Produto atualizado!");
        };
        // Se novas imagens foram escolhidas, substitui; caso contrário mantém
        if (imageFiles.length) {
          const readers = Array.from(imageFiles).map(
            (file) =>
              new Promise((resolve) => {
                const r = new FileReader();
                r.onload = (ev) => resolve(ev.target.result);
                r.readAsDataURL(file);
              })
          );
          Promise.all(readers).then((imgs) => finalizeUpdate(imgs));
        } else {
          finalizeUpdate(null);
        }
      }
      return;
    }

    // Criação
    if (!imageFiles.length) return;
    const readers = Array.from(imageFiles).map(
      (file) =>
        new Promise((resolve) => {
          const r = new FileReader();
          r.onload = (ev) => resolve(ev.target.result);
          r.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((imgs) => {
      const newProduct = { id: Date.now(), imgs, title, desc, size, details, price };
      products.push(newProduct);
      localStorage.setItem("products", JSON.stringify(products));
      renderAdminProducts();
      renderProducts();
      adminForm.reset();
      showSuccess("Produto adicionado!");
    });
  });
}

function renderAdminProducts() {
  const grid = document.getElementById("admin-products");
  if (!grid) return;
  grid.innerHTML = "";
  products.forEach((product) => {
    const card = document.createElement("div");
    card.style = "border: 1px solid var(--color-border,#ddd); padding: 1rem; border-radius: 5px;";
    const cover = product.imgs && product.imgs.length
      ? product.imgs[0]
      : "https://via.placeholder.com/100x100/f5f1ef/333333?text=Imagem";
    card.innerHTML = `
      <img src="${cover}" alt="${product.title}" style="width:100px;height:100px;object-fit:cover;border-radius:8px;" />
      <h4>${product.title}</h4>
      <p>${product.desc}</p>
      <p><strong>Tamanho:</strong> ${product.size || '-'} </p>
      <p style="font-size:0.8rem;">${product.details || ''}</p>
      <p>R$ ${product.price}</p>
      <div style="display:flex; gap:.5rem; flex-wrap:wrap;">
        <button onclick="startEditProduct(${product.id})" style="background: var(--color-bg); color: var(--color-text); border:1px solid var(--color-border); padding:0.5rem; border-radius:5px;">Editar</button>
        <button onclick="removeProduct(${product.id})" style="background:#ff4444;color:#fff;border:none;padding:0.5rem;border-radius:5px;">Remover</button>
      </div>`;
    grid.appendChild(card);
  });
}

function removeProduct(id) {
  products = products.filter((p) => p.id !== id);
  localStorage.setItem("products", JSON.stringify(products));
  renderAdminProducts();
  renderProducts();
  // Remover também do carrinho, caso exista
  const before = cart.length;
  cart = cart.filter(item => item.id !== id);
  if (cart.length !== before) {
    updateCartPersistence();
    renderCart();
  }
}

// ===== Utilidades =====
function scrollToProducts() {
  const section = document.getElementById("products");
  if (section) section.scrollIntoView({ behavior: "smooth" });
}

function openWhatsApp() {
  window.open(
    "https://wa.me/5511999999999?text=Olá! Gostaria de mais informações sobre os produtos.",
    "_blank"
  );
}

// Modal de detalhes do produto
function openProduct(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;
  const modal = document.getElementById("product-modal");
  const content = document.getElementById("product-modal-content");
  if (!modal || !content) return;
  const imagesHtml = (product.imgs || [])
    .map(
      (src, i) =>
        `<img src="${src}" alt="${product.title} ${i + 1}" style="width:100%;max-height:300px;object-fit:cover;margin-bottom:0.5rem;border-radius:8px;" />`
    )
    .join("");
  content.innerHTML = `
    <button onclick="closeProduct()" style="background: var(--color-bg); color: var(--color-text); border:1px solid var(--color-border); padding:0.4rem 0.8rem; border-radius:5px; float:right;">Fechar</button>
    <h3 style="margin-top:0;">${product.title}</h3>
    ${imagesHtml}
    <p>${product.desc}</p>
    <p><strong>Tamanho:</strong> ${product.size || '-'}</p>
    <p>${product.details || ''}</p>
    <p style="font-weight:700;">R$ ${product.price.toFixed(2)}</p>
    <button class="add-to-cart" onclick="addToCart(${product.id})">Adicionar ao Carrinho</button>
  `;
  modal.style.display = "flex";
}

function closeProduct() {
  const modal = document.getElementById("product-modal");
  if (modal) modal.style.display = "none";
}

// Inicialização
renderProducts();

// ===== Navegação / Eventos extras =====
// Abrir o carrinho ao clicar no link do menu
const cartNavLink = document.querySelector('a[href="#cart"]');
if (cartNavLink) {
  cartNavLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleCart();
  });
}

// Modo edição: iniciar e cancelar
function startEditProduct(id) {
  const p = products.find(prod => prod.id === id);
  if (!p) return;
  window.__editingProductId = id;
  document.getElementById('product-title').value = p.title || '';
  document.getElementById('product-desc').value = p.desc || '';
  document.getElementById('product-size').value = p.size || '';
  document.getElementById('product-details').value = p.details || '';
  document.getElementById('product-price').value = p.price || 0;
  const submitBtn = document.getElementById('admin-submit');
  const cancelBtn = document.getElementById('admin-cancel');
  if (submitBtn) submitBtn.textContent = 'Salvar Alterações';
  if (cancelBtn) {
    cancelBtn.style.display = 'inline-block';
    cancelBtn.onclick = cancelEdit;
  }
  // Imagem: manter as atuais caso não selecione novas
  const imagesInput = document.getElementById('product-images');
  if (imagesInput) imagesInput.value = '';
  document.getElementById('admin-dashboard').scrollIntoView({behavior:'smooth'});
}

function cancelEdit() {
  window.__editingProductId = null;
  adminForm.reset();
  const submitBtn = document.getElementById('admin-submit');
  const cancelBtn = document.getElementById('admin-cancel');
  if (submitBtn) submitBtn.textContent = 'Adicionar Produto';
  if (cancelBtn) cancelBtn.style.display = 'none';
}

