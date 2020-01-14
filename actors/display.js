function createDisplay(canvas) {
    var proto_display;
    var glib;

    function drawPixel(x, y, color) {
        glib.fillStyle = color;
        glib.fillRect(x, y, 1, 1);
    }

    function drawRect(x, y, x2, y2, color) {
        glib.fillStyle = color;
        glib.fillRect(x, y, x2, y2);
    }

    function clear() {
        glib.clearRect(0, 0, canvas.width, canvas.height);
    }

    glib = canvas.getContext("2d");

    proto_display = {
        "drawPixel": drawPixel,
        "drawRect": drawRect,
        "clear": clear
    }

    return proto_display;
}
