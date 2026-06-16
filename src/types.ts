export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface SimSettings {
  agentCount: number;
  sensorAngle: number; // in degrees
  sensorDist: number; // pixels
  stepSize: number; // travel distance per frame
  rotationAngle: number; // turn speed in degrees
  pheromoneDeposit: number; // trail deposit value
  decayRate: number; // pheromone evaporation rate
  diffuseRate: number; // blur rate
  bassMapping: string; // which parameter is mapped to bass ('step_size' | 'deposit' | 'sensor_angle' | 'rotation')
  midMapping: string; // mapped to mid
  highMapping: string; // mapped to high
  sensitivity: number; // general audio sensitivity multiplier
}

export interface CodeTemplate {
  id: string;
  title: string;
  description: string;
  setupType: "firefly" | "ghowl" | "python_udp";
  code: string;
}
