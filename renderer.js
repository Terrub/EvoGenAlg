
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

    var ACTIONS = {
        'mate': {
            'cost': 8,
            'execution': function (p_entity, p_target) {

                var offspring;
                var size;
                var left_size;
                var right_size;
                var heading;
                var direction;
                var offset;

                p_target.energy -= ACTIONS.mate.cost;

                offspring = spawnOffspringWithTarget(p_entity, p_target);
                size = (offspring.size * 15) + 5;

                offspring.x = (p_entity.x + p_target.x) / 2;
                offspring.y = (p_entity.y + p_target.y) / 2;

                heading = getHeadingToTarget(p_entity, p_target);
                direction = getDirectionFromHeading(heading + (Math.PI / 2));

                left_size = (p_entity.size * 15) + 5;
                right_size = (p_target.size * 15) + 5

                offset = Math.max(left_size,right_size) + size;

                offspring.x += (direction.x * offset);
                offspring.y += (direction.y * offset);

                if (isEntityBurried(offspring)) {

                    killEntity(offspring);

                }

                entities.push(offspring);

            }
        },

        'kill': {
            'cost': 5,
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

        display.canvas.style.width = (WIDTH * 2 - 20) + "px";
        display.canvas.style.height = (HEIGHT * 2 - 45)  + "px";

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

    function getRandomHeading() {

        return Math.random() * (Math.PI * 2);

    }

    function getRandomDirection() {

        return getDirectionFromHeading(getRandomHeading());

    }

    function getDirectionFromHeading(p_heading) {

        return {x: Math.cos(p_heading), y: Math.sin(p_heading)};

    }

    function moveEntity(p_entity, p_direction) {

        p_entity.x += p_direction.x;
        p_entity.y += p_direction.y;

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

    function getTouchingEntities(p_entities) {

        var row;
        var col;
        var occupants;
        var occupant_ids;
        var entity_id;
        var target_id;

        var i;
        var n;
        var j;

        var w = WIDTH;
        var h = HEIGHT;

        var touching_entities = {};

        row = 0;

        for (row; row < w; row += 1) {

            col = 0;

            for (col; col < h; col += 1) {

                if (Grid.isOccupied(grid, row, col)) {

                    occupants = Grid.getOccupants(grid, row, col);

                    occupant_ids = Object.keys(occupants);

                    if (occupant_ids.length > 1) {

                        i = 0;
                        n = occupant_ids.length;

                        for (i; i < n; i += 1) {

                            entity_id = occupant_ids[i];

                            if (isUndefined(touching_entities[entity_id])) {

                                touching_entities[entity_id] = {};

                            }

                            j = 0;

                            for (j; j < n; j += 1) {

                                // Skip entity itself.
                                if (i === j) {

                                    continue;

                                }

                                target_id = occupant_ids[j];

                                if (!touching_entities[entity_id][target_id]) {

                                    touching_entities[entity_id][target_id] = true;

                                }

                            }

                        }

                    }

                }

            }

        }

        return touching_entities;

    }

    function queueEntityActionAttempts(p_entities, p_action_queue) {

        var entity;
        var intent;
        var action;
        var melee_range_entities;

        var touching_entities = getTouchingEntities(p_entities);

        var i = 0;
        var n = p_entities.length;

        for (i; i < n; i += 1) {

            entity = p_entities[i];
            intent = entity.intent;
            action = intent.action;
            melee_range_entities = touching_entities[i];

            // Is target in range?
            if (isDefined(melee_range_entities) &&
                melee_range_entities[entity.intent.target.id]) {
                // if so, resolve intent.

                if (action.cost < entity.energy) {

                    p_action_queue.push({
                        "action": entity.intent.action,
                        "entity": entity,
                        "target": entity.intent.target
                    });

                }

            } else {

                if (ACTIONS.move.cost < entity.energy) {

                    p_action_queue.push({
                        "action": ACTIONS.move,
                        "entity": entity,
                        "target": entity.intent.target
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
        var execution;

        while (p_action_queue.length > 0) {

            queue_slot = p_action_queue.pop();

            entity = queue_slot.entity;

            if (!isEntityAlive(entity)) {

                continue;

            }

            target = queue_slot.target;
            action = queue_slot.action;

            if (isDefined(action)) {

                if (entity.energy - action.cost > 0) {

                    action.execution(entity, target);

                    entity.energy -= action.cost;

                }

            }

        }

    }

    function getCellsFromEntity(p_entity) {

        var x;
        var w;
        var y;
        var h;

        var max = Math.max;
        var min = Math.min;
        var ceil = Math.ceil;
        var width = WIDTH;
        var height = HEIGHT;

        var size = (p_entity.size * 15) + 5;
        var half_size = (size / 2);

        var cells = [];

        x = max(0, ceil(p_entity.x - half_size)) | 0;
        w = min(width, ceil(x + size)) | 0;

        for (x; x < w; x += 1) {

            y = max(0, ceil(p_entity.y - half_size)) | 0;
            h = min(height, ceil(y + size)) | 0;

            for (y; y < h; y += 1) {

                cells.push({'x': x, 'y': y});

            }

        }

        return cells;

    }

    function isEntityBurried(p_entity) {

        var cells = getCellsFromEntity(p_entity);
        var cell;

        var i = 0;
        var n = cells.length;

        for (i; i < n; i += 1) {

            cell = cells[i];

            if (!Grid.isOccupied(grid, cell.x, cell.y)) {

                return false;

            }

        }

        return true;

    }

    function addCellsToGrid(p_cells, p_grid, p_id) {

        var i = 0;
        var n = p_cells.length;
        var cell;

        for (i; i < n; i += 1) {

            cell = p_cells[i];

            Grid.addOccupant(p_grid, cell.x, cell.y, p_id);

        }

    }

    function addEntityToGrid(p_entity, p_grid, p_entity_index) {

        var entity_cells = getCellsFromEntity(p_entity);
        var found_space = false;
        var cell;

        var i = 0;
        var n = entity_cells.length;

        for (i; i < n; i += 1) {

            cell = entity_cells[i];

            if (!Grid.isOccupied(p_grid, cell.x, cell.y)) {

                found_space = true;

            }

        }

        if (found_space) {

            addCellsToGrid(entity_cells, p_grid, p_entity_index);

        } else {

            killEntity(p_entity);

        }

    }

    //#REFACTOR: See drawEntity
    function addEntitiesToGrid(p_entities, p_grid) {

        var entity;

        var i = 0;
        var n = p_entities.length;

        for ( i; i < n; i += 1 ) {

            entity = p_entities[i];

            addEntityToGrid(entity, p_grid, i);

        }

    }

    function isOutOfBounds(p_entity) {

        if (p_entity.x < 0) { p_entity.x += WIDTH; }
        if (p_entity.y < 0) { p_entity.y += HEIGHT; }

        if (p_entity.x > WIDTH) { p_entity.x -= WIDTH; }
        if (p_entity.y > HEIGHT) { p_entity.y -= HEIGHT; }

    }

    function getHeadingToTarget(p_entity, p_target) {

        var x1 = p_entity.x;
        var y1 = p_entity.y;

        var x2 = p_target.x;
        var y2 = p_target.y;

        return Math.atan2(y2 - y1, x2 - x1);

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

        var action_queue = [];

        Grid.reset(grid);

        entities.map(isOutOfBounds);

        updateEntityCounters(entities);

        addEntitiesToGrid(entities, grid);

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

        var size = (entity.size * 15) + 5;
        var half_size = (size / 2);

        display.drawCircle(
            entity.x,
            entity.y,
            half_size,
            entity.color
        )

    }

    function drawEntities(p_entities) {

        p_entities.map(drawEntity);

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

    function checkForActionCostAdjustments() {

        var direction_changed;
        var limit_reached;

        if (entities.length > 1000) {

            report("Stopping. we're above our render limit!");

            direction_changed = adjustment_direction !== 1;

            adjustment_direction = 1;

            limit_reached = true;

        }

        if (entities.length < 2) {

            report("Stopping with one pixie left:", entities[0]);

            direction_changed = adjustment_direction !== -1;

            adjustment_direction = -1;

            limit_reached = true;

        }

        if (limit_reached) {

            if (direction_changed) {

                current_resolution *= 0.5;

                occurance = 0;

            } else {

                occurance += 1;

            }

            ACTIONS.mate.cost += current_resolution * adjustment_direction;

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

        checkForActionCostAdjustments();
        // checkForActionCostAdjustments();

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

        report("Starting new world with settings:", ACTIONS.mate.cost, ACTIONS);

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
