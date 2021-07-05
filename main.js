/* eslint
    no-bitwise: ["error", { "allow": ["|"] }]
 */

import { Utils } from './utils.js';
import { Display } from './actors/display.js';
import { createMainloop } from './actors/mainloop.js';
import { World } from './actors/world.js';
import { Entity } from './actors/entity.js';
import { Renderer } from './connectors/renderer.js';

/*
  Thoughts:
  Make entities battle. see who overwrites who more often, that one wins => Bigger genomes have higher survival rate
  Make entities age based on how many 'actions'/changes they do => Fast burners vs slow simmers.
    > the two above counteract one another making it more likely a survival of the fittest thing.
      Too slow? You get eaten or starve due to new competitions
      Too fast? You die out of starvation due to burning up too much
  Make the order of resolving entities in a generation either random (for now) or use a means to order them based on
    speed or number of operations or something?
    > This should create a more even playing field for all entities across the board.
*/


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
  1500, // entities_start_amount
  1500, // max_entities
  1, // max_num_traits
  1, // min_num_traits
  0.006, // chance_to_mutate
];

const display = new Display(glib, width, height);
const world = new World(...worldConfig);
const renderer = new Renderer(display, world, size);

function renderWorld() {
  document.querySelector('[name="entity_count"]').value = world.getEntities().length;
  world.calcNextGeneration();
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
    const entity = new Entity(genome);
    world.addEntityAtIndex(entity, index);
  }
}

mainloop.start();
