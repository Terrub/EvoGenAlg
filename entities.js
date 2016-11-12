function getRandomColor() {

    var colors;
    var index;
    var color;

    colors = [
        "white",    "gray",     "black",    "red",  "orange",
        "yellow",   "green",    "cyan",     "blue", "purple"
    ];
    index = generateRandomNumber(0, colors.length);
    color = colors[index];

    return color;

}

function createEntity() {

    var entity;

    entity = {};

    entity.x = generateRandomNumber(0, 800);
    entity.y = generateRandomNumber(0, 600);

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
