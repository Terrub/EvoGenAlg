function createWorld(width, height) {
    var proto_world;
    var entities = [];
    let entityPositions = {};
    var grid;
    
    function getRandomNibble() {
        nibble = Math.random() + 0.5 | 0;
        
        return nibble;
    }

    function createGenome() {
        var proto_genome;        
        var num_traits;

        // create between [1,8) pairs of segments
        num_traits = 2 * generateRandomNumber(10,5);
        proto_genome = "";

        // Seed the empty genome with random octets
        for (let i = 0; i < num_traits * 8; i += 1) {
            const nibble = getRandomNibble();
            proto_genome += nibble;
        }
        
        return proto_genome;
    }

    function mutateGenome(genome) {
        let mutated_genome = "";
        const add_count = (genome.match(/11/g) || []).length;
        const add_bias = add_count / genome.length;
        const sub_count = (genome.match(/00/g) || []).length;
        const sub_bias = sub_count / genome.length;
        const trsl_count = (genome.match(/01/g) || []).length;
        const trsl_bias = trsl_count / genome.length;
        for (let i = 0; i < genome.length; i += 1) {
            const nibble = genome[i];
            if ((Math.random() + add_bias | 0) === 1) {
                mutated_genome += nibble + getRandomNibble();
            }
            else if ((Math.random() + sub_bias | 0) === 1) {
                // Do nothing, removing current nibble
            }
            else if ((Math.random() + trsl_bias | 0) === 1) {
                mutated_genome += getRandomNibble();
            }
            else {
                mutated_genome += nibble;
            }
        }

        return mutated_genome;
    }

    function combineGenomes(a, b) {
        let new_genome = "";
        let a_cursor = 0;
        let b_cursor = 0;
        
        while (a_cursor < a.length && b_cursor < b.length) {
            const random_multiplier = Math.random();
            const a_segment_length = random_multiplier * a.length | 0;
            const b_segment_length = random_multiplier * b.length | 0;
            if (Math.random() + 0.5 | 0) {
                new_genome += a.substr(a_cursor, a_segment_length);
            } else {
                new_genome += b.substr(b_cursor, b_segment_length);
            }
            a_cursor += a_segment_length;
            b_cursor += b_segment_length;
        }

        return new_genome;
    }

    function createEntity(genome) {
        var proto_entity;

        function increaseEntityAge() {
            proto_entity.age += 1;
        }
    
        proto_entity = {
            "genome": genome,
            "age": 0,
            "increaseAge": increaseEntityAge
        };

        return proto_entity;
    }

    function getIndexFromPosition(x, y) {
        const index = y * width + x;

        return index;
    }

    function getPositionFromIndex(index) {
        const position = {
            x: (index % width),
            y: (index / width | 0)
        };

        return position
    }

    function addEntityAt(entity, x, y) {
        const position = getIndexFromPosition(x, y);
        entity["position"] = position;
        if (position >= 0 && position < (width * height)) {
            entityPositions[position] = entity;
            entities.push(entity);
        }

        setGridValueAt(1, x, y);
    }

    function killEntityAt(x, y) {
        const index = getIndexFromPosition(x, y);
        for (let i = 0; i < entities.length; i += 1) {
            const entity = entities[i];
            if (entity.position === index) {
                entities.splice(i, 1);
            }
        }
        delete entityPositions[index];

        setGridValueAt(0, x, y);
    }

    function getEntityAtIndex(index) {
        return entityPositions[index];
    }

    function getEntityAt(x, y) {
        const index = getIndexFromPosition(x, y);
        const entity = getEntityAtIndex(index);

        return entity;
    }

    function hasEntityAt(x, y) {
        const index = getIndexFromPosition(x, y);
        const entity = getEntityAtIndex(index);
        
        if (entity) { return true; }
        else { return false; }
    }

    function getEntities() {
        return entities;
    }

    function getGridValueAt(x, y) {
        let value = 0;
        if (x >= 0 && x < width && y >= 0 && y < height) {
            let index = y * width + x;
            value = grid[index];
        }

        return value;
    }

    function setGridValueAt(value, x, y) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
            let index = y * width + x;
            grid[index] = value;
        }
    }

    function getGrid() {
        return grid;
    }

    // Create the random world grid
    grid = new Uint8Array(width * height);
    for (let i = 0; i < grid.length; i += 1) {
        const value = Math.random() + 0.02 | 0;
        grid[i] = value;
    }

    proto_world = {
        "width": width,
        "height": height,
        "createGenome": createGenome,
        "createEntity": createEntity,
        "combineGenomes": combineGenomes,
        "getPositionFromIndex": getPositionFromIndex,
        "getIndexFromPosition": getIndexFromPosition,
        "getEntities": getEntities,
        "getGrid": getGrid,
        "getEntityAt": getEntityAt,
        "getEntityAtIndex": getEntityAtIndex,
        "getGridValueAt": getGridValueAt,
        "setGridValueAt": setGridValueAt,
        "hasEntityAt": hasEntityAt,
        "addEntityAt": addEntityAt,
        "killEntityAt": killEntityAt,
        "mutateGenome": mutateGenome
    }

    return proto_world;
}