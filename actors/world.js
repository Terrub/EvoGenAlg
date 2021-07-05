/* eslint
    no-bitwise: ["error", { "allow": ["|", "^"] }]
 */

import { Utils } from '../utils.js';
import { Entity } from '../actors/entity.js';

export class World {
  grid;

  width;

  height;

  chanceToMutate;

  maxEntities;

  maxNumTraits;

  minNumTraits;

  maxEntityAge = 10000;

  entities = [];

  entityPositions = {};

  constructor(width, height,
    entitiesStartAmount, maxEntities,
    maxNumTraits, minNumTraits, chanceToMutate) {
    this.width = width;
    this.height = height;
    this.maxEntities = maxEntities;
    this.maxNumTraits = maxNumTraits;
    this.minNumTraits = minNumTraits;
    this.chanceToMutate = chanceToMutate;

    // Create the random world grid
    this.grid = new Uint8Array(width * height);

    // for (let i = 0; i < grid.length; i += 1) {
    //     const value = Math.random() + 0.05 | 0;
    //     grid[i] = value;
    // }

    for (let i = 0; i < entitiesStartAmount; i += 1) {
      const x = (Math.random() * width) | 0;
      const y = (Math.random() * height) | 0;
      const index = (x) + (y * width);
      this.grid[index] = 1;
    }
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
    return (Math.random() + (entity.age / this.maxEntityAge) | 0 === 1);
  }

  getIndexFromPosition(x, y) {
    const { width, height } = this;

    return ((height + y) % height) * width + (width + x) % width;
  }

  getPositionFromIndex(index) {
    return {
      x: (index % this.width),
      y: (index / this.width | 0),
    };
  }

  createGenome() {
    // create between [1,8) pairs of segments
    const numTraits = 2 * Utils.generateRandomNumber(this.maxNumTraits, this.minNumTraits);
    let genome = '';

    // Seed the empty genome with random octets
    for (let i = 0; i < numTraits * 8; i += 1) {
      genome += World.getRandomNibble();
    }

    return genome;
  }

  addEntityAtIndex(pEntity, index) {
    const entity = pEntity;

    entity.index = index;
    if (index >= 0 && index < this.grid.length) {
      this.entityPositions[index] = entity;
      this.entities.push(entity);
      this.setGridValueAtIndex(1, index);
    }
  }

  addEntityAtPosition(entity, x, y) {
    const index = this.getIndexFromPosition(x, y);
    this.addEntityAtIndex(entity, index);
  }

  killEntity(entity) {
    const entityIndex = entity.index;
    delete this.entityPositions[entityIndex];
    this.setGridValueAtIndex(0, entityIndex);
    this.entities.splice(this.entities.indexOf(entity), 1);
  }

  getEntityAtIndex(index) {
    return this.entityPositions[index];
  }

  getEntityAt(x, y) {
    const index = this.getIndexFromPosition(x, y);
    const entity = this.getEntityAtIndex(index);

    return entity;
  }

  hasEntityAtIndex(index) {
    const entity = this.getEntityAtIndex(index);

    return !!entity;
  }

  hasEntityAt(x, y) {
    const index = this.getIndexFromPosition(x, y);
    return this.hasEntityAtIndex(index);
  }

  getEntities() {
    return this.entities;
  }

  getGrid() {
    return this.grid;
  }

  isPositionInGrid(x, y) {
    const index = this.getIndexFromPosition(x, y);
    return (0 <= index && index < this.grid.length);
  }

  getGridValueAtIndex(index) {
    return this.grid[index];
  }

  getGridValueAt(x, y) {
    let value = 0;
    const index = this.getIndexFromPosition(x, y);
    value = this.getGridValueAtIndex(index);

    return value;
  }

  setGridValueAtIndex(value, index) {
    this.grid[index] = value;
  }

