"use strict";

//#REFACTOR this into a separate class already!!! DX
// NOTE: While we're at it. I should probably discern traits from properties or
//  attributes. The RGB values for instance are not traits but properties.
var TRAITS = {
    "stamina": true,
    "strength": true,
    "energy": true,
    "size": true,
    "red": true,
    "green": true,
    "blue": true,
    "like": true,
    "aggression": true,
    "defence": true
};
var TRAIT_NAMES = Object.keys(TRAITS);
var NUM_TRAITS = TRAIT_NAMES.length;

function generateRandomSequence() {

    var trait_name;
    var trait_names = TRAIT_NAMES;

    var i = 0;
    var n = NUM_TRAITS;

    var sequence = [];

    for (i; i < n; i += 1) {

        sequence[i] = Math.random();

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

    var trait_name;
    var trait_names = TRAIT_NAMES;
    var mutation_offset;

    var i = 0;
    var n = NUM_TRAITS;

    var round = Math.round;
    var rand = Math.random;
    var max = Math.max;

    for (i; i < n; i += 1) {

        trait_name = trait_names[i];

        if (round(rand()) + 0.2 > 1) {

            if (round(rand()) === 1) {

                mutation_offset = 0.01;

            } else {

                mutation_offset = -0.01;

            }

            p_entity[trait_name] = max(0, p_entity[trait_name] + mutation_offset);

        }

    }

}

function getEntityColor(p_entity) {

    var red = p_entity.red * 256 | 0;
    var green = p_entity.green * 256 | 0;
    var blue = p_entity.blue * 256 | 0;

    return "rgba(" + red + "," + green + "," + blue + ",1)";

}

function isEntityAlive(p_entity) {

    return (p_entity.energy > 0);

}

function combineParentSequences(p_entity, p_target) {

    var trait_name;
    var left;
    var right;
    var trait;

    var round = Math.round;
    var rand = Math.random;

    var sequence = [];
    var i = 0;
    var n = NUM_TRAITS;

    for (i; i < n; i += 1) {

        trait_name = TRAIT_NAMES[i];

        left = p_entity[trait_name];
        right = p_target[trait_name];

        if (round(rand()) === 1) {

            trait = left;

        } else {

            trait = right;

        }

        sequence[i] = trait;

    }

    return sequence;

}

function spawnOffspringWithTarget(p_entity, p_target) {

    var offspring;
    var genome;
    var trait;
    var trait_name;
    var host;

    genome = {
        "sequence": combineParentSequences(p_entity, p_target)
    };

    offspring = createEntity(genome);

    return offspring;

}

function updateCounters(p_entity) {

    //#TODO: Find a good way to incorporate stamina in this metabolism mechanic.
    p_entity.energy += 1;
    p_entity.size -= 0.0005;

}

function getTraitSumFromEntity(p_entity) {

    var trait_name;
    var i = 0;
    var n = NUM_TRAITS;
    var total = 0;

    for ( i; i < n; i += 1 ) {

        trait_name = TRAIT_NAMES[i];

        total += p_entity[trait_name];

    }

    return total;

}

function getKillPriority(p_entity, p_target) {

    var potential_gain = Renderer.getEntitySurface(p_target);
    var distance = Renderer.calcDeltaDistance(p_entity, p_target);

    var kill_priority = potential_gain / distance;

    return kill_priority;

}

function getLikeFactorOfTarget(p_entity, p_target) {

    var trait_name;
    var like_factor;

    var distance = Renderer.calcDeltaDistance(p_entity, p_target);
    var total = 0;

    var i = 0;
    var n = NUM_TRAITS;

    for ( i; i < n; i += 1 ) {

        trait_name = TRAIT_NAMES[i];

        total += (p_target[trait_name] - p_entity[trait_name]);

    }

    like_factor = total / distance;

    return like_factor;

}

function assessEntityIntent(p_entity, p_targets) {

    var intended_action;
    var comparitor;
    var target;
    var priority;
    var highest_priority;
    var chosen_target;

    var i = 0;
    var n = p_targets.length;

    if (p_entity.energy < Renderer.ACTIONS.mate.cost) {

        intended_action = 'kill';
        comparitor = getKillPriority;

    } else {

        intended_action = 'mate'
        comparitor = getLikeFactorOfTarget;

    }

    for (i; i < n; i += 1) {

        if (p_entity.id === i) {

            continue;

        }

        target = p_targets[i];

        priority = comparitor(p_entity, target);

        if (isUndefined(chosen_target) || priority > highest_priority) {

            highest_priority = priority;

            chosen_target = target;

        }

    }

    p_entity.intent = {
        'action': intended_action,
        'target': chosen_target
    };

}

function killEntity(p_entity) {

    p_entity.energy = 0;

}

function attackEntity(p_entity, p_target) {

    var str = p_entity.strength;
    var def = p_target.defence;
    var entity_surface = Renderer.getEntitySurface(p_entity);

    var dmg = (Math.max(0.0001, str - def) * entity_surface);

    var target_surface = Renderer.getEntitySurface(p_target);

    var new_surface = Math.max(0, target_surface - dmg);
    var dmg_done = target_surface - new_surface;

    Renderer.setEntitySurface(p_entity, entity_surface + dmg_done);
    Renderer.setEntitySurface(p_target, new_surface);

}

//#TODO: Refactor entity traits into object getters instead.
function createEntity(p_genome) {

    var entity;
    var i;
    var n;
    var trait_name;
    var trait_names;

    entity = {};

    entity.x = 0;
    entity.y = 0;

    entity.genome = p_genome;

    trait_names = TRAIT_NAMES;

    i = 0;
    n = NUM_TRAITS;

    for (i; i < n; i += 1) {

        entity[trait_names[i]] = p_genome.sequence[i];

    }

    //#TODO: move this to the renderer please... CMON... ><
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
    var entity;

    var i = 0;
    var n = amount;
    var entities = [];

    for (i; i < n; i += 1) {

        genome = generateRandomGenome();

        entity = createEntity(genome);
        entity.id = i;
        entities[i] = entity;

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
        "Entity has a stamina trait between 0 (incl.) and 1 (excl.)",
        ropBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        true,
        () => {
            return (isNumber(entity.stamina)
                && entity.stamina >= 0
                && entity.stamina < 1);
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
        "Entity has a energy trait between 0 (incl.) and 1 (excl.)",
        ropBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        true,
        () => {
            return (isNumber(entity.energy)
                && entity.energy >= 0
                && entity.energy < 1);
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
