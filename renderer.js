
////////////////////////////////////////////////////////////////////////////////
//
//  NOTES:
/*

    *:  (Action)Points
    -:  Comments
    !:  Warnings or urgencies
    ?:  Questions or requests
    >:  Answers or results

    -   I don't like having to create a canvas here. But I don't really want to
        create it over in the html either.
        Perhaps I should have a separate file that defines the settings?
        Then again, perhaps I should consider the index to be the settings file?

*/

////////////////////////////////////////////////////////////////////////////////
//
//  DESCRIPTION:
/*

    This is the world object. (Might want to rename?)
    This is where the ruleset is loaded up into and applied on the entities
    that live here.

    Like plotting a formula. The ruleset is the formula. the entities are
    the data points and the colours of each data point.
    The world object then dictates how many data points are visible in the
    current world frame/viewport and runs the datapoints through the formula
    to get the actual display data that needs to be sent to the display
    object.

*/



"use strict";

var Renderer;

function define_Renderer() {

}

Renderer = define_Renderer();

// RopBotTestRunner(p_statement, p_assertion, p_expectation, p_experiment)

(function runTests() {



}())
