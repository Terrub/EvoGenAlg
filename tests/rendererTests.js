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
)

testRunner.run();
