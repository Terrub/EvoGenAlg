/* eslint
    no-bitwise: ["error", { "allow": ["|", "^"] }]
 */

function isUndefined(value) {
  // NOTE 1: value being a reference to something.

  /* NOTE 2: changed the use of: */
  // return (value === undefined);
  /* to: */
  return (typeof value === 'undefined');
  /* as this is supported on more browsers according to Teun Lassche */
}

function isDefined(value) {
  return !isUndefined(value);
}

function isBoolean(value) {
  return (typeof value === 'boolean');
}

function isNumber(num) {
  return (typeof num === 'number');
}

function isInteger(value) {
  return (value === +value) && (value === (value | 0));
}

function isString(value) {
  return (typeof value === 'string');
}

function isNull(value) {
  return value === null;
}

function isObject(value) {
  // #NOTE1: typeof null === 'object' so check for null as well!
  if (isNull(value)) {
    return false;
  }
  if (isUndefined(value)) {
    return false;
  }

  return (typeof value === 'object');
}

function isFunction(value) {
  return (typeof value === 'function');
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
  // if they are regexps, they should exactly refer to same one
  //    it is hard to better equality check on current ES
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
  const xKeys = Object.keys(x);
  const yKeysInX = Object.keys(y).every((i) => xKeys.indexOf(i) !== -1);
  const valuesEqual = xKeys.every((i) => objectEquals(x[i], y[i]));

  return (yKeysInX && valuesEqual);
}

// --------

function faultOnError(err) {
  const errBody = document.createElement('body');
  errBody.style.backgroundColor = '#cc3333';
  errBody.style.color = '#ffffff';
  errBody.innerHTML = `<pre>${err}</pre>`;
  document.body = errBody;

  throw err;
}

function attempt(toAttempt, ...args) {
  let result;

  try {
    result = toAttempt(...args);
  } catch (err) {
    faultOnError(err);
  }

  return result;
}

function report(...args) {
  // eslint-disable-next-line no-console
  console.log(...args);
}

function reportError(error) {
  throw new Error(error);
}

function onlyProceedIf(statement, check) {
  if (attempt(check, [statement]) !== true) {
    reportError('A checkpoint failed, check the stack for more info.');
  }
}

function getTime() {
  return Date.now();
}

function generateRandomNumber(pMax, pMin) {
  let max = pMax;
  let min = pMin;

  if (typeof max === 'undefined') { max = 100; }
  if (typeof min === 'undefined') { min = 0; }
  const randomNumber = Math.floor((Math.random() * (max - min)) + min);

  return randomNumber;
}

function reportUsageError(error) {
  // For now just report the error normally;
  reportError(error);
}

// --------

const formatise = (function ConstructFormatise() {
  let argumentsToFormat;
  const supportedTypes = {};
  let supportedTypeFlags = '';
  let pattern;
  let patternWasChanged = true;

  function addFormatType(flag, typeDefinitionTest) {
    if (!isString(flag)) {
      reportUsageError(
        'formatise.addFormatType expects argument #1 to be of type'
        + " 'String'.",
      );
    }

    if (!isFunction(typeDefinitionTest)) {
      reportUsageError(
        'formatise.addFormatType expects argument #2 to be of type'
        + " 'Function'.",
      );
    }

    supportedTypes[flag] = typeDefinitionTest;
    supportedTypeFlags += flag;
    patternWasChanged = true;
  }

  function typeCheck(match, position, typeFlag) {
    const insertValue = argumentsToFormat[position - 1];
    const checkType = supportedTypes[typeFlag];

    if (isUndefined(insertValue)) {
      // _report("Formatize parameter mismatch");
      return 'undefined';
    }

    if (!checkType) {
      // _report("Formatize unsupported type");
      return '[unsupported type]';
    }

    if (!checkType(insertValue)) {
      // _report("Formatize type mismatch");
      return '[type mismatch]';
    }

    return insertValue;
  }

  function updatePattern() {
    /*  Attempt to find & replace en masse to prevent loops
     Hopefully the 'g' modifier is enough */
    pattern = new RegExp(
      `{@([1-9][0-9]*):([${supportedTypeFlags}])}`,
      'gi',
    );
    patternWasChanged = false;
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
  function format(suppliedFormat, ...args) {
    /*  We need to store all the given arguments we received here so
     we can pass them along to the 'typecheck and replace'-function in
     our String.replace down below. */
    argumentsToFormat = args;
    if (patternWasChanged) {
      updatePattern();
    }

    if (!isString(suppliedFormat)) {
      // report(
      //     "function 'format' expected string as argument #1, received:",
      //     suppliedFormat
      // );
      return false;
    }

    return suppliedFormat.replace(pattern, typeCheck);
  }

  addFormatType('b', isBoolean);
  addFormatType('n', isNumber);
  addFormatType('i', isInteger);
  addFormatType('s', isString);

  /*  Allow the outside to reach us. */
  const self = format;
  self.addFormatType = addFormatType;

  return self;
}());

const ropBotTestRunner = (function ropBotTestRunnerConstructor() {
  let result;
  let conclusion;
  let color;
  let statement;
  let expectation;
  let experiment;
  const assertions = [];
  let assertion;

  function postResults() {
    report(
      'RopBot: %c%s %c| %cExpectation: %o %c| %cResult: %o',
      color, statement,
      'color: yellow', 'color: gray', expectation,
      'color: yellow', 'color: gray', result,
    );
  }

  const self = function runRopBotTester(pStatement, pAssertion, pExpectation, pExperiment) {
    result = undefined;
    conclusion = undefined;
    color = 'color: orange';
    expectation = pExpectation;

    // Default the statement;
    // we could be using it later for error reporting.
    if (isUndefined(pStatement)) {
      reportUsageError('Statement is required.');
    }

    statement = pStatement;

    if (!isFunction(pExperiment)) {
      postResults();

      return false;
    }

    experiment = pExperiment;
    assertion = assertions[pAssertion];
    if (isUndefined(assertion)) {
      reportUsageError(`Assertion not recognised: ${pAssertion}`);
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
    conclusion = false;

    try {
      result = experiment();
    } catch (error) {
      result = error;
      color = 'color: red';
    }

    if (result === expectation) {
      color = 'color: green';
      conclusion = true;
    }
  }

  function assertThrowsExpectedError() {
    conclusion = false;

    try {
      result = experiment();
    } catch (error) {
      result = error;
    }

    if (result !== expectation) {
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
    assertStrictlyEqual,
  );
  addAssertion(
    'RESULT_THROWS_EXPECTED_ERROR',
    'Result should throw the expected error message.',
    assertThrowsExpectedError,
  );
  addAssertion(
    'RESULT_OBJECT_DEEP_COMPARE',
    'Resulting object should contain similar contents recursively',
    assertDeepCompareObjects,
  );

  return self;
}());
