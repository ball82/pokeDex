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


