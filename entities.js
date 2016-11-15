
var TRAITS = {
    "RED":      {"index": 0,    "range": 256},
    "GREEN":    {"index": 1,    "range": 256},
    "BLUE":     {"index": 2,    "range": 256},
}

function getRedFromGenome(p_entity) {

    var genome = p_entity.genome;

    var red = genome.sequence[TRAITS.RED.index];

    return (red * TRAITS.RED.range) | 0;

}

function getGreenFromGenome(p_entity) {

    var genome = p_entity.genome;

    var green = genome.sequence[TRAITS.GREEN.index];

    return (green * TRAITS.GREEN.range) | 0;

}

function getBlueFromGenome(p_entity) {

    var genome = p_entity.genome;

    var blue = genome.sequence[TRAITS.BLUE.index];

    return (blue * TRAITS.BLUE.range) | 0;

}

function generateEntityColor(p_entity) {

    var red = getRedFromGenome(p_entity);
    var green = getGreenFromGenome(p_entity);
    var blue = getBlueFromGenome(p_entity);
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
