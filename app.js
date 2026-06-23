// ===== STATE =====
let currentUser = null;
let currentToolId = null;
let selectedEmoji = '🔧';
let previousPage = 'home';

const PAGES = ['home','catalog','how','detail','newTool','myTools','myRentals'];

// ===== SEED DATA =====
const SEED_TOOLS = [
  { id: 1, name: 'Furadeira de Impacto Bosch', category: 'Perfuração', price: 25, city: 'São Paulo, SP', desc: 'Furadeira de impacto Bosch GSB 13 RE, 650W, com maleta, chave e dois bits. Ótimo estado de conservação.', emoji: '🔩', owner: 'Carlos M.', rating: 4.9, reviews: 32, available: true },
  { id: 2, name: 'Serra Circular DeWalt', category: 'Corte', price: 45, city: 'São Paulo, SP', desc: 'Serra circular DeWalt 7-1/4 pol., 1400W. Inclui disco original e guia paralelo. Perfeita para madeiramentos.', emoji: '🪚', owner: 'Ana R.', rating: 4.8, reviews: 18, available: true },
  { id: 3, name: 'Betoneira 120L', category: 'Construção', price: 80, city: 'Guarulhos, SP', desc: 'Betoneira elétrica 120 litros, monofásica 220V. Ideal para pequenas obras. Requer frete ou retirada local.', emoji: '🏗️', owner: 'Paulo S.', rating: 4.7, reviews: 45, available: true },
  { id: 4, name: 'Compressor de Ar 50L', category: 'Construção', price: 55, city: 'São Paulo, SP', desc: 'Compressor Schulz 50L, 2HP, com mangueira de 15m e pistola de pintura. Pode ser usado para pintura, pneus e limpeza.', emoji: '⚙️', owner: 'João F.', rating: 4.6, reviews: 27, available: false },
  { id: 5, name: 'Lixadeira Orbital Black+Decker', category: 'Pintura', price: 18, city: 'Santo André, SP', desc: 'Lixadeira orbital aleatória 125mm com 6 velocidades. Acompanha 5 lixas de diferentes granas.', emoji: '🎨', owner: 'Mariana T.', rating: 5.0, reviews: 11, available: true },
  { id: 6, name: 'Motosserra 16 pol.', category: 'Jardim', price: 60, city: 'Campinas, SP', desc: 'Motosserra a gasolina 16 polegadas. Ideal para poda de árvores e corte de lenha. Requer EPI adequado.', emoji: '🌿', owner: 'Roberto K.', rating: 4.5, reviews: 23, available: true },
  { id: 7, name: 'Esmerilhadeira Angular 4½"', category: 'Corte', price: 22, city: 'São Paulo, SP', desc: 'Esmerilhadeira angular 4,5 polegadas 720W. Inclui disco de corte e desbaste. Ótima para metal e pedra.', emoji: '🔧', owner: 'Fernanda L.', rating: 4.7, reviews: 15, available: true },
  { id: 8, name: 'Detector de Metais e Tensão', category: 'Elétrica', price: 15, city: 'São Bernardo, SP', desc: 'Detecta metais ocultos e fios energizados nas paredes. Essencial antes de qualquer perfuração. Fácil de usar.', emoji: '⚡', owner: 'Sergio P.', rating: 4.9, reviews: 38, available: true },
];

const SEED_USERS = [
  { email: 'demo@demo.com', password: '123456', name: 'Demo User', city: 'São Paulo, SP' }
];

// ===== STORAGE =====
function getTools() {
  const stored = localStorage.getItem('st_tools');
  return stored ? JSON.parse(stored) : SEED_TOOLS;
}
function saveTools(tools) {
  localStorage.setItem('st_tools', JSON.stringify(tools));
}
function getUsers() {
  const stored = localStorage.getItem('st_users');
  return stored ? JSON.parse(stored) : SEED_USERS;
}
function saveUsers(users) {
  localStorage.setItem('st_users', JSON.stringify(users));
}
function getRentals() {
  const stored = localStorage.getItem('st_rentals');
  return stored ? JSON.parse(stored) : [];
}
function saveRentals(r) {
  localStorage.setItem('st_rentals', JSON.stringify(r));
}

