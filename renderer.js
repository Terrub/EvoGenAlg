
////////////////////////////////////////////////////////////////////////////////
//
//  NOTES:
/*

    -   I want entities to carry a genome of sorts so we can do the actual
        mutation and procreation.

        >   Should be easily done if I generate genomes in the entity creation.
            The real question is, how do I represent the genome?
            Do I use a large string of letters similar to DNA or do I just make
            an array with numbers or enumerables?

    -   I want the entities to interact with one another so that we can have
        a means to compare/contest the genomes between entities.

        >   I've got collision detection of sorts now. I should look into
            making colliding entities assess oneanother and then either do
            something or not. Something could be attack/kill and or (attempt to)
            breed?

    -   Eventually I want to have all the metrics that are active, to be
        represented in the genome. (I don't yet know how to determine which part
        of the genome is changable.)

    -   I'd like to turn on/off drawing the background (makes for interesting
        views of the paths entities took and what territory they keep)

    -   I'd also like to be able to see how many entities are still active
        (I use a degenerate method now using the console: entities.length)


    how about each entity invokes an attempt to call a functionname upon a target
    resistance then comes in the form of not hving that functionname exactly or the
    params no longer match.
    we can attempt something as a try...catch block.
    Failure means it just didn't work.
    Also the actions that can be performed themselves are limited to the axioms that
    we set for the this world.

    An attack could then be considered by trying to substract a variable int off
    of the target's energy/health/blood/lifeforce/whatever.
    If the target's lifeforce is not the same type or not at the same location
    as the attacker expects it to be, it would fail. The real interesting part
    comes when conservation of energy is a factor. Imagine armour can be
    described as an variable int that is subtracted from any attempted public
    access to lifeforce. That number that is subtracted could've been points
    spent on speed or size or something else. So a diversity would be able to
    form of entities that are more focussed on defense at the expense of offense
    or vice versa.

*/

