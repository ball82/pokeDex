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