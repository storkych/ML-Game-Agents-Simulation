import React, { useState, useEffect, useRef } from 'react';
import { Brain, Settings } from './components/Brain';
import { Agent } from './components/Agent';
import { Population } from './components/Population';
import { Target } from './components/Target';
import { BrainIcon, Settings2Icon, PlayIcon, PauseIcon, SkipForwardIcon } from 'lucide-react';

function App() {
  const [settings, setSettings] = useState<Settings>({
    populationSize: 50,
    mutationRate: 0.1,
    hiddenLayers: [8],
    activationFunction: 'relu',
    fitnessFunction: 'distance',
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [bestFitness, setBestFitness] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [population, setPopulation] = useState<Population | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [target, setTarget] = useState({ x: 400, y: 100 });
  const [reachedTarget, setReachedTarget] = useState(0);

  // Initialize population
  useEffect(() => {
    const newPopulation = new Population(settings.populationSize, settings);
    setPopulation(newPopulation);
    setGeneration(0);
    setBestFitness(0);
    setReachedTarget(0);
  }, [settings.populationSize, settings.mutationRate, settings.hiddenLayers]);

  // Main simulation loop
  useEffect(() => {
    if (!isRunning || !population || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;
    const maxFrames = 300; // Frames per generation
    
    const runSimulation = () => {
      if (frameCount >= maxFrames) {
        // End of generation
        const newGeneration = population.evolve();
        setPopulation(newGeneration);
        setGeneration(prev => prev + 1);
        const bestFit = newGeneration.getBestFitness();
        setBestFitness(bestFit);
        
        // Count agents that reached the target
        let reachedCount = 0;
        for (const agent of population.agents) {
          if (agent.hasReachedTarget) {
            reachedCount++;
          }
        }
        setReachedTarget(reachedCount);
        
        frameCount = 0;
      }
      
      // Clear canvas
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw target
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(target.x, target.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw target label
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Target', target.x, target.y - 25);
      
      // Update and draw agents
      population.update(target);
      population.draw(ctx);
      
      // Count agents that reached the target during the simulation
      let currentReachedCount = 0;
      for (const agent of population.agents) {
        if (agent.hasReachedTarget) {
          currentReachedCount++;
        }
      }
      setReachedTarget(currentReachedCount);
      
      frameCount++;
      animationRef.current = requestAnimationFrame(runSimulation);
    };
    
    animationRef.current = requestAnimationFrame(runSimulation);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, population, target]);

  const handleStartStop = () => {
    setIsRunning(prev => !prev);
  };

  const handleSkipGeneration = () => {
    if (!population) return;
    
    const newGeneration = population.evolve();
    setPopulation(newGeneration);
    setGeneration(prev => prev + 1);
    const bestFit = newGeneration.getBestFitness();
    setBestFitness(bestFit);
    
    // Count agents that reached the target
    let reachedCount = 0;
    for (const agent of newGeneration.agents) {
      if (agent.hasReachedTarget) {
        reachedCount++;
      }
    }
    setReachedTarget(reachedCount);
  };

  const handleSettingsChange = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setTarget({ x, y });
    
    // Reset the simulation when target is moved
    if (population) {
      const newPopulation = new Population(settings.populationSize, settings);
      setPopulation(newPopulation);
      setGeneration(0);
      setBestFitness(0);
      setReachedTarget(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BrainIcon size={24} />
            <h1 className="text-xl font-bold">ML Game Agents Simulation</h1>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-indigo-500 transition-colors"
          >
            <Settings2Icon size={20} />
          </button>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h2 className="font-semibold">Simulation Environment</h2>
            <div className="flex space-x-2">
              <button 
                onClick={handleStartStop}
                className={`p-2 rounded-full ${isRunning ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'} hover:opacity-80 transition-colors`}
              >
                {isRunning ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
              </button>
              <button 
                onClick={handleSkipGeneration}
                className="p-2 rounded-full bg-blue-100 text-blue-600 hover:opacity-80 transition-colors"
                disabled={isRunning}
              >
                <SkipForwardIcon size={20} />
              </button>
            </div>
          </div>
          <div className="p-4 flex justify-center">
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={500} 
              className="border border-gray-200 rounded-lg cursor-pointer"
              onClick={handleCanvasClick}
            />
          </div>
          <div className="px-4 pb-4 text-center text-sm text-gray-500">
            Click anywhere on the canvas to move the target
          </div>
        </div>
        
        <div className="md:w-80 bg-white rounded-lg shadow-md">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="font-semibold">Simulation Stats</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-sm text-gray-500">Generation</p>
              <p className="text-2xl font-bold">{generation}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Best Fitness</p>
              <p className="text-2xl font-bold">{bestFitness.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Agents Reached Target</p>
              <p className="text-lg font-medium">{reachedTarget} / {settings.populationSize}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${(reachedTarget / settings.populationSize) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Population Size</p>
              <p className="text-lg">{settings.populationSize} agents</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mutation Rate</p>
              <p className="text-lg">{settings.mutationRate * 100}%</p>
            </div>
            
            {showSettings && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium mb-3">Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Population Size</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={settings.populationSize} 
                      onChange={(e) => handleSettingsChange({ populationSize: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>10</span>
                      <span>100</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Mutation Rate</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="50" 
                      value={settings.mutationRate * 100} 
                      onChange={(e) => handleSettingsChange({ mutationRate: parseInt(e.target.value) / 100 })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>1%</span>
                      <span>50%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Fitness Function</label>
                    <select 
                      value={settings.fitnessFunction} 
                      onChange={(e) => handleSettingsChange({ fitnessFunction: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="distance">Distance to Target</option>
                      <option value="time">Time to Reach</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-gray-300 p-4 text-center text-sm">
        Machine Learning for Game AI Demonstration - Neural Networks & Genetic Algorithms
      </footer>
    </div>
  );
}

export default App;