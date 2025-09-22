const apiUrl = "https://pokeapi.co/api/v2/pokemon?limit=150&offset=0"; // URL der API (liefert die ersten 150 Pokémon)
const allPokemon = [];                                               // Array für alle Pokémon-Daten
let currentIndex = 0;                                                // Index für die aktuell gerenderten Karten
let overlayIndex = 0;    
  const promises = [];                                            // Index für das aktuell angezeigte Pokémon im Overlay

// =====================================================
// initPokedex()
// Hauptstartfunktion der App.
// - Lädt die Grunddaten und Details aller Pokémon
// - Rendert die ersten 20 Karten
// - Aktiviert den "Load More"-Button
// =====================================================
async function initPokedex() {
  await fetchAllPokemon();
  await fetchPokemonDetails();
  renderNextBatch();
  document.getElementById("load-more").addEventListener("click", renderNextBatch);
}

// =====================================================
// fetchAllPokemon()
// Holt die erste Liste mit 150 Pokémon (nur Name + URL)
// von der PokeAPI und speichert sie im Array allPokemon.
// =====================================================
async function fetchAllPokemon() {
  showLoading(true);
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    allPokemon.push(...data.results);
  } catch (error) {
    console.error("Fehler beim Abrufen der Pokémon-Liste:", error);
    alert("Es gab ein Problem beim Laden der Pokémon. Bitte versuchen Sie es später erneut.");
  } finally {
    showLoading(false);
  }
}

