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
                if (response.data.chain.evolves_to.length != 0) {
                    pokeEvol.push(response.data.chain.evolves_to[0].species.name);
                    //add third evolution if it exists
                    if (response.data.chain.evolves_to[0].evolves_to.length != 0) {
                        pokeEvol.push(response.data.chain.evolves_to[0].evolves_to[0].species.name);
                    }
                }
                return pokeEvol;
            })
            .then(pokeEvol => {
                let foundCurrentPoke = false;
                let foundMove = false;
                pokeEvol.forEach(pokeEvol => {
                    //check if you're on the pokemon user searched for, or if you already passed it
                    //and couldn't find the move
                    if (pokeEvol == pokeName || !foundMove) {
                        foundCurrentPoke = true;
                    }
                    if (!foundCurrentPoke) return;
                    axios.get(`https://pokeapi.co/api/v2/pokemon/${pokeEvol}/`)
                        .then(response => {
                            let moves = response.data.moves;
                            moves.forEach(move => {
                                //returns if pokemon move doesn't match, or if move is already found
                                if (pokeMove != move.move.name || foundMove) return;
                                move.version_group_details.forEach(version => {
                                    if (version.level_learned_at == 0 || version.level_learned_at == 1 || foundMove) return;
                                    console.log(`${pokeEvol} learns ${pokeMove} at level ${version.level_learned_at}`);
                                    foundMove = true;
                                })
                            })
                        })
                        .catch(error => console.log(error));
                })
                //in case no one learns the move
                if (!foundMove) {
                    console.log(`${pokeName} does not learn ${pokeMove}`);
                }
            })
            .catch(error => console.log(error));
    })
    .catch(error => console.log(error));
