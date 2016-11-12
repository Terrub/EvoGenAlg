function getRandomColor() {

    var red = generateRandomNumber(0, 255);
    var green = generateRandomNumber(0, 255);
    var blue = generateRandomNumber(0, 255);
    var color = "rgba(" + red + "," + green + "," + blue + ",1)";

    return color;

}

function createEntity() {

    var entity;

    entity = {};

    entity.x = 0;
    entity.y = 0;
    entity.width = 10;
    entity.height = 10;

    entity.color = getRandomColor();

    entity.speed = generateRandomNumber(0, 10) * 0.2;

    entity.status = 1;

    return entity;

}

function getEntities(amount) {

    var entities;
    var i = 0;
    var n = amount;

    entities = [];

    for ( i; i < n; i += 1 ) {

        entities[i] = createEntity();

    }

    return entities;

}
