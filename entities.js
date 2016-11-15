
var TRAITS = {
    "RED":      {"index": 0,    "range": 256},
    "GREEN":    {"index": 1,    "range": 256},
    "BLUE":     {"index": 2,    "range": 256},
}

function getTraitFromGenome(p_genome, p_trait) {

    var sequence = p_genome.sequence;

    var value = sequence[p_trait.index]

    return (value * p_trait.range) | 0;

}

function generateEntityColor(p_entity) {

    var red = getTraitFromGenome(p_entity.genome, TRAITS.RED);
    var green = getTraitFromGenome(p_entity.genome, TRAITS.GREEN);
    var blue = getTraitFromGenome(p_entity.genome, TRAITS.BLUE);
    var color = "rgba(" + red + "," + green + "," + blue + ",1)";

    return color;

}

function generateRandomGenome() {

    var genome;

    genome = {
        "sequence": []
    };

    genome.sequence[TRAITS.RED.index] = Math.random();
    genome.sequence[TRAITS.GREEN.index] = Math.random();
    genome.sequence[TRAITS.BLUE.index] = Math.random();

    return genome;

}

function createEntity() {

    var entity;

    entity = {};

    entity.genome = generateRandomGenome();

    entity.x = 0;
    entity.y = 0;
    entity.width = 10;
    entity.height = 10;

    entity.color = generateEntityColor(entity);

    entity.speed = generateRandomNumber(0, 10) * 0.2;

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
