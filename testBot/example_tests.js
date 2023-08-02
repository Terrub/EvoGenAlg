import { TestBot } from "./testBot.js";

const resultsContainer = document.createElement('div');
document.body.appendChild(resultsContainer);

const resultRenderer = TestBot.renderResultsInDiv(resultsContainer);

const testRunner = new TestBot(resultRenderer);

const assertEqualsTest = testRunner.createSuite("Tests assertStrictlyEquals");
assertEqualsTest.addTest("Test assert strictly equals succeeding shows green", () => {
  const expected = "foo";
  const actual = "foo";

  testRunner.assertStrictlyEquals(expected, actual);
});

assertEqualsTest.addTest("Test assert strictly equals failing shows red", () => {
  const expected = "foo";
  const actual = "bar";

  testRunner.assertStrictlyEquals(expected, actual);
});

assertEqualsTest.addTest("Test assert strictly equals encounters error shows orange", () => {
  throw new Error("This should cause an error and show orange in TestBot.");
});

const assertObjectDeepCompareTest = testRunner.createSuite("Tests assertDeepCompareObjects");
assertObjectDeepCompareTest.addTest("Test assert deep compare of same objects shows green", () => {
  const expected = {
    name: 'deep compared object 1',
    id: 1,
    values: ['a', 'b', 'c'],
  };
  const actual = {
    id: 1,
    name: 'deep compared object 1',
    values: ['a', 'b', 'c'],
  };

  testRunner.assertDeepCompareObjects(expected, actual);
});

assertObjectDeepCompareTest.addTest("Test assert deep compare of different objects shows red", () => {
  const expected = {
    name: 'deep compared object 2',
    id: 2,
    values: ['a', 'b', 'c'],
  };
  const actual = {
    name: 'deep compared object 2',
    id: 2,
    values: [1,2,3],
  }

  testRunner.assertDeepCompareObjects(expected, actual);
});

assertObjectDeepCompareTest.addTest("Test assert deep compare encounters error shows orange", () => {
  throw new Error("This should cause an error and show orange in TestBot.");
});

const assertErrorTest = testRunner.createSuite("Tests assertThrowsExpectedError");
assertErrorTest.addTest("Test assert expected error thrown shows green", () => {
  testRunner.assertThrowsExpectedError(TypeError);

  throw new TypeError("This error should be expected and show up green.");
});

assertErrorTest.addTest("Test assert unexpected error thrown shows red", () => {
  testRunner.assertThrowsExpectedError(RangeError);

  throw new TypeError("This error should not be expected and show up red.");
});

const assertRangeTest = testRunner.createSuite("Tests assertInRange");
assertRangeTest.addTest("Test assertInRange shows green",() => {
  const actual = 0.1;
  const expectedMin = 0.0;
  const expectedMax = 0.2;
  
  testRunner.assertInRange(expectedMin, actual, expectedMax);
});

assertRangeTest.addTest("Test assertInRange shows red when value less than min",() => {
  const actual = 0.1;
  const expectedMin = 0.2;
  const expectedMax = 0.3;
  
  testRunner.assertInRange(expectedMin, actual, expectedMax);
});

assertRangeTest.addTest("Test assertInRange shows red when value greater than max",() => {
  const actual = 0.2;
  const expectedMin = 0.0;
  const expectedMax = 0.1;
  
  testRunner.assertInRange(expectedMin, actual, expectedMax);
});


assertRangeTest.addTest("Test assertInRange throws error when value is NaN",() => {
  const actual = '';
  const expectedMin = 1.0;
  const expectedMax = 10.0;
  
  testRunner.assertInRange(expectedMin, actual, expectedMax);
});


testRunner.run();