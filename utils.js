/* eslint
    no-bitwise: ["error", { "allow": ["|", "^"] }]
 */

export class Utils {
  static isUndefined(value) {
    // NOTE 1: value being a reference to something.

    /* NOTE 2: changed the use of: */
    // return (value === undefined);
    /* to: */
    return (typeof value === 'undefined');
    /* as this is supported on more browsers according to Teun Lassche */
  }

  static isDefined(value) {
    return !Utils.isUndefined(value);
  }

  static isBoolean(value) {
    return (typeof value === 'boolean');
  }

  static isNumber(num) {
    return (typeof num === 'number');
  }

  static isInteger(value) {
    return (value === +value) && (value === (value | 0));
  }

  static isString(value) {
    return (typeof value === 'string');
  }

  static isNull(value) {
    return value === null;
  }

  static isObject(value) {
    // #NOTE1: typeof null === 'object' so check for null as well!
    if (Utils.isNull(value)) {
      return false;
    }
    if (Utils.isUndefined(value)) {
      return false;
    }

    return (typeof value === 'object');
  }

  static isFunction(value) {
    return (typeof value === 'function');
  }

  static isEmptyObject(value) {
    if (!Utils.isObject(value)) {
      return false;
    }

    return (Object.getOwnPropertyNames(value).length === 0);
  }

  static isArray(value) {
    return (Array.isArray(value));
  }

  static objectEquals(x, y) {
    if (Utils.isNull(x) || Utils.isNull(y) || Utils.isUndefined(x) || Utils.isUndefined(y)) {
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

    if (Utils.isArray(x) && x.length !== y.length) {
      return false;
    }

    // if they are dates, they must've had equal valueOf
    if (x instanceof Date) {
      return false;
    }

    // if they are strictly equal, they both need to be object at least
    if (!(Utils.isObject(x) && Utils.isObject(y))) {
      return false;
    }

    // recursive object equality check
    const xKeys = Object.keys(x);
    const yKeysInX = Object.keys(y).every((i) => xKeys.indexOf(i) !== -1);
    const valuesEqual = xKeys.every((i) => Utils.objectEquals(x[i], y[i]));

    return (yKeysInX && valuesEqual);
  }

  static shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  static faultOnError(err) {
    const errBody = document.createElement('body');
    errBody.style.backgroundColor = '#cc3333';
    errBody.style.color = '#ffffff';
    errBody.innerHTML = `<pre>${err}</pre>`;
    document.body = errBody;

    throw err;
  }

  static attempt(toAttempt, ...args) {
    let result;

    try {
      result = toAttempt(...args);
    } catch (err) {
      Utils.faultOnError(err);
    }

    return result;
  }

  static report(...args) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }

  static reportError(error) {
    throw new Error(error);
  }

  static onlyProceedIf(statement, check) {
    if (Utils.attempt(check, [statement]) !== true) {
      Utils.reportError('A checkpoint failed, check the stack for more info.');
    }
  }

  static getTime() {
    return Date.now();
  }

  static generateRandomNumber(pMax, pMin) {
    let max = pMax;
    let min = pMin;

    if (!Utils.isInteger(max)) { max = 100; }
    if (!Utils.isInteger(min)) { min = 0; }
    const randomNumber = Math.floor((Math.random() * (max - min)) + min);

    return randomNumber;
  }

  static reportUsageError(error) {
    // For now just report the error normally;
    Utils.reportError(error);
  }
}
