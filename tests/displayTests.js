import { TestBot } from "../testBot/testBot.js";
import { Display } from "../actors/display.js";

const resultsContainer = document.createElement("div");
document.body.appendChild(resultsContainer);

const resultRenderer = TestBot.renderResultsInDiv(resultsContainer);
const testRunner = new TestBot(resultRenderer);

const displayTests = testRunner.createSuite("Tests Display");

function getMockGlib(fnName, fnCallback) {
  const mockGlib = {
    fillStyle: "",
  };
  mockGlib[fnName] = fnCallback;

  return mockGlib;
}

displayTests.addTest(
  "Display.drawPixel exists and properly calls the glib",
  () => {
    let actualFillRectArguments;
    const mockGlib = getMockGlib("fillRect", (x, y, w, h) => {
      actualFillRectArguments = [x, y, w, h];
    });

    const testDisplay = new Display(mockGlib, 100, 100);
    testDisplay.drawPixel(0, 0, "test color string");

    const actual = {
      fillRectArguments: actualFillRectArguments,
      fillStyle: mockGlib.fillStyle,
    };

    const expected = {
      fillRectArguments: [0, 0, 1, 1],
      fillStyle: "test color string",
    };

    testRunner.assertDeepCompareObjects(expected, actual);
  }
);

displayTests.addTest(
  "Display.drawRect exists and properly calls the glib",
  () => {
    let actualFillRectArguments;
    const mockGlib = getMockGlib("fillRect", (x, y, w, h) => {
      actualFillRectArguments = [x, y, w, h];
    });

    const testDisplay = new Display(mockGlib, 100, 100);
    testDisplay.drawRect(10, 10, 100, 100, "test color string");

    const actual = {
      fillRectArguments: actualFillRectArguments,
      fillStyle: mockGlib.fillStyle,
    };

    const expected = {
      fillRectArguments: [10, 10, 100, 100],
      fillStyle: "test color string",
    };

    testRunner.assertDeepCompareObjects(expected, actual);
  }
);

displayTests.addTest(
  "Display.clear exists and invokes the clearRect on glib properly",
  () => {
    let actualFillRectArguments;
    const mockGlib = getMockGlib("clearRect", (x, y, w, h) => {
      actualFillRectArguments = [x, y, w, h];
    });
    const testDisplay = new Display(mockGlib, 200, 200);

    testDisplay.clear();
    const actual = {
      clearRectArguments: actualFillRectArguments,
    };

    const expected = {
      clearRectArguments: [0, 0, 200, 200],
    };

    testRunner.assertDeepCompareObjects(expected, actual);
  }
);

testRunner.run();
