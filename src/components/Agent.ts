import { Brain } from './Brain';

export class Agent {
  brain: Brain;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  fitness: number;
  isDead: boolean;
  hasReachedTarget: boolean;
  timeToReachTarget: number;
  
  constructor(brain?: Brain) {
    // Initialize position randomly on the canvas
    this.x = Math.random() * 700 + 50;
    this.y = Math.random() * 400 + 50;
    
    // Initialize velocity
    this.vx = 0;
    this.vy = 0;
    
    // Agent appearance
    this.size = 10;
    this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    
    // Agent state
    this.fitness = 0;
    this.isDead = false;
    this.hasReachedTarget = false;
    this.timeToReachTarget = 0;
    
    // Create a new brain or use the provided one
    if (brain) {
      this.brain = brain;
    } else {
      // 6 inputs: x, y, vx, vy, target x, target y
      // 2 outputs: acceleration x, acceleration y
      this.brain = new Brain(6, [8], 2);
    }
  }
  
  // Update the agent's position and velocity based on neural network output
  update(target: { x: number, y: number }): void {
    if (this.isDead || this.hasReachedTarget) return;
    
    this.timeToReachTarget++;
    
    // Normalize inputs between 0 and 1
    const inputs = [
      this.x / 800,                // x position
      this.y / 500,                // y position
      (this.vx + 5) / 10,          // x velocity (normalized from -5 to 5)
      (this.vy + 5) / 10,          // y velocity (normalized from -5 to 5)
      target.x / 800,              // target x
      target.y / 500               // target y
    ];
    
    // Get outputs from the neural network
    const outputs = this.brain.feedForward(inputs);
    
    // Apply acceleration (outputs are between 0 and 1, we map to -0.5 to 0.5)
    const ax = (outputs[0] - 0.5) * 1.5; // Increased acceleration range for more dynamic movement
    const ay = (outputs[1] - 0.5) * 1.5;
    
    // Update velocity
    this.vx += ax;
    this.vy += ay;
    
    // Limit velocity
    const maxSpeed = 5;
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > maxSpeed) {
      this.vx = (this.vx / speed) * maxSpeed;
      this.vy = (this.vy / speed) * maxSpeed;
    }
    
    // Update position
    this.x += this.vx;
    this.y += this.vy;
    
    // Check if agent has reached the target
    const distanceToTarget = Math.sqrt(
      Math.pow(this.x - target.x, 2) + Math.pow(this.y - target.y, 2)
    );
    
    // Use a more generous collision detection (15 = target radius)
    if (distanceToTarget < this.size + 15) {
      this.hasReachedTarget = true;
      // Immediately calculate fitness when target is reached
      this.calculateFitness(target);
    }
    
    // Check if agent is out of bounds
    if (
      this.x < 0 || 
      this.x > 800 || 
      this.y < 0 || 
      this.y > 500
    ) {
      this.isDead = true;
      // Immediately calculate fitness when agent dies
      this.calculateFitness(target);
    }
    
    // Calculate fitness for living agents
    if (!this.isDead && !this.hasReachedTarget) {
      this.calculateFitness(target);
    }
  }
  
  // Calculate the fitness of the agent
  calculateFitness(target: { x: number, y: number }): void {
    const distanceToTarget = Math.sqrt(
      Math.pow(this.x - target.x, 2) + Math.pow(this.y - target.y, 2)
    );
    
    if (this.hasReachedTarget) {
      // Reward for reaching the target - higher reward for faster completion
      this.fitness = 1000 - this.timeToReachTarget * 0.5;
    } else {
      // Fitness based on distance to target (closer is better)
      // Increased the fitness scale to make differences more noticeable
      this.fitness = 100 / (distanceToTarget + 1);
      
      // Penalty for dying
      if (this.isDead) {
        this.fitness *= 0.1;
      }
    }
  }
  
  // Draw the agent on the canvas
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    // Draw the agent body
    ctx.fillStyle = this.hasReachedTarget ? '#10b981' : (this.isDead ? '#6b7280' : this.color);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw direction indicator
    const angle = Math.atan2(this.vy, this.vx);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(
      this.x + Math.cos(angle) * this.size,
      this.y + Math.sin(angle) * this.size
    );
    ctx.stroke();
    
    ctx.restore();
  }
}