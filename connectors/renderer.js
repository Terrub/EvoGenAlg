import { Entity } from "../actors/entity.js";
import { Utils } from "../utils.js";

/* eslint
    no-bitwise: ["error", { "allow": ["|", "^"] }]
 */
export class Renderer {
  display;
  world;
  size;
  colorRenderer;
  currentColourRenderIndex = 0;
  colorRenderers = [
    Renderer.getColorFromSegmentByteAverage,
    Renderer.getColorFromTraitCountsSin,
    // Renderer.getColorFromTraitCountsLog,
    // Renderer.getDistinctGenomeColor,
  ];

  constructor(display, world, size) {
    this.display = display;
    this.world = world;
    this.size = size;

    this.colorRenderer = this.colorRenderers[this.currentColourRenderIndex];
  }

  static getByteAverage(byteSegment) {
    let total = 0;
    const segmentLength = 8;
    const numBytes = (byteSegment.length / segmentLength) | 0;

    for (let i = 0; i < byteSegment.length; i += segmentLength) {
      const byte = byteSegment.substr(i, segmentLength);
      total += parseInt(byte, 2);
    }

    return (total / numBytes) | 0;
  }

  static calcInverseLogValue(num, total) {
    // Found log calc formulae from here: https://stackoverflow.com/a/63158920

    //           /  x - x0                                \
    // y = 10 ^ |  ------- * (log(y1) - log(y0)) + log(y0) |
    //           \ x1 - x0                                /

    const yMax = Math.log(255);
    // const yMin = Math.log(1);
    const yMin = 0;

    return Math.E ^ (((num - 1) / (total - 1)) * (yMax - yMin + yMin));
  }

  static calcLogValue(num, total) {
    // Found log calc formulae from here: https://stackoverflow.com/a/63158920

    // //                  log(y) - log(y0)
    // // x = (x1 - x0) * ----------------- + x0
    // //                 log(y1) - log(y0)
    const ln = Math.log;

    const xMax = 255;
    const xMin = 0;
    const y = num;
    const yMax = total;
    const yMin = 1;

    const logY = ln(y);
    const logYMin = ln(yMin);
    const logYMax = ln(yMax);

    return ((xMax - xMin) * (logY - logYMin)) / (logYMax - logYMin) + xMin;
  }

  static calcSinValue(num, total) {
    return (Math.sin((Math.PI / 2) * (num / total)) * 255) | 0;
  }

  static getColorFromTraitCountsLog(genome) {
    const redCount = (genome.match(/00/g) || []).length;
    const grnCount = (genome.match(/11/g) || []).length;
    const bluCount = (genome.match(/01/g) || []).length;
    const totalCount = redCount + bluCount + grnCount;

    const r = Renderer.calcLogValue(redCount, totalCount) | 0;
    const g = Renderer.calcLogValue(grnCount, totalCount) | 0;
    const b = Renderer.calcLogValue(bluCount, totalCount) | 0;

    const color = `rgb(${r},${g},${b})`;

    return color;
  }

  static getColorFromSegmentByteAverage(genome) {
    const numChannelSegments = (genome.length / 3) | 0;

    const redSegment = genome.substr(
      0 * numChannelSegments,
      numChannelSegments
    );
    const grnSegment = genome.substr(
      1 * numChannelSegments,
      numChannelSegments
    );
    const bluSegment = genome.substr(
      2 * numChannelSegments,
      numChannelSegments
    );

    const r = Renderer.getByteAverage(redSegment);
    const g = Renderer.getByteAverage(grnSegment);
    const b = Renderer.getByteAverage(bluSegment);

    let color = "white";

    if (0 < r || 0 < g || 0 < b) {
      color = `rgb(${r},${g},${b})`;
    }

    return color;
  }

