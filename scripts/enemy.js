const PokemonInimigo = () => {
    let chosenPoke = Math.round(Math.random() * 151)+1;

    fetch(`https://pokeapi.co/api/v2/pokemon/${chosenPoke}`)
    .then(resp => { return resp.json() })
    .then(pokemon => {
        document.querySelector('#outraSprite').src = pokemon.sprites.versions["generation-v"]["black-white"].animated.front_default;

        let nature = 1;

        let stats = pokemon.stats;

        let hp = ( ( ( 2 * stats[0].base_stat + iv() + (ev()/4) ) * PokeLv ) / 100 ) + PokeLv + 10;
        let atk = ( ( ( ( 2 * stats[1].base_stat + iv() + (ev()/4) ) * PokeLv ) / 100) + 5 ) * nature;
        let def = ( ( ( ( 2 * stats[2].base_stat + iv() + (ev()/4) ) * PokeLv ) / 100 ) + 5 ) * nature;
        let sp_atk = ( ( ( ( 2 * stats[3].base_stat + iv() + (ev()/4) ) * PokeLv ) / 100 ) + 5 ) * nature;
        let sp_def = ( ( ( ( 2 * stats[4].base_stat + iv() + (ev()/4) ) * PokeLv ) / 100 ) + 5 ) * nature;
        let spe = ( ( ( ( 2 * stats[5].base_stat + iv() + (ev()/4)) * PokeLv ) / 100 ) + 5 ) * nature;

        let types;

        if(pokemon.types.length > 1){
            types = {
                'tipo1':pokemon.types[0].type.name,
                'tipo2':pokemon.types[1].type.name
            }
        }else{
            types = {
                'tipo1':pokemon.types[0].type.name,
                'tipo2':null
            }
        }

        if(otherObjPoke[0].vazio == 'vazio'){
            otherObjPoke = [{
                "name": pokemon.name,
                "lv": PokeLv,
                "stats": {
                    "hp": Math.round(hp),
                    "atk": Math.round(atk),
                    "def": Math.round(def),
                    "sp_atk": Math.round(sp_atk),
                    "sp_def": Math.round(sp_def),
                    "spe": Math.round(spe)
                },
                "type":types
            }]
        }else{
            otherObjPoke.push({
                "name": pokemon.name,
                "lv": 100,
                "stats": {
                    "hp": Math.round(hp),
                    "atk": Math.round(atk),
                    "def": Math.round(def),
                    "sp_atk": Math.round(sp_atk),
                    "sp_def": Math.round(sp_def),
                    "spe": Math.round(spe)
                },
                "type":types
            }) 
        }
        
        //console.log(otherObjPoke);

        choseEnemyMoves(pokemon.moves);

        document.querySelector('.otherPokeName').innerHTML = otherObjPoke[0].name;
        document.querySelector('.otherPokeLv').innerHTML += otherObjPoke[0].lv;

        document.querySelector('#otherHealth').max = hp+11;
        document.querySelector('#otherHealth').value = hp+11;
    })
}

const choseEnemyMoves = (moves) => {
    let rngMove =[];

    for(let i = 0; i < 4; i++){
        rngMove[i] = Math.round(Math.random() * moves.length)+1;
    }

    rngMove.forEach(moove => {
        for(let i = 0; i < 4; i++){
            let nMoove = Math.round(Math.random() * moves.length)+1;
            for(let j = 0; j < rngMove.length; j++){
                if(rngMove[j] == moove && rngMove[j] != nMoove){
                    rngMove[j] = nMoove;
                }else if(rngMove[i] == moove && rngMove[j] == nMoove){
                    nMoove = Math.round(Math.random() * moves.length)+1;
                }
            }
            
        }
    })

    rngMove.forEach(move => {
        fetch(`https://pokeapi.co/api/v2/move/${move}`)
        .then(res => { return res.json() })
        .then(desc => {
            combat.enemy.push(desc)
            //console.log(desc.id);
        })
    })

}

const enemyTurn = (move) => {
    let otherHealth = document.querySelector("#otherHealth");
    let yourHealth = document.querySelector("#yourHealth");

    let damage = 0;
    let self = 0;

    if(move.damage_class.name == 'physical') {
        damage = ( ( ( ( 2*PokeLv/5 +2 ) * move.power * otherObjPoke[0].stats.atk/otherObjPoke[0].stats.def ) / 50 + 2 ) * STAB(move.type.name));
        self = damage*(move.meta.drain)/100
    }else if(move.damage_class.name == 'special'){
        damage = ( ( ( ( 2*PokeLv/5 +2 ) * move.power * otherObjPoke[0].stats.sp_atk/otherObjPoke[0].stats.sp_def ) / 50 + 2 ) * STAB(move.type.name));
        self = damage*(move.meta.drain)/100
    }else{
        console.log('status')
    }
    
    if(move.meta.min_hits == null){
        yourHealth.value = yourHealth.value - Math.round(damage);
        otherHealth.value = otherHealth.value + Math.round(self);
    }else{
        let qtd = (Math.random() * (move.meta.max_hits - move.meta.min_hits)) + move.meta.min_hits;
        console.log(Math.round(qtd));

        let count = 1;

        let interval = setInterval(() => {
            yourHealth.value = yourHealth.value - Math.round(damage);

            if(count == Math.round(qtd)){
                clearInterval(interval);
            }

            count++;
        }, 400);
    }

    if(move.meta.category.name == "ohko"){
        yourHealth.value = yourHealth.value - yourHealth.value;
    }
}