import { TestBot } from "../testBot/testBot.js";
import { World } from "../actors/world.js";
import { Entity } from "../actors/entity.js";
import { Utils } from "../utils.js";
import { WorldConfig } from "../actors/worldConfig.js";

const resultsContainer = document.createElement("div");
document.body.appendChild(resultsContainer);

const resultRenderer = TestBot.renderResultsInDiv(resultsContainer);
const testRunner = new TestBot(resultRenderer);

const worldTests = testRunner.createSuite("Tests World");

function fixtureThreeByThreeWorldConfig(pEntities) {
  let entities = pEntities;
  if (Utils.isUndefined(pEntities)) {
    entities = [
      new Entity(""),
      undefined,
      new Entity(""),
      undefined,
      new Entity(""),
      undefined,
      new Entity(""),
      undefined,
      new Entity(""),
    ];
  }

  const worldConfig = new WorldConfig();
  worldConfig.width = 3;
  worldConfig.height = 3;
  worldConfig.maxNumTraits = 5;
  worldConfig.minNumTrais = 1;
  worldConfig.maxEntityAge = 10;
  worldConfig.chanceToMutate = 0.01;
  worldConfig.entities = entities;

  return worldConfig;
}

function fixtureTenBySevenWorldConfig() {
  const entities = [];
  const worldConfig = new WorldConfig();
  worldConfig.width = 10;
  worldConfig.height = 7;
  worldConfig.maxNumTraits = 5;
  worldConfig.minNumTrais = 1;
  worldConfig.maxEntityAge = 10;
  worldConfig.chanceToMutate = 0.01;
  worldConfig.entities = entities;

  return worldConfig;
}

worldTests.addTest(
  "World.getCurrentActiveTraitForEntity returns expected trait",
  () => {
    const genome = "000000001111111111110000110011001";
    const entity = new Entity(genome);

    const traitA = World.getCurrentActiveTraitForEntity(entity);
    entity.increaseAge();
    const traitB = World.getCurrentActiveTraitForEntity(entity);
    entity.increaseAge();
    const traitC = World.getCurrentActiveTraitForEntity(entity);

    const actual = [traitA, traitB, traitC];

    const expected = ["00000000", "11110000", "00000000"];

    testRunner.assertDeepCompareObjects(expected, actual);
  }
);

worldTests.addTest(
  "World.getCurrentActiveOutputForEntity returns expected output",
  () => {
    const expected = ["11111111", "11001100", "11111111"];
    const genome = "000000001111111111110000110011001";
    const entity = new Entity(genome);

    const outputA = World.getCurrentActiveOutputForEntity(entity);
    entity.increaseAge();
    const outputB = World.getCurrentActiveOutputForEntity(entity);
    entity.increaseAge();
    const outputC = World.getCurrentActiveOutputForEntity(entity);

    const actual = [outputA, outputB, outputC];

    testRunner.assertDeepCompareObjects(expected, actual);
  }
);

worldTests.addTest(
  "World.getSurroundingIndicesForIndex for an index in centre",
  () => {
    /*
      0 1 2
      3(4)5
      6 7 8
    */
    const world = new World(fixtureThreeByThreeWorldConfig());
    const actual = world.getSurroundingIndicesForIndex(4);

    const expected = [0, 1, 2, 3, 5, 6, 7, 8];

    testRunner.assertDeepCompareObjects(expected, actual);
  }
);

worldTests.addTest(
  "World.getSurroundingIndicesForIndex for an index at an edge",
  () => {
    /*
      0 1 2
      3 4(5)
      6 7 8
    */
    const world = new World(fixtureThreeByThreeWorldConfig());

    const actual = world.getSurroundingIndicesForIndex(5);

    const expected = [1, 2, 0, 4, 3, 7, 8, 6];

    testRunner.assertDeepCompareObjects(expected, actual);
  }
);

worldTests.addTest(
  "World.getSurroundingIndicesForIndex for an index at BR corner",
  () => {
    /*
      0 1 2
      3 4 5
      6 7(8)
    */
    const world = new World(fixtureThreeByThreeWorldConfig());

    const actual = world.getSurroundingIndicesForIndex(8);

    const expected = [4, 5, 3, 7, 6, 1, 2, 0];

    testRunner.assertDeepCompareObjects(expected, actual);
  }
);

worldTests.addTest(
  "World.getSurroundingIndicesForIndex for an index at TL corner",
  () => {
    /*
     (0)1 2
      3 4 5
      6 7 8
    */
    const world = new World(fixtureThreeByThreeWorldConfig());

    const actual = world.getSurroundingIndicesForIndex(0);

    const expected = [8, 6, 7, 2, 1, 5, 3, 4];

    testRunner.assertDeepCompareObjects(expected, actual);
  }
);

