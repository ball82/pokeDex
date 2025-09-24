const apiUrl = "https://pokeapi.co/api/v2/pokemon?limit=150&offset=0";
const allPokemon = [];
let currentIndex = 0;
let overlayIndex = 0;
const promises = [];

async function initPokedex() {
  await fetchAllPokemon();
  await fetchPokemonDetails(0, 20);
  renderNextBatch();
  document
    .getElementById("load-more")
    .addEventListener("click", loadMoreHandler);
}

async function ensureDetailsForRange(start, count) {
  const end = Math.min(start + count, allPokemon.length);
  for (let i = start; i < end; i++) {
    if (!allPokemon[i] || !allPokemon[i].sprites) {
      await fetchPokemonDetails(start, count, false);
      return;
    }
  }
}

async function loadMoreHandler() {
  const nextStart = currentIndex;
  await ensureDetailsForRange(nextStart, 20);
  renderNextBatch();
}

async function fetchAllPokemon() {
  showLoading(true);
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    allPokemon.push(...data.results);
  } catch (error) {
    console.error("Error fetching Pokémon list:", error);
    alert("There was a problem loading the Pokémon. Please try again later.");
  } finally {
    showLoading(false);
  }
}

async function fetchPokemonDetails(
  start = 0,
  count = allPokemon.length,
  hideLoading = true
) {
  const end = Math.min(start + count, allPokemon.length);
  const promises = buildFetchPromises(start, end);
  try {
    const results = await Promise.all(promises);
    updatePokemonData(results, start);
  } catch (error) {
    handleFetchError(error, "Pokémon-Details");
  } finally {
    if (hideLoading) showLoading(false);
  }
}

function buildFetchPromises(start, end) {
  const promises = [];
  for (let i = start; i < end; i++) {
    promises.push(fetch(allPokemon[i].url).then((res) => res.json()));
  }
  return promises;
}

function updatePokemonData(results, start) {
  for (let i = 0; i < results.length; i++) {
    allPokemon[start + i] = results[i];
  }
}

function handleFetchError(error, context) {
  console.error(`Error fetching ${context}:`, error);
  alert(`There was a problem loading the ${context}. Please try again later.`);
}

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
  for (let indexSlice = 0; indexSlice < slice.length; indexSlice++) {
    const absoluteIndex = startIndex + indexSlice;
    const card = createPokemonCard(slice[indexSlice], absoluteIndex);
    list.appendChild(card);
  }
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

function openOverlay(index) {
  overlayIndex = index;
  const p = allPokemon[index];
  const overlay = document.getElementById("overlay");
  const card = document.getElementById("overlay-card");
  card.innerHTML = overlayCardTemplate(p);
  overlay.classList.remove("d-none");
  document.body.style.overflow = "hidden";
  updateOverlayNavButtons();
}

function updateOverlayNavButtons() {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  if (!prevBtn || !nextBtn) return;
  prevBtn.disabled = overlayIndex <= 0;
  nextBtn.disabled = overlayIndex >= allPokemon.length - 1;
}

function closeOverlay(event) {
  if (event.target.id === "overlay") {
    document.getElementById("overlay").classList.add("d-none");
    document.body.style.overflow = "auto";
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) nextBtn.disabled = false;
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
  if (filtered.length === 0) {
    showSearchError(list);
  } else {
    renderFilteredCards(filtered, list);
  }
  hideLoadMoreBtn();
  showOrCreateResetBtn();
}

function getSearchQuery() {
  return document.getElementById("searchInput").value.trim().toLowerCase();
}

function renderFilteredCards(filtered, list) {
  for (let i = 0; i < filtered.length; i++) {
    const p = filtered[i];
    const card = createPokemonCard(p, allPokemon.indexOf(p));
    list.appendChild(card);
  }
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
  document.getElementById("searchInput").value = "";
  currentIndex = 0;
  renderNextBatch();
  document.getElementById("load-more").style.display = "inline-block";
  document.getElementById("reset-btn").style.display = "none";
}

function showLoading(show) {
  document.getElementById("loading").classList.toggle("d-none", !show);
}

function showSearchError(list) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "search-error";
  errorDiv.textContent = "No Pokémon found. Please check your input..";
  list.appendChild(errorDiv);
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