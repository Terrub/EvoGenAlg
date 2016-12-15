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
    this.size = floor(p_genome.getTraitAt(0) * 10 + 10);
    this.red = floor(p_genome.getTraitAt(1) * 255);
    this.green = floor(p_genome.getTraitAt(2) * 255);
    this.blue = floor(p_genome.getTraitAt(3) * 255);
    this.mass = PI * (size/2) * (size/2);
    
    this.pos = p_pos;
    this.vel = p_vel;
  }
  
  public void addForce(PVector p_force) {
    PVector force = PVector.div(p_force, this.mass);
    force.mult(0.5);
    this.acc.add(force);
  }
  
  public void update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    
    // Reset current acceleration. We've used it.
    this.acc.mult(0);
  }
  
  public boolean isOutOfBounds(float left, float right, float top, float bottom) {
    float x = this.pos.x;
    float y = this.pos.y;
    
    return (x < left || x > right || y < top || y > bottom);
  }
  
  public void wrapPosition(float p_width, float p_height) {
    this.pos.x = (p_width + this.pos.x) % p_width;
    this.pos.y = (p_height + this.pos.y) % p_height;
  }
  
  public void draw() {

  }
}