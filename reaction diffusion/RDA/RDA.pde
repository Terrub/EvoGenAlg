PVector[] ratios_L = new PVector[width * height];
PVector[] ratios_R;
boolean goofy = false;

// Formula constants
float diffusion_rate_a = 1.0;
float diffusion_rate_b = 0.5;
float feed_rate = 0.040;
float kill_rate = 0.060;
float time_interval = 1;

void initialiseRatios() {
  ratios_L = new PVector[width * height];
  ratios_R = new PVector[width * height];
  
  for (int y = 0; y < height; y += 1) {
    for (int x = 0; x < width; x += 1) {
      setRatio(ratios_L, x, y, new PVector(1, 0));
      setRatio(ratios_R, x, y, new PVector(1, 0));
    }
  }
}

void sprinkle(PVector[] ratios, int n) {
  for (int i = 0; i < n; i += 1) {
    int x = floor(random(width));
    int y = floor(random(height));
    setRatio(ratios, x, y, new PVector(0, 1));
  }
}

void spludgeCenter(PVector[] ratios, int n) {
  spludge(ratios, floor(width / 2), floor(height / 2), n);
}

void spludge(PVector[] ratios, int _x, int _y, int n) {
  int start_x = floor(_x - (n / 2));
  int start_y = floor(_y - (n / 2));
  int end_x = start_x + n;
  int end_y = start_y + n;
  
  for (int y = start_y; y < end_y; y += 1) {
    for (int x = start_x; x < end_x; x += 1) {
      setRatio(
        ratios,
        constrain(x, 0, width),
        constrain(y, 0, height),
        new PVector(0, 1)
      );
    }
  }
}

void addChemicalX(int option) {
  switch (option) {
    case 0:
      sprinkle(ratios_L, 20);
      break;

    case 1:
      spludgeCenter(ratios_L, 10);
      break;
      
    case 2:
      int n = 30;
      int x = floor(random(n, width - n));
      int y = floor(random(n, height - n));
      spludge(ratios_L, x, y, n);
      break;
      
    case 3:
      for (int i = 0; i < 10; i += 1) {
        int _n = 30;
        int _x = floor(random(_n, width - _n));
        int _y = floor(random(_n, height - _n));
        spludge(ratios_L, _x, _y, _n);
      }
      break;

    default:
      println("No chemical x was added! X_X");
      break;
  }
}

void setup() {
  size(400, 400);
  background(33);
  
  initialiseRatios();
  
  //spludgeCenter(ratios_L, 20);
  //addChemicalX(3);
  //sprinkle(ratios_L, 20);
  
}

PVector getRatio(PVector[] ratios, int x, int y) {
  int index = y * width + x;
  PVector ratio = ratios[index];
  
  return ratio;
}

void setRatio(PVector[] ratios, int x, int y, PVector ratio) {
  int index = y * width + x;

  ratios[index] = ratio;
}

PVector calculateLaplace(PVector[] ratios, int x, int y) {
  float[] multipliers = {0.05, 0.20, 0.05,
                         0.20,-1.00, 0.20,
                         0.05, 0.20, 0.05};
  float avg_x = 0.0;
  float avg_y = 0.0;
  
  for (int i = 0; i < 3; i += 1) {
    for (int j = 0; j < 3; j += 1) {
      int _x = x - 1 + j;
      int _y = y - 1 + i;
      _x = constrain(_x, 0, width - 1);
      _y = constrain(_y, 0, height - 1);
      
      PVector ratio = getRatio(ratios, _x, _y);
      int index = floor(i * 3 + j);
      float multiplier = multipliers[index];
      avg_x += multiplier * ratio.x;
      avg_y += multiplier * ratio.y;
    }
  }
  
  return new PVector(avg_x, avg_y);
}

