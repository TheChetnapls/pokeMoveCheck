const axios = require('axios');

let Name = process.argv[2];
let Move = process.argv[3];
let pokeEvol = [];

let moveCheck = async (pokeName, pokeMove) => {
    // Check evolution chain url from species json object
    let pokeChain = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokeName}/`);
    let evolvResponse = await axios.get(pokeChain.data.evolution_chain.url);
    pokeEvol.push(evolvResponse.data.chain.species.name);
    //add second evolution if it exists
    evolvResponse.data.chain.evolves_to.forEach(evol => {
        pokeEvol.push(evol.species.name);
        //add third evolution
        evol.evolves_to.forEach(evolv => {
            pokeEvol.push(evolv.species.name);
        })
    })
    let foundCurrentPoke = false;
    let foundMove = false;
    //nested functions have to be async
    pokeEvol.forEach(async pokemon => {
        //check if you're on the pokemon user searched for, or if you already passed it
        //and couldn't find the move
        if (pokemon == pokeName) {
            foundCurrentPoke = true;
        }
        if (!foundCurrentPoke || foundMove) return;
        let pokeResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon}/`);
        let moves = await pokeResponse.data.moves;
        moves.forEach(move => {
            //returns if pokemon move doesn't match, or if move is already found
            if (pokeMove != move.move.name || foundMove) return;
            move.version_group_details.forEach(version => {
                if (version.level_learned_at == 0 || version.level_learned_at == 1 || foundMove) return;
                console.log(`${pokemon} learns ${pokeMove} at level ${version.level_learned_at}`);
                foundMove = true;
            })
        })
        //in case pokemon can't learn the move
        if (!foundMove) {
            console.log(`${pokemon} does not learn ${pokeMove}`);
        }
    })
}

moveCheck(Name, Move);