class Pixie
{
  public float size = 0;
  public float red = 0;
  public float green = 0;
  public float blue = 0;
  public float mass = 0;
  
  public PVector pos;
  public PVector vel;
  public PVector acc = new PVector(0,0);
  
  public Pixie(Genome p_genome, PVector p_pos, PVector p_vel) {
    this.size = floor(p_genome.getTraitAt(0) * 5 + 5);
    this.red = floor(p_genome.getTraitAt(1) * 255);
    this.green = floor(p_genome.getTraitAt(2) * 255);
    this.blue = floor(p_genome.getTraitAt(3) * 255);
    this.mass = PI * (size/2) * (size/2);
    
    this.pos = p_pos;
    this.vel = p_vel;
  }
  
  public void addForce(PVector p_force) {
    PVector force = PVector.div(p_force, this.mass);
    this.acc.add(force);
  }
  
  public void update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    
    // Reset current acceleration. We've used it.
    this.acc.mult(0);
  }
}