/* eslint
    no-bitwise: ["error", { "allow": ["|", "^"] }]
 */

import { Utils } from "../utils.js";
import { Entity } from "./entity.js";
import { WorldConfig } from "./worldConfig.js";

export class World {
  width;
  height;
  numCells;
  chanceToMutate;
  maxEntities;
  maxNumTraits;
  minNumTraits;
  maxEntityAge;
  entitiesList;
  entityEnergy;
  estimatedNumEntities;

  constructor(worldConfig) {
    if (!Utils.isInstanceOf(WorldConfig, worldConfig)) {
      // TODO: Consider using custom error here.
      throw new TypeError("Provided config is not of type WorldConfig");
    }

    this.width = worldConfig.width;
    this.height = worldConfig.height;
    this.maxNumTraits = worldConfig.maxNumTraits;
    this.minNumTraits = worldConfig.minNumTraits;
    this.chanceToMutate = worldConfig.chanceToMutate;
    this.maxEntityAge = worldConfig.maxEntityAge;
    this.entitiesList = worldConfig.entities;
    this.entityEnergy = worldConfig.entityEnergy;

    this.numCells = this.width * this.height;
    this.maxEntities = this.numCells;
    this.estimatedNumEntities = this.entitiesList.length;
  }

  static getRandomNibble() {
    return (Math.random() + 0.5) | 0;
  }

  static mutateGenome(genome) {
    let mutatedGenome = "";
    const addCount = (genome.match(/01/g) || []).length;
    const addBias = addCount / genome.length;
    const subCount = (genome.match(/00/g) || []).length;
    const subBias = subCount / genome.length;
    const trslCount = (genome.match(/11/g) || []).length;
    const trslBias = trslCount / genome.length;

    for (let i = 0; i < genome.length; i += 1) {
      const nibble = genome[i];
      if ((Math.random() + addBias) | (0 === 1)) {
        mutatedGenome += nibble + World.getRandomNibble();
      } else if ((Math.random() + subBias) | (0 === 1)) {
        // Do nothing, removing current nibble
      } else if ((Math.random() + trslBias) | (0 === 1)) {
        mutatedGenome += World.getRandomNibble();
      } else {
        mutatedGenome += nibble;
      }
    }

    return mutatedGenome;
  }

  static mutateGenomeV2(genome) {
    let mutatedGenome = "";
    let mutationEffect = 0;

    for (let i = 0; i < genome.length; i += 1) {
      if (((Math.random() + this.chanceToMutate) | 0) === 1) {
        mutationEffect += 1;
      }

      if (((Math.random() + this.chanceToMutate) | 0) === 1) {
        i += mutationEffect * (-1 * ((Math.random() + 0.5) | 0));
        mutationEffect = 0;
      }

      mutatedGenome += genome[Math.max(i, 0)];
    }

    return mutatedGenome;
  }

  static combineGenomes(a, b) {
    let newGenome = "";
    let cursorA = 0;
    let cursorB = 0;

    while (cursorA < a.length && cursorB < b.length) {
      const randomMultiplier = Math.random();
      const segmentLengthA = (randomMultiplier * a.length) | 0;
      const segmentLengthB = (randomMultiplier * b.length) | 0;
      if ((Math.random() + 0.5) | 0) {
        newGenome += a.substr(cursorA, segmentLengthA);
      } else {
        newGenome += b.substr(cursorB, segmentLengthB);
      }
      cursorA += segmentLengthA;
      cursorB += segmentLengthB;
    }

    return newGenome;
  }

  static traitMatchesGround(trait, ground) {
    return (trait ^ ground) === 0; // eslint disable no-bitwise
  }

  entityShouldDie(entity) {
    const tooOld = ((Math.random() + entity.age / this.maxEntityAge) | 0) === 1;
    const starved = entity.energy < 1;

    return tooOld || starved;
  }

  getPositionFromIndex(index) {
    return {
      x: index % this.width,
      y: (index / this.width) | 0,
    };
  }

  static createGenome(numTraits) {
    let genome = "";

    // Seed the empty genome with random octets
    for (let i = 0; i < numTraits * 8; i += 1) {
      genome += World.getRandomNibble();
    }

    return genome;
  }

  addEntityAtIndex(entity, index) {
    this.entitiesList[index] = entity;
  }

  executeEntityAtIndex(index) {
    delete this.entitiesList[index];
  }

  killOffEntity(entity) {
    entity.state = Entity.STATE_DEAD;
  }

  getEntitiesList() {
    return this.entitiesList;
  }

