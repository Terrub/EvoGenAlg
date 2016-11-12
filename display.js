function getDisplay() {

    var display;
    var canvas;
    var glib;

    canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;

    document.body.appendChild(canvas);

    glib = canvas.getContext("2d");

    display = {};

    display.drawPixel = function(x, y, color) {

        glib.fillStyle = color;
        glib.fillRect(x, y, 1, 1);

    }

    display.drawRect = function(x, y, w, h, color) {

        glib.fillStyle = color;
        glib.fillRect(x, y, w, h);

    }

    display.fill = function(color) {

        glib.fillStyle = color;
        glib.fillRect(0, 0, canvas.width, canvas.height);

    }

    display.clear = function() {

        glib.clearRect(0, 0, canvas.width, canvas.height);

    }

    return display;

}
