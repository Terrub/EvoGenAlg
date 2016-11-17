//#REFACTOR this into a separate class already!!! DX
// NOTE: While we're at it. I should probably discern traits from properties or
//  attributes. The RGB values for instances are not traits but properties.
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
    var trait_name;

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

function mutateEntity(p_entity) {

    var trait;
    var trait_name;
    var mutation_offset;

    for (trait_name in TRAITS) {

        trait = TRAITS[trait_name];

        if (!isUndefined(trait.index)) {

            if (Math.round(Math.random()) === 1) {

                mutation_offset = 0.01;

            } else {

                mutation_offset = -0.01;

            }

            new_trait = p_entity.genome.sequence[trait.index] + mutation_offset;

            p_entity.genome.sequence[trait.index] = Math.min(1, new_trait);

        }

    }

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

// NOTE: I should add a trait that lowers or highers these numbers as a quick
//  and temporary fix to jack up the diversity.
function checkForLikableTrait(p_entity, p_target) {

    var higher_str = p_entity.strength() < p_target.strength();
    var higher_spd = p_entity.speed() < p_target.speed();
    var bigger = p_entity.size() < p_target.size();

    return (higher_spd || higher_str || bigger);

}

function calculateEntityFitness(p_entity) {

    return (p_entity.size() + p_entity.strength() + p_entity.speed()) / 3;

}

function canEntityMateTarget(p_entity, p_target) {

    // For now... if the target cannot kill us... we can breed with it.
    return !canEntityKillTarget(p_target, p_entity);

}

// I FEEL DIRTY HAVING WRITTEN THIS!!!! OMG!!!!
function mate(p_entity, p_target) {

    var genome;
    var trait_name;
    var host;

    genome = {
        "sequence": []
    };

    for (trait_name in TRAITS) {

        trait = TRAITS[trait_name];

        if (!isUndefined(trait.index)) {

            if (Math.round(Math.random()) === 1) {

                host = p_entity;

            } else {

                host = p_target;

            }

            genome.sequence[trait.index] = host.genome.sequence[trait.index];

        }

    }

    return createEntity(genome);

}

function canEntityKillTarget(p_entity, p_target) {

    return calculateEntityFitness(p_entity) >= calculateEntityFitness(p_target);

}


function killEntity(p_entity) {

    p_entity.status = 0;

}


function createEntity(p_genome) {

    var entity;
    var size;

    entity = {};

    entity.x = 0;
    entity.y = 0;
    entity.status = 1;

    entity.genome = p_genome;

    entity.size = () => { return getEntitySize(entity) };
    entity.color = () => { return getEntityColor(entity) };
    entity.speed = () => { return getEntitySpeed(entity) };
    entity.strength = () => { return getEntityStrength(entity) };

    return entity;

}

function getEntities(amount) {

    var entities;
    var i = 0;
    var n = amount;
    var genome;

    entities = [];

    for ( i; i < n; i += 1 ) {

        genome = generateRandomGenome();

        entities[i] = createEntity(genome);

    }

    return entities;

}

(function runTests() {

    var genome = generateRandomGenome();
    var entity = createEntity(genome);

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
        isString(entity.color()) && entity.color().length > 0,
        "Entity has a color string.");

    console.assert(
        isInteger(entity.speed()) && entity.speed() >= 0 && entity.speed() < 100,
        "Entity has a speed between 0 (incl) and 100 (exl.)");

    console.assert(
        isInteger(entity.strength()) && entity.strength() >= 0 && entity.strength() < 100,
        "Entity has a strength between 0 (incl) and 100 (exl.)");

    console.assert(
        isInteger(entity.size()) && entity.size() > 0 && entity.size() <= 20,
        "Entity has a size between 1 (incl) and 20 (incl.)");

    console.assert(
        entity.status === 1,
        "Entity is alive.");

}())