// ===== NAVIGATION =====
function showPage(name, extra) {
  if (name !== 'detail') previousPage = name;
  PAGES.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.toggle('hidden', p !== name);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (name === 'catalog') renderCatalog(extra);
  if (name === 'home') renderFeatured();
  if (name === 'myTools') renderMyTools();
  if (name === 'myRentals') renderMyRentals();
}

function filterCategory(cat) {
  showPage('catalog');
  const sel = document.getElementById('categoryFilter');
  if (sel) sel.value = cat;
  renderCatalog();
}

function searchFromHero() {
  const q = document.getElementById('heroSearch').value.trim();
  showPage('catalog');
  const input = document.getElementById('catalogSearch');
  if (input) input.value = q;
  renderCatalog();
}

// ===== RENDER TOOLS =====
function toolCard(tool, showDelete) {
  const avail = tool.available !== false;
  return `
    <div class="tool-card" onclick="openDetail(${tool.id})">
      <div class="tool-card-img">
        ${tool.emoji}
        <span class="tool-badge ${avail ? '' : 'unavailable'}">${avail ? 'Disponível' : 'Indisponível'}</span>
      </div>
      <div class="tool-card-body">
        <h3>${tool.name}</h3>
        <p class="tool-card-meta">${tool.category} · ${tool.city}</p>
        <p class="tool-owner">👤 ${tool.owner}</p>
        <div class="tool-card-footer">
          <div class="tool-price">R$ ${tool.price}<span>/dia</span></div>
          <div class="tool-rating">⭐ ${tool.rating} (${tool.reviews})</div>
        </div>
        ${showDelete ? `<button class="btn btn-ghost" style="width:100%;margin-top:12px;color:#ef4444;border-color:#ef4444" onclick="event.stopPropagation();deleteTool(${tool.id})">Remover anúncio</button>` : ''}
      </div>
    </div>`;
}

function renderFeatured() {
  const tools = getTools().filter(t => t.available !== false).slice(0, 4);
  document.getElementById('featuredTools').innerHTML = tools.map(t => toolCard(t)).join('');
}

function renderCatalog() {
  const q = (document.getElementById('catalogSearch')?.value || '').toLowerCase();
  const cat = document.getElementById('categoryFilter')?.value || '';
  const sort = document.getElementById('sortFilter')?.value || 'recent';

  let tools = getTools().filter(t => {
    const matchQ = !q || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.city.toLowerCase().includes(q);
    const matchCat = !cat || t.category === cat;
    return matchQ && matchCat;
  });

  if (sort === 'price-asc') tools.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') tools.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') tools.sort((a, b) => b.rating - a.rating);

  const grid = document.getElementById('catalogTools');
  const empty = document.getElementById('emptyState');
  grid.innerHTML = tools.map(t => toolCard(t)).join('');
  empty?.classList.toggle('hidden', tools.length > 0);
}

function renderMyTools() {
  if (!currentUser) return;
  const tools = getTools().filter(t => t.ownerEmail === currentUser.email);
  const grid = document.getElementById('myToolsGrid');
  const empty = document.getElementById('myToolsEmpty');
  grid.innerHTML = tools.map(t => toolCard(t, true)).join('');
  empty?.classList.toggle('hidden', tools.length > 0);
}

function renderMyRentals() {
  if (!currentUser) return;
  const rentals = getRentals().filter(r => r.renterEmail === currentUser.email);
  const tools = getTools();
  const el = document.getElementById('myRentalsContent');
  if (!rentals.length) {
    el.innerHTML = '<p class="empty-state">Você ainda não solicitou nenhum aluguel.</p>';
    return;
  }
  el.innerHTML = rentals.map(r => {
    const tool = tools.find(t => t.id === r.toolId);
    if (!tool) return '';
    const cls = { pending: 'status-pending', approved: 'status-approved', rejected: 'status-rejected' }[r.status] || 'status-pending';
    const label = { pending: '⏳ Aguardando', approved: '✅ Aprovado', rejected: '❌ Recusado' }[r.status] || 'Pendente';
    const days = Math.max(1, Math.round((new Date(r.end) - new Date(r.start)) / 86400000));
    return `<div class="rental-item">
      <div class="rental-emoji">${tool.emoji}</div>
      <div class="rental-info">
        <strong>${tool.name}</strong>
        <p>${r.start} → ${r.end} · ${days} dia(s) · R$ ${days * tool.price}</p>
        <p>${tool.city} · Proprietário: ${tool.owner}</p>
      </div>
      <span class="rental-status ${cls}">${label}</span>
    </div>`;
  }).join('');
}

