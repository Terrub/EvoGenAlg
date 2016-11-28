
////////////////////////////////////////////////////////////////////////////////
//
//  NOTES:
/*

    The display should just be a wrapper and interface for the canvas 2d context
    for now. But I'd like to be able to use different displays.

*/

"use strict";

var Display;

function define_Display() {

    var proto_display;

    function createDisplay(p_canvas) {

        var instance = {};
        var internal_width = 0;
        var internal_height = 0;

        instance.context = p_canvas.getContext('2d');

        Object.defineProperty(instance, "width", {
            get: function() { return p_canvas.width },
            set: function(value) { p_canvas.width = value },
            enumerable: true,
            configurable: false
        })

        Object.defineProperty(instance, "height", {
            get: function() { return p_canvas.height },
            set: function(value) { p_canvas.height = value },
            enumerable: true,
            configurable: false
        })

        return instance;

    }

    function drawCircle(p_instance, p_x, p_y, p_radius, p_color) {

        var ctx = p_instance.context;

        ctx.fillStyle = p_color;

        ctx.arc(p_x, p_y, p_radius, 0, 0);

    }

    function runTests() {

        RopBotTestRunner(
            "Display is defined",
            RopBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
            true,
            function() {

                return isDefined(Display);

            }
        );

        RopBotTestRunner(
            "Display can create a new instance with a canvas object",
            RopBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
            true,
            function() {

                var display_instance;
                var mock_canvas = {};

                mock_canvas.getContext = function () {}

                display_instance = Display.createDisplay(mock_canvas);

                return isDefined(display_instance);

            }
        );

        RopBotTestRunner(
            "Display can draw a circle on a 2d canvas",
            RopBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
            true,
            function() {

                var called_succesfully;
                var display;

                var x;
                var y;
                var radius;
                var color;

                var mock_canvas = {};

                mock_canvas.getContext = function() {

                    var mock_context = {};

                    mock_context.arc = function(p_x, p_y, p_r, p_s, p_e, p_c) {

                        called_succesfully = (p_x === 0) &&
                            (p_y === 0) &&
                            (p_r === 3) &&
                            (p_s === 0) &&
                            (p_e === 0) &&
                            (p_c !== true) &&
                            (mock_context.fillStyle === "black")

                    }

                    return mock_context;

                }

                display = Display.createDisplay(mock_canvas);
                x = 0;
                y = 0;
                radius = 3;
                color = "black";

                Display.drawCircle(display, x, y, radius, color);

                return called_succesfully;

            }
        );

    }

//------------------------------------------------------------------------------

    proto_display = {};

    proto_display.runTests = runTests;
    proto_display.createDisplay = createDisplay;
    proto_display.drawCircle = drawCircle;

    return proto_display;

}

Display = define_Display();

    // RopBotTestRunner(
    //     statement,
    //     assertion,
    //     expectation,
    //     experiment
    // )
