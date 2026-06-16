import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Disc, Mic, Upload, Sliders, Compass, Eye, Zap, RefreshCw, Layers } from "lucide-react";
import { SimSettings } from "../types";

const SIM_WIDTH = 220;
const SIM_HEIGHT = 160;

export default function ACOSector() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSourceType, setAudioSourceType] = useState<"none" | "synthesizer" | "mic" | "file">("none");
  const [tempo, setTempo] = useState(128); // BPM for internal synth
  const [synthPreset, setSynthPreset] = useState<"kick-bass" | "ambient-plucks" | "harmonic-glide">("kick-bass");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");

  // Live frequency values (0 - 1)
  const [bassVal, setBassVal] = useState(0.0);
  const [midVal, setMidVal] = useState(0.0);
  const [highVal, setHighVal] = useState(0.0);
  
  // Simulation settings
  const [settings, setSettings] = useState<SimSettings>({
    agentCount: 800,
    sensorAngle: 45,
    sensorDist: 9,
    stepSize: 1.5,
    rotationAngle: 25,
    pheromoneDeposit: 15,
    decayRate: 0.1,
    diffuseRate: 0.25,
    bassMapping: "step_size", // bass -> SS
    midMapping: "deposit",    // mid -> T
    highMapping: "sensor_angle", // high -> SA
    sensitivity: 1.5
  });

  const [activePreset, setActivePreset] = useState<"default" | "brutalist" | "filaments" | "chaotic">("default");

  // Web Audio Context & Synthesizer references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const synthIntervalRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioBufferSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Simulation particle and trail state
  const agentsRef = useRef<{ x: number; y: number; angle: number }[]>([]);
  const trailGridRef = useRef<Float32Array>(new Float32Array(SIM_WIDTH * SIM_HEIGHT));
  const blurGridRef = useRef<Float32Array>(new Float32Array(SIM_WIDTH * SIM_HEIGHT));
  const animationFrameId = useRef<number | null>(null);

  // Initialize agents
  const initAgents = (count: number) => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      // Start in a central cluster or randomly in space
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 25;
      arr.push({
        x: SIM_WIDTH / 2 + Math.cos(angle) * radius,
        y: SIM_HEIGHT / 2 + Math.sin(angle) * radius,
        angle: Math.random() * Math.PI * 2,
      });
    }
    agentsRef.current = arr;
    trailGridRef.current.fill(0);
    blurGridRef.current.fill(0);
  };

  // Setup agents on load or when count changes
  useEffect(() => {
    initAgents(settings.agentCount);
    return () => {
      stopAudio();
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [settings.agentCount]);

  // Handle Preset changes
  const applyPreset = (pname: "default" | "brutalist" | "filaments" | "chaotic") => {
    setActivePreset(pname);
    if (pname === "default") {
      setSettings(prev => ({
        ...prev,
        sensorAngle: 45,
        sensorDist: 8,
        stepSize: 1.5,
        rotationAngle: 25,
        pheromoneDeposit: 14,
        decayRate: 0.08,
        diffuseRate: 0.22,
        bassMapping: "step_size",
        midMapping: "deposit",
        highMapping: "sensor_angle",
      }));
    } else if (pname === "brutalist") {
      setSettings(prev => ({
        ...prev,
        sensorAngle: 22,
        sensorDist: 15,
        stepSize: 0.9,
        rotationAngle: 12,
        pheromoneDeposit: 25,
        decayRate: 0.04,
        diffuseRate: 0.1,
        bassMapping: "deposit",
        midMapping: "sensor_offset",
        highMapping: "rotation",
      }));
    } else if (pname === "filaments") {
      setSettings(prev => ({
        ...prev,
        sensorAngle: 65,
        sensorDist: 10,
        stepSize: 2.2,
        rotationAngle: 35,
        pheromoneDeposit: 18,
        decayRate: 0.22,
        diffuseRate: 0.3,
        bassMapping: "step_size",
        midMapping: "deposit",
        highMapping: "sensor_angle",
      }));
    } else if (pname === "chaotic") {
      setSettings(prev => ({
        ...prev,
        sensorAngle: 110,
        sensorDist: 6,
        stepSize: 2.8,
        rotationAngle: 55,
        pheromoneDeposit: 12,
        decayRate: 0.15,
        diffuseRate: 0.4,
        bassMapping: "rotation",
        midMapping: "step_size",
        highMapping: "sensor_angle",
      }));
    }
  };

  // Web Audio Hookups
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const startSynthesizer = () => {
    stopAudio();
    const ctx = getAudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    
    setAudioSourceType("synthesizer");
    setIsPlaying(true);

    let step = 0;
    const intervalMs = (60 * 1000) / tempo / 4; // 16th notes

    const playStep = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state === "suspended") return;
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // 1. Kick Bass Trigger (heavy on steps of 4)
      if (step % 4 === 0 || (synthPreset === "harmonic-glide" && Math.random() > 0.6)) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(analyser);
        analyser.connect(ctx.destination);

        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);

        gain.gain.setValueAtTime(0.8, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.35);
      }

      // 2. Snare / High Hat Noise transient (high frequency beat)
      if (step % 8 === 4 || (step % 4 !== 0 && Math.random() > 0.75)) {
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "highpass";
        noiseFilter.frequency.setValueAtTime(8000, now);

        const noiseGain = ctx.createGain();
        noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(analyser);

        noiseGain.gain.setValueAtTime(synthPreset === "ambient-plucks" ? 0.05 : 0.25, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);

        noiseNode.start(now);
        noiseNode.stop(now + 0.1);
      }

      // 3. Melodic synth notes (Arpeggio in intermediate frequencies)
      const scale = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00]; // Pentatonic Matrix
      if (synthPreset === "ambient-plucks" || (synthPreset === "harmonic-glide" && step % 2 === 0)) {
        const melodyTrig = synthPreset === "ambient-plucks" ? 0.45 : 0.75;
        if (Math.random() < melodyTrig) {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(analyser);

          const randomFreq = scale[Math.floor(Math.random() * scale.length)] * (Math.random() > 0.5 ? 2 : 1);
          osc2.frequency.setValueAtTime(randomFreq, now);
          osc2.type = synthPreset === "harmonic-glide" ? "sawtooth" : "sine";

          gain2.gain.setValueAtTime(0.15, now);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

          osc2.start(now);
          osc2.stop(now + 0.45);
        }
      }

      step = (step + 1) % 16;
    };

    const intervalId = window.setInterval(playStep, intervalMs);
    synthIntervalRef.current = intervalId;
  };

  const startMicrophone = async () => {
    stopAudio();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      
      const ctx = getAudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      analyserRef.current = analyser;
      setAudioSourceType("mic");
      setIsPlaying(true);
    } catch (err) {
      console.error("میکروفون در دسترس نیست", err);
      alert("خطا در دسترسی به میکروفون: لطفاً دسترسی را تایید کنید.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopAudio();
    setUploadedFileName(file.name);
    setAudioSourceType("file");

    try {
      const ctx = getAudioContext();
      const fileReader = new FileReader();

      fileReader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) return;

        ctx.decodeAudioData(arrayBuffer, (decodedBuffer) => {
          const sourceNode = ctx.createBufferSource();
          sourceNode.buffer = decodedBuffer;
          sourceNode.loop = true;

          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          
          sourceNode.connect(analyser);
          analyser.connect(ctx.destination);

          audioBufferSourceRef.current = sourceNode;
          analyserRef.current = analyser;

          sourceNode.start(0);
          setIsPlaying(true);
        }, (err) => {
          console.error("خطا در بارگذاری فایل صوتی", err);
          alert("فرمت صوتی نامعتبر است.");
        });
      };

      fileReader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
    }
  };

  const stopAudio = () => {
    setIsPlaying(false);
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (audioBufferSourceRef.current) {
      audioBufferSourceRef.current.stop();
      audioBufferSourceRef.current.disconnect();
      audioBufferSourceRef.current = null;
    }
    setAudioSourceType("none");
    setBassVal(0);
    setMidVal(0);
    setHighVal(0);
  };

  // Toggle Play
  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startSynthesizer();
    }
  };

  // Main high-performance simulation canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fast Web Audio FFT Analysis
    const audioDataArr = new Uint8Array(128);
    
    const updateAudioAnalysis = () => {
      if (analyserRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(audioDataArr);
        
        // Sum regions of spectrum
        // Bass: indices 1 to 8 (low frequencies)
        let bassSum = 0;
        for (let i = 1; i <= 8; i++) bassSum += audioDataArr[i];
        const rawBass = (bassSum / 8) / 255.0 * settings.sensitivity;
        
        // Mids: indices 12 to 35
        let midSum = 0;
        for (let i = 12; i <= 35; i++) midSum += audioDataArr[i];
        const rawMid = (midSum / 24) / 255.0 * settings.sensitivity;

        // Highs: indices 45 to 80
        let highSum = 0;
        for (let i = 45; i <= 80; i++) highSum += audioDataArr[i];
        const rawHigh = (highSum / 35) / 255.0 * settings.sensitivity;

        setBassVal(Math.min(1.0, rawBass));
        setMidVal(Math.min(1.0, rawMid));
        setHighVal(Math.min(1.0, rawHigh));
      } else {
        // Fallback smooth fluctuations to keep visual interesting when silent
        setBassVal(0);
        setMidVal(0);
        setHighVal(0);
      }
    };

    // Main particle update tick
    const simTick = () => {
      updateAudioAnalysis();

      // Resolve live-modulated parameters based on mapped sliders
      // Incorporate Audio inputs with fallbacks
      const bSig = bassVal;
      const mSig = midVal;
      const hSig = highVal;

      // 1. Step Size SS (rhythm speed)
      let activeStepSize = settings.stepSize;
      if (settings.bassMapping === "step_size") activeStepSize += bSig * 3.5;
      else if (settings.midMapping === "step_size") activeStepSize += mSig * 2.5;

      // 2. Sensor Angle SA
      let activeSensorAngle = (settings.sensorAngle * Math.PI) / 180;
      if (settings.highMapping === "sensor_angle") activeSensorAngle += hSig * 1.5;
      else if (settings.midMapping === "sensor_angle") activeSensorAngle += mSig * 0.8;

      // 3. Sensor Distance SO
      let activeSensorDist = settings.sensorDist;
      if (settings.midMapping === "sensor_offset") activeSensorDist += mSig * 14;
      else if (settings.highMapping === "sensor_offset") activeSensorDist += hSig * 8;

      // 4. Trail Deposit T
      let activeDeposit = settings.pheromoneDeposit;
      if (settings.midMapping === "deposit") activeDeposit += mSig * 25;
      else if (settings.bassMapping === "deposit") activeDeposit += bSig * 35;

      // 5. Rotation Angle RA (turning sharpness)
      let activeRotation = (settings.rotationAngle * Math.PI) / 180;
      if (settings.highMapping === "rotation") activeRotation += hSig * 1.2;
      else if (settings.bassMapping === "rotation") activeRotation += bSig * 0.8;

      // 6. Evaporation / Decay Rate
      const activeDecay = settings.decayRate;

      const trailGrid = trailGridRef.current;
      const blurGrid = blurGridRef.current;
      const agents = agentsRef.current;

      // Helper helper to safely read trail value
      const getTrailVal = (x: number, y: number) => {
        // Wrap coordinates safely around border bounds (Torus space)
        const wrappedX = (Math.floor(x) + SIM_WIDTH) % SIM_WIDTH;
        const wrappedY = (Math.floor(y) + SIM_HEIGHT) % SIM_HEIGHT;
        return trailGrid[wrappedX + wrappedY * SIM_WIDTH];
      };

      // 1. Agent processing loop
      for (let i = 0; i < agents.length; i++) {
        const ag = agents[i];

        // Read trail sensors
        // Front sensor
        const xF = ag.x + Math.cos(ag.angle) * activeSensorDist;
        const yF = ag.y + Math.sin(ag.angle) * activeSensorDist;
        const valF = getTrailVal(xF, yF);

        // FL (front left) sensor
        const xL = ag.x + Math.cos(ag.angle - activeSensorAngle) * activeSensorDist;
        const yL = ag.y + Math.sin(ag.angle - activeSensorAngle) * activeSensorDist;
        const valL = getTrailVal(xL, yL);

        // FR (front right) sensor
        const xR = ag.x + Math.cos(ag.angle + activeSensorAngle) * activeSensorDist;
        const yR = ag.y + Math.sin(ag.angle + activeSensorAngle) * activeSensorDist;
        const valR = getTrailVal(xR, yR);

        // Steer decision matrix representing slime mold tropism
        if (valF > valL && valF > valR) {
          // Stay path, tiny random perturb
          ag.angle += (Math.random() - 0.5) * 0.1;
        } else if (valL > valF && valL > valR) {
          // Steer left
          ag.angle -= activeRotation;
        } else if (valR > valF && valR > valL) {
          // Steer right
          ag.angle += activeRotation;
        } else if (valL > valR) {
          ag.angle -= activeRotation * 0.5;
        } else if (valR > valL) {
          ag.angle += activeRotation * 0.5;
        } else {
          // Wander randomly
          ag.angle += (Math.random() - 0.5) * 0.5;
        }

        // Apply physical movements
        ag.x += Math.cos(ag.angle) * activeStepSize;
        ag.y += Math.sin(ag.angle) * activeStepSize;

        // Warp bounds wrapping
        if (ag.x < 0) ag.x = SIM_WIDTH - 1;
        if (ag.x >= SIM_WIDTH) ag.x = 0;
        if (ag.y < 0) ag.y = SIM_HEIGHT - 1;
        if (ag.y >= SIM_HEIGHT) ag.y = 0;

        // Deposit pheromones at agent grid index
        const idx = Math.floor(ag.x) + Math.floor(ag.y) * SIM_WIDTH;
        if (idx >= 0 && idx < trailGrid.length) {
          trailGrid[idx] = Math.min(255, trailGrid[idx] + activeDeposit);
        }
      }

      // 2. Diffuse & Evaporation box filter for trails
      // We apply 3x3 average filter
      for (let y = 1; y < SIM_HEIGHT - 1; y++) {
        for (let x = 1; x < SIM_WIDTH - 1; x++) {
          const selfIdx = x + y * SIM_WIDTH;
          
          let neighborsSum = 0;
          neighborsSum += trailGrid[selfIdx - 1 - SIM_WIDTH]; // top left
          neighborsSum += trailGrid[selfIdx - SIM_WIDTH];     // top
          neighborsSum += trailGrid[selfIdx + 1 - SIM_WIDTH]; // top right
          neighborsSum += trailGrid[selfIdx - 1];             // left
          neighborsSum += trailGrid[selfIdx];                 // center
          neighborsSum += trailGrid[selfIdx + 1];             // right
          neighborsSum += trailGrid[selfIdx - 1 + SIM_WIDTH]; // bottom left
          neighborsSum += trailGrid[selfIdx + SIM_WIDTH];     // bottom
          neighborsSum += trailGrid[selfIdx + 1 + SIM_WIDTH]; // bottom right
          
          const rawAverage = neighborsSum / 9.0;
          
          // Apply diffuse blending
          const blendVal = (1.0 - settings.diffuseRate) * trailGrid[selfIdx] + settings.diffuseRate * rawAverage;
          
          // Apply evaporation decay
          blurGrid[selfIdx] = Math.max(0, blendVal * (1.0 - activeDecay));
        }
      }

      // Swap buffer values back to trail grid
      trailGrid.set(blurGrid);

      // 3. Render raw cells onto screen canvas
      const imgData = ctx.createImageData(SIM_WIDTH, SIM_HEIGHT);
      const data = imgData.data;

      // Color palette based on frequency - blend Slime emerald green with cyan rhythms
      const bassR = Math.floor(bSig * 255);
      const midG = Math.floor(120 + mSig * 135);
      const highB = Math.floor(200 + hSig * 55);

      for (let i = 0; i < trailGrid.length; i++) {
        const strength = trailGrid[i];
        if (strength > 4) {
          const pixIdx = i * 4;
          const factor = strength / 255.0;
          
          // High-tech responsive color blend
          data[pixIdx] = Math.floor(factor * (20 + bassR));     // Red
          data[pixIdx + 1] = Math.floor(factor * (160 + midG)); // Green
          data[pixIdx + 2] = Math.floor(factor * (100 + highB)); // Blue
          data[pixIdx + 3] = Math.min(255, Math.floor(strength * 2.2)); // Alpha
        }
      }

      ctx.putImageData(imgData, 0, 0);

      animationFrameId.current = requestAnimationFrame(simTick);
    };

    animationFrameId.current = requestAnimationFrame(simTick);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [settings, isPlaying, bassVal, midVal, highVal]);

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 glow-green relative overflow-hidden backdrop-blur-xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl -z-10 ambient-pulse"></div>
      
      {/* Simulation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/60">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-150 flex items-center gap-2">
            <Layers className="text-brand-primary w-5 h-5 animate-pulse" />
            <span className="rtl font-sans tracking-tight">شبیه‌ساز زنده کلونی ذرات موسیقی (Sandbox)</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 rtl font-sans">
            تغییر رفتارهای بیولوژیک قارچ اسلایم (کپک مخاطی) همگام با نوسانات صوتی
          </p>
        </div>

        {/* Dynamic Presets */}
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => applyPreset("default")}
            className={`px-3 py-1.5 rounded-lg border font-mono transition-all ${
              activePreset === "default"
                ? "bg-brand-primary/25 border-brand-primary text-brand-primary font-semibold"
                : "border-slate-800 bg-slate-950/45 text-gray-400 hover:text-gray-200"
            }`}
          >
            Organic Tree
          </button>
          <button
            onClick={() => applyPreset("brutalist")}
            className={`px-3 py-1.5 rounded-lg border font-mono transition-all ${
              activePreset === "brutalist"
                ? "bg-brand-secondary/25 border-brand-secondary text-brand-secondary font-semibold"
                : "border-slate-800 bg-slate-950/45 text-gray-400 hover:text-gray-200"
            }`}
          >
            Brutalist Core
          </button>
          <button
            onClick={() => applyPreset("filaments")}
            className={`px-3 py-1.5 rounded-lg border font-mono transition-all ${
              activePreset === "filaments"
                ? "bg-emerald-500/25 border-emerald-500 text-emerald-400 font-semibold"
                : "border-slate-800 bg-slate-950/45 text-gray-400 hover:text-gray-200"
            }`}
          >
            High evp (Filaments)
          </button>
          <button
            onClick={() => applyPreset("chaotic")}
            className={`px-3 py-1.5 rounded-lg border font-mono transition-all ${
              activePreset === "chaotic"
                ? "bg-amber-500/25 border-amber-500 text-amber-400 font-semibold"
                : "border-slate-800 bg-slate-950/45 text-gray-400 hover:text-gray-200"
            }`}
          >
            Chaos Network
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Canvas & Live Waveform Panel */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-1 group">
            <canvas
              ref={canvasRef}
              width={SIM_WIDTH}
              height={SIM_HEIGHT}
              className="w-full aspect-[220/160] max-h-[460px] object-cover rounded-lg"
              style={{ imageRendering: "pixelated" }}
            />
            
            {/* Live Parameter Overlay Details */}
            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md rounded-lg py-2 px-3 border border-slate-800 text-[10px] font-mono flex flex-col gap-1 select-none pointer-events-none text-gray-300">
              <div className="flex justify-between gap-5">
                <span className="text-gray-400">Step Size:</span>
                <span className="text-brand-primary">{(settings.stepSize + bassVal * settings.sensitivity * 2).toFixed(2)} px</span>
              </div>
              <div className="flex justify-between gap-5">
                <span className="text-gray-400">Sensor Sight:</span>
                <span className="text-brand-secondary">{(settings.sensorAngle + highVal * 45).toFixed(1)}°</span>
              </div>
              <div className="flex justify-between gap-5">
                <span className="text-gray-400">Pheromones:</span>
                <span className="text-emerald-400">{(settings.pheromoneDeposit + midVal * 25).toFixed(1)}</span>
              </div>
            </div>

            {/* Glowing mold indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-900/95 border border-slate-800 py-1.5 px-3 rounded-full text-[10px]">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-brand-primary animate-ping" : "bg-red-500"}`}></span>
              <span className="font-mono text-gray-300">
                {audioSourceType === "none" && "OFF AIR"}
                {audioSourceType === "synthesizer" && `SYNTH SEQUENCER [${synthPreset.toUpperCase()}]`}
                {audioSourceType === "mic" && "LIVE MICROPHONE"}
                {audioSourceType === "file" && "CUSTOM MUSIC TRACK"}
              </span>
            </div>
          </div>

          {/* Audio Equalizer Real-time Visualization Bars */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3 font-mono">
            <div className="flex text-xs items-center justify-between text-gray-400 pb-1 border-b border-slate-900">
              <span>FREQUENCY METRIC (FFT)</span>
              <span className="text-[10px] text-brand-primary">MULTIPLIER: {settings.sensitivity}x</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs">
              {/* Bass Band */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-red-400 flex items-center gap-1 font-sans text-[11px]"><Zap className="w-3.5 h-3.5" /> بم (BASS)</span>
                  <span className="text-[10px] text-gray-500">{(bassVal * 100).toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-75"
                    style={{ width: `${Math.min(100, bassVal * 100)}%` }}
                  />
                </div>
              </div>

              {/* Mid Band */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400 flex items-center gap-1 font-sans text-[11px]"><Layers className="w-3.5 h-3.5" /> میانه (MID)</span>
                  <span className="text-[10px] text-gray-500">{(midVal * 100).toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-75"
                    style={{ width: `${Math.min(100, midVal * 100)}%` }}
                  />
                </div>
              </div>

              {/* High Band */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400 flex items-center gap-1 font-sans text-[11px]"><Compass className="w-3.5 h-3.5" /> زیر (HIGH)</span>
                  <span className="text-[10px] text-gray-500">{(highVal * 100).toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-75"
                    style={{ width: `${Math.min(100, highVal * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Controller Sidebar Controls */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Sound Controls Panel */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <h3 className="text-sm font-display font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/50 pb-2">
              <Disc className="w-4 h-4 text-brand-secondary" />
              <span className="rtl font-sans">۱. انتخاب سیگنال موسیقی</span>
            </h3>

            {/* Main Synth Play/Pause */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleTogglePlay}
                className={`py-3 px-4 rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
                  isPlaying && audioSourceType === "synthesizer"
                    ? "bg-red-500/25 text-red-400 border border-red-500/50"
                    : "bg-brand-primary text-slate-950 border border-transparent hover:bg-emerald-400 glow-green"
                }`}
              >
                {isPlaying && audioSourceType === "synthesizer" ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span className="rtl font-sans">توقف تپش ساز سنتز</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span className="rtl font-sans">پخش موسیقی ریتمیک (سنتز)</span>
                  </>
                )}
              </button>
            </div>

            {/* Synthesizer Tweaks */}
            <div className="bg-slate-900/40 border border-slate-800/50 p-3 rounded-xl flex flex-col gap-3">
              <div className="text-[11px] font-sans text-gray-400 rtl">پیش‌فرض تن صدا:</div>
              <div className="grid grid-cols-1 gap-1.5 text-xs font-mono">
                <button
                  onClick={() => {
                    setSynthPreset("kick-bass");
                    if (isPlaying && audioSourceType === "synthesizer") startSynthesizer();
                  }}
                  className={`py-1.5 px-2 rounded text-right transition-all flex justify-between items-center ${
                    synthPreset === "kick-bass" ? "bg-slate-800 text-brand-primary font-semibold" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <span className="text-[10px] text-gray-500">[Bassy Beats]</span>
                  <span className="rtl font-sans text-[11px]">ضربات سنگین تکنو</span>
                </button>
                <button
                  onClick={() => {
                    setSynthPreset("ambient-plucks");
                    if (isPlaying && audioSourceType === "synthesizer") startSynthesizer();
                  }}
                  className={`py-1.5 px-2 rounded text-right transition-all flex justify-between items-center ${
                    synthPreset === "ambient-plucks" ? "bg-slate-800 text-emerald-400 font-semibold" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <span className="text-[10px] text-gray-500">[Ambient Chords]</span>
                  <span className="rtl font-sans text-[11px]">ملودی رویایی تار</span>
                </button>
                <button
                  onClick={() => {
                    setSynthPreset("harmonic-glide");
                    if (isPlaying && audioSourceType === "synthesizer") startSynthesizer();
                  }}
                  className={`py-1.5 px-2 rounded text-right transition-all flex justify-between items-center ${
                    synthPreset === "harmonic-glide" ? "bg-slate-800 text-cyan-400 font-semibold" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <span className="text-[10px] text-gray-500">[Oscillating Glides]</span>
                  <span className="rtl font-sans text-[11px]">هارمونی نوسانی بم</span>
                </button>
              </div>

              {/* Tempo slider */}
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex justify-between text-[11px] font-mono text-gray-400">
                  <span className="text-cyan-400">{tempo} BPM</span>
                  <span className="rtl font-sans">سرعت ضرب (Tempo)</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="180"
                  value={tempo}
                  onChange={(e) => {
                    setTempo(Number(e.target.value));
                    if (isPlaying && audioSourceType === "synthesizer") {
                      // Restart synth to apply new interval
                      setTimeout(() => startSynthesizer(), 50);
                    }
                  }}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-secondary"
                />
              </div>
            </div>

            {/* External Audio Inputs */}
            <div className="grid grid-cols-2 gap-2">
              {/* Mic mode */}
              <button
                onClick={audioSourceType === "mic" ? stopAudio : startMicrophone}
                className={`py-2 px-3 rounded-lg border text-xs flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  audioSourceType === "mic"
                    ? "bg-cyan-500/25 border-cyan-500 text-cyan-400 font-semibold"
                    : "border-slate-800 hover:border-slate-700 bg-slate-900/60 text-gray-400"
                }`}
              >
                <Mic className="w-4 h-4" />
                <span className="rtl font-sans text-[10px]">میکروفون سیستم</span>
              </button>

              {/* File Upload Mode */}
              <label
                className={`py-2 px-3 rounded-lg border text-xs flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  audioSourceType === "file"
                    ? "bg-brand-primary/25 border-brand-primary text-brand-primary font-semibold"
                    : "border-slate-800 hover:border-slate-700 bg-slate-900/60 text-gray-400"
                }`}
              >
                <Upload className="w-4 h-4" />
                <span className="rtl font-sans text-[10px] text-center overflow-hidden whitespace-nowrap text-ellipsis max-w-full">
                  {uploadedFileName ? uploadedFileName : "آپلود آهنگ"}
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Mapping Controls Panel */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <h3 className="text-sm font-display font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/50 pb-2">
              <Sliders className="w-4 h-4 text-brand-primary" />
              <span className="rtl font-sans">۲. اتصالات و حسگرها</span>
            </h3>

            {/* Mapping Config details */}
            <div className="flex flex-col gap-3.5 text-xs font-mono">
              {/* Bass selector */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[11px] text-gray-400">
                  <span className="rtl font-sans">محرک صوتی بم (BASS)</span>
                  <span className="text-red-400">مورف فیزیکی:</span>
                </div>
                <select
                  value={settings.bassMapping}
                  onChange={(e) => setSettings(prev => ({ ...prev, bassMapping: e.target.value }))}
                  className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-gray-300 font-sans text-xs focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="step_size">حرکت طولی شتاب (Step Size)</option>
                  <option value="deposit">شدت رسوب چسبنده (Trail Deposit)</option>
                  <option value="rotation">زاویه پیچش لحظه‌ای (Rotation Angle)</option>
                  <option value="none">بدون تاثیر فیزیکی</option>
                </select>
              </div>

              {/* Mid selector */}
              <div className="flex flex-col gap-1.5 font-mono">
                <div className="flex justify-between items-center text-[11px] text-gray-400">
                  <span className="rtl font-sans">محرک صوتی میانه (MIDS)</span>
                  <span className="text-emerald-400">مورف فیزیکی:</span>
                </div>
                <select
                  value={settings.midMapping}
                  onChange={(e) => setSettings(prev => ({ ...prev, midMapping: e.target.value }))}
                  className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-gray-300 font-sans text-xs focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="deposit">شدت رسوب چسبنده (Trail Deposit)</option>
                  <option value="sensor_offset">عمق دید جلویی (Sensor Distance)</option>
                  <option value="step_size">حرکت طولی شتاب (Step Size)</option>
                  <option value="none">بدون تاثیر فیزیکی</option>
                </select>
              </div>

              {/* High selector */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[11px] text-gray-400">
                  <span className="rtl font-sans">محرک زیر موسیقی (HIGHS)</span>
                  <span className="text-cyan-400">مورف فیزیکی:</span>
                </div>
                <select
                  value={settings.highMapping}
                  onChange={(e) => setSettings(prev => ({ ...prev, highMapping: e.target.value }))}
                  className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-gray-300 font-sans text-xs focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="sensor_angle">زاویه اسکن دید یا چشمی (Sensor Angle)</option>
                  <option value="rotation">زاویه پیچش لحظه‌ای (Rotation Angle)</option>
                  <option value="sensor_offset">عمق دید جلویی (Sensor Distance)</option>
                  <option value="none">بدون تاثیر فیزیکی</option>
                </select>
              </div>

              {/* Sensitivity Range Control */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-900">
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span className="text-brand-primary font-bold">{settings.sensitivity}x</span>
                  <span className="rtl font-sans">حساسیت واکنش ذرات</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={settings.sensitivity}
                  onChange={(e) => setSettings(prev => ({ ...prev, sensitivity: Number(e.target.value) }))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
