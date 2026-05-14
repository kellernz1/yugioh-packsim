const API_URL = "https://db.ygoprodeck.com/api/v7/cardinfo.php";
const PACK_SIZE = 9;
const COLLECTION_KEY = "millennium-pack-collection";
const WALLET_KEY = "millennium-pack-wallet";
const AUDIO_MUTED_KEY = "millennium-pack-audio-muted";

const boosterTypes = {
  starter: {
    name: "Starter Pack",
    title: "Millennium",
    price: 0,
    odds: { "Super Rare": 70, "Ultra Rare": 25, "Secret Rare": 5 },
    slots: { common: 7, rare: 1 },
  },
  gold: {
    name: "Gold Sarcophagus",
    title: "Premium",
    price: 12,
    odds: { "Super Rare": 55, "Ultra Rare": 35, "Secret Rare": 10 },
    slots: { common: 6, rare: 2 },
  },
  pharaoh: {
    name: "Pharaoh's Vault",
    title: "Secret",
    price: 30,
    odds: { "Super Rare": 40, "Ultra Rare": 42, "Secret Rare": 18 },
    slots: { common: 5, rare: 3 },
  },
};

const saleMultipliers = {
  Common: 0.65,
  Rare: 1,
  "Super Rare": 1.8,
  "Ultra Rare": 3,
  "Secret Rare": 5.5,
};

const state = {
  cards: [],
  collection: readCollection(),
  wallet: readWallet(),
  isMuted: readMuted(),
  selectedBooster: "starter",
  isOpening: false,
};

const els = {
  pack: document.querySelector("#pack"),
  packTitle: document.querySelector("#pack-title"),
  packEdition: document.querySelector("#pack-edition"),
  fan: document.querySelector("#card-fan"),
  openButton: document.querySelector("#open-button"),
  resetButton: document.querySelector("#reset-button"),
  muteButton: document.querySelector("#mute-button"),
  sellCommonsButton: document.querySelector("#sell-commons-button"),
  shop: document.querySelector("#booster-shop"),
  status: document.querySelector("#status"),
  featured: document.querySelector("#featured-card"),
  shareLink: document.querySelector("#share-link"),
  album: document.querySelector("#album-grid"),
  count: document.querySelector("#collection-count"),
  value: document.querySelector("#collection-value"),
  wallet: document.querySelector("#wallet-balance"),
};

init();

async function init() {
  bindEvents();
  renderShop();
  renderEconomy();
  renderCollection();
  renderAudioState();
  updateSelectedBooster();

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Falha ao buscar cartas");

    const payload = await response.json();
    state.cards = normalizeCards(payload.data);
    els.status.textContent = `${state.cards.length.toLocaleString("pt-BR")} cartas carregadas. O duelo pode comecar.`;
    els.openButton.disabled = false;
  } catch (error) {
    els.status.textContent = "Nao consegui carregar a API agora. Usando cartas demo para manter o ritual.";
    state.cards = fallbackCards();
    els.openButton.disabled = false;
  }
}

function bindEvents() {
  els.openButton.disabled = true;
  els.openButton.addEventListener("click", handleOpenPack);
  els.pack.addEventListener("click", handleOpenPack);
  els.pack.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenPack();
    }
  });
  els.resetButton.addEventListener("click", () => {
    state.collection = [];
    state.wallet = 0;
    localStorage.removeItem(COLLECTION_KEY);
    localStorage.removeItem(WALLET_KEY);
    renderEconomy();
    renderCollection();
    els.status.textContent = "Colecao e saldo limpos. Hora de tentar a sorte outra vez.";
  });
  els.muteButton.addEventListener("click", () => {
    state.isMuted = !state.isMuted;
    localStorage.setItem(AUDIO_MUTED_KEY, String(state.isMuted));
    renderAudioState();
  });
  els.sellCommonsButton.addEventListener("click", sellCommons);
  els.shop.addEventListener("click", (event) => {
    const button = event.target.closest("[data-booster]");
    if (!button) return;
    state.selectedBooster = button.dataset.booster;
    updateSelectedBooster();
    renderShop();
  });
  els.album.addEventListener("click", (event) => {
    const button = event.target.closest("[data-sell-card]");
    if (!button) return;
    sellCard(button.dataset.sellCard);
  });
  els.featured.addEventListener("mousemove", handleFoilMove);
  els.featured.addEventListener("mouseleave", () => {
    els.featured.style.transform = "rotateX(0deg) rotateY(0deg)";
    els.featured.style.setProperty("--x", "50%");
    els.featured.style.setProperty("--y", "50%");
  });
}

