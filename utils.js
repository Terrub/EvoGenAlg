"use strict";

function isUndefined(value) {
  // NOTE 1: value being a reference to something.

  /* NOTE 2: changed the use of: */
  // return (value === undefined);
  /* to: */
  return (typeof value === "undefined");
  /* as this is supported on more browsers according to Teun Lassche */
}

function isDefined(value) {
  return !isUndefined(value);
}

function isBoolean(value) {
  return (typeof value === "boolean");
}

function isNumber(num) {
  return (typeof num === "number");
}

function isInteger(value) {
  return (value === +value) && (value === (value | 0));
}

function isString(value) {
  return (typeof value === "string");
}

function isNull(value) {
  return value === null;
}

function isObject(value) {
  //#NOTE1: typeof null === 'object' so check for null as well!
  if (isNull(value)) {
    return false;
  }
  if (isUndefined(value)) {
    return false;
  }

  return (typeof value === "object");
}

function isFunction(value) {
  return (typeof value === "function");
}

function isEmptyObject(value) {
  if (!isObject(value)) {
    return false;
  }

  return (Object.getOwnPropertyNames(value).length === 0);
}

function isArray(value) {
  return (Array.isArray(value));
}

function objectEquals(x, y) {
  if (isNull(x) || isNull(y) || isUndefined(x) || isUndefined(y)) {
    return x === y;
  }

  // after this just checking type of one would be enough
  if (x.constructor !== y.constructor) {
    return false;
  }

  // if they are functions, they should exactly refer to same one (because of closures)
  // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
  if (x instanceof Function || x instanceof RegExp) {
    return x === y;
  }

  if (x === y || x.valueOf() === y.valueOf()) {
    return true;
  }

  if (isArray(x) && x.length !== y.length) {
    return false;
  }

  // if they are dates, they must've had equal valueOf
  if (x instanceof Date) {
    return false;
  }

  // if they are strictly equal, they both need to be object at least
  if (!(isObject(x) && isObject(y))) {
    return false;
  }

  // recursive object equality check
  let p = Object.keys(x);

  return Object.keys(y).every((i) => {
    return p.indexOf(i) !== -1;
  }) && p.every((i) => {
    return objectEquals(x[i], y[i]);
  });
}

// --------

function faultOnError(err) {
  var errBody = document.createElement("body");
  errBody.style.backgroundColor = "#cc3333";
  errBody.style.color = "#ffffff";
  errBody.innerHTML = "<pre>" + err + "</pre>";
  document.body = errBody;

  throw err;
}

function attempt(toAttempt, args) {
  try {
    return toAttempt.apply(null, args);
  } catch (err) {
    faultOnError(err);
  }
}

function onlyProceedIf(statement, check) {
  if (attempt(check, [statement]) !== true) {
    reportError("A checkpoint failed, check the stack for more info.");
  }
}

function getTime() {
  return Date.now();
}

function generateRandomNumber(max, min) {
  var random_number;
  if (typeof max === "undefined") { max = 100; }
  if (typeof min === "undefined") { min = 0; }
  random_number = Math.floor((Math.random() * (max - min)) + min);

  return random_number;
}

function report() {
  console.log.apply(console, arguments);
}

function reportError(error) {
  throw new Error(error);
}

function reportUsageError(error) {
  // For now just report the error normally;
  reportError(error);
}

// --------

