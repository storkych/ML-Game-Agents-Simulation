export interface Settings {
  populationSize: number;
  mutationRate: number;
  hiddenLayers: number[];
  activationFunction: string;
  fitnessFunction: string;
}

export class Brain {
  weights: number[][][]; // Weights between layers
  biases: number[][]; // Biases for each layer
  layerSizes: number[]; // Number of neurons in each layer
  
  constructor(inputSize: number, hiddenLayers: number[], outputSize: number) {
    // Define the architecture of the neural network
    this.layerSizes = [inputSize, ...hiddenLayers, outputSize];
    
    // Initialize weights and biases with random values
    this.weights = [];
    this.biases = [];
    
    // Initialize weights between layers
    for (let i = 0; i < this.layerSizes.length - 1; i++) {
      const layerWeights: number[][] = [];
      
      for (let j = 0; j < this.layerSizes[i]; j++) {
        const neuronWeights: number[] = [];
        
        for (let k = 0; k < this.layerSizes[i + 1]; k++) {
          // Random weight between -1 and 1
          neuronWeights.push(Math.random() * 2 - 1);
        }
        
        layerWeights.push(neuronWeights);
      }
      
      this.weights.push(layerWeights);
    }
    
    // Initialize biases for each layer (except input layer)
    for (let i = 1; i < this.layerSizes.length; i++) {
      const layerBiases: number[] = [];
      
      for (let j = 0; j < this.layerSizes[i]; j++) {
        // Random bias between -1 and 1
        layerBiases.push(Math.random() * 2 - 1);
      }
      
      this.biases.push(layerBiases);
    }
  }
  
  // Activation function (ReLU)
  activate(x: number): number {
    return Math.max(0, x);
  }
  
  // Forward pass through the neural network
  feedForward(inputs: number[]): number[] {
    if (inputs.length !== this.layerSizes[0]) {
      throw new Error(`Expected ${this.layerSizes[0]} inputs, got ${inputs.length}`);
    }
    
    let currentLayer = inputs;
    
    // Process each layer
    for (let i = 0; i < this.weights.length; i++) {
      const nextLayer: number[] = new Array(this.layerSizes[i + 1]).fill(0);
      
      // Calculate weighted sum for each neuron in the next layer
      for (let j = 0; j < currentLayer.length; j++) {
        for (let k = 0; k < nextLayer.length; k++) {
          nextLayer[k] += currentLayer[j] * this.weights[i][j][k];
        }
      }
      
      // Add biases and apply activation function
      for (let j = 0; j < nextLayer.length; j++) {
        nextLayer[j] += this.biases[i][j];
        nextLayer[j] = this.activate(nextLayer[j]);
      }
      
      currentLayer = nextLayer;
    }
    
    return currentLayer;
  }
  
  // Create a copy of this brain
  clone(): Brain {
    const clone = new Brain(
      this.layerSizes[0],
      this.layerSizes.slice(1, -1),
      this.layerSizes[this.layerSizes.length - 1]
    );
    
    // Copy weights
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        for (let k = 0; k < this.weights[i][j].length; k++) {
          clone.weights[i][j][k] = this.weights[i][j][k];
        }
      }
    }
    
    // Copy biases
    for (let i = 0; i < this.biases.length; i++) {
      for (let j = 0; j < this.biases[i].length; j++) {
        clone.biases[i][j] = this.biases[i][j];
      }
    }
    
    return clone;
  }
  
  // Mutate the brain with a given mutation rate
  mutate(mutationRate: number): void {
    // Mutate weights
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        for (let k = 0; k < this.weights[i][j].length; k++) {
          if (Math.random() < mutationRate) {
            // Add random value between -0.5 and 0.5
            this.weights[i][j][k] += Math.random() - 0.5;
          }
        }
      }
    }
    
    // Mutate biases
    for (let i = 0; i < this.biases.length; i++) {
      for (let j = 0; j < this.biases[i].length; j++) {
        if (Math.random() < mutationRate) {
          // Add random value between -0.5 and 0.5
          this.biases[i][j] += Math.random() - 0.5;
        }
      }
    }
  }
  
  // Crossover with another brain to create a child
  crossover(partner: Brain): Brain {
    const child = this.clone();
    
    // Crossover weights
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        for (let k = 0; k < this.weights[i][j].length; k++) {
          // 50% chance to inherit from each parent
          if (Math.random() < 0.5) {
            child.weights[i][j][k] = partner.weights[i][j][k];
          }
        }
      }
    }
    
    // Crossover biases
    for (let i = 0; i < this.biases.length; i++) {
      for (let j = 0; j < this.biases[i].length; j++) {
        // 50% chance to inherit from each parent
        if (Math.random() < 0.5) {
          child.biases[i][j] = partner.biases[i][j];
        }
      }
    }
    
    return child;
  }
}