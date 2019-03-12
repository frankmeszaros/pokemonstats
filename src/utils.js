const Pokedex = require('pokedex-promise-v2');
const P = new Pokedex();

const getPokemon = region => P.getPokedexByName(region);
const getPokemonDetails = name => P.getPokemonByName(name);
const getPokemonColor = name => P.getPokemonSpeciesByName(name);
const getFontColor = typeName => {
	if (typeName === 'flying' || typeName === 'normal') {
		return 'black';
	}

	if (typeName === 'ice') {
		return '#3D7DCA';
	}

	return 'white';
};

const getBackgroundColor = pokeColor => {
	console.log(pokeColor);
	switch (pokeColor) {
		case 'red':
			return 'rgba(255, 0, 0, 0.2)';
		case 'blue':
			return 'rgba(0, 0, 255, 0.2)';
		case 'green':
			return 'rgba(0, 255, 0, 0.2)';
		case 'brown':
			return 'rgba(117, 81, 55, 0.2)';
		case 'white':
			return 'rgba(222, 222, 222, 0.2)';
		case 'yellow':
			return 'rgba(242,239,106,0.2)';
		case 'purple':
			return 'rgba(179, 82, 206, 0.2)';
		case 'pink':
			return 'rgba(247, 219, 256, 0.2)';

		case 'black':
			return 'rgba(0, 0, 0, 0.2)';
		default:
			return 'rgba(200, 200, 200, 0.2)';
	}
};

const getBorderColor = pokeColor => {
	switch (pokeColor) {
		case 'red':
			return 'rgba(255, 0, 0, 0.8)';
		case 'blue':
			return 'rgba(0, 0, 255, 0.8)';
		case 'green':
			return 'rgba(0, 255, 0, 0.8)';
		case 'brown':
			return 'rgba(117, 81, 55, 0.8)';
		case 'white':
			return 'rgba(222, 222, 222, 0.8)';
		case 'yellow':
			return 'rgba(242,239,106,0.8)';
		case 'purple':
			return 'rgba(179, 82, 206, 0.2)';
		case 'pink':
			return 'rgba(247, 219, 256, 0.8)';
		case 'black':
			return 'rgba(0, 0, 0, 0.8)';
		default:
			return 'rgba(200, 200, 200, 0.8)';
	}
};

module.exports = { getPokemon, getBackgroundColor, getBorderColor, getPokemonColor, getFontColor, getPokemonDetails };
