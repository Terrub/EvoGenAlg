import { Utils } from '../utils';

/**
   * Formatises a list of variable arguments into the allocated position of
   * the given format.
   *
   * Arguments:
   *  <string> "format"
   *      The format the given arguments have to be allocated to.
   *  <*> ... (optional)
   *      A variable list of arguments that will be ordered into the given
   *      format.
   *      Available format options:
   *      "{@x:T}" where x is the position of the argument in the provided
   *      argument list (optional)
   *      and T = the required type (or types?) the argument needs to adhere
   *      to.
   *      Possible types are:
   *      - 'b' Boolean
   *      - 'i' Integer
   *      - 'n' Number
   *      - 's' String
   *
   * Return:
   *  <string>
   *      The formatted arguments
   */
export class Formatiser {
  argumentsToFormat;

  supportedTypes = {};

  supportedTypeFlags = '';

  pattern;

  patternWasChanged = true;

  constructor() {
    this.addFormatType('b', Utils.isBoolean);
    this.addFormatType('n', Utils.isNumber);
    this.addFormatType('i', Utils.isInteger);
    this.addFormatType('s', Utils.isString);
  }

  addFormatType(flag, typeDefinitionTest) {
    if (!Utils.isString(flag)) {
      Utils.reportUsageError(
        'formatise.addFormatType expects argument #1 to be of type'
        + " 'String'.",
      );
    }

    if (!Utils.isFunction(typeDefinitionTest)) {
      Utils.reportUsageError(
        'formatise.addFormatType expects argument #2 to be of type'
        + " 'Function'.",
      );
    }

    this.supportedTypes[flag] = typeDefinitionTest;
    this.supportedTypeFlags += flag;
    this.patternWasChanged = true;
  }

  typeCheck(match, position, typeFlag) {
    const insertValue = this.argumentsToFormat[position - 1];
    const checkType = this.supportedTypes[typeFlag];

    if (Utils.isUndefined(insertValue)) {
      // _report("Formatize parameter mismatch");
      return 'undefined';
    }

    if (!checkType) {
      // _report("Formatize unsupported type");
      return '[unsupported type]';
    }

    if (!checkType(insertValue)) {
      // _report("Formatize type mismatch");
      return '[type mismatch]';
    }

    return insertValue;
  }

  updatePattern() {
    /*  Attempt to find & replace en masse to prevent loops
     Hopefully the 'g' modifier is enough */
    this.pattern = new RegExp(
      `{@([1-9][0-9]*):([${this.supportedTypeFlags}])}`,
      'gi',
    );
    this.patternWasChanged = false;
  }

  format(suppliedFormat, ...args) {
    /*  We need to store all the given arguments we received here so
     we can pass them along to the 'typecheck and replace'-function in
     our String.replace down below. */
    this.argumentsToFormat = args;
    if (this.patternWasChanged) {
      this.updatePattern();
    }

    if (!Utils.isString(suppliedFormat)) {
      // report(
      //     "function 'format' expected string as argument #1, received:",
      //     suppliedFormat
      // );
      return false;
    }

    return suppliedFormat.replace(this.pattern, this.typeCheck);
  }
}
