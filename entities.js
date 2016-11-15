
var TRAITS = {
    "RED":      {"index": 0,    "range": 256},
    "GREEN":    {"index": 1,    "range": 256},
    "BLUE":     {"index": 2,    "range": 256},
    "SPEED":    {"index": 3,    "range": 100},
    "STRENGTH": {"index": 4,    "range": 100}
}

function generateRandomGenome() {

    var genome;
    var trait;

    genome = {
        "sequence": []
    };

    for (trait_name in TRAITS) {

        trait = TRAITS[trait_name];

        genome.sequence[trait.index] = Math.random();

    }

    return genome;

}

function getTraitFromGenome(p_genome, p_trait) {

    var sequence = p_genome.sequence;

    var value = sequence[p_trait.index]

    return (value * p_trait.range) | 0;

}

function getEntityColor(p_entity) {

    var red = getTraitFromGenome(p_entity.genome, TRAITS.RED);
    var green = getTraitFromGenome(p_entity.genome, TRAITS.GREEN);
    var blue = getTraitFromGenome(p_entity.genome, TRAITS.BLUE);
    var color = "rgba(" + red + "," + green + "," + blue + ",1)";

    return color;

}

function getEntitySpeed(p_entity) {

    var speed = getTraitFromGenome(p_entity.genome, TRAITS.SPEED);

    return speed;

}

function getEntityStrength(p_entity) {

    var strength = getTraitFromGenome(p_entity.genome, TRAITS.STRENGTH);

}

function createEntity() {

    var entity;

    entity = {};

    entity.genome = generateRandomGenome();

    entity.x = 0;
    entity.y = 0;
    entity.width = 10;
    entity.height = 10;

    entity.color = getEntityColor(entity);
    entity.speed = getEntitySpeed(entity);
    entity.strength = getEntityStrength(entity);

    entity.status = 1;

    return entity;

}

function getEntities(amount) {

    var entities;
    var i = 0;
    var n = amount;

    entities = [];

    for ( i; i < n; i += 1 ) {

        entities[i] = createEntity();

    }

    return entities;

}
