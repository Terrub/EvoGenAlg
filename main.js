/* eslint
    no-bitwise: ["error", { "allow": ["|"] }]
 */

import { Display } from "./actors/display.js";
import { createMainloop } from "./actors/mainloop.js";
import { World } from "./actors/world.js";
import { Renderer } from "./connectors/renderer.js";
import { WorldConfig } from "./actors/worldConfig.js";
import { Utils } from "./utils.js";

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

const canvas = document.getElementById("world_display_canvas");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const size = 4;
const glib = canvas.getContext("2d");

const { width, height } = canvas;
const worldConfig = new WorldConfig();
worldConfig.width = (width / size) | 0;
worldConfig.height = (height / size) | 0;
worldConfig.maxNumTraits = 20;
worldConfig.chanceToMutate = 0.005;
worldConfig.maxEntityAge = 300;
worldConfig.entityEnergy = Math.pow(2, 11);

const display = new Display(glib, width, height);
const world = new World(worldConfig);
const renderer = new Renderer(display, world, size);
let currentGeneration = 0;

function renderWorld() {
  const sortedEntityIndices = world.sortEntitiesByGenomeLength(
    world.getEntitiesList()
  );

  world.calculateNextGeneration(sortedEntityIndices);
  currentGeneration += 1;
  world.spawnNewEntities(0.00001);
  renderer.renderCurrentState();

  const entityCount = world.getNumLivingEntities();
  document.getElementById("entity_count").textContent = entityCount;
  document.getElementById("generation_count").textContent = currentGeneration;

  if (entityCount < 1) {
    mainloop.stop();
  }
}

const mainloop = createMainloop(renderWorld);

document.getElementById("btn_next").onclick = () => renderWorld();
document.getElementById("btn_start").onclick = () => mainloop.start();
document.getElementById("btn_stop").onclick = () => mainloop.stop();
document.getElementById("btn_colors").onclick = () =>
  renderer.toggleColorRenderer();

mainloop.start();
