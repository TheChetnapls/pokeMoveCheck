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
                console.log(pokeEvol);
                return pokeEvol;
            })
            .catch(error => console.log(error))
        console.log(pokeEvol);
        return pokeEvol;
    })
    .then(pokeEvol => {
        for (let i = 0; i < pokeEvol.length; i++) {
            axios.get(`https://pokeapi.co/api/v2/pokemon/${pokeEvol[i]}/`)
                .then(response => {
                    console.log(pokeEvol);

                    let moves = response.data.moves;
                    //check all moves to see if pokeMove can be learned
                    for (let i = 0; i < moves.length; i++) {
                        //check to see if it learns it by leveling
                        let moveLevel = moves[i].version_group_details[0].level_learned_at;
                        if (pokeMove == moves[i].move.name && moveLevel > 0) {
                            if (pokeName == pokeEvol[i]) {
                                console.log(`${pokeName} learns ${pokeMove} at level ${moveLevel}.`);
                            } else if (pokeName == pokeEvol[0] && pokeEvol[i] == pokeEvol[1]) {
                                console.log(`${pokeName}'s next evolution, ${pokeEvol[i]} can learn ${pokeMove} at level ${moveLevel}.`);
                            } else if (pokeName == pokeEvol[0] && pokeEvol[i] == pokeEvol[2]) {
                                console.log(`${pokeName}'s last evolution, ${pokeEvol[i]} can learn ${pokeMove} at level ${moveLevel}.`);
                            } else if (pokeName == pokeEvol[1] && pokeEvol[i] == pokeEvol[0]) {
                                console.log(`${pokeName}'s previous evolution, ${pokeEvol[i]} can learn ${pokeMove} at level ${moveLevel}.`);
                            } else if (pokeName == pokeEvol[1] && pokeEvol[i] == pokeEvol[2]) {
                                console.log(`${pokeName}'s next evolution, ${pokeEvol[i]} can learn ${pokeMove} at level ${moveLevel}.`);
                            } else if (pokeName == pokeEvol[2] && pokeEvol[i] == pokeEvol[0]) {
                                console.log(`${pokeName}'s starting evolution, ${pokeEvol[i]} can learn ${pokeMove} at level ${moveLevel}.`);
                            } else if (pokeName == pokeEvol[2] && pokeEvol[i] == pokeEvol[1]) {
                                console.log(`${pokeName}'s previous evolution, ${pokeEvol[i]} can learn ${pokeMove} at level ${moveLevel}.`);
                            }
                        }
                    }
                })
        }
    })
    .catch(error => console.log(error))
