/* eslint
    no-bitwise: ["error", { "allow": ["|"] }]
 */

import { Display } from './actors/display.js';
import { createMainloop } from './actors/mainloop.js';
import { World } from './actors/world.js';
import { Entity } from './actors/entity.js';
import { Renderer } from './connectors/renderer.js';
import { Utils } from './utils.js';

/*
  Thoughts:
  [√] Make entities battle. see who overwrites who more often, that one wins => Bigger genomes have
    higher survival rate
    > See below.
  [√] Make entities age based on how many 'actions'/changes they do => Fast burners vs slow simmers.
    * the two above counteract one another making it more likely a survival of the fittest thing.
      Too slow? You get eaten or starve due to new competitions
      Too fast? You die out of starvation due to burning up too much
      > Fixed this by making each generation resolve a single segment of a genome.
        Short genomes (len=16, traits=1) pretty much resolve their entire genome each generation.
        Large genomes would then slowly work down their chain of 'operations' one generation
        at a time. More complexity means more interaction, but time then becomes a factor,
        making it possible for fast and nimble pixies to snuff out large lumbering complex pixies.

  Make the order of resolving entities in a generation either random (for now) or use a means to
  order them based on speed or number of operations or something?
    * This should create a more even playing field for all entities across the board.
      > Fixed this by ordering pixies each generation based on their genome length. Long genomes go
        first giving them at least one generation to try and overcome multiple fast small genomes
        that have more than one oppertunity to overpower them.
*/

const canvas = document.getElementById('test_canvas');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const size = 5;
const glib = canvas.getContext('2d');
const { width, height } = canvas;
let entityUpdateAmount = 100;
const entityUpdateAmountStepSize = 100;
const worldWidth = (width / size | 0); // width
const worldHeight = (height / size | 0); // height
const maxEntities = 500;
const maxNumTraits = 5;
const minNumTraits = 1;
const chanceToMutate = 0.09;
const startingEntities = [];

// Create starting entities
for (let i = 0; i < maxEntities; i += 1) {
  const index = (Math.random() * worldWidth * worldHeight) | 0;
  const numTraits = 2 * Utils.generateRandomNumber(maxNumTraits, minNumTraits);
  startingEntities[index] = new Entity(World.createGenome(numTraits));
}

const display = new Display(glib, width, height);
const world = new World(
  worldWidth,
  worldHeight,
  maxEntities,
  maxNumTraits,
  minNumTraits,
  chanceToMutate,
  startingEntities,
);
const renderer = new Renderer(display, world, size);
let currentGeneration = 0;
let entityIndices = [];

function renderWorld() {
  // debugger;
  // if (entityIndices.length === 0) {
  //   entityIndices = world.sortEntitiesByGenomeLength(world.getEntitiesList().slice());
  //   currentGeneration += 1;
  // }
  // const chunkEntityIndices = entityIndices.splice(0, entityUpdateAmount);
  // world.calculateNextGeneration(chunkEntityIndices);
  world.calculateNextGeneration(world.sortEntitiesByGenomeLength(world.getEntitiesList().slice()));
  currentGeneration += 1;
  // world.removeDeadEntities();
  world.spawnNewEntities();
  renderer.renderCurrentState();

  // document.getElementById('btn_speed_up').disabled = (entityUpdateAmount + entityUpdateAmountStepSize > world.maxEntities);
  // document.getElementById('btn_speed_down').disabled = (entityUpdateAmount - entityUpdateAmountStepSize < 1);
  document.getElementById('entity_count').textContent = world.getNumLivingEntities();
  document.getElementById('generation_count').textContent = currentGeneration;
}

const mainloop = createMainloop(renderWorld);

document.getElementById('btn_next').onclick = () => renderWorld();
document.getElementById('btn_start').onclick = () => mainloop.start();
document.getElementById('btn_stop').onclick = () => mainloop.stop();
// document.getElementById('btn_speed_up').onclick = () => {
//   if (entityUpdateAmount + entityUpdateAmountStepSize <= world.maxEntities) {
//     entityUpdateAmount += entityUpdateAmountStepSize;
//   }
// };
// document.getElementById('btn_speed_down').onclick = () => {
//   if (entityUpdateAmount - entityUpdateAmountStepSize > 1) {
//     entityUpdateAmount -= entityUpdateAmountStepSize;
//   }
// };
// document.getElementById('btn_max_ent_up').onclick = () => {
//   if (world.maxEntities + 100 <= world.numCells) {
//     world.maxEntities += 100;
//   }
// };
// document.getElementById('btn_max_ent_down').onclick = () => {
//   if (world.maxEntities > 100) {
//     world.maxEntities -= 100;
//   }
// };
document.getElementById('btn_colors').onclick = () => renderer.toggleColorRenderer();

mainloop.start();