  getOctetAtIndex(index) {
    const { x, y } = this.getPositionFromIndex(index);
    let octet = '';

    for (let ox = -1; ox <= 1; ox += 1) {
      for (let oy = -1; oy <= 1; oy += 1) {
        if (!(ox === 0 && oy === 0)) {
          octet += this.getGridValueAt(x + ox, y + oy);
        }
      }
    }

    return octet;
  }

  parseEntityOutput(entity) {
    const { genome } = entity;
    const position = this.getPositionFromIndex(entity.index);

    for (let i = 0; i < genome.length; i += 16) {
      const trait = World.getTraitFromGenomeAtIndex(genome, i);
      const output = World.getOutputFromGenomeAtIndex(genome, i);
      const ground = this.getOctetAtIndex(entity.index);

      let index = 0;
      if (World.traitMatchesGround(trait, ground)) {
        for (let ox = -1; ox <= 1; ox += 1) {
          for (let oy = -1; oy <= 1; oy += 1) {
            if (!(ox === 0 && oy === 0)) {
              const offsetX = position.x + ox;
              const offsetY = position.y + oy;
              const outputNibble = output[index];

              const neighbour = this.getEntityAt(offsetX, offsetY);

              if (neighbour) {
                this.killEntity(neighbour);
              }

              if (outputNibble === '1' && this.getEntities().length < this.maxEntities) {
                let offspringGenome;
                if (neighbour && genome !== neighbour.genome) {
                  offspringGenome = World.combineGenomes(genome, neighbour.genome);
                } else if ((Math.random() + this.chanceToMutate | 0) === 1) {
                  offspringGenome = World.mutateGenome(genome);
                } else {
                  offspringGenome = genome;
                }

                const entity = new Entity(offspringGenome);
                this.addEntityAtPosition(entity, offsetX, offsetY);
              }

              index += 1;
            }
          }
        }
      }
    }
  }

  // TODO: We shouldn't be fixing stuff in place. Read the previous generation first,
  //      Then work out the next generation,
  //      Then kill off whatever dies this generation.
  parseEntityEvolution(entities) {
    let entity = entities.shift();
    let currentEntityIndex = 0;
    const numEntities = entities.length;

    while (Utils.isDefined(entity) && currentEntityIndex < numEntities) {
      entity.increaseAge();

      this.parseEntityOutput(entity);

      if (this.entityShouldDie(entity)) {
        this.killEntity(entity);
      }

      entity = entities.shift();
      currentEntityIndex += 1;
    }

    while (currentEntityIndex <= this.maxEntities) {
      let index = Utils.generateRandomNumber(0, this.grid.length - 1);
      if (!this.hasEntityAtIndex(index)) {
        const genome = this.createGenome();
        const entity = new Entity(genome);
        this.addEntityAtIndex(entity, index);
        currentEntityIndex += 1;
      }
    }
  }

