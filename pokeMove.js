const axios = require('axios');

let pokeName = process.argv[2];
let pokeMove = process.argv[3];

//set array for pokemon in the chain
let pokeEvol = [];

// Check evolution chain url from species json object
axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokeName}/`)
    .then(response => {
        //get pokemon from evolution chain
        axios.get(response.data.evolution_chain.url)
            .then(response => {
                //add first pokemon in chain
                pokeEvol.push(response.data.chain.species.name);
                //add second evolution if it exists
                response.data.chain.evolves_to.forEach(evol => {
                    pokeEvol.push(evol.species.name);
                    //add third evolution
                    evol.evolves_to.forEach(evolv => {
                        pokeEvol.push(evol.species.name);

                    })
                })
                return pokeEvol;
            })
            .then(pokeEvol => {
                let foundCurrentPoke = false;
                let foundMove = false;
                pokeEvol.forEach(pokemon => {
                    //check if you're on the pokemon user searched for, or if you already passed it
                    //and couldn't find the move
                    if (pokemon == pokeName) {
                        foundCurrentPoke = true;
                    }
                    if (!foundCurrentPoke || foundMove) return;
                    axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon}/`)
                        .then(response => {
                            let moves = response.data.moves;
                            moves.forEach(move => {
                                //returns if pokemon move doesn't match, or if move is already found
                                if (pokeMove != move.move.name || foundMove) return;
                                move.version_group_details.forEach(version => {
                                    if (version.level_learned_at == 0 || version.level_learned_at == 1 || foundMove) return;
                                    console.log(`${pokemon} learns ${pokeMove} at level ${version.level_learned_at}`);
                                    foundMove = true;
                                })
                            })
                            //in case no one learns the move
                            if (!foundMove) {
                                console.log(`${pokeName} does not learn ${pokeMove}`);
                            }
                        })
                        .catch(error => console.log(error));
                })
            })
            .catch(error => console.log(error));
    })
    .catch(error => console.log(error));
