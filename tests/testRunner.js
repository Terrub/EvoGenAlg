import { TestBot } from '../helpers/testBot.js';
import { Display } from '../actors/display.js';
import { World } from '../actors/world.js';
import { Entity } from '../actors/entity.js';
import { Utils } from '../utils.js';

function runDisplayTests() {
  function getMockGlib(fnName, fnCallback) {
    const mockGlib = {
      fillStyle: '',
    };
    mockGlib[fnName] = fnCallback;

    return mockGlib;
  }

  TestBot(
    'Display.drawPixel exists and properly calls the glib',
    TestBot.RESULT_OBJECT_DEEP_COMPARE,
    {
      fillRectArguments: [0, 0, 1, 1],
      fillStyle: 'test color string',
    },
    () => {
      let fillRectArguments;
      const mockGlib = getMockGlib('fillRect', (x, y, w, h) => {
        fillRectArguments = [x, y, w, h];
      });
      const testDisplay = new Display(mockGlib, 100, 100);
      testDisplay.drawPixel(0, 0, 'test color string');

      return {
        fillRectArguments,
        fillStyle: mockGlib.fillStyle,
      };
    },
  );

  TestBot(
    'Display.drawRect exists and properly calls the glib',
    TestBot.RESULT_OBJECT_DEEP_COMPARE,
    {
      fillRectArguments: [10, 10, 100, 100],
      fillStyle: 'test color string',
    },
    () => {
      let fillRectArguments;
      const mockGlib = getMockGlib('fillRect', (x, y, w, h) => {
        fillRectArguments = [x, y, w, h];
      });
      const testDisplay = new Display(mockGlib, 100, 100);
      testDisplay.drawRect(10, 10, 100, 100, 'test color string');

      return {
        fillRectArguments,
        fillStyle: mockGlib.fillStyle,
      };
    },
  );

  TestBot(
    'Display.clear exists and invokes the clearRect on glib properly',
    TestBot.RESULT_OBJECT_DEEP_COMPARE,
    {
      clearRectArguments: [0, 0, 200, 200],
    },
    () => {
      let fillRectArguments;
      const mockGlib = getMockGlib('clearRect', (x, y, w, h) => {
        fillRectArguments = [x, y, w, h];
      });
      const testDisplay = new Display(mockGlib, 200, 200);

      testDisplay.clear();

      return {
        clearRectArguments: fillRectArguments,
      };
    },
  );
}