worldTests.addTest(
  "World.getSurroundingIndicesForIndex for an index at BR corner with greater dimensions",
  () => {
    /*
      0  1   2   3   4   5   6   7   8   9
      10 11  12  13  14  15  16  17  18  19
      20 21  22  23  24  25  26  27  28  29
      30 31  32  33  34  35  36  37  38  39
      40 41  42  43  44  45  46  47  48  49
      50 51  52  53  54  55  56  57  58  59
      60 61  62  63  64  65  66  67  68 (69)

      58, 59, 50, 68, 60, 8, 9, 0

      i(69) +-1 +-w(10) % n(70)   = 58
      i(69) + 0 +-w(10) % n(70)   = 59
      i(69) + 1 +-w(10) % n(70)   = 60
      i(69) +-1 + 0     % n(70)   = 68
      i(69) + 1 + 0     % n(70)   = 70
      i(69) +-1 + w(10) % n(70)   =  8
      i(69) + 0 + w(10) % n(70)   =  9
      i(69) + 1 + w(10) % n(70)   = 10
    */
    const world = new World(fixtureTenBySevenWorldConfig());

    const actual = world.getSurroundingIndicesForIndex(69);

    const expected = [58, 59, 50, 68, 60, 8, 9, 0];

    testRunner.assertDeepCompareObjects(expected, actual);
  }
);

worldTests.addTest(
  "World.getSurroundingIndicesForIndex for an index at BR edge with greater dimensions",
  () => {
    /*
      0  1   2   3   4   5   6   7   8   9
      10 11  12  13  14  15  16  17  18  19
      20 21  22  23  24  25  26  27  28  29
      30 31  32  33  34  35  36  37  38  39
      40 41  42  43  44  45  46  47  48  49
      50 51  52  53  54  55  56  57  58 (59)
      60 61  62  63  64  65  66  67  68  69
    */

    const world = new World(fixtureTenBySevenWorldConfig());

    const actual = world.getSurroundingIndicesForIndex(59);

    const expected = [48, 49, 40, 58, 50, 68, 69, 60];

    testRunner.assertDeepCompareObjects(expected, actual);
  }
);

worldTests.addTest(
  "World.getSurroundingIndicesForIndex for an index at TL corner with greater dimensions",
  () => {
    /*
     (0) 1   2   3   4   5   6   7   8   9
      10 11  12  13  14  15  16  17  18  19
      20 21  22  23  24  25  26  27  28  29
      30 31  32  33  34  35  36  37  38  39
      40 41  42  43  44  45  46  47  48  49
      50 51  52  53  54  55  56  57  58  59
      60 61  62  63  64  65  66  67  68  69

      69, 60, 61, 9, 1, 19, 10, 11

      let n, i, w, h;
      n = 70,
      i = 0,
      w = 10,
      h = 7,

      console.log((n + i +-1 +-w) % n);
      console.log((n + i + 0 +-w) % n);
      console.log((n + i + 1 +-w) % n);
      console.log((n + i +-1 + 0) % n);
      console.log((n + i + 1 + 0) % n);
      console.log((n + i +-1 + w) % n);
      console.log((n + i + 0 + w) % n);
      console.log((n + i + 1 + w) % n);
      (n + i +-1 +-w) % n   = 59
      (n + i + 0 +-w) % n   = 60
      (n + i + 1 +-w) % n   = 61
      (n + i +-1 + 0) % n   = 69
      (n + i + 1 + 0) % n   = 1
      (n + i +-1 + w) % n   = 9
      (n + i + 0 + w) % n   = 10
      (n + i + 1 + w) % n   = 11
    */

    const world = new World(fixtureTenBySevenWorldConfig());

    const actual = world.getSurroundingIndicesForIndex(0);

    const expected = [69, 60, 61, 9, 1, 19, 10, 11];

    testRunner.assertDeepCompareObjects(expected, actual);
  }
);

worldTests.addTest("World.getOctetAtIndex at centre index", () => {
  /*
    0:1 1:0 2:1
    3:0(4:1)5:0
    6:1 7:0 8:1
  */
  const world = new World(fixtureThreeByThreeWorldConfig());

  const actual = world.getOctetAtIndex(4);

  const expected = "10100101";

  testRunner.assertStrictlyEquals(expected, actual);
});

worldTests.addTest("World.getOctetAtIndex at edge", () => {
  /*
    0:1 1:0 2:1
    3:0 4:1(5:0)
    6:1 7:0 8:1
  */
  const world = new World(fixtureThreeByThreeWorldConfig());

  const actual = world.getOctetAtIndex(5);

  const expected = "01110011";

  testRunner.assertStrictlyEquals(expected, actual);
});

worldTests.addTest("World.sortEntitiesByGenomeLength", () => {
  const entities = [
    new Entity("0"),
    new Entity("0000"),
    new Entity("00"),
    new Entity("000"),
  ];

  const world = new World(fixtureThreeByThreeWorldConfig());

  const actual = world.sortEntitiesByGenomeLength(entities);

  const expected = [1, 3, 2, 0];

  testRunner.assertDeepCompareObjects(expected, actual);
});

worldTests.addTest("World.getPositionFromIndex", () => {
  const world = new World(fixtureThreeByThreeWorldConfig());

  const actual = [];
  for (let i = 0; i < 9; i += 1) {
    actual[i] = world.getPositionFromIndex(i);
  }

  const expected = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
  ];

  testRunner.assertDeepCompareObjects(expected, actual);
});

testRunner.run();
