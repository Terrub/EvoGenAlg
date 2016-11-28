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

    var SETTINGS_KEYS = [];

    var default_settings = {};

    function addDefaultSetting(key, value) {

        default_settings[key] = value;

        SETTINGS_KEYS.push(key);

    }

    function construct_canvas() {

        var canvas = document.createElement("canvas");

        document.body.appendChild(canvas);

        return canvas;

    }

    function imbueSettingsObjectWith(p_settings, p_settings_obj) {

        var settings_key;
        var setting;
        var i;
        var n;

        i = 0;
        n = SETTINGS_KEYS.length;

        for (i; i < n; i += 1) {

            settings_key = SETTINGS_KEYS[i];

            setting = p_settings_obj[settings_key];

            if (isDefined(setting)) {

                p_settings[settings_key] = setting;

            }

        }

    }

    function createSettings(p_settings_obj) {

        var settings = {};
        var settings_obj = default_settings;

        if (isDefined(p_settings_obj)) {

            settings_obj = p_settings_obj;

        }

        imbueSettingsObjectWith(settings, settings_obj);

        return settings;

    };

    function runTests() {

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

                var settings_obj = {
                    "display constructor": function construct_canvas() {},
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

    }

//------------------------------------------------------------------------------

    addDefaultSetting("display constructor", construct_canvas);
    addDefaultSetting("display width", 800);
    addDefaultSetting("display height", 600);

    proto_settings.runTests = runTests;
    proto_settings.createSettings = createSettings;

    return proto_settings;

}

Settings = define_Settings();
