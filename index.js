const MAX_POKEMON_PER_PAGE = 8;
const MAX_POKEMON = 810
let maxPages = Math.ceil(MAX_POKEMON / MAX_POKEMON_PER_PAGE);

let currentPage = 1;

const getPokeInfo = async () => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`);
  const data = await response.json();
  return data.results;
}

const pokemonData = getPokeInfo();

const getPokemonByType = async (type) => {
  const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
  const data = await response.json();
  return data.pokemon;
}

const generateCard = async (pokemon) => {

  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
  const data = await response.json();

  return `
  <div class="pokecard nes-container with-title is-centered">
    <span class="title">${pokemon.name[0].toUpperCase() + pokemon.name.slice(1)}</span>
    <img src="${data.sprites.front_default}" alt="sprite"/>
    <button type="button" class="nes-btn is-primary" onclick="document.getElementById('${pokemon.name}-modal').showModal();">
      Details
    </button>
    <dialog class="nes-dialog" id="${pokemon.name}-modal">
      <form method="dialog">
        <h1 class="title">${pokemon.name[0].toUpperCase() + pokemon.name.slice(1)}</h1>
        <img src="${data.sprites.other['official-artwork'].front_default}" alt="pokemon" />
        <h3>Abilities</h3>
        <ul>
        ${data.abilities.map(ability => `<li>${ability.ability.name[0].toUpperCase() + ability.ability.name.slice(1)}</li>`).join('')}
        </ul>
        <h3>Stats</h3>
        <ul>
        ${data.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>
        <h3>Types</h3>
        <ul>
        ${data.types.map(type => `<li>${type.type.name[0].toUpperCase() + type.type.name.slice(1)}</li>`).join('')}
        </ul>
        <button class="nes-btn is-success">Confirm</button>
      </form>
    </dialog>
  </div>
  `;
}

const displayCards = async () => {
  let pokemonList = await pokemonData;

  const type1 = document.querySelector('#type-1').value;
  const type2 = document.querySelector('#type-2').value;

  if (type1) {
    const type1Pokemon = await getPokemonByType(type1);
    pokemonList = type1Pokemon.map(entry => entry.pokemon);
  }
  if (type2) {
    let type2Pokemon = await getPokemonByType(type2);
    type2Pokemon = type2Pokemon.map(entry => entry.pokemon.name);
    pokemonList = pokemonList.filter(pokemon => type2Pokemon.includes(pokemon.name));
  }

  maxPages = Math.ceil(pokemonList.length / MAX_POKEMON_PER_PAGE);

  document.querySelector('.cards').innerHTML = '';
  const cardList = await Promise.all(pokemonList
    .slice(currentPage * MAX_POKEMON_PER_PAGE - MAX_POKEMON_PER_PAGE, currentPage * MAX_POKEMON_PER_PAGE)
    .map(pokemon => generateCard(pokemon)));
  const cardSection = document.querySelector('.cards');
  cardList.forEach(card => cardSection.innerHTML += card);

  displayShowingStat(pokemonList.length);
}

const displayShowingStat = (totalPokemon) => {
  let showing = 0;

  if (currentPage == maxPages)
    showing = totalPokemon % MAX_POKEMON_PER_PAGE;
  else
    showing = Math.min(8, totalPokemon);
  document.querySelector('.showing-stat').innerHTML =
    `<h3>Showing ${showing} out of ${totalPokemon} Pokémon:`;
}

const displayButtons = () => {
  document.querySelector('.pagination').innerHTML = '';

  const start = Math.max(currentPage - 2, 1);
  const end = Math.min(currentPage + 2, maxPages);

  if (currentPage != 1)
    document.querySelector('.pagination').innerHTML +=
      `<button class="nes-btn" id = "first" onclick = "paginate(1)">First</button>
    <button class="nes-btn" id="prev" onclick="paginate(Math.max(1, --currentPage))">Prev</button>`;

  for (let i = start; i <= end; i++) {
    document.querySelector('.pagination').innerHTML +=
      `<button class="nes-btn ${i == currentPage ? 'is-primary' : ''}" onclick = "paginate(${i})">${i}</button> `;
  }
  if (currentPage != maxPages)
    document.querySelector('.pagination').innerHTML +=
      `<button class="nes-btn" id = "next" onclick = "paginate(Math.min(maxPages, ++currentPage))">Next</button>
    <button class="nes-btn" id="last" onclick="paginate(maxPages)">Last</button>`;
}

const paginate = (toPage) => {
  currentPage = toPage;
  render()
}

const render = async () => {
  await displayCards();
  displayButtons();
}

render();