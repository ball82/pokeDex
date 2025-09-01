const apiUrl = "https://pokeapi.co/api/v2/pokemon?limit=150&offset=0";
const allPokemon = [];
let currentIndex = 0;
let overlayIndex = 0;

async function initPokedex() {
  await fetchAllPokemon();
  await fetchPokemonDetails();
  renderNextBatch();
  document
    .getElementById("load-more")
    .addEventListener("click", renderNextBatch);
}

async function fetchAllPokemon() {
  showLoading(true);
  const response = await fetch(apiUrl);
  const data = await response.json();
  allPokemon.push(...data.results);
}

async function fetchPokemonDetails() {
  const promises = allPokemon.map((p) =>
    fetch(p.url).then((res) => res.json())
  );
  const results = await Promise.all(promises);
  allPokemon.length = 0;
  allPokemon.push(...results);
  showLoading(false);
}

// --- Render ---
function renderNextBatch() {
  const list = document.querySelector(".pokemon-list");
  const startIndex = currentIndex;
  const slice = allPokemon.slice(startIndex, startIndex + 20);
  const loadBtn = document.getElementById("load-more");
  loadBtn.disabled = true;
  renderBatchCards(slice, startIndex, list);
  currentIndex += 20;
  updateLoadBtn(loadBtn);
}

function renderBatchCards(slice, startIndex, list) {
  slice.forEach((pokemon, index) => {
    const absoluteIndex = startIndex + index;
    const card = createPokemonCard(pokemon, absoluteIndex);
    list.appendChild(card);
  });
}

function createPokemonCard(pokemon, absoluteIndex) {
  const card = document.createElement("div");
  card.className = "pokemon-card";
  card.style.backgroundColor = getPokemonTypeColor(pokemon.types[0].type.name);
  card.innerHTML = pokemonCardTemplate(pokemon);
  card.addEventListener("click", () => openOverlay(absoluteIndex));
  return card;
}

function updateLoadBtn(loadBtn) {
  if (currentIndex >= allPokemon.length) {
    loadBtn.style.display = "none";
  } else {
    loadBtn.disabled = false;
  }
}

function pokemonCardTemplate(pokemon) {
  return `
    <h4>${pokemon.name}</h4>
    <img class="pokemon-image" src="${
      pokemon.sprites.other["official-artwork"].front_default
    }" alt="${pokemon.name}">
    <p>Type: ${pokemon.types.map((t) => t.type.name).join(", ")}</p>
  `;
}

function openOverlay(index) {
  overlayIndex = index;
  const p = allPokemon[index];
  const overlay = document.getElementById("overlay");
  const card = document.getElementById("overlay-card");
  card.innerHTML = overlayCardTemplate(p);
  overlay.classList.remove("d-none");
  document.body.style.overflow = "hidden";
}

function overlayCardTemplate(pokemon) {
  return `
    <h2>${pokemon.name}</h2>
    <img src="${
      pokemon.sprites.other["official-artwork"].front_default
    }" class="overlay-image" alt="${pokemon.name}">
    <p><b>Type:</b> ${pokemon.types.map((t) => t.type.name).join(", ")}</p>
    <p><b>Attack:</b> ${pokemon.stats[1].base_stat}</p>
    <p><b>Defense:</b> ${pokemon.stats[2].base_stat}</p>
  `;
}

function closeOverlay(event) {
  if (event.target.id === "overlay") {
    document.getElementById("overlay").classList.add("d-none");
    document.body.style.overflow = "auto";
  }
}

function prevPokemon(event) {
  event.stopPropagation();
  if (overlayIndex > 0) openOverlay(overlayIndex - 1);
}

function nextPokemon(event) {
  event.stopPropagation();
  if (overlayIndex < allPokemon.length - 1) openOverlay(overlayIndex + 1);
}

function searchPokemon(event) {
  event.preventDefault();
  const query = getSearchQuery();
  if (query.length < 3) return;
  const list = document.querySelector(".pokemon-list");
  list.innerHTML = "";
  const filtered = allPokemon.filter((p) => p.name.includes(query));
  renderFilteredCards(filtered, list);
  hideLoadMoreBtn();
  showOrCreateResetBtn();
}

function getSearchQuery() {
  return document.getElementById("searchInput").value.trim().toLowerCase();
}

function renderFilteredCards(filtered, list) {
  filtered.forEach((p) => {
    const card = createPokemonCard(p, allPokemon.indexOf(p));
    list.appendChild(card);
  });
}

function hideLoadMoreBtn() {
  document.getElementById("load-more").style.display = "none";
}

function showOrCreateResetBtn() {
  let resetBtn = document.getElementById("reset-btn");
  if (!resetBtn) {
    resetBtn = createResetBtn();
    document.querySelector("main").appendChild(resetBtn);
  }
  resetBtn.style.display = "inline-block";
}

function createResetBtn() {
  const btn = document.createElement("button");
  btn.id = "reset-btn";
  btn.className = "btn btn-secondary mt-3";
  btn.textContent = "Back to full list";
  btn.addEventListener("click", resetPokedex);
  return btn;
}

function resetPokedex() {
  const list = document.querySelector(".pokemon-list");
  list.innerHTML = "";
  currentIndex = 0;
  renderNextBatch();
  document.getElementById("load-more").style.display = "inline-block";
  document.getElementById("reset-btn").style.display = "none";
}

function getPokemonTypeColor(type) {
  const colors = {
    fire: "#F08030",
    water: "#6890F0",
    grass: "#78C850",
    electric: "#F8D030",
    psychic: "#F85888",
    ice: "#98D8D8",
    dragon: "#7038F8",
    dark: "#705848",
    normal: "#A8A878",
  };
  return colors[type] || "#A8A878";
}

function showLoading(show) {
  document.getElementById("loading").classList.toggle("d-none", !show);
}
