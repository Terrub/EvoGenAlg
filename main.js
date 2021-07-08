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
  [√] Make entities battle. see who overwrites who more often, that one wins => Bigger genomes have higher survival rate
    > See below.
  [√] Make entities age based on how many 'actions'/changes they do => Fast burners vs slow simmers.
    * the two above counteract one another making it more likely a survival of the fittest thing.
      Too slow? You get eaten or starve due to new competitions
      Too fast? You die out of starvation due to burning up too much
      > Fixed this by making each generation resolve a single segment of a genome. Short genomes (len=16, traits=1)
        pretty much resolve their entire genome each generation.
        Large genomes would then slowly work down their chain of 'operations' one generation at a time. More complexity
        means more interaction, but time then becomes a factor, making it possible for fast and nimble pixies to snuff
        out large lumbering complex pixies.

  Make the order of resolving entities in a generation either random (for now) or use a means to order them based on
    speed or number of operations or something?
    * This should create a more even playing field for all entities across the board.
      > Fixed this by ordering pixies each generation based on their genome length. Long genomes go first giving them at
        least one generation to try and overcome multiple fast small genomes that have more than one oppertunity to
        overpower them.
*/


const canvas = document.getElementById('test_canvas');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const size = 3;
const glib = canvas.getContext('2d');
const { width, height } = canvas;
let entityUpdateAmount = 1000;
const entityUpdateAmountStepSize = 100;
const worldConfig = [
  (width / size | 0), // width
  (height / size | 0), // height
  1000, // entities_start_amount
  2000, // max_entities
  5, // max_num_traits
  1, // min_num_traits
  0.01, // chance_to_mutate
];

const display = new Display(glib, width, height);
const world = new World(...worldConfig);
const renderer = new Renderer(display, world, size);
let totalEntitySet = [];
let currentGeneration = 0;

function renderWorld() {
  if (totalEntitySet.length === 0) {
    totalEntitySet = world.getEntities().slice();
    World.sortEntities(totalEntitySet);
    currentGeneration += 1;
  }
  const currentEntitySet = totalEntitySet.splice(0, entityUpdateAmount);
  world.calcNextGeneration(currentEntitySet);
  world.spawnNewEntities();
  renderer.renderCurrentState();

  document.getElementById('btn_speed_up').disabled = (entityUpdateAmount + entityUpdateAmountStepSize > world.maxEntities);
  document.getElementById('btn_speed_down').disabled = (entityUpdateAmount - entityUpdateAmountStepSize < 1);
  document.getElementById('entity_count').textContent = world.getEntities().length;
  document.getElementById('generation_count').textContent = currentGeneration;
}

const mainloop = createMainloop(renderWorld);

document.getElementById('btn_start').onclick = () => mainloop.start();
document.getElementById('btn_stop').onclick = () => mainloop.stop();
document.getElementById('btn_speed_up').onclick = () => {
  if (entityUpdateAmount + entityUpdateAmountStepSize <= world.maxEntities) {
    entityUpdateAmount += entityUpdateAmountStepSize;
  }
}
document.getElementById('btn_speed_down').onclick = () => {
  if (entityUpdateAmount - entityUpdateAmountStepSize > 1) {
    entityUpdateAmount -= entityUpdateAmountStepSize;
  }
};
document.getElementById('btn_max_ent_up').onclick = () => {
  if (world.maxEntities + 100 <= world.grid.length) {
    world.maxEntities += 100;
  }
};
document.getElementById('btn_max_ent_down').onclick = () => {
  if (world.maxEntities > 100) {
    world.maxEntities -= 100;
  }
};
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
