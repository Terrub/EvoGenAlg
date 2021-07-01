import { Utils } from '../utils.js';

// TODO: See if we can turn this into a class after all.
/*
  Currently I cannot turn this into a class simply, as the tic function passed to the window's
  requestAnimationFrame is assigned to some internal magic variable or something. This means
  the call to tic the first time has no defined context for `this`.
    > (typeof this === 'undefined')
  We could probably do something pretty cool to make this work with a class like this, but
  currently this works and the complexity of this psuedo-class is minimal enough to not merrit
  the time investment.
 */
export function createMainloop(frameRender) {
  if (!Utils.isFunction(frameRender)) {
    Utils.reportUsageError('Usage: createMainloop(frameRender: function');
  }

  let animating = false;

  function tic() {
    if (animating !== true) { return; }

    frameRender();

    window.requestAnimationFrame(tic);
  }

  const protoMainloop = {
    start: function start() {
      if (animating === true) { return; }
      animating = true;
      Utils.report('Animation started');
      tic();
    },
    stop: function stop() {
      animating = false;
      Utils.report('Animation stopped');
    },
    reset: function reset() {},
  };

  return protoMainloop;
}