function normalizeCards(cards) {
  return cards
    .filter((card) => card.card_images?.[0]?.image_url && card.name)
    .map((card) => ({
      id: card.id,
      name: card.name,
      image: card.card_images[0].image_url,
      type: card.type,
      price: Number(card.card_prices?.[0]?.cardmarket_price || 0),
    }));
}

function openPack(cards, booster = boosterTypes.starter) {
  const commonPool = cards.filter((card) => !isExtraDeck(card));
  const rarePool = cards.filter((card) => card.type.includes("Effect") || card.type.includes("Spell"));
  const shinyRarity = weightedRarity(booster.odds);

  return [
    ...drawMany(commonPool, booster.slots.common, "Common"),
    ...drawMany(rarePool, booster.slots.rare, "Rare"),
    { ...drawOne(cards), rarity: shinyRarity },
  ].slice(0, PACK_SIZE);
}

function weightedRarity(odds) {
  const roll = Math.random() * 100;
  if (roll < odds["Super Rare"]) return "Super Rare";
  if (roll < odds["Super Rare"] + odds["Ultra Rare"]) return "Ultra Rare";
  return "Secret Rare";
}

function drawMany(pool, count, rarity) {
  return Array.from({ length: count }, () => ({ ...drawOne(pool), rarity }));
}