  static getDistinctGenomeColor(genome) {
    // const value = parseInt(genome, 2);
    const r = Utils.generateRandomNumber(256);
    const g = Utils.generateRandomNumber(256);
    const b = Utils.generateRandomNumber(256);

    return `rgb(${r},${g},${b})`;
  }

  static getColorFromTraitCountsSin(genome) {
    const redCount = (genome.match(/00/g) || []).length;
    const grnCount = (genome.match(/11/g) || []).length;
    const bluCount = (genome.match(/01/g) || []).length;
    const totalCount = redCount + bluCount + grnCount;

    const r = Renderer.calcSinValue(redCount, totalCount);
    const g = Renderer.calcSinValue(grnCount, totalCount);
    const b = Renderer.calcSinValue(bluCount, totalCount);

    const color = `rgb(${r},${g},${b})`;

    return color;
  }

  renderCurrentState() {
    const { display, world, size } = this;

    display.clear();
    const entities = world.getEntitiesList();
    const n = entities.length;

    for (let i = 0; i < n; i += 1) {
      const entity = entities[i];
      if (!entity) {
        continue;
      }
      let color = "#333";
      if (Entity.STATE_ALIVE === entity.state) {
        color = this.colorRenderer(entity.genome);
      }

      const { x, y } = world.getPositionFromIndex(i);
      display.drawRect(x * size, y * size, size, size, color);
    }

    const { max, min, avg, nrg } = world.getGenomeStats();
    document.getElementById("max_gnome").textContent = max;
    document.getElementById("min_gnome").textContent = min;
    document.getElementById("avg_gnome").textContent = avg;
    document.getElementById("tot_energy").textContent = Math.round(nrg);
  }

  toggleColorRenderer() {
    const newIndex =
      (this.currentColourRenderIndex + 1) % this.colorRenderers.length;
    this.currentColourRenderIndex = newIndex;

    this.colorRenderer = this.colorRenderers[this.currentColourRenderIndex];
  }

  displayEntityData(entity) {
    this.display.clear();

    if (Utils.isUndefined(entity)) {
      return;
    }

    const totalWidth = this.world.width * this.size;
    const totalheight = this.world.height * this.size;
    const padding = 10;
    const containerWidth = (this.size * 3 * 3 + 2) * 2 + padding;
    const containerHeight = totalheight;

    this.display.drawRect(
      totalWidth - containerWidth,
      0,
      containerWidth,
      containerHeight,
      "#333"
    );
    this.displayGenome(
      entity.genome,
      totalWidth - containerWidth + padding,
      padding
    );
  }

  displayGenome(genome, x, y) {
    // The genome segment       0 1 0
    // only contains the        1   1
    // corona of the cell:  ->  0 1 0
    // We want to display
    // the whole thing:     ->  0 1 0
    // So we need to insert     1 1 1
    // the cell centre itself   0 1 0
    // which should always be
    // active. Hence we just
    // insert a 1 there.
    const n = Math.ceil(genome.length / 16);
    const size = this.size * 3 * 3 + 2;

    for (let i = 0; i < n; i += 1) {
      const traitCorona = genome.substr(i * 16, 8);
      const outputCorona = genome.substr(i * 16 + 8, 8);

      const traitSegment =
        traitCorona.substr(0, 4) + "1" + traitCorona.substr(0 + 4, 8);
      const outputSegment =
        outputCorona.substr(0, 4) + "1" + outputCorona.substr(0 + 4, 8);

      this.displaySegment(traitSegment, x, i * size + y);
      this.displaySegment(outputSegment, x + size, i * size + y);
    }
  }

  displaySegment(segment, x, y) {
    const size = this.size * 2;

    for (let i = 0; i < 9; i += 1) {
      const c = segment[i] === "0" ? "gray" : "lightgreen";
      const xOff = i % 3;
      const yOff = Math.floor(i / 3);
      const relX = xOff * size + xOff;
      const relY = yOff * size + yOff;
      this.display.drawRect(x + relX, y + relY, size, size, c);
    }
  }
}