// ===== DETAIL =====
function openDetail(id) {
  const tools = getTools();
  const tool = tools.find(t => t.id === id);
  if (!tool) return;
  currentToolId = id;

  const avail = tool.available !== false;
  const el = document.getElementById('detailContent');
  el.innerHTML = `
    <button class="back-btn" onclick="showPage('${previousPage}')">← Voltar</button>
    <div class="detail-grid">
      <div>
        <div class="detail-img">${tool.emoji}</div>
        <h1 class="detail-title">${tool.name}</h1>
        <p class="detail-meta">📍 ${tool.city} · 🏷️ ${tool.category}</p>
        <p class="detail-desc">${tool.desc}</p>
        <div class="detail-tags">
          <span class="tag">⭐ ${tool.rating} (${tool.reviews} avaliações)</span>
          <span class="tag">${avail ? '✅ Disponível' : '❌ Indisponível'}</span>
          <span class="tag">📦 ${tool.category}</span>
        </div>
        <div class="owner-card" style="margin-top:28px">
          <div class="owner-avatar">${tool.owner[0]}</div>
          <div class="owner-info">
            <strong>${tool.owner}</strong>
            <span><span class="stars">★★★★★</span> Anfitrião verificado</span>
          </div>
        </div>
      </div>
      <div>
        <div class="rent-card">
          <div class="price">R$ ${tool.price} <span>/ dia</span></div>
          <hr class="rent-card-divider" />
          <p style="font-size:.9rem;color:var(--gray-500);margin-bottom:16px">Solicite o aluguel e combine os detalhes com o proprietário.</p>
          ${avail
            ? `<button class="btn btn-primary w-full" onclick="requestRent(${tool.id})" style="font-size:1rem;padding:14px">Solicitar aluguel</button>`
            : `<button class="btn btn-ghost w-full" disabled style="opacity:.6;cursor:not-allowed">Ferramenta indisponível</button>`}
          <p style="font-size:.78rem;color:var(--gray-500);text-align:center;margin-top:12px">Sem taxas ocultas · Cancele antes da retirada</p>
        </div>
      </div>
    </div>`;
  showPage('detail');
}

// ===== RENT =====
function requestRent(toolId) {
  if (!currentUser) { openModal('login'); return; }
  currentToolId = toolId;
  const tool = getTools().find(t => t.id === toolId);
  document.getElementById('rentModalContent').innerHTML =
    `<strong>${tool.emoji} ${tool.name}</strong> — R$ ${tool.price}/dia`;
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('rentStart').value = today;
  document.getElementById('rentEnd').value = today;
  document.getElementById('rentTotal').classList.add('hidden');
  openModal('rent');
}

function calcTotal() {
  const s = document.getElementById('rentStart').value;
  const e = document.getElementById('rentEnd').value;
  if (!s || !e) return;
  const tool = getTools().find(t => t.id === currentToolId);
  const days = Math.max(1, Math.round((new Date(e) - new Date(s)) / 86400000));
  const total = days * tool.price;
  document.getElementById('rentTotalValue').textContent = `R$ ${total},00`;
  document.getElementById('rentTotal').classList.remove('hidden');
}

