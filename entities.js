var TRAITS = {
    "RED":      {"index": 0,    "range": 256},
    "GREEN":    {"index": 1,    "range": 256},
    "BLUE":     {"index": 2,    "range": 256},
    "SPEED":    {"index": 3,    "range": 100},
    "STRENGTH": {"index": 4,    "range": 100},
    "SIZE":     {"index": 5,    "range": 20}
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

function getEntitySize(p_entity) {

    var size = getTraitFromGenome(p_entity.genome, TRAITS.SIZE);

    return size;

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

    return strength;

}

function createEntity() {

    var entity;
    var size;

    entity = {};

    entity.genome = generateRandomGenome();

    entity.x = 0;
    entity.y = 0;

    size = getEntitySize(entity) + 1;

    entity.width = size;
    entity.height = size;

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

(function runTests() {

    var entity = createEntity();
    console.assert(
        isObject(entity.genome),
        "Entity has a genome.");

    console.assert(
        !isUndefined(entity.genome.sequence),
        "Entity genome has a defined sequene.");

    console.assert(
        entity.x === 0,
        "Entity starts at x:0.");

    console.assert(
        entity.y === 0,
        "Entity starts at y:0.");

    console.assert(
        isInteger(entity.width) && entity.width > 0,
        "Entity has a width greater than 0.");

    console.assert(
        isInteger(entity.height) && entity.height > 0,
        "Entity has a height greater than 0.");

    console.assert(
        isString(entity.color) && entity.color.length > 0,
        "Entity has a color string.");

    console.assert(
        isInteger(entity.speed) && entity.speed >= 0 && entity.speed < 100,
        "Entity has a speed between 0 and 100.");

    console.assert(
        isInteger(entity.strength) && entity.strength >= 0 && entity.strength < 100,
        "Entity has a strength between 0 and 100.");

    console.assert(
        entity.status === 1,
        "Entity is alive.");

}())
