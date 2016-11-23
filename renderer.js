
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
    var temp_time = getTime();
    var tics = 0;

    var proto_render = {};

    var actions = {
        'mate': function (p_entity, p_target) {

            var offspring = spawnOffspringWithTarget(p_entity, p_target);
            var direction = getRandomDirection();
            var size = (offspring.size * 15) + 5;

            offspring.x = (p_entity.x + p_target.x) / 2;
            offspring.y = (p_entity.y + p_target.y) / 2;

            offspring.x += (size * Math.random() * 2 * direction.x);
            offspring.y += (size * Math.random() * 2 * direction.y);

            entities.push(offspring);

        },

        'kill': function (p_entity, p_target) {

            attackEntity(p_entity, p_target);

        },

        'move': function (p_entity, p_target) {

            var heading = getCurrentHeading(p_entity, entities);
            var direction = getDirectionFromHeading(heading);
            var size = (p_entity.size * 15) + 5
            var half_size = size / 2;

            p_entity.x += direction.x * Math.random() * half_size;
            p_entity.y += direction.y * Math.random() * half_size;

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

    function getRandomDirection() {

        var heading = Math.random() * (Math.PI * 2);

        return getDirectionFromHeading(heading);

    }

    function getDirectionFromHeading(p_heading) {

        return {x: Math.cos(p_heading), y: Math.sin(p_heading)};

    }

    function getLivingEntities(p_entities) {

        var entity;

        var entities = [];

        var i = 0;
        var n = p_entities.length;

        for ( i; i < n; i += 1 ) {

            entity = p_entities[i];

            if (isEntityAlive(entity)) {

                entities.push(entity);

            }

        }

        return entities;

    }

    function updateEntityCounters(p_entities) {

        var entity;

        var i = 0;
        var n = p_entities.length;

        for ( i; i < n; i += 1 ) {

            entity = p_entities[i];

            updateCounters(entity);

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

        var entity_id;
        var entity_targets;
        var target_id;

        var entity;
        var target;
        var action;

        var touching_entities = getTouchingEntities(p_entities);

        var i = 0;
        var n = p_entities.length;

        for (i; i < n; i += 1) {

            entity = p_entities[i];

            entity_targets = touching_entities[i];

            if (isDefined(entity_targets)) {

                for (target_id in entity_targets) {

                    target = p_entities[target_id];

                    action = getEntityActionForTouchingTarget(entity, target);

                    p_action_queue.push({
                        "action": action,
                        "entity": entity,
                        "target": target
                    });

                    break;

                }

            } else {

                action = "move";

                p_action_queue.push({
                    "action": action,
                    "entity": entity
                });

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

                execution = actions[action];

                if (isDefined(execution)) {

                    execution(entity, target);

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

    function addEntityToGrid(p_entity, p_grid, p_entity_index) {

        var cell;

        var entity_cells = getCellsFromEntity(p_entity);

        var i = 0;
        var n = entity_cells.length;

        for (i; i < n; i += 1) {

            cell = entity_cells[i];

            Grid.addOccupant(p_grid, cell.x, cell.y, p_entity_index);

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

    function isOutOfBounds(entity) {

        if (entity.x < 0) { entity.x += WIDTH; }
        if (entity.y < 0) { entity.y += HEIGHT; }

        if (entity.x > WIDTH) { entity.x -= WIDTH; }
        if (entity.y > HEIGHT) { entity.y -= HEIGHT; }

    }

    //#TODO: Make entities mutation resistant using genome and use that to
    //  determine whether or not the entity mutates or not.
    //  We can add factors that influence the chance of mutations
    //  happening later.
    function mutateEntities(p_entities) {

        var is_mutating;
        var entity;

        var i;
        var n;

        i = 0;
        n = p_entities.length;

        for (i; i < n; i += 1){

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

        addEntitiesToGrid(entities, grid);

        updateEntityCounters(entities);

        queueEntityActionAttempts(entities, action_queue);

        resolveActionQueue(action_queue);

        entities.map(isOutOfBounds);

        entities = getLivingEntities(entities);

        mutateEntities(entities);

    }

    // ----

    function drawBackground() {

        display.fill("rgba(15, 15, 15, 1)");

    }

    //#REFACTOR: How do I merge this with the logic in 'addEntitiesToGrid'
    // I'm doing unit occupation calculations in two places. Perhaps move it
    // to entity class itself? Resolution is fixed due to units anyway.
    function drawEntity(entity) {

        var size = (entity.size * 15) + 5;
        var half_size = (size / 2);

        display.drawRect(
            entity.x - half_size,
            entity.y - half_size,
            size,
            size,
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

    function tic() {

        if (entities.length > 50000) {

            stop();

            console.log("Stopping. we're above our render limit!")

        }

        tics += 1;

        updateValues();

        updateDisplay();

        if (temp_time + 1000 < getTime()) {

            temp_time = getTime();

            document.querySelector('[name="frame_rate"]').innerHTML = tics;

            tics = 0;

        }

        document.querySelector('[name="entity_count"]').value = entities.length;

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

        animating = true;

        temp_time = 0;
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

        entities = [];

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

    return proto_render;

}())