function drawOne(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function isExtraDeck(card) {
  return /Fusion|Synchro|Xyz|Link/i.test(card.type);
}

function handleOpenPack() {
  if (state.isOpening || state.cards.length === 0) return;

  const booster = boosterTypes[state.selectedBooster];
  if (state.wallet < booster.price) {
    els.status.textContent = `Saldo insuficiente para ${booster.name}. Venda cartas ou abra o Starter Pack.`;
    return;
  }

  state.wallet -= booster.price;
  saveWallet();
  renderEconomy();

  state.isOpening = true;
  els.openButton.disabled = true;
  els.shareLink.classList.add("hidden");
  els.fan.innerHTML = "";
  els.pack.classList.remove("opened");
  void els.pack.offsetWidth;

  playRitualSound();
  const pack = openPack(state.cards, booster);
  els.status.textContent = `${booster.name} rasga... a ultima carta esta brilhando.`;
  els.pack.classList.add("opened");

  window.setTimeout(() => {
    renderPack(pack);
    const chase = pack[PACK_SIZE - 1];
    renderFeatured(chase);
    savePull(pack);
    els.status.textContent = `Pull final: ${chase.name} (${chase.rarity}).`;
    state.isOpening = false;
    els.openButton.disabled = false;
  }, 720);
}

function renderPack(pack) {
  const angles = [-32, -23, -14, -5, 4, 13, 22, 31, 40];
  const lifts = [36, 16, 3, -8, -14, -8, 3, 16, 36];

  pack.forEach((card, index) => {
    const node = document.createElement("button");
    node.className = `pack-card ${rarityClass(card.rarity)}`;
    node.style.setProperty("--angle", `${angles[index]}deg`);
    node.style.setProperty("--lift", `${lifts[index]}px`);
    node.style.setProperty("--delay", `${index * 70}ms`);
    node.type = "button";
    node.innerHTML = `
      <img src="${card.image}" alt="${escapeHtml(card.name)}" loading="lazy">
      <span class="rarity-tag">${card.rarity}</span>
    `;
    node.addEventListener("click", () => renderFeatured(card));
    els.fan.appendChild(node);
  });
}

function renderFeatured(card) {
  els.featured.className = `featured-card ${rarityClass(card.rarity)}`;
  els.featured.innerHTML = `<img src="${card.image}" alt="${escapeHtml(card.name)}">`;

  if (card.rarity === "Ultra Rare" || card.rarity === "Secret Rare") {
    const text = encodeURIComponent(`Tirei ${card.name} (${card.rarity}) no Millennium Pack Sim!`);
    els.shareLink.href = `https://twitter.com/intent/tweet?text=${text}`;
    els.shareLink.classList.remove("hidden");
  } else {
    els.shareLink.classList.add("hidden");
  }
}

function handleFoilMove(event) {
  if (els.featured.classList.contains("empty")) return;

  const rect = els.featured.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  const rotateY = (x - 50) / 5.5;
  const rotateX = (50 - y) / 6.5;

  els.featured.style.setProperty("--x", `${x}%`);
  els.featured.style.setProperty("--y", `${y}%`);
  els.featured.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

function savePull(pack) {
  const stamped = pack.map((card) => {
    const cardPrice = Number(card.price || 0);
    return {
      uid: `${card.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      id: card.id,
      name: card.name,
      image: card.image,
      rarity: card.rarity,
      price: cardPrice,
      saleValue: getSaleValue(card.rarity, cardPrice),
    };
  });

  state.collection = [...stamped, ...state.collection].slice(0, 180);
  saveCollection();
  renderEconomy();
  renderCollection();
}

function sellCard(uid) {
  const card = state.collection.find((item) => item.uid === uid || item.id === uid);
  if (!card) return;

  state.collection = state.collection.filter((item) => item !== card);
  state.wallet += getSaleValue(card.rarity, card.price);
  saveCollection();
  saveWallet();
  renderEconomy();
  renderCollection();
  els.status.textContent = `${card.name} vendida por ${formatMoney(getSaleValue(card.rarity, card.price))}.`;
}

function sellCommons() {
  const commons = state.collection.filter((card) => card.rarity === "Common");
  if (commons.length === 0) {
    els.status.textContent = "Voce nao tem cartas comuns para vender agora.";
    return;
  }

  const payout = commons.reduce((sum, card) => sum + getSaleValue(card.rarity, card.price), 0);
  state.collection = state.collection.filter((card) => card.rarity !== "Common");
  state.wallet += payout;
  saveCollection();
  saveWallet();
  renderEconomy();
  renderCollection();
  els.status.textContent = `${commons.length} comuns vendidas por ${formatMoney(payout)}.`;
}

function getSaleValue(rarity, price) {
  const base = Number(price || 0);
  const minimums = {
    Common: 0.25,
    Rare: 0.75,
    "Super Rare": 2.25,
    "Ultra Rare": 6,
    "Secret Rare": 14,
  };
  return Math.max(minimums[rarity] || 0.25, base * (saleMultipliers[rarity] || 1));
}

function readCollection() {
  try {
    return (JSON.parse(localStorage.getItem(COLLECTION_KEY)) || []).map((card) => ({
      ...card,
      uid: card.uid || `${card.id}-${Math.random().toString(36).slice(2)}`,
      saleValue: card.saleValue || getSaleValue(card.rarity, card.price),
    }));
  } catch {
    return [];
  }
}

function readWallet() {
  return Number(localStorage.getItem(WALLET_KEY) || 0);
}

function readMuted() {
  return localStorage.getItem(AUDIO_MUTED_KEY) === "true";
}

function saveCollection() {
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(state.collection));
}

function saveWallet() {
  localStorage.setItem(WALLET_KEY, String(state.wallet));
}

function renderEconomy() {
  const totalValue = state.collection.reduce((sum, card) => sum + getSaleValue(card.rarity, card.price), 0);
  els.count.textContent = `${state.collection.length} carta${state.collection.length === 1 ? "" : "s"}`;
  els.value.textContent = formatMoney(totalValue);
  els.wallet.textContent = formatMoney(state.wallet);
  renderShop();
}

function renderShop() {
  els.shop.innerHTML = Object.entries(boosterTypes)
    .map(([key, booster]) => {
      const selected = key === state.selectedBooster ? "selected" : "";
      const affordable = state.wallet >= booster.price ? "" : "locked";
      const price = booster.price === 0 ? "Gratis" : formatMoney(booster.price);
      return `
        <button class="booster-option ${selected} ${affordable}" type="button" data-booster="${key}">
          <span>${booster.name}</span>
          <strong>${price}</strong>
          <small>Secret ${booster.odds["Secret Rare"]}%</small>
        </button>
      `;
    })
    .join("");
}

function updateSelectedBooster() {
  const booster = boosterTypes[state.selectedBooster];
  els.packTitle.textContent = booster.title;
  els.packEdition.textContent = booster.name;
  els.openButton.textContent = booster.price === 0 ? "Abrir booster" : `Comprar e abrir ${formatMoney(booster.price)}`;
  els.status.textContent = `${booster.name} selecionado. Secret Rare: ${booster.odds["Secret Rare"]}%.`;
}

function renderAudioState() {
  els.muteButton.textContent = state.isMuted ? "OFF" : "ON";
  els.muteButton.classList.toggle("muted", state.isMuted);
  els.muteButton.setAttribute("aria-pressed", String(state.isMuted));
  els.muteButton.title = state.isMuted ? "Ativar audio" : "Mutar audio";
}

function renderCollection() {
  if (state.collection.length === 0) {
    els.album.innerHTML = `<p class="empty-album">Abra seu primeiro booster para comecar o album.</p>`;
    return;
  }

  els.album.innerHTML = state.collection
    .map(
      (card) => `
        <article class="album-card ${rarityClass(card.rarity)}" title="${escapeHtml(card.name)}">
          <img src="${card.image}" alt="${escapeHtml(card.name)}" loading="lazy">
          <span class="rarity-tag">${card.rarity} - ${formatMoney(getSaleValue(card.rarity, card.price))}</span>
          <button class="sell-card-button" type="button" data-sell-card="${card.uid}">
            Vender
          </button>
        </article>
      `,
    )
    .join("");
}

function playRitualSound() {
  if (state.isMuted) return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.55, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  for (let i = 0; i < output.length; i += 1) {
    output[i] = (Math.random() * 2 - 1) * (1 - i / output.length);
  }

  const noise = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  const suspense = ctx.createOscillator();
  const suspenseGain = ctx.createGain();

  noise.buffer = noiseBuffer;
  filter.type = "highpass";
  filter.frequency.value = 1200;
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.36, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

  suspense.type = "triangle";
  suspense.frequency.setValueAtTime(150, ctx.currentTime);
  suspense.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.82);
  suspenseGain.gain.setValueAtTime(0.001, ctx.currentTime);
  suspenseGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.25);
  suspenseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.95);

  noise.connect(filter).connect(gain).connect(ctx.destination);
  suspense.connect(suspenseGain).connect(ctx.destination);
  noise.start();
  suspense.start();
  noise.stop(ctx.currentTime + 0.56);
  suspense.stop(ctx.currentTime + 1);
}

function rarityClass(rarity) {
  return rarity.toLowerCase().replace(/\s+/g, "-");
}

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[char];
  });
}

function fallbackCards() {
  return [
    ["Dark Magician", "Normal Monster"],
    ["Blue-Eyes White Dragon", "Normal Monster"],
    ["Red-Eyes Black Dragon", "Normal Monster"],
    ["Kuriboh", "Effect Monster"],
    ["Monster Reborn", "Spell Card"],
    ["Mirror Force", "Trap Card"],
    ["Summoned Skull", "Normal Monster"],
    ["Change of Heart", "Spell Card"],
    ["Exodia the Forbidden One", "Effect Monster"],
  ].map(([name, type], index) => ({
    id: index + 1,
    name,
    type,
    price: 1 + index * 0.75,
    image: `https://images.ygoprodeck.com/images/cards/${["46986414", "89631139", "74677422", "40640057", "83764718", "44095762", "70781052", "04031928", "33396948"][index]}.jpg`,
  }));
}
