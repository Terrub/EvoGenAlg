/* eslint
    no-bitwise: ["error", { "allow": ["|", "^"] }]
 */

import { Utils } from '../utils.js';
import { Entity } from './entity.js';

export class World {
  width;

  height;

  numCells;

  chanceToMutate;

  maxEntities;

  maxNumTraits;

  minNumTraits;

  maxEntityAge = 200;

  entityPositions = {};

  entitiesList;

  estimatedNumEntities;

  constructor(width, height, maxEntities, maxNumTraits, minNumTraits, chanceToMutate, pEntities) {
    this.width = width;
    this.height = height;
    this.maxNumTraits = maxNumTraits;
    this.minNumTraits = minNumTraits;
    this.chanceToMutate = chanceToMutate;
    this.numCells = this.width * this.height;
    // this.maxEntities = maxEntities;
    this.maxEntities = this.numCells;
    this.entitiesList = pEntities;
    this.estimatedNumEntities = maxEntities;
  }

  static getRandomNibble() {
    return (Math.random() + 0.5) | 0;
  }

  static mutateGenome(genome) {
    let mutatedGenome = '';
    const addCount = (genome.match(/01/g) || []).length;
    const addBias = addCount / genome.length;
    const subCount = (genome.match(/00/g) || []).length;
    const subBias = subCount / genome.length;
    const trslCount = (genome.match(/11/g) || []).length;
    const trslBias = trslCount / genome.length;

    for (let i = 0; i < genome.length; i += 1) {
      const nibble = genome[i];
      if ((Math.random() + addBias) | 0 === 1) {
        mutatedGenome += nibble + World.getRandomNibble();
      } else if ((Math.random() + subBias) | 0 === 1) {
        // Do nothing, removing current nibble
      } else if ((Math.random() + trslBias) | 0 === 1) {
        mutatedGenome += World.getRandomNibble();
      } else {
        mutatedGenome += nibble;
      }
    }

    return mutatedGenome;
  }

  static mutateGenomeV2(genome) {
    let mutatedGenome = '';
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
    let newGenome = '';
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
    const tooOld = (Math.random() + (entity.age / this.maxEntityAge) | 0 === 1);
    const starved = entity.energy < 1;

    return (tooOld || starved);
  }

  getPositionFromIndex(index) {
    return {
      x: (index % this.width),
      y: (index / this.width | 0),
    };
  }

  static createGenome(numTraits) {
    let genome = '';

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
    // return this.entitiesList.reduce((numLivingEntities, entity) => {
    //   if (Utils.isDefined(entity) && entity.state === Entity.STATE_ALIVE) {
    //     return numLivingEntities + 1;
    //   }

    //   return numLivingEntities;
    // }, 0);
    return this.estimatedNumEntities;
  }

  getSurroundingIndicesForIndex(i) {
    const w = this.width;
    const h = this.height;

    return [
      (((h + (i / w | 0) - 1) % h) * w) + (w + (i % w) - 1) % w, // Top Left
      (((h + (i / w | 0) - 1) % h) * w) + (w + (i % w)) % w, // Top Centre
      (((h + (i / w | 0) - 1) % h) * w) + (w + (i % w) + 1) % w, // Top Right
      (((h + (i / w | 0)) % h) * w) + (w + (i % w) - 1) % w, // Mid Left
      (((h + (i / w | 0)) % h) * w) + (w + (i % w) + 1) % w, // Mid Right
      (((h + (i / w | 0) + 1) % h) * w) + (w + (i % w) - 1) % w, // Bottom Left
      (((h + (i / w | 0) + 1) % h) * w) + (w + (i % w)) % w, // Bottom Centre
      (((h + (i / w | 0) + 1) % h) * w) + (w + (i % w) + 1) % w, // Bottom Right
    ]
  }

  getOctetAtIndex(index) {
    const indices = this.getSurroundingIndicesForIndex(index);
    let octet = '';
    indices.forEach((index) => {
      let nibble = 0;
      const entity = this.entitiesList[index];
      if (Utils.isDefined(entity)) {
        nibble = 1;
      }
      octet += nibble;
    });

    return octet;
  }

  sortEntitiesByGenomeLength(entities) {
    const listOfIndices = [];
    const listToOrder = [];

    entities.forEach((entity, index) => {
      // listToOrder.push([index, entity.genome]);
      listToOrder.push([index, World.getCurrentActiveOutputForEntity(entity)]);
    });

    listToOrder.sort((a, b) => (a[1].match(/1/g) || []).length - (b[1].match(/1/g) || []).length);
    listToOrder.forEach((entry) => {
      listOfIndices.push(entry[0]);
    });

    this.estimatedNumEntities = listOfIndices.length;

    return listOfIndices;
  }

  static getCurrentActiveTraitForEntity(entity) {
    const { genome, age } = entity;
    const index = age % ((genome.length / 16) | 0);

    return genome.substr((index * 16), 8);
  }

  static getCurrentActiveOutputForEntity(entity) {
    const { genome, age } = entity;
    const index = age % ((genome.length / 16) | 0);

    return genome.substr((index * 16) + 8, 8);
  }

