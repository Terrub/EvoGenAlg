////////////////////////////////////////////////////////////////////////////////
//
//  NOTES:
/*

    *:  (Action)Points
    -:  Comments
    !:  Warnings or urgencies
    ?:  Questions or requests
    >:  Answers or results

*/

////////////////////////////////////////////////////////////////////////////////
//
//  DESCRIPTION:
/*

*/

"use strict";

var Settings;

function define_Settings() {

    var proto_settings = {};

    var SETTINGS_KEYS = [
        "display constructor",
        "display width",
        "display height"
    ];

    proto_settings.createSettings = function(p_settings_obj) {

        var settings = {};
        var settings_key;
        var seting;
        var i;
        var n;

        settings["display constructor"] = function construct_canvas() {

            var canvas = document.createElement("canvas");

            document.body.appendChild(canvas);

            return canvas;

        };
        settings["display width"] = 800;
        settings["display height"] = 600;

        i = 0;
        n = SETTINGS_KEYS.length;

        for (i; i < n; i += 1) {

            settings_key = SETTINGS_KEYS[i];

            setting = p_settings_obj[settings_key];

            if (isDefined(setting)) {

                settings[settings_key] = setting;

            }

        }

        return settings;

    };

    return proto_settings;

}

Settings = define_Settings();

//------------------------------------------------------------------------------

// RopBotTestRunner(
//     statement,
//     assertion,
//     expectation,
//     experiment
// )

(function runTests() {

    RopBotTestRunner(
        "Settings is defined",
        RopBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        true,
        function() {

            return isDefined(Settings);

        }
    );

    RopBotTestRunner(
        "Settings can create a new instance",
        RopBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        true,
        function() {

            var settings = Settings.createSettings();

            return isDefined(settings);

        }
    );

    RopBotTestRunner(
        "Settings can create a new instance based on previous settings object",
        RopBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
        true,
        function() {

            var does_this_get_called = false;

            var settings_obj = {
                "display constructor": function construct_canvas() {
                    does_this_get_called = true;
                },
                "display width": 101,
                "display height": 102
            };

            var settings = Settings.createSettings(settings_obj);

            return (
                settings["display width"] === 101 &&
                settings["display height"] === 102 &&
                isFunction(settings["display constructor"])
            );

        }
    );

}())
