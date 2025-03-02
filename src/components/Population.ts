import { Agent } from './Agent';
import { Settings } from './Brain';

export class Population {
  agents: Agent[];
  size: number;
  settings: Settings;
  bestAgent: Agent | null;
  
  constructor(size: number, settings: Settings) {
    this.size = size;
    this.settings = settings;
    this.agents = [];
    this.bestAgent = null;
    
    // Create initial population
    for (let i = 0; i < size; i++) {
      this.agents.push(new Agent());
    }
  }
  
  // Update all agents in the population
  update(target: { x: number, y: number }): void {
    for (const agent of this.agents) {
      agent.update(target);
    }
    
    // Update best agent after all agents have been updated
    this.updateBestAgent();
  }
  
  // Find and update the best agent in the population
  updateBestAgent(): void {
    let bestFitness = -Infinity;
    let bestAgentIndex = 0;
    
    for (let i = 0; i < this.agents.length; i++) {
      if (this.agents[i].fitness > bestFitness) {
        bestFitness = this.agents[i].fitness;
        bestAgentIndex = i;
      }
    }
    
    this.bestAgent = this.agents[bestAgentIndex];
  }
  
  // Draw all agents in the population
  draw(ctx: CanvasRenderingContext2D): void {
    // Draw regular agents first
    for (const agent of this.agents) {
      if (agent !== this.bestAgent) {
        agent.draw(ctx);
      }
    }
    
    // Draw the best agent last (on top)
    if (this.bestAgent) {
      // Make the best agent slightly larger
      const originalSize = this.bestAgent.size;
      this.bestAgent.size = originalSize * 1.5;
      
      // Draw with a highlight
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      this.bestAgent.draw(ctx);
      ctx.shadowBlur = 0;
      
      // Restore original size
      this.bestAgent.size = originalSize;
    }
  }
  
  // Calculate the fitness of all agents
  calculateFitness(): void {
    for (const agent of this.agents) {
      agent.calculateFitness({ x: 400, y: 100 });
    }
  }
  
  // Get the best fitness in the population
  getBestFitness(): number {
    let bestFitness = 0;
    
    for (const agent of this.agents) {
      if (agent.fitness > bestFitness) {
        bestFitness = agent.fitness;
      }
    }
    
    return bestFitness;
  }
  
  // Select a parent based on fitness (higher fitness = higher chance)
  selectParent(): Agent {
    // Tournament selection
    const tournamentSize = 5;
    let bestAgent = this.agents[Math.floor(Math.random() * this.agents.length)];
    
    for (let i = 0; i < tournamentSize - 1; i++) {
      const agent = this.agents[Math.floor(Math.random() * this.agents.length)];
      if (agent.fitness > bestAgent.fitness) {
        bestAgent = agent;
      }
    }
    
    return bestAgent;
  }
  
  // Create a new generation through natural selection
  evolve(): Population {
    // Create a new population
    const newPopulation = new Population(this.size, this.settings);
    
    // Find the best agent
    let bestAgent = this.agents[0];
    for (let i = 1; i < this.agents.length; i++) {
      if (this.agents[i].fitness > bestAgent.fitness) {
        bestAgent = this.agents[i];
      }
    }
    
    // Keep the best agent (elitism)
    newPopulation.agents[0] = new Agent(bestAgent.brain.clone());
    newPopulation.bestAgent = newPopulation.agents[0];
    
    // Create the rest of the population through crossover and mutation
    for (let i = 1; i < this.size; i++) {
      // Select parents
      const parentA = this.selectParent();
      const parentB = this.selectParent();
      
      // Create child through crossover
      const childBrain = parentA.brain.crossover(parentB.brain);
      
      // Mutate child
      childBrain.mutate(this.settings.mutationRate);
      
      // Add child to new population
      newPopulation.agents[i] = new Agent(childBrain);
    }
    
    return newPopulation;
  }
}