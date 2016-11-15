//#REFACTOR this into a separate class already!!! DX
var TRAITS = {
    "SPEED": {
        "index": 0,
        "range": 100,
        "offset": 0
    },
    "STRENGTH": {
        "index": 1,
        "range": 100,
        "offset": 0
    },
    "SIZE": {
        "index": 2,
        "range": 20,
        "offset": 1
    },
    "RED": {
        "target": "STRENGTH",
        "range": 256,
        "offset": 0
    },
    "GREEN": {
        "target": "SPEED",
        "range": 256,
        "offset": 0
    },
    "BLUE": {
        "target": "SIZE",
        "range": 256,
        "offset": 0
    }
}

function generateRandomGenome() {

    var genome;
    var trait;

    genome = {
        "sequence": []
    };

    for (trait_name in TRAITS) {

        trait = TRAITS[trait_name];

        if (!isUndefined(trait.index)) {

            genome.sequence[trait.index] = Math.random();

        }

    }

    return genome;

}

function getTraitFromGenome(p_genome, p_trait) {

    var value;

    var sequence = p_genome.sequence;
    var trait = p_trait;

    if (!isUndefined(p_trait.target)) {

        trait = TRAITS[p_trait.target];

    }

    value = sequence[trait.index];

    return (value * p_trait.range) + p_trait.offset | 0;

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

    entity.x = 0;
    entity.y = 0;
    entity.status = 1;

    entity.genome = generateRandomGenome();

    entity.size = getEntitySize(entity);
    entity.color = getEntityColor(entity);
    entity.speed = getEntitySpeed(entity);
    entity.strength = getEntityStrength(entity);

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
        isString(entity.color) && entity.color.length > 0,
        "Entity has a color string.");

    console.assert(
        isInteger(entity.speed) && entity.speed >= 0 && entity.speed < 100,
        "Entity has a speed between 0 (incl) and 100 (exl.)");

    console.assert(
        isInteger(entity.strength) && entity.strength >= 0 && entity.strength < 100,
        "Entity has a strength between 0 (incl) and 100 (exl.)");

    console.assert(
        isInteger(entity.size) && entity.size > 0 && entity.size <= 20,
        "Entity has a size between 1 (incl) and 20 (incl.)");

    console.assert(
        entity.status === 1,
        "Entity is alive.");

}())