function runWorldTests() {
  function fixtureThreeByThreeWorldConfig(pEntities) {
    let entities = pEntities
    if (Utils.isUndefined(pEntities)) {
      entities = [
        new Entity(''), undefined, new Entity(''),
        undefined, new Entity(''), undefined,
        new Entity(''), undefined, new Entity(''),
      ];
    }

    const worldConfig = [
      3, // width
      3, // height
      9, // max_entities
      5, // max_num_traits
      1, // min_num_traits
      0.01, // chance_to_mutate
      entities,
    ];

    return worldConfig;
  }

  TestBot(
    'World.getCurrentActiveTraitForEntity returns expected trait',
    TestBot.RESULT_OBJECT_DEEP_COMPARE,
    [
      '00000000',
      '11110000',
      '00000000',
    ],
    () => {
      const genome = '000000001111111111110000110011001';
      const entity = new Entity(genome);

      const result = [];
      result.push(World.getCurrentActiveTraitForEntity(entity));
      entity.increaseAge();
      result.push(World.getCurrentActiveTraitForEntity(entity));
      entity.increaseAge();
      result.push(World.getCurrentActiveTraitForEntity(entity));

      return result;
    },
  );

  TestBot(
    'World.getCurrentActiveOutputForEntity returns expected output',
    TestBot.RESULT_OBJECT_DEEP_COMPARE,
    [
      '11111111',
      '11001100',
      '11111111',
    ],
    () => {
      const genome = '000000001111111111110000110011001';
      const entity = new Entity(genome);

      const result = [];
      result.push(World.getCurrentActiveOutputForEntity(entity));
      entity.increaseAge();
      result.push(World.getCurrentActiveOutputForEntity(entity));
      entity.increaseAge();
      result.push(World.getCurrentActiveOutputForEntity(entity));

      return result;
    },
  );

  TestBot(
    'World.getSurroundingIndicesForIndex for an index in centre',
    TestBot.RESULT_OBJECT_DEEP_COMPARE,
    [0, 1, 2, 3, 5, 6, 7, 8],
    () => {
      /*
        0 1 2
        3(4)5
        6 7 8
      */
      const worldConfig = fixtureThreeByThreeWorldConfig();
      const world = new World(...worldConfig);

      return world.getSurroundingIndicesForIndex(4);
    },
  );

  TestBot(
    'World.getSurroundingIndicesForIndex for an index at an edge',
    TestBot.RESULT_OBJECT_DEEP_COMPARE,
    [1, 2, 0, 4, 3, 7, 8, 6],
    () => {
      /*
        0 1 2
        3 4(5)
        6 7 8
      */
      const worldConfig = fixtureThreeByThreeWorldConfig();
      const world = new World(...worldConfig);

      return world.getSurroundingIndicesForIndex(5);
    },
  );

  TestBot(
    'World.getSurroundingIndicesForIndex for an index at an edge',
    TestBot.RESULT_OBJECT_DEEP_COMPARE,
    [4, 5, 3, 7, 6, 1, 2, 0],
    () => {
      /*
        0 1 2
        3 4 5
        6 7(8)
      */
      const worldConfig = fixtureThreeByThreeWorldConfig();
      const world = new World(...worldConfig);

      return world.getSurroundingIndicesForIndex(8);
    },
  );

  TestBot(
    'World.getSurroundingIndicesForIndex for an index at an edge',
    TestBot.RESULT_OBJECT_DEEP_COMPARE,
    [8, 6, 7, 2, 1, 5, 3, 4],
    () => {
      /*
       (0)1 2
        3 4 5
        6 7 8
      */
      const worldConfig = fixtureThreeByThreeWorldConfig();
      const world = new World(...worldConfig);

      return world.getSurroundingIndicesForIndex(0);
    },
  );

  TestBot(
    'World.getSurroundingIndicesForIndex for an index at an edge with greater dimensions',
    TestBot.RESULT_OBJECT_DEEP_COMPARE,
    [48, 49, 40, 58, 50, 68, 69, 60],
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
      const entities = [];
      const worldConfig = [
        10, // width
        7, // height
        20, // max_entities
        5, // max_num_traits
        1, // min_num_traits
        0.01, // chance_to_mutate
        entities,
      ];

      const world = new World(...worldConfig);

      return world.getSurroundingIndicesForIndex(59);
    },
  );

  TestBot(
    'World.getSurroundingIndicesForIndex for an index at BR corner with greater dimensions',
    TestBot.RESULT_OBJECT_DEEP_COMPARE,
    [58, 59, 50, 68, 60, 8, 9, 0],
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
      const entities = [];
      const worldConfig = [
        10, // width
        7, // height
        20, // max_entities
        5, // max_num_traits
        1, // min_num_traits
        0.01, // chance_to_mutate
        entities,
      ];

      const world = new World(...worldConfig);

      return world.getSurroundingIndicesForIndex(69);
    },
  );

  TestBot(
    'World.getSurroundingIndicesForIndex for an index at TL corner with greater dimensions',
    TestBot.RESULT_OBJECT_DEEP_COMPARE,
    [69, 60, 61, 9, 1, 19, 10, 11],
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
      const entities = [];
      const worldConfig = [
        10, // width
        7, // height
        20, // max_entities
        5, // max_num_traits
        1, // min_num_traits
        0.01, // chance_to_mutate
        entities,
      ];

      const world = new World(...worldConfig);

      return world.getSurroundingIndicesForIndex(0);
    },
  );

  TestBot(
    'World.getOctetAtIndex at centre index',
    TestBot.RESULT_EXACTLY_MATCHES_EXPECTATION,
    '10100101',
    () => {
      /*
        0:1 1:0 2:1
        3:0(4:1)5:0
        6:1 7:0 8:1
      */
      const worldConfig = fixtureThreeByThreeWorldConfig();
      const world = new World(...worldConfig);

      return world.getOctetAtIndex(4);
    },
  );

  TestBot(
    'World.getOctetAtIndex at edge',
    TestBot.RESULT_EXACTLY_MATCHES_EXPECTATION,
    '01110011',
    () => {
      /*
        0:1 1:0 2:1
        3:0 4:1(5:0)
        6:1 7:0 8:1
      */
      const worldConfig = fixtureThreeByThreeWorldConfig();
      const world = new World(...worldConfig);

      return world.getOctetAtIndex(5);
    },
  );

  TestBot(
    'World.sortEntitiesByGenomeLength',
    TestBot.RESULT_OBJECT_DEEP_COMPARE,
    [0, 2, 3, 1],
    () => {
      const entities = [
        new Entity('0'),
        new Entity('0000'),
        new Entity('00'),
        new Entity('000'),
      ];

      const worldConfig = fixtureThreeByThreeWorldConfig();
      const world = new World(...worldConfig);

      return world.sortEntitiesByGenomeLength(entities);
    },
  );

  TestBot(
    'World.getPositionFromIndex',
    TestBot.RESULT_OBJECT_DEEP_COMPARE,
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    () => {
      const worldConfig = fixtureThreeByThreeWorldConfig();
      const world = new World(...worldConfig);

      const result = [];
      for (let i = 0; i < 9; i += 1) {
        result[i] = world.getPositionFromIndex(i);
      }
      console.log(result);
      return result;
    },
  );

  TestBot(
    'Something something world test',
    TestBot.RESULT_THROWS_EXPECTED_ERROR,
    'TypeError',
    () => {
      const world = new World();
      world.addEntityAtIndex();
    },
  );
}

runDisplayTests();
runWorldTests();