const formatise = (function ConstructFormatise() {
  var self;
  var arguments_to_format;
  var supported_types = {};
  var supported_type_flags = "";
  var pattern;
  var pattern_was_changed = true;

  function addFormatType(flag, typeDefinitionTest) {
    if (!isString(flag)) {
      reportUsageError(
        "formatise.addFormatType expects argument #1 to be of type"
        + " 'String'."
      );
    }

    if (!isFunction(typeDefinitionTest)) {
      reportUsageError(
        "formatise.addFormatType expects argument #2 to be of type"
        + " 'Function'."
      );
    }

    supported_types[flag] = typeDefinitionTest;
    supported_type_flags += flag;
    pattern_was_changed = true;
  }

  function typeCheck(match, position, type_flag) {
    var insert_value = arguments_to_format[position];
    var checkType = supported_types[type_flag];

    if (isUndefined(insert_value)) {
      // _report("Formatize parameter mismatch");
      return "undefined";
    }

    if (!checkType) {
      // _report("Formatize unsupported type");
      return "[unsupported type]";
    }

    if (!checkType(insert_value)) {
      // _report("Formatize type mismatch");
      return "[type mismatch]";
    }

    return insert_value;
  }

  function updatePattern() {
    /*  Attempt to find & replace en masse to prevent loops
     Hopefully the 'g' modifier is enough */
    pattern = new RegExp(
      "{@([0-9]+):([" + supported_type_flags + "])}",
      "gi"
    );
    pattern_was_changed = false;
  }

  /**
   * Formatises a list of variable arguments into the allocated position of
   * the given format.
   *
   * Arguments:
   *  <string> "format"
   *      The format the given arguments have to be allocated to.
   *  <*> ... (optional)
   *      A variable list of arguments that will be ordered into the given
   *      format.
   *      Available format options:
   *      "{@x:T}" where x is the position of the argument in the provided
   *      argument list (optional)
   *      and T = the required type (or types?) the argument needs to adhere
   *      to.
   *      Possible types are:
   *      - 'b' Boolean
   *      - 'i' Integer
   *      - 'n' Number
   *      - 's' String
   *
   * Return:
   *  <string>
   *      The formatted arguments
   */
  function format(supplied_format) {
    /*  We need to store all the given arguments we received here so we so
     we can pass them along to the 'typecheck and replace'-function in
     our String.replace down below. */
    arguments_to_format = arguments;
    if (pattern_was_changed) {
      updatePattern();
    }

    if (!isString(supplied_format)) {
      // report(
      //     "function 'format' expected string as argument #1, received:",
      //     supplied_format
      // );
      return false;
    }

    return supplied_format.replace(pattern, typeCheck);
  }

  addFormatType("b", isBoolean);
  addFormatType("n", isNumber);
  addFormatType("i", isInteger);
  addFormatType("s", isString);

  /*  Allow the outside to reach us. */
  self = format;
  self.addFormatType = addFormatType;

  return self;
}());

const ropBotTestRunner = (function ropBotTestRunnerConstructor() {
  "use strict";

  let result;
  let conclusion;
  let color;
  let statement;
  let expectation;
  let experiment;
  let assertions = [];
  let assertion;

  function postResults() {
    report(
      `RopBot: %c%s %c| %cExpectation: %o %c| %cResult: %o`,
      color, statement,
      'color: yellow', 'color: gray', expectation,
      'color: yellow', 'color: gray', result
    );
  }

  const self = function (p_statement, p_assertion, p_expectation, p_experiment) {
    result = undefined;
    conclusion = undefined;
    color = 'color: orange';
    expectation = p_expectation;

    // Default the statement;
    // we could be using it later for error reporting.
    if (isUndefined(p_statement)) {
      reportUsageError('Statement is required.');
    }

    statement = p_statement;

    if (!isFunction(p_experiment)) {
      postResults();

      return false;
    }

    experiment = p_experiment;
    assertion = assertions[p_assertion];
    if (isUndefined(assertion)) {
      reportUsageError(`Assertion not recognised: ${p_assertion}`);
    }

    assertion();
    postResults();

    return conclusion;
  };

  function addAssertion(key, description, assertFunction) {
    if (!isString(key)
      || !isString(description)
      || !isFunction(assertFunction)) {
      reportUsageError('Usage: key <String>, description <String>, assertFunction <Function>.');
    }

    if (!isUndefined(self[key])) {
      reportUsageError(`following key is already in use: ${key}`);
    }

    self[key] = description;
    assertions[description] = assertFunction;
  }

  function assertStrictlyEqual() {
    try {
      result = experiment();
    } catch (error) {
      result = error;
      color = 'color: red';
    }

    conclusion = (result === expectation);

    if (conclusion === true) {
      color = 'color: green';
    }
  }

  function assertThrowsExpectedError() {
    conclusion = false;
    try {
      result = experiment();
    } catch (error) {
      result = error;
    }

    if (error !== expectation) {
      conclusion = true;
      color = 'color: green';
    }
  }

  function assertDeepCompareObjects() {
    conclusion = false;

    try {
      result = experiment();
    } catch (error) {
      result = error;
      color = 'color: red';
    }

    if (objectEquals(result, expectation)) {
      conclusion = true;
      color = 'color: green';
    }
  }

  // Add all the constants here:
  addAssertion(
    'RESULT_EXACTLY_MATCHES_EXPECTATION',
    'Result and expectation are exactly the same.',
    assertStrictlyEqual
  );
  addAssertion(
    'RESULT_THROWS_EXPECTED_ERROR',
    'Result should throw the expected error message.',
    assertThrowsExpectedError
  );
  addAssertion(
    'RESULT_OBJECT_DEEP_COMPARE',
    'Resulting object should contain similar contents recursively',
    assertDeepCompareObjects
  );

  return self;
}());