  getNumLivingEntities() {
    let numLivingEntities = 0;
    const n = this.entitiesList.length;
    for (let i = 0; i < n; i += 1) {
      const entity = this.entitiesList[i];
      if (Utils.isDefined(entity) && Entity.STATE_ALIVE === entity.state) {
        numLivingEntities += 1;
      }
    }

    return numLivingEntities;
  }

  getSurroundingIndicesForIndex(i) {
    const w = this.width;
    const h = this.height;

    const hOffset = h + ((i / w) | 0);
    const wOffset = w + (i % w);

    const top = ((hOffset - 1) % h) * w;
    const mid = (hOffset % h) * w;
    const bot = ((hOffset + 1) % h) * w;

    const left = (wOffset - 1) % w;
    const right = (wOffset + 1) % w;
    const centre = wOffset % w;

    return [
      top + left,
      top + centre,
      top + right,
      mid + left,
      mid + right,
      bot + left,
      bot + centre,
      bot + right,
    ];
  }

  getOctetAtIndex(index) {
    const indices = this.getSurroundingIndicesForIndex(index);
    let octet = "";
    const n = indices.length;
    for (let i = 0; i < n; i += 1) {
      const index = indices[i];
      let nibble = 0;
      const entity = this.entitiesList[index];
      if (Utils.isDefined(entity) && Entity.STATE_ALIVE === entity.state) {
        nibble = 1;
      }
      octet += nibble;
    }

    return octet;
  }

  sortEntitiesByGenomeLength(entities) {
    const listOfIndices = [];
    const listToOrder = [];

    const n = entities.length;
    for (let i = 0; i < n; i += 1) {
      if (Utils.isDefined(entities[i])) {
        listToOrder.push([i, entities[i].genome.length]);
      }
    }

    listToOrder.sort((a, b) => b[1] - a[1]);

    for (const entry of listToOrder) {
      listOfIndices.push(entry[0]);
    }

    this.estimatedNumEntities = listOfIndices.length;

    return listOfIndices;
  }

  static getCurrentActiveTraitForEntity(entity) {
    const { genome, age } = entity;
    const index = age % ((genome.length / 16) | 0);

    return genome.substr(index * 16, 8);
  }

  static getCurrentActiveOutputForEntity(entity) {
    const { genome, age } = entity;
    const index = age % ((genome.length / 16) | 0);

    return genome.substr(index * 16 + 8, 8);
  }

  // Assumed used
  static visualiseGenomeInConsole(genome) {
    const cOn = "lightgreen";
    const cOff = "gray";
    /* FORMAT
      @ @ @     @ @ @
      @ @ @  >  @ @ @
      @ @ @     @ @ @
    */
    const c = [];
    const displayStrings = [];

    for (let iSeg = 0; iSeg < genome.length; iSeg += 16) {
      // Top row
      c.push(`color:${genome[iSeg + 0] === "1" ? cOn : cOff}`);
      c.push(`color:${genome[iSeg + 1] === "1" ? cOn : cOff}`);
      c.push(`color:${genome[iSeg + 2] === "1" ? cOn : cOff}`);

      c.push(`color:${genome[iSeg + 8] === "1" ? cOn : cOff}`);
      c.push(`color:${genome[iSeg + 9] === "1" ? cOn : cOff}`);
      c.push(`color:${genome[iSeg + 10] === "1" ? cOn : cOff}`);

      // Middle row
      c.push(`color:${genome[iSeg + 3] === "1" ? cOn : cOff}`);
      c.push(`color:${cOn}`);
      c.push(`color:${genome[iSeg + 4] === "1" ? cOn : cOff}`);

      // ... with arrow
      c.push(`color:${cOff}`);

      c.push(`color:${genome[iSeg + 11] === "1" ? cOn : cOff}`);
      c.push(`color:${cOn}`);
      c.push(`color:${genome[iSeg + 12] === "1" ? cOn : cOff}`);

      // Bottom row
      c.push(`color:${genome[iSeg + 5] === "1" ? cOn : cOff}`);
      c.push(`color:${genome[iSeg + 6] === "1" ? cOn : cOff}`);
      c.push(`color:${genome[iSeg + 7] === "1" ? cOn : cOff}`);

      c.push(`color:${genome[iSeg + 13] === "1" ? cOn : cOff}`);
      c.push(`color:${genome[iSeg + 14] === "1" ? cOn : cOff}`);
      c.push(`color:${genome[iSeg + 15] === "1" ? cOn : cOff}`);

      displayStrings.push(
        "%c@ %c@ %c@     %c@ %c@ %c@\n%c@ %c@ %c@  %c>  %c@ %c@ %c@\n%c@ %c@ %c@     %c@ %c@ %c@"
      );
    }

    // eslint-disable-next-line no-console
    console.log(displayStrings.join("\n\n"), ...c);
  }

