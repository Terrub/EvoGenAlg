var renderer = {}
var animating = false;
var tics;
var entities;
var world_is_loaded = false;
var display = getDisplay(100, 100)

function calculateNewState() {
    entities.forEach(entity => {
        entity.consumeEnergy();
    });
}

function drawCurrentState() {
    display.clear();
    entities.forEach(entity => {
        display.drawCircle(50, 50, 10, entity.getColor())
    });
}

function createEntity() {
    var proto_entity = {
        "energy": 100,
        "muscle_mass": 5,
        "red": generateRandomNumber(0,1),
        "blue": generateRandomNumber(0,1),
        "green": generateRandomNumber(0,1)
    };
    
    proto_entity.consumeEnergy = function() {
        proto_entity.energy -= proto_entity.muscle_mass;
    }

    proto_entity.getColor = function () {
        var red = proto_entity.red * 256 | 0;
        var green = proto_entity.green * 256 | 0;
        var blue = proto_entity.blue * 256 | 0;
        
        return "rgba(" + red + "," + green + "," + blue + ",1)";
    }

    return proto_entity;
}

function addEntity(entity) {
    entities.push(entity);
}

function updateWorld() {
    calculateNewState();
    drawCurrentState();
}

function loadWorld() {
    var entity = createEntity();
    addEntity(entity);
}
