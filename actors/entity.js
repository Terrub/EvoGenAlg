export class Entity {
  age;

  genome;

  constructor(genome) {
    this.age = 0;
    this.genome = genome;
    this.index;
  }
  
  increaseAge() {
    this.age += 1;
  }
}