  applyOutputToGeneration(index, output, entity) {
    const outputIndices = this.getSurroundingIndicesForIndex(index);
    // Utils.shuffleArray(outputIndices);
    const n = outputIndices.length;
    for (let i = 0; i < n; i += 1) {
      const outputIndex = outputIndices[i];
      const neighbour = this.entitiesList[outputIndex];

      let neighbourGenome;
      if (Utils.isDefined(neighbour)) {
        neighbourGenome = neighbour.genome;
        if (output[i] === "0") {
          entity.increaseEnergy(neighbour.energy);
        }
        this.executeEntityAtIndex(outputIndex);
      }

      // if (output[i] === "1" && this.getNumLivingEntities() < this.maxEntities) {
      if (output[i] === "1") {
        const spawnCost = entity.energy * 0.5;
        entity.reduceEnergy(spawnCost);
        let offspringGenome = entity.genome;
        if (
          Utils.isDefined(neighbourGenome) &&
          neighbourGenome !== entity.genome
        ) {
          offspringGenome = World.combineGenomes(
            entity.genome,
            neighbourGenome
          );
        }

        if (((Math.random() + this.chanceToMutate) | 0) === 1) {
          // offspringGenome = World.mutateGenome(offspringGenome);
          offspringGenome = World.mutateGenomeV2(offspringGenome);
        }

        const offspring = new Entity(offspringGenome, spawnCost);
        this.addEntityAtIndex(offspring, outputIndex);
      }
    }
  }

  calculateNextGeneration(entityIndices) {
    for (const index of entityIndices) {
      const entity = this.entitiesList[index];
      if (Utils.isUndefined(entity)) {
        continue;
      }

      entity.increaseAge();
      entity.reduceEnergy();

      // Entity decomposed, no energy left.
      if (0 >= entity.energy) {
        this.executeEntityAtIndex(index);
      }

      if (Entity.STATE_DEAD === entity.state) {
        continue;
      }

      if (this.entityShouldDie(entity)) {
        this.killOffEntity(entity);
        // this.executeEntityAtIndex(index);
        continue;
      }

      const trait = World.getCurrentActiveTraitForEntity(entity);
      const ground = this.getOctetAtIndex(index);
      if (World.traitMatchesGround(trait, ground)) {
        const output = World.getCurrentActiveOutputForEntity(entity);
        this.applyOutputToGeneration(index, output, entity);
      }
    }
  }

  spawnNewEntities(chanceToSpawn = 0.001) {
    // Always plant at least one white blossom tree for serenity
    this.addEntityAtIndex(
      new Entity("0000000000000000", this.entityEnergy),
      Utils.generateRandomNumber(this.numCells)
    );

    let numAttempts = this.numCells * 0.5;
    for (numAttempts; numAttempts > 0; numAttempts -= 1) {
      const index = Utils.generateRandomNumber(this.numCells);
      if (
        Utils.isUndefined(this.entitiesList[index]) &&
        ((Math.random() + chanceToSpawn) | 0) === 1
      ) {
        const numTraits =
          2 * Utils.generateRandomNumber(this.maxNumTraits, this.minNumTraits);
        const genome = World.createGenome(numTraits);
        const entity = new Entity(genome, this.entityEnergy);
        this.addEntityAtIndex(entity, index);
      }
    }
  }

  getGenomeStats() {
    let totGnome = 0;
    let maxGnome;
    let minGnome;
    let numEntities = 0;
    let totEnergy = 0;

    const n = this.entitiesList.length;
    for (let i = 0; i < n; i += 1) {
      const entity = this.entitiesList[i];
      if (Utils.isUndefined(entity) || Entity.STATE_DEAD === entity.state) {
        continue;
      }

      numEntities += 1;
      const lenGnome = entity.genome.length;
      if (Utils.isUndefined(maxGnome) || maxGnome < lenGnome) {
        maxGnome = lenGnome;
      }
      if (Utils.isUndefined(minGnome) || minGnome > lenGnome) {
        minGnome = lenGnome;
      }

      totGnome += lenGnome;
      totEnergy += entity.energy;
    }

    return {
      max: maxGnome,
      min: minGnome,
      avg: (totGnome / numEntities) | 0,
      nrg: totEnergy,
    };
  }
}
