
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

        var heading;
        var direction;

        heading = Math.random() * (Math.PI * 2);

        direction = {x: Math.cos(heading), y: Math.sin(heading)};

        return direction;

    }

    //#REFACTOR: the randomised movement to use the genome!
    function moveEntityInRandomDirection(entity) {

        var direction;

        direction = getRandomDirection();

        entity.x += entity.speed() * direction.x;
        entity.y += entity.speed() * direction.y;

    }

    function getLivingEntities(p_entities) {

        var entities;

        function addLivingEntity(entity) {

            if (entity.status !== 0) {

                entities.push(entity);

            }

        }

        entities = [];

        p_entities.map(addLivingEntity);

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

    function resolveEntityMovement(p_entities) {

        var entity;

        var i = 0;
        var n = p_entities.length;

        for ( i; i < n; i += 1 ) {

            entity = p_entities[i];

            resolveMoveAttempt(entity);

        }

    }

    function getTouchingEntities(p_entities, p_touching_entities) {

        var row;
        var col;
        var occupants;
        var occupant_ids;
        var entity_id;
        var target_id;

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

                            for (j; j < m; j += 1) {

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

        var intent;
        var action;

        var touching_entities = getTouchingEntities(p_entities);

        for (entity_id in touching_entities) {

            entity_targets = touching_entities[entity_id];

            for (target_id in entity_targets) {

                entity = p_entities[entity_id];
                target = p_entities[target_id];

                intent = getEntityActionForTouchingTarget(entity, target);

                action = actions[intent];

                if (!isUndefined(action)) {

                    p_action_queue.push({"entity": entity, "action": action});

                }

            }

        }

    }

    function resolveActionQueue(p_action_queue) {

        var action;
        var entity;
        var queue_slot;

        var i = 0;
        var n = p_action_queue.lenght;

        p_action_queue.sort(sortActionQueueOnEntitySpeed);

        while (p_action_queue.length > 0) {

            queue_slot = p_action_queue.pop();

            // entity = queue_slot.entity;

            action = queue_slot.action;

            if (!isUndefined(action)) {

                ;

            }

        }

    }

    // DEPRECATED
    function moveEntities(p_entities) {

        report("call to 'moveEntities' detected. function is DEPRECATED");

        p_entities.map(moveEntityInRandomDirection);

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

        var half_size = (p_entity.size() / 2);

        var cells = [];

        x = max(0, ceil(p_entity.x - half_size)) | 0;
        w = min(width, ceil(x + p_entity.size())) | 0;

        for (x; x < w; x += 1) {

            y = max(0, ceil(p_entity.y - half_size)) | 0;
            h = min(height, ceil(y + p_entity.size())) | 0;

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

    function sortEntitiesOnSpeed(p_left_entity, p_right_entity) {

        return p_right_entity.speed() - p_left_entity.speed();

    }

    function sortActionQueueOnEntitySpeed(p_left_action, p_right_action) {

        return p_left_action.entity.speed() - p_right_action.entity.speed();

    }

    //#REFACTOR: too many indents. we can clean this up I'm sure!
    function resolveTouchingEntities(p_entities, p_grid) {

        var row;
        var col;

        var occupants;
        var occupant_ids;
        var entities;
        var id;
        var entity;
        var target;
        var like;
        var child;

        var i;
        var n;
        var j;

        var direction;

        var w = WIDTH;
        var h = HEIGHT;

        var new_children = [];

        row = 0;

        for (row; row < w; row += 1) {

            col = 0;

            for (col; col < h; col += 1) {


                if ( Grid.isOccupied(grid, row, col)) {

                    occupants = Grid.getOccupants(grid, row, col);

                    occupant_ids = Object.keys(occupants);

                    if (occupant_ids.length > 1) {

                        entities = [];

                        i = 0;
                        n = occupant_ids.length;

                        for (i; i < n; i += 1) {

                            id = occupant_ids[i];
                            entity = p_entities[id];
                            entities.push(entity);

                        }

                        // ORDER BY speed DESC;
                        entities.sort(sortEntitiesOnSpeed);

                        i = 0;
                        n = entities.length;

                        for (i; i < n; i += 1) {

                            entity = entities[i];

                            if (!isEntityAlive(entity)) {

                                continue;

                            }

                            j = 0;

                            for (j; j < n; j += 1) {

                                // Skip if entity is targeting itself
                                if (i === j) {

                                    continue;

                                }

                                target = entities[j];

                                // Skip dead things
                                if (!isEntityAlive(target)) {

                                    continue;

                                }

                                like = checkForLikableTrait(entity, target);

                                if (like && new_children.length < 20) {

                                    if (canEntityMateTarget(entity, target)) {

                                        child = mate(entity, target);

                                        child.x = (entity.x + target.x) / 2;
                                        child.y = (entity.y + target.y) / 2;

                                        direction = getRandomDirection();

                                        child.x += (child.size() * Math.random() * 2 * direction.x);
                                        child.y += (child.size() * Math.random() * 2 * direction.y);

                                        new_children.push(child);

                                    }

                                } else {

                                    if (canEntityKillTarget(entity, target)) {

                                        killEntity(target);

                                    }

                                }

                            }

                        }

                    }

                }

            }

        }

        return new_children;

    }

    function isOutOfBounds(entity) {

        var left = (entity.x < 0);
        var right = (entity.x > WIDTH);
        var top = (entity.y < 0);
        var bottom = (entity.y > HEIGHT);

        return (left || right || top || bottom);

    }

    function checkForDeath(entity) {

        if (isOutOfBounds(entity)) {

            killEntity(entity);

        }

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

            // Mutate 20% of the time for now.
            is_mutating = ((Math.random() + 0.2) > 1);

            if (is_mutating) {

                mutateEntity(entity);

            }

        }

    }

    // ----

    function updateValues() {

        var action_queue = [];

        updateEntityCounters(entities);

        resolveEntityMovement(entities);

        Grid.reset(grid);

        addEntitiesToGrid(entities, grid);

        queueEntityActionAttempts(entities, action_queue);

        resolveActionQueue(action_queue);

        // new_children = resolveTouchingEntities(entities, grid);

        // entities = entities.concat(new_children);

        entities.map(checkForDeath);

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

        var half_size = (entity.size() / 2);

        display.drawRect(
            entity.x - half_size,
            entity.y - half_size,
            (entity.size() | 0),
            (entity.size() | 0),
            entity.color()
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
    proto_render.getRandomDirection = getRandomDirection;

    return proto_render;

}())
