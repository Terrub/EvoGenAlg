import { Utils } from "../../utils.js";
import { TestBot } from "../testBot.js";

export class DivResultsRenderer {
  container;

  suiteElements = [];

  constructor(container) {
    this.container = container;
  }

  getSuiteElement(name) {
    let suiteElement = this.suiteElements[name];

    if (Utils.isUndefined(suiteElement)) {
      const suiteDivElement = document.createElement("div");
      const suiteTitleElement = document.createElement("h2");
      suiteElement = document.createElement("ul");

      suiteTitleElement.innerText = name;
      suiteDivElement.append(suiteTitleElement, suiteElement);
      this.container.appendChild(suiteDivElement);

      this.suiteElements[name] = suiteElement;
    }

    return suiteElement;
  }

  addResult(suiteName, testName, result, expected, actual) {
    const suiteElement = this.getSuiteElement(suiteName);
    const resultLine = document.createElement("li");

    let outcome = document.createElement("span");
    if (result === TestBot.TEST_SUCCEEDED) {
      outcome.style.color = "lime";
      outcome.innerText = "√";
    } else if (result === TestBot.TEST_FAILED) {
      outcome.style.color = "red";
      outcome.innerText = "X";
    } else if (result === TestBot.TEST_ERROR) {
      outcome.style.color = "orange";
      outcome.innerText = "E";
    } else if (result === TestBot.TEST_MISSING) {
      outcome.style.color = "yellow";
      outcome.innerText = "MISSING ASSERT";
    } else {
      outcome.style.color = "gray";
      outcome.innerText = "UNKNOWN RESULT";
    }

    resultLine.append(outcome, " - ", testName);

    suiteElement.appendChild(resultLine);
  }
}