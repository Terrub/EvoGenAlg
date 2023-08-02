import { Renderer } from "../connectors/renderer.js";
import { TestBot } from "../testBot/testBot.js";

const resultsContainer = document.createElement("div");
document.body.appendChild(resultsContainer);

const resultRenderer = TestBot.renderResultsInDiv(resultsContainer);
const testRunner = new TestBot(resultRenderer);

const rendererTests = testRunner.createSuite("Tests Renderer");

rendererTests.addTest(
  "Renderer.getByteAverage with segment '00000001' returns 1",
  () => {
    const byteSegment = "00000001";
    const actual = Renderer.getByteAverage(byteSegment);
    const expected = 1;

    testRunner.assertStrictlyEquals(expected, actual);
  }
);

rendererTests.addTest(
  "Renderer.getByteAverage with segment '00000001000000010000000100000001' still returns 1",
  () => {
    const byteSegment = "00000001000000010000000100000001";
    const actual = Renderer.getByteAverage(byteSegment);
    const expected = 1;

    testRunner.assertStrictlyEquals(expected, actual);
  }
);

rendererTests.addTest(
  "Renderer.getByteAverage with segment '00000000111111110000000011111111' returns 127",
  () => {
    const byteSegment = "00000000111111110000000011111111";
    const actual = Renderer.getByteAverage(byteSegment);
    const expected = 127;

    testRunner.assertStrictlyEquals(expected, actual);
  }
);

rendererTests.addTest(
  "SPECIAL CASE: Renderer.getColorFromSegmentByteAverage with genome containing only zeroes returns white",
  () => {
    const genome = "000000000000";
    const actual = Renderer.getColorFromSegmentByteAverage(genome);
    const expected = "white";

    testRunner.assertStrictlyEquals(expected, actual);
  }
);

rendererTests.addTest("renderer has displayGenome method that calls drawRect for each nine cells", () => {
  const genome = "01011010";
  const size = 3;
  const actualCellCalls = [];
  const mockDisplay = {
    drawRect: (x, y, w, h, c) => {
      actualCellCalls.push({ x: x, y: y, w: w, h: h, c: c });
    },
  };
  const mockWorld = {};
  const renderer = new Renderer(mockDisplay, mockWorld, size);

  renderer.displayGenome(genome);

  const expectedCellCalls = [
    { x: 0 * size + 0, y: 0 * size + 0, w: size, h: size, c: "gray" },
    { x: 1 * size + 1, y: 0 * size + 0, w: size, h: size, c: "lightgreen" },
    { x: 2 * size + 2, y: 0 * size + 0, w: size, h: size, c: "gray" },
    { x: 0 * size + 0, y: 1 * size + 1, w: size, h: size, c: "lightgreen" },
    { x: 1 * size + 1, y: 1 * size + 1, w: size, h: size, c: "lightgreen" },
    { x: 2 * size + 2, y: 1 * size + 1, w: size, h: size, c: "lightgreen" },
    { x: 0 * size + 0, y: 2 * size + 2, w: size, h: size, c: "gray" },
    { x: 1 * size + 1, y: 2 * size + 2, w: size, h: size, c: "lightgreen" },
    { x: 2 * size + 2, y: 2 * size + 2, w: size, h: size, c: "gray" },
  ];

  testRunner.assertDeepCompareObjects(expectedCellCalls, actualCellCalls);
});

testRunner.run();
