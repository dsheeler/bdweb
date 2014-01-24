
void setup() {
  size(1280, 720);
}

void draw() {
  if (mousePressed) {
    fill(#20b0d0);
  } else {
    fill(255);
  }
  ellipse(mouseX, mouseY, 80, 80);

  float angle = atan2(mouseY - height/2, mouseX - width/2);
  
  //background(255);
  pushMatrix();
  translate(width/2, height/2);
  rotate(angle);
  rect(0, 0, 50, 10);
  popMatrix();
}
