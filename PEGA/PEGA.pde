////////////////////////////////////////////////////////////////////////////////
// Processing Evolution based Genetic Algorithm!
//
ArrayList pixies = new ArrayList();

void setup() {
  size(800, 600);
  background(20);
  
  createRandomPixies(100);
}

void draw() {
  background(20);
  updatePixies();
  drawPixies();
  drawUI();
}

void createRandomPixies(int p_pixie_count) {
  for (int i = 0; i < p_pixie_count; i += 1) {
    pixies.add(createRandomPixie());
  }
}

Pixie createRandomPixie() {
  Genome random_genome = new Genome();
  PVector pos = new PVector(random(width), random(height));
  PVector vel = PVector.random2D();
  return new Pixie(random_genome, pos, vel);
}

void addMouseForceTo(Pixie pixie) {
  if (mousePressed) {
    PVector mouse_force = new PVector(mouseX, mouseY);
    
    if (mouseButton == LEFT) {
      // move towards the mouse
      PVector.sub(mouse_force, pixie.pos, mouse_force);
    }
    else if (mouseButton == RIGHT) {
      // move away from the mouse
      PVector.sub(pixie.pos, mouse_force, mouse_force);
    }
    pixie.addForce(mouse_force);
  }
}

void addResistancesTo(Pixie pixie) {
  PVector air_resistance = new PVector(0,0);
  air_resistance.sub(pixie.vel);
  
  float c_d = 0.05;
  float p = 0.1; 
  float v = pixie.vel.mag();
  float a = pixie.mass;
  float mlp = 0.5 * p * (v * v) * a * c_d;
  
  air_resistance.setMag(mlp);
  
  pixie.addForce(air_resistance);
}

void addCollisionForceTo(Pixie pixie, int index) {
  for (int i = 0; i < pixies.size(); i += 1) {
    if (i == index) {
      continue;
    }

    Pixie target = (Pixie) pixies.get(i);
    float ds = PVector.dist(pixie.pos, target.pos);
    
    if (ds <= (pixie.size / 2) + (target.size / 2)) {
      PVector d_vel = PVector.sub(target.vel, pixie.vel);
      float acc = (d_vel.mag() / frameRate);
      
      PVector impact = PVector.sub(target.pos, pixie.pos);
      impact.mult(pixie.mass * acc);
      
      PVector react = PVector.sub(pixie.pos, target.pos);
      react.mult(target.mass * acc);
      
      target.addForce(impact);
      pixie.addForce(react);
    }
  }
}

void updatePixies() {
  for (int i = 0; i < pixies.size(); i += 1) {
    Pixie pixie = (Pixie) pixies.get(i);

    addMouseForceTo(pixie);
    addCollisionForceTo(pixie, i);
    addResistancesTo(pixie);
    pixie.update();
    
    if (pixie.isOutOfBounds(0, width, 0, height)) {
      pixie.wrapPosition(width, height);
    }
  }
}

void drawPixies() {
  for (int i = 0; i < pixies.size(); i += 1) {
    Pixie pixie = (Pixie) pixies.get(i);
    
    fill(pixie.red, pixie.green, pixie.blue);
    noStroke();
    ellipse(pixie.pos.x, pixie.pos.y, pixie.size, pixie.size);
  }
}

void drawUI() {
  fill(255);
  text("PIXIE COUNT", 0, height - 13);
  text("FPS", 0, height - 2);
  
  fill(0,255,0);
  text(pixies.size(), 100, height - 13);
  text(floor(frameRate), 100, height - 2);
}