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
    "dislike": true
};

var NUM_TRAITS = Object.keys(TRAITS).length;

var ACTIONS_COSTS_MATE = 5;
var ACTIONS_COSTS_KILL = 0.5;
var ACTIONS_COSTS_MOVE = 0.1;

function generateRandomSequence(p_traits) {

    var trait_name;

    var trait_names = Object.keys(p_traits);

    var i = 0;
    var n = trait_names.length;

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
    var trait_names = Object.keys(TRAITS);
    var mutation_offset;

    var i = 0;
    var n = trait_names.length;

    var round = Math.round;
    var rand = Math.random;

    for (i; i < n; i += 1) {

        trait_name = trait_names[i];

        if (round(rand()) + 0.2 > 1) {

            if (round(rand()) === 1) {

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

function getLikeFactorForEntity(p_entity, p_target) {

    var trait;
    var trait_name;

    var trait_names = Object.keys(TRAITS);
    var i = 0;
    var n = trait_names.length;

    var total = 0;

    for ( i; i < n; i += 1 ) {

        trait_name = trait_names[i];

        total += p_target[trait_name] - p_entity[trait_name];

    }

    return total;

}

function isEntityAlive(p_entity) {

    return (p_entity.energy > 0);

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

    var offspring;
    var genome;
    var trait;
    var trait_name;
    var host;

    p_entity.energy -= ACTIONS_COSTS_MATE;
    p_target.energy -= ACTIONS_COSTS_MATE;

    genome = {
        "sequence": combineParentSequences(p_entity, p_target)
    };

    offspring = createEntity(genome);

    return offspring;

}

function updateCounters(p_entity) {

    p_entity.energy += p_entity.stamina;

}

function getEntityActionForTouchingTarget(p_entity, p_target) {

    var like_factor = getLikeFactorForEntity(p_entity, p_target);
    var action = "move";

    if (like_factor > (p_entity.like * NUM_TRAITS * 2) &&
        p_entity.energy > ACTIONS_COSTS_MATE &&
        p_target.energy > ACTIONS_COSTS_MATE) {

        action = "mate";

    }

    if (p_entity.dislike > Math.random() &&
        p_entity.energy > ACTIONS_COSTS_KILL) {

        action = "kill";

    }

    return action;

}

function getEntityIntent(p_entity) {

    var intent;

    if (p_entity.energy > ACTIONS_COSTS_MATE) {

        intent = "mate";

    } else {

        intent = "kill";

    }

    return intent;

}

function getOperatorFromIntent(p_intent) {

    var result;

    function dislikeOperator(left, right) {

        return (left <= right);

    }

    function likeOperator(left, right) {

        return (left >= right);

    }

    if (p_intent === "kill") {

        result = dislikeOperator;

    } else if (p_intent === "mate") {

        result = likeOperator;

    }

    return result;

}

function calcDeltaDistance(left, right) {

    var x1 = left.x;
    var y1 = left.y;

    var x2 = right.x;
    var y2 = right.y;

    var a = Math.pow(x2 - x1, 2);
    var b = Math.pow(y2 - y1, 2);

    return Math.sqrt(a + b);

}

function getDistanceToEntitySorter(p_entity) {

    function proto_distanceSort(left, right) {

        var d_left = calcDeltaDistance(p_entity, left);
        var d_right = calcDeltaDistance(p_entity, right)

        return d_left - d_right;

    }

    return proto_distanceSort;

}

function findTarget(p_entity, p_targets) {

    var current_target;
    var like_factor;

    var intent = getEntityIntent(p_entity);
    var operator = getOperatorFromIntent(intent);

    p_targets.sort(getDistanceToEntitySorter(p_entity))

    var target = p_targets[0];
    var current_factor = getLikeFactorForEntity(p_entity, target);

    var i = 1;
    var n = p_targets.length;

    for (i; i < n; i += 1) {

        current_target = p_targets[i];

        like_factor = getLikeFactorForEntity(p_entity, current_target) * (1 / i);

        if (operator(like_factor, current_factor)) {

            current_factor = like_factor;

            target = current_target

        }

    }

    return target;

}

function getDirectionToTarget(p_entity, p_target) {

    var x1 = p_entity.x;
    var y1 = p_entity.y;

    var x2 = p_target.x;
    var y2 = p_target.y;

    return Math.atan2(y2 - y1, x2 - x1);

}

function getCurrentHeading(p_entity, p_entities) {

    p_entity.energy -= ACTIONS_COSTS_MOVE;

    var target = findTarget(p_entity, p_entities);
    var heading = getDirectionToTarget(p_entity, target);

    return heading;

}

function attackEntity(p_entity, p_target) {

    var vit = p_target.energy;
    var str = p_entity.strength;

    var adjusted_vit = Math.max(0, Math.min(1, (vit - str)));

    if (adjusted_vit <= 0) {

        p_entity.entity += p_target.energy;

    } else {

        p_entity.energy -= ACTIONS_COSTS_KILL;

    }

    p_target.energy = adjusted_vit;

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
    entity.energy = 0;

    entity.genome = p_genome;

    trait_names = Object.keys(TRAITS);

    i = 0;
    n = trait_names.length;

    for (i; i < n; i += 1) {

        entity[trait_names[i]] = p_genome.sequence[i];

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