  // Assumed used
  static visualiseGenomeInConsole(genome) {
    const cOn = 'lightgreen';
    const cOff = 'gray';
    /* FORMAT
      @ @ @     @ @ @
      @ @ @  >  @ @ @
      @ @ @     @ @ @
    */
    const c = [];
    const displayStrings = [];

    for (let iSeg = 0; iSeg < genome.length; iSeg += 16) {
      // Top row
      c.push(`color:${genome[iSeg + 0] === '1' ? cOn : cOff}`);
      c.push(`color:${genome[iSeg + 1] === '1' ? cOn : cOff}`);
      c.push(`color:${genome[iSeg + 2] === '1' ? cOn : cOff}`);

      c.push(`color:${genome[iSeg + 8] === '1' ? cOn : cOff}`);
      c.push(`color:${genome[iSeg + 9] === '1' ? cOn : cOff}`);
      c.push(`color:${genome[iSeg + 10] === '1' ? cOn : cOff}`);

      // Middle row
      c.push(`color:${genome[iSeg + 3] === '1' ? cOn : cOff}`);
      c.push(`color:${cOn}`);
      c.push(`color:${genome[iSeg + 4] === '1' ? cOn : cOff}`);

      // ... with arrow
      c.push(`color:${cOff}`);

      c.push(`color:${genome[iSeg + 11] === '1' ? cOn : cOff}`);
      c.push(`color:${cOn}`);
      c.push(`color:${genome[iSeg + 12] === '1' ? cOn : cOff}`);

      // Bottom row
      c.push(`color:${genome[iSeg + 5] === '1' ? cOn : cOff}`);
      c.push(`color:${genome[iSeg + 6] === '1' ? cOn : cOff}`);
      c.push(`color:${genome[iSeg + 7] === '1' ? cOn : cOff}`);

      c.push(`color:${genome[iSeg + 13] === '1' ? cOn : cOff}`);
      c.push(`color:${genome[iSeg + 14] === '1' ? cOn : cOff}`);
      c.push(`color:${genome[iSeg + 15] === '1' ? cOn : cOff}`);

      displayStrings.push('%c@ %c@ %c@     %c@ %c@ %c@\n%c@ %c@ %c@  %c>  %c@ %c@ %c@\n%c@ %c@ %c@     %c@ %c@ %c@');
    }

    // eslint-disable-next-line no-console
    console.log(displayStrings.join('\n\n'), ...c);
  }

  applyOutputToGeneration(index, output, entity) {
    const outputIndices = this.getSurroundingIndicesForIndex(index);
    const spawnFactor = (output.match(/1/g) || []).length;
    // Utils.shuffleArray(outputIndices);
    outputIndices.forEach((outputIndex, i) => {
      if (this.entityShouldDie(entity)) {
        this.executeEntityAtIndex(index);
      } else {
        const neighbour = this.entitiesList[outputIndex];

        let neighbourGenome;
        if (Utils.isDefined(neighbour)) {
          neighbourGenome = neighbour.genome;
          if (output[i] === '0') {
            entity.increaseEnergy((neighbour.energy - entity.energy) | 0);
          }
          // this.killOffEntity(neighbour);
          this.executeEntityAtIndex(outputIndex);
        }

        if (output[i] === '1' && this.getNumLivingEntities() < this.maxEntities) {
          const spawnCost = 9 - spawnFactor;
          entity.reduceEnergy(spawnCost); // kids make you oooold...
          let offspringGenome = entity.genome;
          if (Utils.isDefined(neighbourGenome) && neighbourGenome !== entity.genome) {
            offspringGenome = World.combineGenomes(entity.genome, neighbour.genome);
          }

          if ((Math.random() + this.chanceToMutate) | 0 === 1) {
            // offspringGenome = World.mutateGenome(offspringGenome);
            offspringGenome = World.mutateGenomeV2(offspringGenome);
          }

          const offspring = new Entity(offspringGenome, spawnCost);
          this.addEntityAtIndex(offspring, outputIndex);
        }
      }
    });
  }

  calculateNextGeneration(entityIndices) {
    entityIndices.forEach((index) => {
      const entity = this.entitiesList[index];
      if (Utils.isDefined(entity)) {
        entity.increaseAge();
        
        if (this.entityShouldDie(entity)) {
          // this.killOffEntity(entity);
          this.executeEntityAtIndex(index);
        }

        const trait = World.getCurrentActiveTraitForEntity(entity);
        const ground = this.getOctetAtIndex(index);
        if (World.traitMatchesGround(trait, ground)) {
          const output = World.getCurrentActiveOutputForEntity(entity);
          this.applyOutputToGeneration(index, output, entity);
        }
      }
    });
  }

  spawnNewEntities() {
    let numEmptySpots = this.maxEntities - this.getNumLivingEntities();
    for (numEmptySpots; numEmptySpots > 0; numEmptySpots -= 1) {
      const index = Utils.generateRandomNumber(this.numCells);
      if (Utils.isUndefined(this.entitiesList[index]) && ((Math.random() + 0.001) | 0) === 1) {
        const numTraits = 2 * Utils.generateRandomNumber(this.maxNumTraits, this.minNumTraits);
        const genome = World.createGenome(numTraits);
        const entity = new Entity(genome);
        this.addEntityAtIndex(entity, index);
      }
    }
  }

  removeDeadEntities() {
    this.entitiesList.forEach((entity, index) => {
      if (entity.state === Entity.STATE_DEAD) {
        this.executeEntityAtIndex(index);
      }
    });
  }

  getGenomeStats() {
    let avgGnome = 0;
    let lenGnome;
    let maxGnome;
    let minGnome;

    this.entitiesList.forEach((entity) => {
      lenGnome = entity.genome.length;
      if (Utils.isUndefined(maxGnome) || maxGnome < lenGnome) {
        maxGnome = lenGnome;
      }
      if (Utils.isUndefined(minGnome) || minGnome > lenGnome) {
        minGnome = lenGnome;
      }

      avgGnome += lenGnome;
    });

    return {
      max: maxGnome,
      min: minGnome,
      avg: (avgGnome / this.getNumLivingEntities()) | 0,
    };
  }
}
