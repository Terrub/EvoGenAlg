"use strict";

//#REFACTOR this into a separate class already!!! DX
// NOTE: While we're at it. I should probably discern traits from properties or
//  attributes. The RGB values for instances are not traits but properties.
var TRAITS = {
    "SPEED": {
        "index": 0,
        "range": 100,
        "offset": 1
    },
    "STRENGTH": {
        "index": 1,
        "range": 100,
        "offset": 1
    },
    "VITALITY": {
        "index": 2,
        "range": 100,
        "offset": 1
    },
    "SIZE": {
        "index": 3,
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
        "target": "VITALITY",
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
    var new_trait;

    for (trait_name in TRAITS) {

        trait = TRAITS[trait_name];

        if (!isUndefined(trait.index)) {

            if (Math.round(Math.random()) === 1) {

                mutation_offset = 0.01;

            } else {

                mutation_offset = -0.01;

            }

            new_trait = p_entity.genome.sequence[trait.index] + mutation_offset;

            p_entity.genome.sequence[trait.index] = Math.max(0, Math.min(1, new_trait));

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

function getEntityColor(p_entity) {

    var red = getTraitFromGenome(p_entity.genome, TRAITS.RED);
    var green = getTraitFromGenome(p_entity.genome, TRAITS.GREEN);
    var blue = getTraitFromGenome(p_entity.genome, TRAITS.BLUE);
    var color = "rgba(" + red + "," + green + "," + blue + ",1)";

    return color;

}

// NOTE: I should add a trait that lowers or highers these numbers as a quick
//  and temporary fix to jack up the diversity.
function checkForLikableTrait(p_entity, p_target) {

    var max = Math.max;

    var d_str = max(0, p_target.strength() - p_entity.strength());
    var d_spd = max(0, p_target.speed() - p_entity.speed());
    var d_size = max(0, p_target.size() - p_entity.size());

    var total = d_str + d_spd + d_size;

    return total >= 8;

}

function checkForHostility(p_entity, p_target) {

    var d_str = (0, p_target.strength() - p_entity.strength());
    var d_spd = (0, p_target.speed() - p_entity.speed());
    var d_size = (0, p_target.size() - p_entity.size());

    var total = d_str + d_spd + d_size;

    return total < 0;

}

function isEntityAlive(p_entity) {

    return (p_entity.genome.sequence[TRAITS.VITALITY.index] > 0);

}

function isEntityBusy(p_entity) {

    return (p_entity.cooldown_counter > 0);

}

function spawnOffspringWithTarget(p_entity, p_target) {

    var genome;
    var trait;
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

function updateCounters(p_entity) {

    var max = Math.max;
    var size_hinderance = (1 - (p_entity.genome.sequence[TRAITS.SIZE.index] * 0.3));
    var offset = (p_entity.speed() * size_hinderance);
    var proposed_cooldown = p_entity.cooldown_counter - offset;

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

    var target_vit = p_target.genome.sequence[TRAITS.VITALITY.index];
    var entity_str = p_entity.genome.sequence[TRAITS.STRENGTH.index];

    var new_trait = Math.max(0, Math.min(1, (target_vit - entity_str)));

    p_target.genome.sequence[TRAITS.VITALITY.index] = new_trait;

}

//#TODO: Refactor entity traits into object getters instead.
function createEntity(p_genome) {

    var entity;
    var size;

    entity = {};

    entity.x = 0;
    entity.y = 0;
    entity.cooldown_counter = 0;

    entity.genome = p_genome;

    entity.color = () => {

        return getEntityColor(entity);

    };

    entity.size = () => {

        return getTraitFromGenome(entity.genome, TRAITS.SIZE);

    };

    entity.speed = () => {

        return getTraitFromGenome(entity.genome, TRAITS.SPEED);

    };

    entity.strength = () => {

        return getTraitFromGenome(entity.genome, TRAITS.STRENGTH);

    };

    entity.vitality = () => {

        return getTraitFromGenome(entity.genome, TRAITS.VITALITY);

    };

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
            return (isString(entity.color())
                && entity.color().length > 0);
        }
    )

    ropBotTestRunner(
        "Entity has a speed between trait 1 (incl.) and 100 (incl.)",
        ropBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        true,
        () => {
            return (isInteger(entity.speed())
                && entity.speed() > 0
                && entity.speed() <= 100);
        }
    )

    ropBotTestRunner(
        "Entity has a strength trait between 1 (incl.) and 100 (incl.)",
        ropBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        true,
        () => {
            return (isInteger(entity.strength())
                && entity.strength() > 0
                && entity.strength() <= 100);
        }
    )

    ropBotTestRunner(
        "Entity has a vitality trait between 1 (incl.) and 100 (incl.)",
        ropBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        true,
        () => {
            return (isInteger(entity.vitality())
                && entity.vitality() > 0
                && entity.vitality() <= 100);
        }
    )

    ropBotTestRunner(
        "Entity has a size between 1 (incl) and 20 (incl.)",
        ropBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        true,
        () => {
            return (isInteger(entity.size())
                && entity.size() > 0
                && entity.size() <= 20);
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