var Renderer = (function contructRenderer() {

    ///////////
    // Declarations

    "use strict";

    var display;
    var entities;
    var new_children;
    var grid;
    var animating;

    var WIDTH = (window.innerWidth / 2);
    var HEIGHT = (window.innerHeight / 2);

    var world_is_loaded = false;

    var old_time = getTime();
    var current_time;
    var tics = 0;

    var proto_render = {};

    var current_resolution = 0.1;
    var adjustment_direction = 0;
    var occurance = 0;
    var occurance_threshold = 3;

    var action_queue = [];

    var ACTIONS = {
        'mate': {
            'cost': 5,
            'execution': function (p_entity, p_target) {

                var offspring;
                var d_size;
                var heading;
                var direction;


                p_target.energy -= ACTIONS.mate.cost;

                offspring = spawnOffspringWithTarget(p_entity, p_target);

                heading = getRandomHeading();
                direction = getDirectionFromHeading(heading);

                d_size = (calcEntitySize(p_entity)) + (calcEntitySize(offspring));

                offspring.x = calcEntityX(p_entity) + (d_size * direction.x);
                offspring.y = calcEntityY(p_entity) + (d_size * direction.y);

                moveEntity(offspring, direction);

                if (isUndefined(getCollidingEntity(offspring))) {

                    entities.push(offspring);

                }

            }
        },

        'kill': {
            'cost': 1,
            'execution': function (p_entity, p_target) {

                attackEntity(p_entity, p_target);

            }
        },

        'move': {
            'cost': 1,
            'execution': function (p_entity, p_target) {

                var heading = getHeadingToTarget(p_entity, p_target);
                var direction = getDirectionFromHeading(heading);

                moveEntity(p_entity, direction);

            }
        }
    }

    function createDisplay() {

        display = getDisplay(WIDTH, HEIGHT);

        display.canvas.style.width = ((WIDTH - 10) * 2) + "px";
        display.canvas.style.height = ((HEIGHT - 20) * 2)  + "px";

    }

    function createGrid() {

        grid = Grid.create(WIDTH, HEIGHT);

    }

    //#NOTE: Am I happy with this here? It's just the initial generation right?
    // so it shouldn't matter if this is here?
    function positionEntityRandomly(entity) {

        entity.x = generateRandomNumber(0, WIDTH);
        entity.y = generateRandomNumber(0, HEIGHT);

    }

    // ----

    function calcCircSurface(p_radius) {

        return Math.PI * Math.pow(p_radius,2);

    }

    function getRandomHeading() {

        return Math.random() * (Math.PI * 2);

    }

    function getRandomDirection() {

        return getDirectionFromHeading(getRandomHeading());

    }

    function getDirectionFromHeading(p_heading) {

        return {x: Math.cos(p_heading), y: Math.sin(p_heading)};

    }

    function getCollidingEntity(p_entity) {

        var target;
        var target_radius;
        var melee_range;
        var distance;
        var current_distance;
        var colliding_entity;

        var entity_radius = calcEntitySize(p_entity);

        var i = 0;
        var n = entities.length;

        for (i; i < n; i += 1) {

            if (i === p_entity.id) {

                continue;

            }

            target = entities[i];
            target_radius = calcEntitySize(target);

            melee_range = entity_radius + target_radius;
            distance = calcDeltaDistance(p_entity, target);

            if (distance < melee_range &&
                (distance < current_distance || isUndefined(current_distance))) {

                current_distance = distance;
                colliding_entity = target;

            }

        }

        return colliding_entity;

    }

    function calcEntitySize(p_entity) {

        return p_entity.size * 7.5 + 2.5;

    }

    function calcEntityX(p_entity) {

        return (WIDTH + p_entity.x) % WIDTH;

    }

    function calcEntityY(p_entity) {

        return (HEIGHT + p_entity.y) % HEIGHT;

    }

    function deviateMovement(p_entity, p_target) {

        var ratio;
        var melee_range;
        var distance;
        var entity_size;
        var target_size;
        var d_x;
        var d_y;

        entity_size = calcEntitySize(p_entity);
        target_size = calcEntitySize(p_target);

        melee_range = entity_size + target_size;
        distance = calcDeltaDistance(p_entity, p_target);

        ratio = 2 * (melee_range - distance) / melee_range;

        d_x = (calcEntityX(p_entity) - calcEntityX(p_target));
        d_y = (calcEntityY(p_entity) - calcEntityY(p_target));

        p_entity.x = calcEntityX(p_entity) + d_x * ratio;
        p_entity.y = calcEntityY(p_entity) + d_y * ratio;

    }

    function moveEntity(p_entity, p_direction) {

        var target_entity;
        var target_radius;
        var entity_radius;
        var distance;
        var melee_range;
        var ratio;
        var colliding_entity;

        var attempts = 0;
        var i = 0;
        var n = entities.length;

        entity_radius = calcEntitySize(p_entity);

        p_entity.x = calcEntityX(p_entity) + p_direction.x;
        p_entity.y = calcEntityY(p_entity) + p_direction.y;

        colliding_entity = getCollidingEntity(p_entity);

        while (isDefined(colliding_entity) && attempts < 1000) {

            deviateMovement(p_entity, colliding_entity);

            colliding_entity = getCollidingEntity(p_entity)

            attempts += 1;

        }

    }

    function getLivingEntities(p_entities) {

        var entity;

        var entities = [];

        var i = 0;
        var n = p_entities.length;

        for (i; i < n; i += 1) {

            entity = p_entities[i];

            if (isEntityAlive(entity)) {

                entity.id = entities.length;
                entities.push(entity);

            }

        }

        return entities;

    }

    function updateEntityCounters(p_entities) {

        var entity;

        var i = 0;
        var n = p_entities.length;

        for (i; i < n; i += 1) {

            entity = p_entities[i];

            updateCounters(entity);

        }

    }

    function getEntitiesIntentions(p_entities) {

        var entity;

        var i = 0;
        var n = p_entities.length;

        for (i; i < n; i += 1) {

            entity = p_entities[i];

            assessEntityIntent(entity, p_entities);

        }

    }

    function queueEntityActionAttempts(p_entities, p_action_queue) {

        var entity;
        var entity_radius;
        var intent;
        var target;
        var target_radius;
        var action;
        var move_cost;
        var melee_range;
        var target_in_range;
        var action_cost;

        var i = 0;
        var n = p_entities.length;

        for (i; i < n; i += 1) {

            entity = p_entities[i];
            intent = entity.intent;
            target = intent.target;
            action = ACTIONS[intent.action];

            entity_radius = calcEntitySize(entity);
            target_radius = calcEntitySize(target);

            melee_range = (entity_radius + target_radius);

            target_in_range = calcDeltaDistance(entity, target) <= melee_range;

            if (intent.action === "kill") {

                action_cost = Math.max(0.1, (entity.strength + entity.size) - entity.stamina);

            } else {

                action_cost = action.cost;

            }

            if (target_in_range) {

                if (action_cost < entity.energy) {

                    p_action_queue.push({
                        "action": action,
                        "entity": entity,
                        "target": target,
                        "cost": action_cost
                    });

                }

            } else {

                move_cost = calcCircSurface(entity_radius) * 0.125;

                if (move_cost < entity.energy) {

                    p_action_queue.push({
                        "action": ACTIONS.move,
                        "entity": entity,
                        "target": target,
                        "cost": move_cost
                    });

                }

            }

        }

    }

    function resolveActionQueue(p_action_queue) {

        var queue_slot;
        var entity;
        var target;
        var action;
        var cost;
        var execution;

        while (p_action_queue.length > 0) {

            queue_slot = p_action_queue.pop();

            entity = queue_slot.entity;

            if (!isEntityAlive(entity)) {

                continue;

            }

            target = queue_slot.target;
            action = queue_slot.action;
            cost = queue_slot.cost;

            if (isDefined(action)) {

                if ((entity.energy - cost) > 0) {

                    action.execution(entity, target);

                    entity.energy -= cost;

                }

            }

        }

    }

    function getHeadingToTarget(p_entity, p_target) {

        var d_x = calcEntityX(p_target) - calcEntityX(p_entity);
        var d_y = calcEntityY(p_target) - calcEntityY(p_entity);

        return Math.atan2(d_y, d_x);

    }

    function calcDeltaDistance(left, right) {

        var d_x = calcEntityX(right) - calcEntityX(left);
        var d_y = calcEntityY(right) - calcEntityY(left);

        return Math.sqrt((d_x * d_x) + (d_y * d_y));

    }

    //#TODO: Make entities mutation resistant using genome and use that to
    //  determine whether or not the entity mutates or not.
    //  We can add factors that influence the chance of mutations
    //  happening later.
    function mutateEntities(p_entities) {

        var is_mutating;
        var entity;

        var i = 0;
        var n = p_entities.length;

        for (i; i < n; i += 1) {

            entity = p_entities[i];

            // Mutate 2% of the time for now.
            is_mutating = ((Math.random() + 0.1) > 1);

            if (is_mutating) {

                mutateEntity(entity);

            }

        }

    }

    // ----

    function updateValues() {

        Grid.reset(grid);

        updateEntityCounters(entities);

        getEntitiesIntentions(entities);

        queueEntityActionAttempts(entities, action_queue);

        resolveActionQueue(action_queue);

        mutateEntities(entities);

        entities = getLivingEntities(entities);

    }

    // ----

    function drawBackground() {

        display.fill("rgba(15, 15, 15, 1)");

    }

    function drawEntity(entity) {

        var radius = calcEntitySize(entity);

        display.drawCircle(
            calcEntityX(entity),
            calcEntityY(entity),
            radius,
            entity.color
        )

    }

    function drawEntities(p_entities) {

        var i = 0;
        var n = p_entities.length;

        for (i; i < n; i += 1) {

            drawEntity(p_entities[i]);

        }

    }

    function updateDisplay() {

        drawBackground();

        drawEntities(entities);

    }

    function updateUserInterface() {

        tics += 1;

        current_time = getTime();

        if (old_time + 1000 < current_time) {

            old_time = current_time;

            document.querySelector('[name="frame_rate"]').innerHTML = tics;

            tics = 0;

        }

        document.querySelector('[name="entity_count"]').value = entities.length;

    }

    function checkStopHeuristics() {

        var limit_reached;

        if (entities.length > 1000) {

            report("Stopping. we're above our render limit!");

            limit_reached = true;

        }

        if (entities.length < 2) {

            report("Stopping with one pixie left:", entities[0]);

            limit_reached = true;

        }

        if (limit_reached) {

            reset();

            start();

        }

    }

    function tic() {

        if (!world_is_loaded) {

            return;

        }

        updateValues();

        updateDisplay();

        updateUserInterface();

        checkStopHeuristics();

        if (animating === true) {

            window.requestAnimationFrame(tic);

        }

    }

    function loadWorld() {

        var amount;
        var entity_count;

        entity_count = document.querySelector('[name="entity_count"]').value;

        amount = parseInt(entity_count, 10);

        if (!isInteger(amount) || amount < 2) {

            reportUsageError("amount must be an integer > 1")

        }

        world_is_loaded = true;

        entities = getEntities(amount);

        entities.map(positionEntityRandomly);

    }

    function start() {

        if (animating === true) {

            return;

        }

        if (!world_is_loaded) {

            loadWorld();

        }

        report("Starting new world with settings:", ACTIONS);

        animating = true;

        old_time = getTime();
        tics = 0;

        tic();

    }

    function stop() {

        animating = false;

    }

    function reset() {

        stop();

        world_is_loaded = false;

        document.querySelector('[name="entity_count"]').value = "100";

        drawBackground();

    }

    ///////////
    // Execution

    createDisplay();
    createGrid();
    drawBackground();

    proto_render.start = start;
    proto_render.stop = stop;
    proto_render.reset = reset;
    proto_render.getHeadingToTarget = getHeadingToTarget;
    proto_render.calcDeltaDistance = calcDeltaDistance;
    proto_render.ACTIONS = ACTIONS;

    return proto_render;

}())
