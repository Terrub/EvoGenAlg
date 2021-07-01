function runDisplayTests() {
  function getMockGlib(fnName, fnCallback) {
    const mockGlib = {
      fillStyle: '',     
    }
    mockGlib[fnName] = fnCallback;

    return mockGlib;
  }

  ropBotTestRunner(
    'Display class has drawPixel method that properly calls the glib',
    ropBotTestRunner.RESULT_OBJECT_DEEP_COMPARE,
    {
      fillRectArguments: [0, 0, 1, 1],
      fillStyle: 'test color string'
    },
    () => {
      let fillRectArguments;
      const mockGlib = getMockGlib('fillRect', (x, y, w, h) => {
        fillRectArguments = [x, y, w, h];
      });
      const testDisplay = new Display(mockGlib, 100, 100);
      testDisplay.drawPixel(0, 0, 'test color string');

      return {
        fillRectArguments: fillRectArguments,
        fillStyle: mockGlib.fillStyle
      };
    }
  );

  ropBotTestRunner(
    'Display class has drawRect method that properly calls the glib',
    ropBotTestRunner.RESULT_OBJECT_DEEP_COMPARE,
    {
      fillRectArguments: [10, 10, 100, 100],
      fillStyle: 'test color string'
    },
    () => {
      let fillRectArguments;
      const mockGlib = getMockGlib('fillRect', (x, y, w, h) => {
        fillRectArguments = [x, y, w, h];
      });
      const testDisplay = new Display(mockGlib, 100, 100);
      testDisplay.drawRect(10, 10, 100, 100, 'test color string');

      return {
        fillRectArguments: fillRectArguments,
        fillStyle: mockGlib.fillStyle
      }
    }
  );

  ropBotTestRunner(
    'Display class has clear method that invokes the clearRect on glib properly',
    ropBotTestRunner.RESULT_OBJECT_DEEP_COMPARE,
    {
      clearRectArguments: [0, 0, 200, 200]
    },
    () => {
      let fillRectArguments;
      const mockGlib = getMockGlib('clearRect', (x, y, w, h) => {
        fillRectArguments = [x, y, w, h];
      });
      const testDisplay = new Display(mockGlib, 200, 200);

      testDisplay.clear();

      return {
        clearRectArguments: fillRectArguments
      }
    }
  );
}

function runWorldTests() {
  ropBotTestRunner(
    'Failed tests turn orange',
    ropBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
    true,
    () => { return false }
  );
  
  ropBotTestRunner(
    'Errors show up red',
    ropBotTestRunner.RESULT_EXACTLY_MATCHES_EXPECTATION,
    true,
    () => { throw Error("boom") }
  );

  ropBotTestRunner(
    ''
  );
}

function runTests() {
  runDisplayTests();
  runWorldTests();
}