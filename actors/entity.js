export class Entity {
  age;

  genome;

  state = 0;

  energy;

  constructor(genome, energy = 9) {
    this.age = 0;
    this.genome = genome;
    this.energy = energy;
  }

  static get STATE_ALIVE() { return 0; }

  static get STATE_DEAD() { return 1; }

  increaseAge() {
    this.age += 1;
  }

  increaseEnergy(delta = 1) {
    this.energy += delta;
  }

  reduceEnergy(delta = 1) {
    this.energy -= delta;
  }
}
