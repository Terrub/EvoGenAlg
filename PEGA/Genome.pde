class Genome
{
  private float[] traits;
  
  public Genome() {
    this.traits = new float[4];
    for (int i = this.traits.length-1; i >= 0; i -= 1) {
      this.traits[i] = random(1);
    }
  }
  
  public void setTraitAt(int p_index, float p_value) {
    this.traits[p_index] = p_value;
  }
  
  public float getTraitAt(int p_index) {
    return this.traits[p_index];
  }
}