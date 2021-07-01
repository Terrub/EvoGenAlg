import { Utils } from '../utils';

export const ropBotTestRunner = (function ropBotTestRunnerConstructor() {
  let result;
  let conclusion;
  let color;
  let statement;
  let expectation;
  let experiment;
  const assertions = [];
  let assertion;

  function postResults() {
    Utils.report(
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
    if (Utils.isUndefined(pStatement)) {
      Utils.reportUsageError('Statement is required.');
    }

    statement = pStatement;

    if (!Utils.isFunction(pExperiment)) {
      postResults();

      return false;
    }

    experiment = pExperiment;
    assertion = assertions[pAssertion];
    if (Utils.isUndefined(assertion)) {
      Utils.reportUsageError(`Assertion not recognised: ${pAssertion}`);
    }

    assertion();
    postResults();

    return conclusion;
  };

  function addAssertion(key, description, assertFunction) {
    if (!Utils.isString(key)
      || !Utils.isString(description)
      || !Utils.isFunction(assertFunction)) {
      Utils.reportUsageError('Usage: key <String>, description <String>, assertFunction <Function>.');
    }

    if (!Utils.isUndefined(self[key])) {
      Utils.reportUsageError(`following key is already in use: ${key}`);
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

    if (Utils.objectEquals(result, expectation)) {
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