PVector calculateNextRatioFromOld(PVector[] ratios, int x, int y) {
  PVector old_ratio = getRatio(ratios, x, y);
  float a = old_ratio.x;
  float b = old_ratio.y;
  float d_a = diffusion_rate_a;
  float d_b = diffusion_rate_b;
  PVector lp = calculateLaplace(ratios, x, y);
  float abb = a * b * b;
  float f = feed_rate;
  float k = kill_rate;
  float t = time_interval;
 
  //f = map(x, 0, width, 0.01, 0.1);
  //k = map(y, 0, height, 0.045, 0.07);
 
  float a_p = a + ((d_a * lp.x) - abb + (f * (1 - a))) * t;
  float b_p = b + ((d_b * lp.y) + abb - ((k + f) * b)) * t;
  
  PVector ratio = new PVector(a_p, b_p);

  return ratio;
}

PVector[] calculateNewRatios() {
  PVector[] old_ratios;
  PVector[] new_ratios;
  
  // We swap arrays back and forth to reuse easily.
  if (goofy) {
    old_ratios = ratios_R;
    new_ratios = ratios_L;
    goofy = false;
  } else {
    old_ratios = ratios_L;
    new_ratios = ratios_R;
    goofy = true;
  }
  
  sprinkle(old_ratios, 20);
  
  int h = height;
  int w = width;
  for (int y = 0; y < h; y += 1) {
    for (int x = 0; x < w; x += 1) {
      PVector ratio = calculateNextRatioFromOld(old_ratios, x, y);
      setRatio(new_ratios, x, y, ratio);
    }
  }
  
  return new_ratios;
}

int limit = 2;
int update_dir = 0;
int old_dir = 0;
int num_change_dir = 0;
int num_same_dir = 0;
float old_fps = 60;
boolean change_dir = false;
boolean adjusting = true;

PVector[] updateRatios() {
  PVector[] ratios = calculateNewRatios();
  int count = 0;
  
  while (count < limit) {
    ratios = calculateNewRatios();
    count += 1;
  }
  
  float fps = frameRate;
  
  float d_fps = fps - old_fps;
  
  if (adjusting) {
    if (fps < 30 && d_fps < 0) {
      update_dir = -1;
      println("Frame rate is " + fps + " decreasing limit.");
    } else {
      update_dir = 1;
      println("Frame rate is " + fps + " increasing limit.");
    }
    
    if (update_dir != old_dir) {
      change_dir = true;
      num_change_dir += 1;
      num_same_dir = 0;
      println("Changing direction to: " + update_dir);
    } else {
      change_dir = false;
      num_change_dir = 0;
      num_same_dir += 1;
    }
    
    if (num_change_dir > 10) {
      adjusting = false;
      println("We seem to have found a border limit at: " + limit);
    }
 
    limit += update_dir;

    if (limit <= 1) {
      limit = 1;
      update_dir = 1;
    }
    
    println("Limit is now set at: " + limit);
    
    old_dir = update_dir;
    old_fps = fps;
  }
  
  return ratios;
}

void draw() {
  background(33);
  
  loadPixels();
  
  PVector[] new_ratios = calculateNewRatios(); //<>//
  
  for (int y = 0; y < height; y += 1) {
    for (int x = 0; x < width; x += 1) {
      PVector ratio = getRatio(new_ratios, x, y);
      int index = ((y * width) + x);
      //int r = floor(ratio.x * 155 + 100);
      //int g = 100;
      //int b = floor(ratio.y * 155 + 100);
      
      int gray = floor(map(ratio.x - ratio.y, -1, 1, 0, 255));
      
      pixels[index] = color(gray);
    }
  }

  updatePixels();
  drawUI();
}

void drawUI() {
  fill(255);
  text("FPS", 0, height - 2);
  
  fill(0,255,0);
  text(floor(frameRate), 100, height - 2);
}

void mouseClicked() {
  float k = map(mouseY, 0, height, 0.045, 0.07);
  float f = map(mouseX, 0, width, 0.01, 0.1);;
  
  println("k: '" + k + "' | f: '" + f + "'");
}