function confirmRent(e) {
  e.preventDefault();
  const start = document.getElementById('rentStart').value;
  const end = document.getElementById('rentEnd').value;
  if (new Date(end) < new Date(start)) { showToast('❌ Data de fim deve ser após a data de início.'); return; }
  const rentals = getRentals();
  rentals.push({
    id: Date.now(),
    toolId: currentToolId,
    renterEmail: currentUser.email,
    start, end,
    message: document.getElementById('rentMessage').value,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  saveRentals(rentals);
  closeModal();
  showToast('✅ Solicitação enviada! O proprietário entrará em contato.');
}

// ===== NEW TOOL =====
function selectEmoji(el) {
  document.querySelectorAll('.emoji-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  selectedEmoji = el.textContent;
  document.getElementById('toolEmoji').value = selectedEmoji;
}

function submitTool(e) {
  e.preventDefault();
  const tools = getTools();
  const newTool = {
    id: Date.now(),
    name: document.getElementById('toolName').value,
    category: document.getElementById('toolCategory').value,
    price: Number(document.getElementById('toolPrice').value),
    city: document.getElementById('toolCity').value,
    desc: document.getElementById('toolDesc').value,
    emoji: selectedEmoji,
    owner: currentUser.name,
    ownerEmail: currentUser.email,
    rating: 5.0,
    reviews: 0,
    available: true,
  };
  tools.push(newTool);
  saveTools(tools);
  showToast('🎉 Ferramenta publicada com sucesso!');
  showPage('myTools');
}

function deleteTool(id) {
  if (!confirm('Tem certeza que deseja remover este anúncio?')) return;
  const tools = getTools().filter(t => t.id !== id);
  saveTools(tools);
  renderMyTools();
  showToast('🗑️ Anúncio removido.');
}

// ===== AUTH =====
function doLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.toLowerCase();
  const pass = document.getElementById('loginPass').value;
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === pass);
  if (!user) { showToast('❌ E-mail ou senha incorretos.'); return; }
  currentUser = user;
  closeModal();
  updateNavForUser();
  showToast(`👋 Bem-vindo, ${user.name.split(' ')[0]}!`);
}

function doRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value.toLowerCase();
  const city = document.getElementById('regCity').value;
  const pass = document.getElementById('regPass').value;
  const users = getUsers();
  if (users.find(u => u.email === email)) { showToast('❌ E-mail já cadastrado.'); return; }
  const user = { name, email, city, password: pass };
  users.push(user);
  saveUsers(users);
  currentUser = user;
  closeModal();
  updateNavForUser();
  showToast(`🎉 Conta criada! Bem-vindo(a), ${name.split(' ')[0]}!`);
}

function logout() {
  currentUser = null;
  document.getElementById('navUser').classList.add('hidden');
  document.getElementById('navActions').classList.remove('hidden');
  showPage('home');
  showToast('Até logo!');
}

function updateNavForUser() {
  if (!currentUser) return;
  document.getElementById('navActions').classList.add('hidden');
  document.getElementById('navUser').classList.remove('hidden');
  document.getElementById('userInitial').textContent = currentUser.name[0].toUpperCase();
}

function toggleUserMenu() {
  document.getElementById('userDropdown').classList.toggle('hidden');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.avatar-btn')) {
    document.getElementById('userDropdown')?.classList.add('hidden');
  }
});

// ===== MODALS =====
function openModal(name) {
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
  document.getElementById('modal-' + name)?.classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

// ===== TOAST =====
function showToast(msg, duration = 3500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.add('hidden'), duration);
}

// ===== MOBILE MENU =====
function toggleMenu() {
  const links = document.getElementById('navLinks');
  links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
  links.style.flexDirection = 'column';
  links.style.position = 'absolute';
  links.style.top = '68px';
  links.style.left = '0'; links.style.right = '0';
  links.style.background = 'white';
  links.style.padding = '20px 24px';
  links.style.borderBottom = '1px solid var(--gray-100)';
  links.style.zIndex = '99';
}

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
  document.getElementById('navbar').style.boxShadow =
    window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,0.08)' : 'none';
});

// ===== INIT =====
(function init() {
  if (!localStorage.getItem('st_tools')) saveTools(SEED_TOOLS);
  if (!localStorage.getItem('st_users')) saveUsers(SEED_USERS);
  renderFeatured();
  // Set min date for rent inputs
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('rentStart')?.setAttribute('min', today);
  document.getElementById('rentEnd')?.setAttribute('min', today);
})();