  static sortEntities(entities) {
    // TODO: Use some way to sort entities sensibly.
    //    > Try sorting by genome length for now?
    entities.sort((a, b) => {
      return b.genome.length - a.genome.length;
    });

    return entities;
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

  static getAltActiveTraitForEntity(entity) {
    const { genome, age } = entity;
    const index = age % (genome.length - 16);

    return genome.substr(index, 8);
  }

  static getAltActiveOutputForEntity(entity) {
    const { genome, age } = entity;
    const index = age % (genome.length - 16);

    return genome.substr(index + 8, 8);
  }

  static getTraitFromGenomeAtIndex(genome, index) {
    return genome.substr(index, 8);
  }

  static getOutputFromGenomeAtIndex(genome, index) {
    return genome.substr(index + 8, 8);
  }

  getOutputIndicesFromPositionOld(x, y) {
    return [
      (y - 1) * this.width + x - 1, // Top Left
      (y - 1) * this.width + x, // Top Centre
      (y - 1) * this.width + x + 1, // Top Right
      y * this.width + x - 1, // Mid Left
      y * this.width + x + 1, // Mid Right
      (y + 1) * this.width + x - 1, // Bottom Left
      (y + 1) * this.width + x, // Bottom Centre
      (y + 1) * this.width + x + 1, // Bottom Right
    ];
  }

  getOutputIndicesFromPosition(x, y) {
    const { height, width } = this;

    return [
      (((height + y - 1) % height) * width) + ((width + x) - 1) % width, // Top Left
      (((height + y - 1) % height) * width) + (width + x) % width, // Top Centre
      (((height + y - 1) % height) * width) + ((width + x) + 1) % width, // Top Right
      (((height + y) % height) * width) + ((width + x) - 1) % width, // Mid Left
      (((height + y) % height) * width) + ((width + x) + 1) % width, // Mid Right
      (((height + y + 1) % height) * width) + ((width + x) - 1) % width, // Bottom Left
      (((height + y + 1) % height) * width) + (width + x) % width, // Bottom Centre
      (((height + y + 1) % height) * width) + ((width + x) + 1) % width, // Bottom Right
    ];
  };

  getOutputIndicesFromIndex(index) {
    const { x, y } = this.getPositionFromIndex(index);

    return this.getOutputIndicesFromPosition(x, y);
  }

  applyOutputToGeneration(entity, output) {
    const { index, genome } = entity;
    const outputIndices = this.getOutputIndicesFromIndex(index);
    const lenOutputIndices = outputIndices.length;

    const randomisedOffset = Utils.generateRandomNumber(lenOutputIndices);
    for (let i = 0; i < lenOutputIndices; i += 1) {
      const randomisedIndex = (i + randomisedOffset) % lenOutputIndices;
      const outputIndex = outputIndices[randomisedIndex];
      const neighbour = this.getEntityAtIndex(outputIndex);

      if (neighbour) {
        this.killEntity(neighbour);
      }

      if (output[randomisedIndex] === '1' && this.entities.length < this.maxEntities) {
        let offspringGenome;
        if (neighbour && genome !== neighbour.genome) {
          offspringGenome = World.combineGenomes(genome, neighbour.genome);
        } else if ((Math.random() + this.chanceToMutate | 0) === 1) {
          offspringGenome = World.mutateGenome(genome);
        } else {
          offspringGenome = genome;
        }

        const offspring = new Entity(offspringGenome);
        this.addEntityAtIndex(offspring, outputIndex);
      }
    }
  }

  calcNextGeneration(entities) {
    for (const entity of entities) {
      const { index } = entity;
      const trait = World.getCurrentActiveTraitForEntity(entity);
      // const trait = World.getAltActiveTraitForEntity(entity);
      const ground = this.getOctetAtIndex(index);
      if (World.traitMatchesGround(trait, ground)) {
        const output = World.getCurrentActiveOutputForEntity(entity);
        // const output = World.getAltActiveOutputForEntity(entity);
        this.applyOutputToGeneration(entity, output);
      }

      entity.increaseAge();

      if (this.entityShouldDie(entity)) {
        this.killEntity(entity);
      }
    }
  }

  spawnNewEntities() {
    let numEmptySpots = this.maxEntities - this.entities.length;
    for (numEmptySpots; numEmptySpots > 0; numEmptySpots -= 1) {
      let index = Utils.generateRandomNumber(this.grid.length);
      if (!this.hasEntityAtIndex(index) && ((Math.random() + 0.5) | 0) === 1) {
        const genome = this.createGenome();
        const entity = new Entity(genome);
        this.addEntityAtIndex(entity, index);
      }
    }
  }

  getGenomeStats() {
    let avgGnome = 0;
    let lenGnome;
    let maxGnome;
    let minGnome;

    for (let i = 0; i < this.entities.length; i += 1) {
      lenGnome = this.entities[i].genome.length;
      if (maxGnome === undefined || maxGnome < lenGnome) {
        maxGnome = lenGnome;
      }
      if (minGnome === undefined || minGnome > lenGnome) {
        minGnome = lenGnome;
      }
      avgGnome += lenGnome;
    }

    return {
      max: maxGnome,
      min: minGnome,
      avg: (avgGnome / this.entities.length) | 0,
    };
  }
}
