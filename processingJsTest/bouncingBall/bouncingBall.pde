/**
 * Bouncing Ball with Vectors 
 * by Daniel Shiffman.  
 * 
 * Demonstration of using vectors to control motion of body
 * This example is not object-oriented
 * See AccelerationWithVectors for an example of how to simulate motion using vectors in an object
 */
 
PVector location;  // Location of shape
PVector velocity;  // Velocity of shape
PVector gravity;   // Gravity acts at the shape's acceleration

void setup() {
  size(1280,720);
  smooth();
  location = new PVector(width/2, height*0.8);
  velocity = new PVector(2,0);
  gravity = new PVector(0,0.2);

}

void draw() {
  //background(0);
  
  // Add velocity to the location.
  location.add(velocity);
  // Add gravity to velocity
  float angle = atan2(location.y - height/2, location.x - width/2);
  float a = location.y - height/2;
  float b = location.x - width/2;
  float r = sqrt(a*a + b*b);
  r = max(r, 0.01);  
  float r2 = r*r;

  gravity.x = -5000*cos(angle)/r2;
  gravity.y = -5000*sin(angle)/r2;
  velocity.add(gravity);
 
  if (mousePressed) {
    location.x = mouseX;
    location.y = mouseY;
    velocity.x = mouseX - pmouseX;
    velocity.y = mouseY - pmouseY; 
  }

  // Bounce off edges
  if (location.x > width) {
    velocity.x = velocity.x * -1;
    location.x = width
  }
  if (location.x < 0) {
    velocity.x = velocity.x * -1;
    location.x = 0;
  }
  if (location.y > height) {
    velocity.y = velocity.y * -1; 
    location.y = height;
  }

  if (location.y < 0) {
    velocity.y = velocity.y * -1;
    location.y = 0;
  }
  
  // Display circle at location vector
  stroke(255);
  strokeWeight(2);
  fill(127);
  ellipse(location.x,location.y,48,48);
}


