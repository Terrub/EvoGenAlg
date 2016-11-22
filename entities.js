"use strict";

//#REFACTOR this into a separate class already!!! DX
// NOTE: While we're at it. I should probably discern traits from properties or
//  attributes. The RGB values for instance are not traits but properties.
var TRAITS = {
    "speed": true,
    "strength": true,
    "vitality": true,
    "size": true,
    "red": true,
    "green": true,
    "blue": true
};

function generateRandomSequence(p_traits) {

    var trait_name;

    var i = 0;
    var sequence = [];

    for (trait_name in p_traits) {

        sequence[i] = Math.random();

        i += 1;

    }

    return sequence;

}

function generateRandomGenome() {

    var genome;

    genome = {
        "sequence": generateRandomSequence(TRAITS)
    };

    return genome;

}

function mutateEntity(p_entity) {

    var trait;
    var trait_name;
    var mutation_offset;
    var new_trait;

    for (trait_name in TRAITS) {

        if (Math.round(Math.random() + 0.2) > 1) {

            if (Math.round(Math.random()) === 1) {

                mutation_offset = 0.01;

            } else {

                mutation_offset = -0.01;

            }

            p_entity[trait_name] += mutation_offset;

        }

    }

}

function getEntityColor(p_entity) {

    var red = p_entity.red * 256 | 0;
    var green = p_entity.green * 256 | 0;
    var blue = p_entity.blue * 256 | 0;

    return "rgba(" + red + "," + green + "," + blue + ",1)";

}

// NOTE: I should add a trait that lowers or highers these numbers as a quick
//  and temporary fix to jack up the diversity.
function checkForLikableTrait(p_entity, p_target) {

    var max = Math.max;

    var d_str = max(0, p_target.strength - p_entity.strength);
    var d_spd = max(0, p_target.speed - p_entity.speed);
    var d_size = max(0, p_target.size - p_entity.size);

    var total = d_str + d_spd + d_size;

    return total > 0;

}

function checkForHostility(p_entity, p_target) {

    var d_str = (p_target.strength - p_entity.strength);
    var d_spd = (p_target.speed - p_entity.speed);
    var d_size = (p_target.size - p_entity.size);

    var total = d_str + d_spd + d_size;

    return total < 0;

}

function isEntityAlive(p_entity) {

    return (p_entity.vitality > 0);

}

function isEntityBusy(p_entity) {

    return (p_entity.cooldown_counter > 0);

}

function combineParentSequences(p_entity, p_target) {

    var trait_name;
    var left;
    var right;
    var trait;

    var sequence = [];
    var i = 0;

    for (trait_name in TRAITS) {

        left = p_entity[trait_name];
        right = p_target[trait_name];

        if (Math.round(Math.random()) === 1) {

            trait = left;

        } else {

            trait = right;

        }

        sequence[i] = trait;

        i += 1;

    }

    return sequence;

}

function spawnOffspringWithTarget(p_entity, p_target) {

    var genome;
    var trait;
    var trait_name;
    var host;

    genome = {
        "sequence": combineParentSequences(p_entity, p_target)
    };

    return createEntity(genome);

}

function updateCounters(p_entity) {

    var max = Math.max;
    var proposed_cooldown = p_entity.cooldown_counter - p_entity.speed;

    p_entity.cooldown_counter = max(0, proposed_cooldown);

}

function getEntityActionForTouchingTarget(p_entity, p_target) {

    var action;

    if (checkForLikableTrait(p_entity, p_target)) {

        action = "mate";

    } else if (checkForHostility(p_entity, p_target)) {

        action = "kill";

    } else {

        action = "move";

    }

    return action;

}

function attackEntity(p_entity, p_target) {

    var vit = p_target.vitality;
    var str = p_entity.strength;

    var adjusted_vit = Math.max(0, Math.min(1, (vit - str)));

    p_target.vit = adjusted_vit;

}

//#TODO: Refactor entity traits into object getters instead.
function createEntity(p_genome) {

    var entity;
    var i;
    var trait_name;

    entity = {};

    entity.x = 0;
    entity.y = 0;
    entity.cooldown_counter = 0;

    entity.genome = p_genome;

    i = 0;

    // This is allowed to go wrong. It's called mutation :P
    for (trait_name in TRAITS) {

        entity[trait_name] = p_genome.sequence[i];

        i += 1;

    }

    Object.defineProperty(entity, 'color', {
        'get': function () {

            return getEntityColor(entity);

        },
        enumerable: true,
        configurable: false
    });

    return entity;

}

function getEntities(amount) {

    var genome;

    var i = 0;
    var n = amount;
    var entities = [];

    for (i; i < n; i += 1) {

        genome = generateRandomGenome();

        entities[i] = createEntity(genome);

    }

    return entities;

}

(function runTests() {

    "use strict";

    var genome = generateRandomGenome();
    var entity = createEntity(genome);

    // function (p_statement, p_assertion, p_expectation, p_experiment)
    ropBotTestRunner(
        "Entity has a genome object",
        ropBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        true,
        () => {
            return isObject(entity.genome);
        }
    )

    ropBotTestRunner(
        "Entity genome has a sequence defined.",
        ropBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        true,
        () => {
            return !isUndefined(entity.genome.sequence);
        }
    )

    ropBotTestRunner(
        "Entity starts at x = 0.",
        ropBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        0,
        () => {
            return entity.x;
        }
    )

    ropBotTestRunner(
        "Entity starts at y = 0.",
        ropBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        0,
        () => {
            return entity.y;
        }
    )

    ropBotTestRunner(
        "Entity has a color string.",
        ropBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        true,
        () => {
            return (isString(entity.color)
                && entity.color.length > 0);
        }
    )

    ropBotTestRunner(
        "Entity has a speed trait between 0 (incl.) and 1 (excl.)",
        ropBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        true,
        () => {
            return (isNumber(entity.speed)
                && entity.speed >= 0
                && entity.speed < 1);
        }
    )

    ropBotTestRunner(
        "Entity has a strength trait between 0 (incl.) and 1 (excl.)",
        ropBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        true,
        () => {
            return (isNumber(entity.strength)
                && entity.strength >= 0
                && entity.strength < 1);
        }
    )

    ropBotTestRunner(
        "Entity has a vitality trait between 0 (incl.) and 1 (excl.)",
        ropBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        true,
        () => {
            return (isNumber(entity.vitality)
                && entity.vitality >= 0
                && entity.vitality < 1);
        }
    )

    ropBotTestRunner(
        "Entity has a size trait between 0 (incl.) and 1 (excl.)",
        ropBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        true,
        () => {
            return (isNumber(entity.size)
                && entity.size >= 0
                && entity.size < 1);
        }
    )

    ropBotTestRunner(
        "Entity is alive.",
        ropBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        true,
        () => {
            return isEntityAlive(entity);
        }
    )

}())