// =====================================================
// fetchPokemonDetails()
// Lädt zu jedem Pokémon in allPokemon die vollständigen
// Detaildaten (z. B. Typen, Stats, Bilder).
// Überschreibt das ursprüngliche Array mit diesen Daten.
// =====================================================
async function fetchPokemonDetails(start = 0, count = allPokemon.length, hideLoading = true) {
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

// =====================================================
// buildFetchPromises(start, end)
// Erstellt ein Array von Promises für das Abrufen der
// Pokémon-Details im angegebenen Bereich.
// =====================================================
function buildFetchPromises(start, end) {
  const promises = [];
  for (let i = start; i < end; i++) {
    promises.push(fetch(allPokemon[i].url).then((res) => res.json()));
  }
  return promises;
}

// =====================================================
// updatePokemonData(results, start)
// Aktualisiert die Pokémon-Daten im Array allPokemon
// mit den abgerufenen Details ab dem Startindex.
// =====================================================
function updatePokemonData(results, start) {
  for (let i = 0; i < results.length; i++) {
    allPokemon[start + i] = results[i];
  }
}

// =====================================================
// handleFetchError(error, context)
// Behandelt Fehler beim Abrufen von Daten und zeigt
// eine entsprechende Fehlermeldung an.
// =====================================================
function handleFetchError(error, context) {
  console.error(`Fehler beim Abrufen der ${context}:`, error);
  alert(`Es gab ein Problem beim Laden der ${context}. Bitte versuchen Sie es später erneut.`);
}

// =====================================================
// renderNextBatch()
// Rendert jeweils 20 Pokémon-Karten in die Liste.
// Deaktiviert den Button während des Renderns und
// aktiviert oder versteckt ihn anschließend wieder.
// =====================================================
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

// =====================================================
// renderBatchCards(slice, startIndex, list)
// Rendert ein Set von Karten (z. B. 20 Stück).
// Berechnet für jede Karte den absoluten Index.
// =====================================================
function renderBatchCards(slice, startIndex, list) {
  slice.forEach((pokemon, index) => {
    const absoluteIndex = startIndex + index;
    const card = createPokemonCard(pokemon, absoluteIndex);
    list.appendChild(card);
  });
}

// =====================================================
// createPokemonCard(pokemon, absoluteIndex)
// Erstellt eine einzelne Pokémon-Karte.
// - Hintergrundfarbe je nach Typ
// - Inhalt über Template
// - Klick: öffnet Overlay mit Details
// =====================================================
function createPokemonCard(pokemon, absoluteIndex) {
  const card = document.createElement("div");
  card.className = "pokemon-card";
  card.style.backgroundColor = getPokemonTypeColor(pokemon.types[0].type.name);
  card.innerHTML = pokemonCardTemplate(pokemon);
  card.addEventListener("click", () => openOverlay(absoluteIndex));
  return card;
}

// =====================================================
// updateLoadBtn(loadBtn)
// Steuert, ob der "Load More"-Button noch angezeigt
// oder deaktiviert wird, wenn alle Karten gerendert sind.
// =====================================================
function updateLoadBtn(loadBtn) {
  if (currentIndex >= allPokemon.length) {
    loadBtn.style.display = "none";
  } else {
    loadBtn.disabled = false;
  }
}

// =====================================================
// pokemonCardTemplate(pokemon)
// Gibt das HTML-Template für eine einfache Pokémon-Karte
// zurück (Name, Bild, Typ).
// =====================================================
function pokemonCardTemplate(pokemon) {
  return `
    <h4>${pokemon.name}</h4>
    <p><b>ID:${pokemon.id}</b> </p>
    <img class="pokemon-image" src="${
      pokemon.sprites.other["official-artwork"].front_default
    }" alt="${pokemon.name}">
    <p>Type: ${pokemon.types.map((t) => t.type.name).join(", ")}</p>
  `;
}

// =====================================================
// openOverlay(index)
// Öffnet ein Overlay mit den Detailinfos eines Pokémon.
// - Setzt das aktuelle Pokémon
// - Zeigt die Detailkarte an
// - Verhindert Scrollen im Hintergrund
// =====================================================
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

// =====================================================
// updateOverlayNavButtons()
// Steuert die Overlay-Navigation (Pfeile).
// - Liest Prev/Next Buttons aus dem DOM
// - Deaktiviert sie am Anfang/Ende der Liste
// - Bricht ab, falls die Buttons nicht existieren
// =====================================================
function updateOverlayNavButtons() {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  if (!prevBtn || !nextBtn) return;
  prevBtn.disabled = overlayIndex <= 0;
  nextBtn.disabled = overlayIndex >= allPokemon.length - 1;
}

// =====================================================
// overlayCardTemplate(pokemon)
// Gibt HTML-Template für das Overlay zurück
// (Name, Bild, Typ, Attack, Defense).
// =====================================================
function overlayCardTemplate(pokemon) {
  return `
    <h2>${pokemon.name}</h2>
    <p><b>ID:${pokemon.id}</b> </p>
    <img src="${
      pokemon.sprites.other["official-artwork"].front_default
    }" class="overlay-image" alt="${pokemon.name}">
    <p><b>Type:</b> ${pokemon.types.map((t) => t.type.name).join(", ")}</p>
    <p><b>Attack:</b> ${pokemon.stats[1].base_stat}</p>
    <p><b>Defense:</b> ${pokemon.stats[2].base_stat}</p>
    <p><b>Height:</b> ${pokemon.height / 10} m</p>
    <p><b>Weight:</b> ${pokemon.weight / 10} kg</p>
  `;
}

// =====================================================
// closeOverlay(event)
// Schließt das Overlay, wenn man auf den Hintergrund
// klickt, und aktiviert wieder Scrollen im Body.
// =====================================================
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

// =====================================================
// prevPokemon(event)
// Blättert im Overlay ein Pokémon zurück.
// =====================================================
function prevPokemon(event) {
  event.stopPropagation();
  if (overlayIndex > 0) openOverlay(overlayIndex - 1);
}

// =====================================================
// nextPokemon(event)
// Blättert im Overlay ein Pokémon weiter.
// =====================================================
function nextPokemon(event) {
  event.stopPropagation();
  if (overlayIndex < allPokemon.length - 1) openOverlay(overlayIndex + 1);
}

// =====================================================
// searchPokemon(event)
// Führt eine Suche nach Pokémon-Namen aus.
// - Nur bei >= 3 Zeichen
// - Rendert die gefilterten Ergebnisse
// - Versteckt den Load-Button
// - Zeigt einen Reset-Button
// =====================================================
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

// =====================================================
// getSearchQuery()
// Holt den Text aus dem Suchfeld, entfernt Leerzeichen
// und macht alles klein.
// =====================================================
function getSearchQuery() {
  return document.getElementById("searchInput").value.trim().toLowerCase();
}

// =====================================================
// renderFilteredCards(filtered, list)
// Rendert nur die gefilterten Karten nach der Suche.
// =====================================================
function renderFilteredCards(filtered, list) {
  filtered.forEach((p) => {
    const card = createPokemonCard(p, allPokemon.indexOf(p));
    list.appendChild(card);
  });
}

// =====================================================
// hideLoadMoreBtn()
// Blendet den "Load More"-Button komplett aus.
// =====================================================
function hideLoadMoreBtn() {
  document.getElementById("load-more").style.display = "none";
}

// =====================================================
// showOrCreateResetBtn()
// Erstellt einen "Reset"-Button, falls er noch nicht
// existiert, und zeigt ihn an.
// =====================================================
function showOrCreateResetBtn() {
  let resetBtn = document.getElementById("reset-btn");
  if (!resetBtn) {
    resetBtn = createResetBtn();
    document.querySelector("main").appendChild(resetBtn);
  }
  resetBtn.style.display = "inline-block";
}

// =====================================================
// createResetBtn()
// Erstellt den Button "Back to full list", mit dem die
// Pokedex-Ansicht zurückgesetzt wird.
// =====================================================
function createResetBtn() {
  const btn = document.createElement("button");
  btn.id = "reset-btn";
  btn.className = "btn btn-secondary mt-3";
  btn.textContent = "Back to full list";
  btn.addEventListener("click", resetPokedex);
  return btn;
}

// =====================================================
// resetPokedex()
// Setzt die Ansicht zurück auf die volle Liste.
// - Leert die Liste
// - Startet das Rendering neu
// - Zeigt den Load-Button wieder
// - Versteckt den Reset-Button
// =====================================================
function resetPokedex() {
  const list = document.querySelector(".pokemon-list");
  list.innerHTML = "";
  document.getElementById("searchInput").value = "";
  currentIndex = 0;
  renderNextBatch();
  document.getElementById("load-more").style.display = "inline-block";
  document.getElementById("reset-btn").style.display = "none";
}

// =====================================================
// getPokemonTypeColor(type)
// Gibt eine Hintergrundfarbe je nach Typ des Pokémon
// zurück (z. B. Feuer = Orange).
// =====================================================
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

// =====================================================
// showLoading(show)
// Steuert die Ladeanzeige (ein- oder ausblenden).
// =====================================================
function showLoading(show) {
  document.getElementById("loading").classList.toggle("d-none", !show);
}
