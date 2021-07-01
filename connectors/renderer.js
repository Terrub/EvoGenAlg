class Renderer {
  #display;
  #world;
  #size;
  #colorRenderer;
  #current_colour_render_index = 0;
  #color_renderers = [
    Renderer.getColorFromSegmentByteAverage,
    Renderer.getColorFromTraitCountsLog,
    Renderer.getColorFromTraitCountsSin
  ];

  constructor(display, world, size) {
    this.#display = display;
    this.#world = world;
    this.#size = size;

    this.#colorRenderer = this.#color_renderers[this.#current_colour_render_index];
  }

  static getByteAverage(byte_segment) {
    let total = 0;
    const num_bytes = byte_segment.length / 8 | 0;
    for (let i = 0; i < byte_segment.length; i += 8) {
      const byte = byte_segment.substr(i, 8);
      total += parseInt(byte, 2);
    }

    return total / num_bytes | 0;
  }

  static calcInverseLogValue(num, total) {
    // Found log calc formulae from here: https://stackoverflow.com/a/63158920

    //           /  x - x0                                \
    // y = 10 ^ |  ------- * (log(y1) - log(y0)) + log(y0) |
    //           \ x1 - x0                                /

    const y_max = Math.log(255);
    // const y_min = Math.log(1);
    const y_min = 0;

    return Math.E ^ (((num - 1) / (total - 1)) * ((y_max - y_min) + y_min));
  }

  static calcLogValue(num, total) {
    // Found log calc formulae from here: https://stackoverflow.com/a/63158920

    // //                  log(y) - log(y0)
    // // x = (x1 - x0) * ----------------- + x0
    // //                 log(y1) - log(y0)
    const ln = Math.log;

    const x_max = 255;
    const x_min = 0;
    const y = num;
    const y_max = total;
    const y_min = 1;

    const log_y = ln(y);
    const log_y_min = ln(y_min);
    const log_y_max = ln(y_max);

    return (x_max - x_min) * (log_y - log_y_min) / (log_y_max - log_y_min) + x_min;
  }

  static calcSinValue(num, total) {
    return Math.sin((Math.PI / 2) * (num / total)) * 255 | 0
  }

  static getColorFromTraitCountsLog(genome) {
    const red_count = (genome.match(/00/g) || []).length;
    const grn_count = (genome.match(/11/g) || []).length;
    const blu_count = (genome.match(/01/g) || []).length;
    const total_count = red_count + blu_count + grn_count;

    const r = Renderer.calcLogValue(red_count, total_count) | 0;
    const g = Renderer.calcLogValue(grn_count, total_count) | 0;
    const b = Renderer.calcLogValue(blu_count, total_count) | 0;

    const color = `rgb(${r},${g},${b})`;

    return color;
  }

  static getColorFromSegmentByteAverage(genome) {
    const num_channel_segments = (genome.length / 3 | 0);

    const red_segment = genome.substr(0 * num_channel_segments, num_channel_segments);
    const grn_segment = genome.substr(1 * num_channel_segments, num_channel_segments);
    const blu_segment = genome.substr(2 * num_channel_segments, num_channel_segments);

    const r = Renderer.getByteAverage(red_segment);
    const g = Renderer.getByteAverage(grn_segment);
    const b = Renderer.getByteAverage(blu_segment);

    const color = `rgb(${r},${g},${b})`;

    return color;
  }

  static getColorFromTraitCountsSin(genome) {
    const red_count = (genome.match(/00/g) || []).length;
    const grn_count = (genome.match(/11/g) || []).length;
    const blu_count = (genome.match(/01/g) || []).length;
    const total_count = red_count + blu_count + grn_count;

    const r = Renderer.calcSinValue(red_count, total_count);
    const g = Renderer.calcSinValue(grn_count, total_count);
    const b = Renderer.calcSinValue(blu_count, total_count);

    const color = `rgb(${r},${g},${b})`;

    return color;
  }

  renderCurrentState() {
    const display = this.#display;
    const world = this.#world;
    const size = this.#size;

    display.clear();

    const grid = world.getGrid();
    for (let index = 0; index < grid.length; index += 1) {
      const cell = grid[index];
      if (cell === 1) {
        const position = world.getPositionFromIndex(index);
        const entity = world.getEntityAtIndex(index);
        if (entity) {
          const genome = entity.genome;
          const color = this.#colorRenderer(genome);
          display.drawRect(position.x * size, position.y * size, size, size, color);
        }
      }
    }

    let stats = world.getGenomeStats()
    document.querySelector('[name="max_gnome"]').innerHTML = stats["max"]
    document.querySelector('[name="min_gnome"]').innerHTML = stats["min"]
    document.querySelector('[name="avg_gnome"]').innerHTML = stats["avg"]
  }

  toggleColorRenderer() {
    this.#current_colour_render_index = (this.#current_colour_render_index + 1) % this.#color_renderers.length;

    this.#colorRenderer = this.#color_renderers[this.#current_colour_render_index];
  }
}
