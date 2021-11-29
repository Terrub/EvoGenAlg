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
    Renderer.getColorFromTraitCountsSin,
    // Renderer.getColorFromTraitCountsLog,
    Renderer.getColorFromSegmentByteAverage,
  ];

  constructor(display, world, size) {
    this.display = display;
    this.world = world;
    this.size = size;

    this.colorRenderer = this.colorRenderers[this.currentColourRenderIndex];
  }

  static getByteAverage(byteSegment) {
    let total = 0;
    const segmentLength = Math.min(8, byteSegment.length);
    const maxValue = segmentLength ** 2 - 1;
    const numBytes = (byteSegment.length / segmentLength) | 0;

    for (let i = 0; i < byteSegment.length; i += segmentLength) {
      const byte = byteSegment.substr(i, segmentLength);
      total += (parseInt(byte, 2) / maxValue) * 255;
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

    return Math.E ^ (((num - 1) / (total - 1)) * ((yMax - yMin) + yMin));
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

    const redSegment = genome.substr(0 * numChannelSegments, numChannelSegments);
    const grnSegment = genome.substr(1 * numChannelSegments, numChannelSegments);
    const bluSegment = genome.substr(2 * numChannelSegments, numChannelSegments);

    const r = Renderer.getByteAverage(redSegment);
    const g = Renderer.getByteAverage(grnSegment);
    const b = Renderer.getByteAverage(bluSegment);

    const color = `rgb(${r},${g},${b})`;

    return color;
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

    world.getEntitiesList().forEach((entity, index) => {
      if (entity.state === Entity.STATE_ALIVE) {
        const { genome } = entity;
        const color = this.colorRenderer(genome);
        const { x, y } = world.getPositionFromIndex(index);
        display.drawRect(x * size, y * size, size, size, color);
      }
    });

    const { max, min, avg } = world.getGenomeStats();
    document.getElementById('max_gnome').textContent = max;
    document.getElementById('min_gnome').textContent = min;
    document.getElementById('avg_gnome').textContent = avg;
  }

  toggleColorRenderer() {
    const newIndex = (this.currentColourRenderIndex + 1) % this.colorRenderers.length;
    this.currentColourRenderIndex = newIndex;

    this.colorRenderer = this.colorRenderers[this.currentColourRenderIndex];
  }
}
