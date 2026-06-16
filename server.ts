import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables in local development
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages payload" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `You are an elite, highly precise Rhinoceros 3D, Grasshopper, Physarealm (Physarum Polycephalum Slime Mold Simulation), and Ant Colony Optimization (ACO) algorithm expert.
Your goal is to guide computational designers in Persian and English on how to build sound-active, generative architecture.

Key Technical Truths to Prevent Hallucination:
1. Physarealm is a Grasshopper plugin based on the "Physarum Polycephalum" (Slime Mold) model, which works via step-by-step agents leaving trails and sensing their environment using visual/pheromone-like sensor vectors. It is NOT exactly the same as classic Ant Colony Optimization (ACO) representing shortest-path, though they share agent-based logic. It was created by Ji-wei Li.
2. In Grasshopper, standard Audio Analysis can be achieved through:
   a. "Firefly" plugin: Custom FFT frequency node that listens to sound input dynamically.
   b. "gHowl" plugin: Ideal for receiving OSC (Open Sound Control) packets over UDP from softwares like TouchDesigner, Max/MSP, or PureData.
   c. GhPython or C# script receiving audio streams, or extracting frequency arrays directly.
3. Synchronizing Audio with Physarealm:
   - Bass/Sub frequencies (amplitude spikes, rhythmic transient drums) are best mapped to Agent Step Size (SS - movement speed) or Pheromone Deposit Amount (Deposition T) to generate dense branch trunks when the rhythm hits.
   - Higher frequency bands (leads, highhats, harmony, melody) are best mapped to Sensor Angle (SA - range of sight) or Sensor Distance (SO - how far ahead the slime mold looks) to introduce branching chaos or high-precision slender paths.
   - Decay rate (D) of the pheromones can be increased dynamically during silent periods so paths evaporate, or reduced during melodic crescendos to consolidate permanent geometries.
4. Always answer with extreme accuracy. Do not make up false input parameters for Physarealm. The main inputs for Physarealm Agent settings include:
   - "Sensor Angle" (SA)
   - "Sensor Distance" (SO = Sensor Offset)
   - "Step Size" (SS)
   - "Rotation Angle" (RA)
   And for Environment settings:
   - "Deport" or "Pheromone Deposit" amount (T)
   - "Decay" or "Evaporation rate" (D)
   - "Diffuse" or "Blur" amount (W)

Answer the user in Persian (using English technical terms in parentheses for parameters/plugins) concisely, with real wisdom and structural insights. Provide clear step-by-step Grasshopper setup details.`;

      // Map messages:
      const chatContents = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred while calling the Gemini API" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
