
function getRedFromGenome(p_entity) {

    var genome = p_entity.genome;

    var red = genome.sequence[0];

    return (red * 256) | 0;

}

function getGreenFromGenome(p_entity) {

    var genome = p_entity.genome;

    var green = genome.sequence[1];

    return (green * 256) | 0;

}

function getBlueFromGenome(p_entity) {

    var genome = p_entity.genome;

    var blue = genome.sequence[2];

    return (blue * 256) | 0;

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

    genome.sequence[0] = Math.random();
    genome.sequence[1] = Math.random();
    genome.sequence[2] = Math.random();

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
