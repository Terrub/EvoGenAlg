/* eslint
    no-bitwise: ["error", { "allow": ["|"] }]
 */

import { Utils } from './utils.js';
import { Display } from './actors/display.js';
import { createMainloop } from './actors/mainloop.js';
import { World } from './actors/world.js';
import { Renderer } from './connectors/renderer.js';

const canvas = document.getElementById('test_canvas');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const size = 3;
const glib = canvas.getContext('2d');
const { width } = canvas;
const { height } = canvas;

const worldConfig = [
  (width / size | 0), // width
  (height / size | 0), // height
  300, // entities_start_amount
  1500, // max_entities
  100, // max_num_traits
  5, // min_num_traits
  0.001, // chance_to_mutate
];

const display = new Display(glib, width, height);
const world = new World(...worldConfig);
const renderer = new Renderer(display, world, size);

function renderWorld() {
  let entities;
  if (Utils.isUndefined(entities) || entities.length < 1) {
    // report("Starting new list of entities");
    entities = world.getEntities().slice();

    document.querySelector('[name="entity_count"]').value = entities.length;
  }
  world.parseEntityEvolution(entities);
  renderer.renderCurrentState();
}

const mainloop = createMainloop(renderWorld);

document.getElementById('btn_start').onclick = () => mainloop.start();
document.getElementById('btn_stop').onclick = () => mainloop.stop();
document.getElementById('btn_reset').onclick = () => mainloop.reset();
document.getElementById('btn_colors').onclick = () => renderer.toggleColorRenderer();

const grid = world.getGrid();
// TODO: Replace this with a filter or use an alternative method
//    to get the list of indices that should spawn a new entity
for (let index = 0; index < grid.length; index += 1) {
  const cell = grid[index];
  if (cell === 1) {
    const genome = world.createGenome();
    const entity = world.createEntity(genome);
    world.addEntityAtIndex(entity, index);
  }
}

mainloop.start();
