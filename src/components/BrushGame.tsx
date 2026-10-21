import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../services/sound';
import { recordSessionComplete, getActiveSkinId, getSkins } from '../services/storage';
import { QuadrantId, QuadrantInfo, Germ, FoamParticle, SparkleItem, SessionType } from '../types';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Award, Clock, Star, Flame, Check } from 'lucide-react';

interface BrushGameProps {
  onSessionDone?: (result: { starsEarned: number; germsCleared: number; duration: number }) => void;
  preferredSessionType?: SessionType;
}

const QUADRANTS: QuadrantInfo[] = [
  {
    id: 1,
    name: 'Kuadran 1: Kanan Atas',
    subtitle: 'Sikat permukaan luar, dalam & kunyah kanan atas',
    hint: 'Putar sikat gigi perlahan membentuk lingkaran kecil 45°!',
    durationSeconds: 30,
  },
  {
    id: 2,
    name: 'Kuadran 2: Kiri Atas & Depan',
    subtitle: 'Sikat bagian depan dan kiri atas hingga bersih',
    hint: 'Ayunkan bulu sikat dari arah gusi ke ujung gigi!',
    durationSeconds: 30,
  },
  {
    id: 3,
    name: 'Kuadran 3: Kiri Bawah',
    subtitle: 'Sikat gigi geraham kunyah kiri bawah',
    hint: 'Maju mundur perlahan di atas permukaan kunyah!',
    durationSeconds: 30,
  },
  {
    id: 4,
    name: 'Kuadran 4: Kanan Bawah & Depan Bawah',
    subtitle: 'Sikat bagian bawah depan dan kanan bawah',
    hint: 'Bersihkan bagian dalam gigi bawah dengan ujung sikat!',
    durationSeconds: 20,
  },
  {
    id: 5,
    name: 'Bonus: Bersihkan Lidah!',
    subtitle: 'Sikat lidah dengan lembut untuk nafas segar',
    hint: 'Tarik sikat perlahan dari pangkal lidah ke depan!',
    durationSeconds: 10,
  },
];

// Germ types metadata
const GERM_TYPES = [
  { type: 'sugar' as const, name: 'Kuman Permen Gula', color: '#ec4899', icon: '🍬', maxHealth: 30 },
  { type: 'plaque' as const, name: 'Monster Plak Gigi', color: '#eab308', icon: '🧀', maxHealth: 35 },
  { type: 'acid' as const, name: 'Kuman Asam Perusak', color: '#10b981', icon: '🍋', maxHealth: 25 },
  { type: 'odor' as const, name: 'Bakteri Bau Mulut', color: '#8b5cf6', icon: '💨', maxHealth: 30 },
];

export const BrushGame: React.FC<BrushGameProps> = ({ onSessionDone, preferredSessionType = 'morning' }) => {
  // Game states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [sessionType, setSessionType] = useState<SessionType>(preferredSessionType);
  const [gameMode, setGameMode] = useState<'full' | 'practice'>('full'); // full = 120s, practice = 30s
  
  const totalDuration = gameMode === 'full' ? 120 : 30;
  const [timeLeft, setTimeLeft] = useState<number>(totalDuration);
  const [currentQuadrant, setCurrentQuadrant] = useState<QuadrantId>(1);
  const [germs, setGerms] = useState<Germ[]>([]);
  const [germsDefeated, setGermsDefeated] = useState<number>(0);
  const [cleanliness, setCleanliness] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());

  // Brush positioning & effects
  const [brushPos, setBrushPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [foamParticles, setFoamParticles] = useState<FoamParticle[]>([]);
  const [sparkles, setSparkles] = useState<SparkleItem[]>([]);

  // Skin config
  const skins = getSkins();
  const activeSkinId = getActiveSkinId();
  const activeSkin = skins.find((s) => s.id === activeSkinId) || skins[0];

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 50, y: 50 });

  // Determine active quadrant based on time elapsed
  const getQuadrantForTime = useCallback((secondsLeft: number, total: number): QuadrantId => {
    const elapsed = total - secondsLeft;
    const ratio = elapsed / total;
    if (ratio < 0.25) return 1;
    if (ratio < 0.50) return 2;
    if (ratio < 0.75) return 3;
    if (ratio < 0.90) return 4;
    return 5; // Tongue
  }, []);

  // Spawn germs inside quadrant zone
  const spawnGermsForQuadrant = useCallback((quadId: QuadrantId, count: number = 5): Germ[] => {
    const newGerms: Germ[] = [];
    for (let i = 0; i < count; i++) {
      const gType = GERM_TYPES[Math.floor(Math.random() * GERM_TYPES.length)];
      let minX = 15;
      let maxX = 85;
      let minY = 20;
      let maxY = 80;

      // Coordinate zone mapping for mouth quadrants
      if (quadId === 1) {
        // Upper Right (patient's right = screen right upper)
        minX = 55; maxX = 88; minY = 18; maxY = 45;
      } else if (quadId === 2) {
        // Upper Left & Front (screen left & center upper)
        minX = 12; maxX = 55; minY = 18; maxY = 45;
      } else if (quadId === 3) {
        // Lower Left (screen left lower)
        minX = 12; maxX = 48; minY = 55; maxY = 82;
      } else if (quadId === 4) {
        // Lower Right & Front Lower (screen right lower)
        minX = 48; maxX = 88; minY = 55; maxY = 82;
      } else if (quadId === 5) {
        // Tongue (Center)
        minX = 35; maxX = 65; minY = 42; maxY = 68;
      }

      const x = minX + Math.random() * (maxX - minX);
      const y = minY + Math.random() * (maxY - minY);

      newGerms.push({
        id: `germ_${quadId}_${Date.now()}_${i}_${Math.random()}`,
        x,
        y,
        quadrant: quadId,
        type: gType.type,
        name: gType.name,
        health: gType.maxHealth,
        maxHealth: gType.maxHealth,
        size: 34 + Math.random() * 12,
        color: gType.color,
        isDefeated: false,
        wobble: Math.random() * 360,
      });
    }
    return newGerms;
  }, []);

  // Start game
  const startGame = () => {
    setIsPlaying(true);
    setIsPaused(false);
    setIsCompleted(false);
    const dur = gameMode === 'full' ? 120 : 30;
    setTimeLeft(dur);
    setCurrentQuadrant(1);
    setGermsDefeated(0);
    setCleanliness(5);
    setGerms(spawnGermsForQuadrant(1, 6));
    setFoamParticles([]);
    setSparkles([]);
    sounds.playButton();
  };

  // Reset game
  const resetGame = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setIsCompleted(false);
    setTimeLeft(gameMode === 'full' ? 120 : 30);
    setGerms([]);
    setFoamParticles([]);
    setSparkles([]);
  };

  // Main game timer loop
  useEffect(() => {
    if (!isPlaying || isPaused || isCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameComplete();
          return 0;
        }

        const nextTime = prev - 1;
        const newQuad = getQuadrantForTime(nextTime, totalDuration);

        // Quadrant changed notification
        if (newQuad !== currentQuadrant) {
          setCurrentQuadrant(newQuad);
          sounds.playDing();
          // Add new germs for current quadrant
          setGerms((current) => {
            const alive = current.filter((g) => !g.isDefeated);
            return [...alive, ...spawnGermsForQuadrant(newQuad, 4)];
          });
        }

        // Calculate progress %
        const progressPct = Math.min(100, Math.round(((totalDuration - nextTime) / totalDuration) * 100));
        setCleanliness(progressPct);

        // Periodic sparkle
        if (nextTime % 5 === 0) {
          sounds.playSparkle();
          addRandomSparkles();
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isPaused, isCompleted, currentQuadrant, totalDuration, getQuadrantForTime, spawnGermsForQuadrant]);

  const addRandomSparkles = () => {
    const newSparkles: SparkleItem[] = [];
    for (let i = 0; i < 3; i++) {
      newSparkles.push({
        id: Date.now() + i,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
        size: 16 + Math.random() * 14,
      });
    }
    setSparkles((prev) => [...prev.slice(-6), ...newSparkles]);
  };

  // On Game Completion
  const handleGameComplete = () => {
    setIsCompleted(true);
    setIsPlaying(false);
    setCleanliness(100);
    sounds.playCelebration();

    // Trigger fireworks confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#34d399', '#facc15', '#f43f5e', '#a855f7'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 350);
    } catch {
      // ignore
    }

    // Save session in localStorage
    const finalDuration = totalDuration;
    const finalGerms = Math.max(germsDefeated, 12);
    const result = recordSessionComplete(sessionType, finalDuration, finalGerms);

    if (onSessionDone) {
      onSessionDone({
        starsEarned: result.starsAwarded,
        germsCleared: finalGerms,
        duration: finalDuration,
      });
    }
  };

  // Handle pointer / touch movement for toothbrush interaction
  const handlePointerAction = (clientX: number, clientY: number) => {
    if (!gameAreaRef.current || !isPlaying || isPaused) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

    setBrushPos({ x: xPct, y: yPct });

    // Distance moved
    const dx = xPct - lastPosRef.current.x;
    const dy = yPct - lastPosRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 1.2) {
      // Play foam sound
      sounds.playBrush();
      lastPosRef.current = { x: xPct, y: yPct };

      // Spawn toothpaste foam bubbles
      const newFoam: FoamParticle = {
        id: Date.now() + Math.random(),
        x: xPct + (Math.random() * 6 - 3),
        y: yPct + (Math.random() * 6 - 3),
        size: 10 + Math.random() * 16,
        opacity: 0.9,
        color: activeSkin.pasteColor || '#ffffff',
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.5,
      };

      setFoamParticles((prev) => [...prev.slice(-25), newFoam]);

      // Check collision with germs
      checkGermCollision(xPct, yPct);
    }
  };

  const checkGermCollision = (brushX: number, brushY: number) => {
    setGerms((prevGerms) => {
      let defeatedCountInThisFrame = 0;
      let hasHit = false;

      const updated = prevGerms.map((germ) => {
        if (germ.isDefeated) return germ;

        const dist = Math.hypot(germ.x - brushX, germ.y - brushY);
        // Collision threshold in %
        if (dist < 10) {
          hasHit = true;
          const newHp = germ.health - 6;

          if (newHp <= 0) {
            defeatedCountInThisFrame++;
            sounds.playGermPop();
            return { ...germ, health: 0, isDefeated: true };
          }
          return { ...germ, health: newHp, wobble: (germ.wobble + 25) % 360 };
        }
        return germ;
      });

      if (defeatedCountInThisFrame > 0) {
        setGermsDefeated((prev) => prev + defeatedCountInThisFrame);
      }

      // If active germs in current quadrant are low, spawn new reinforcements!
      const activeInQuad = updated.filter((g) => g.quadrant === currentQuadrant && !g.isDefeated);
      if (activeInQuad.length < 2 && isPlaying) {
        const reinforcements = spawnGermsForQuadrant(currentQuadrant, 3);
        return [...updated, ...reinforcements];
      }

      return updated;
    });
  };

  // Foam decay animation
  useEffect(() => {
    if (foamParticles.length === 0) return;
    const interval = setInterval(() => {
      setFoamParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + p.vy * 0.2,
            x: p.x + p.vx * 0.2,
            opacity: p.opacity - 0.05,
            size: p.size * 0.98,
          }))
          .filter((p) => p.opacity > 0.05)
      );
    }, 60);
    return () => clearInterval(interval);
  }, [foamParticles.length]);

  const activeQuadrantInfo = QUADRANTS.find((q) => q.id === currentQuadrant) || QUADRANTS[0];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Top Banner / Session Mode & Sound Toggle */}
      <div className="w-full bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-sky-100 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-teal-400 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-black text-slate-800 tracking-tight flex items-center gap-1.5">
              <span>Game Sikat Gigi 2 Menit</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-bold">
                {gameMode === 'full' ? '120 Detik' : '30 Detik Latihan'}
              </span>
            </h2>
            <p className="text-xs text-slate-500">Durasi ideal rekomendasi dokter gigi untuk senyum cemerlang!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Session Switcher (Pagi / Malam) */}
          <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => !isPlaying && setSessionType('morning')}
              disabled={isPlaying}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                sessionType === 'morning'
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>☀️</span>
              <span>Pagi</span>
            </button>
            <button
              onClick={() => !isPlaying && setSessionType('night')}
              disabled={isPlaying}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                sessionType === 'night'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>🌙</span>
              <span>Malam</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const muted = sounds.toggleMute();
              setIsMuted(muted);
            }}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer"
            title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>
        </div>
      </div>

      {/* Main Game Shell */}
      <div className="w-full bg-gradient-to-b from-sky-100 via-white to-sky-50 rounded-3xl p-4 md:p-6 shadow-xl border-4 border-sky-200 relative overflow-hidden">
        
        {/* Progress & Live HUD Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {/* Timer Display */}
          <div className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-sky-200 shadow-xs flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${timeLeft <= 10 && isPlaying ? 'bg-rose-500 animate-ping' : 'bg-sky-500'}`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hitung Mundur</p>
              <p className="text-xl font-black text-slate-800 font-mono tabular-nums">{formatTime(timeLeft)}</p>
            </div>
          </div>

          {/* Germs Cleared HUD */}
          <div className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-sky-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center font-black text-white">
              <span className="text-lg">🦠</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kuman Dibasmi</p>
              <p className="text-xl font-black text-rose-600 font-mono tabular-nums">{germsDefeated}</p>
            </div>
          </div>

          {/* Cleanness Percentage */}
          <div className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-sky-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kebersihan Gigi</p>
              <p className="text-xl font-black text-emerald-600 font-mono tabular-nums">{cleanliness}%</p>
            </div>
          </div>

          {/* Active Skin Indicator */}
          <div className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-sky-200 shadow-xs flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs font-black text-xs"
              style={{ backgroundColor: activeSkin.handleColor }}
            >
              🪥
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sikat Aktif</p>
              <p className="text-xs font-black text-slate-800 truncate">{activeSkin.name}</p>
            </div>
          </div>
        </div>

        {/* Quadrant Guide Banner */}
        {isPlaying && (
          <div className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-4 py-2.5 rounded-2xl shadow-md mb-3 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-spin">🎯</span>
              <div>
                <p className="text-xs font-black tracking-wide uppercase">{activeQuadrantInfo.name}</p>
                <p className="text-xs text-amber-100">{activeQuadrantInfo.hint}</p>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-bold">
              Kuadran {currentQuadrant} dari 5
            </span>
          </div>
        )}

        {/* Interactive Mouth & Teeth Arena */}
        <div
          ref={gameAreaRef}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={(e) => isDragging && handlePointerAction(e.clientX, e.clientY)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={(e) => {
            if (e.touches[0]) {
              handlePointerAction(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onClick={(e) => handlePointerAction(e.clientX, e.clientY)}
          className={`w-full aspect-[4/3] max-h-[460px] bg-gradient-to-b from-rose-100 via-pink-50 to-rose-200 rounded-3xl border-4 border-rose-300 relative select-none cursor-crosshair overflow-hidden shadow-inner ${
            !isPlaying ? 'opacity-90' : ''
          }`}
        >
          {/* Mouth Cavity Dark Arch */}
          <div className="absolute inset-x-8 inset-y-6 bg-gradient-to-b from-rose-950 via-rose-900 to-rose-950 rounded-[48px] border-8 border-pink-400 shadow-2xl flex items-center justify-center overflow-hidden">
            
            {/* Soft Mouth Backing & Uvula */}
            <div className="absolute top-0 w-12 h-16 bg-rose-800 rounded-b-full border-2 border-rose-600/50 shadow-inner" />
            
            {/* Tongue (Kuadran 5) */}
            <div
              className={`absolute bottom-6 w-48 h-32 bg-gradient-to-t from-rose-400 to-pink-400 rounded-t-[50px] border-4 border-rose-500 shadow-md transition-all duration-300 ${
                currentQuadrant === 5 ? 'ring-4 ring-yellow-400 ring-offset-2 scale-105' : 'opacity-85'
              }`}
            >
              {/* Tongue Taste Buds texture */}
              <div className="w-1 h-16 bg-rose-500/40 mx-auto rounded-full mt-3" />
              <div className="flex justify-center gap-3 mt-1">
                <span className="w-1.5 h-1.5 bg-rose-300 rounded-full" />
                <span className="w-1.5 h-1.5 bg-rose-300 rounded-full" />
                <span className="w-1.5 h-1.5 bg-rose-300 rounded-full" />
              </div>
            </div>

            {/* UPPER TEETH ARCH */}
            <div className="absolute top-2 inset-x-4 flex justify-between items-start px-2">
              {/* Upper Left Quadrant Group (Patient Right = Quadrant 1) */}
              <div
                className={`flex gap-1.5 p-1 rounded-2xl transition-all duration-300 ${
                  currentQuadrant === 1 ? 'bg-amber-400/30 ring-4 ring-amber-400 ring-offset-2' : ''
                }`}
              >
                {[1, 2, 3, 4].map((tooth) => (
                  <div
                    key={`upper-q1-${tooth}`}
                    className={`w-7 sm:w-10 h-10 sm:h-14 bg-gradient-to-b from-slate-100 to-white rounded-b-2xl border-2 border-slate-300 shadow-md relative overflow-hidden transition-all ${
                      cleanliness > 60 ? 'shadow-white/80' : ''
                    }`}
                  >
                    {/* Tooth Gloss Reflection */}
                    <div className="absolute top-1 left-1 w-2 h-6 bg-white/70 rounded-full rotate-6" />
                    {/* Gum Edge */}
                    <div className="absolute top-0 inset-x-0 h-2 bg-rose-400 rounded-b-md" />
                  </div>
                ))}
              </div>

              {/* Upper Center / Right Quadrant Group (Patient Left = Quadrant 2) */}
              <div
                className={`flex gap-1.5 p-1 rounded-2xl transition-all duration-300 ${
                  currentQuadrant === 2 ? 'bg-amber-400/30 ring-4 ring-amber-400 ring-offset-2' : ''
                }`}
              >
                {[5, 6, 7, 8].map((tooth) => (
                  <div
                    key={`upper-q2-${tooth}`}
                    className={`w-7 sm:w-10 h-10 sm:h-14 bg-gradient-to-b from-slate-100 to-white rounded-b-2xl border-2 border-slate-300 shadow-md relative overflow-hidden transition-all ${
                      cleanliness > 60 ? 'shadow-white/80' : ''
                    }`}
                  >
                    <div className="absolute top-1 left-1 w-2 h-6 bg-white/70 rounded-full rotate-6" />
                    <div className="absolute top-0 inset-x-0 h-2 bg-rose-400 rounded-b-md" />
                  </div>
                ))}
              </div>
            </div>

            {/* LOWER TEETH ARCH */}
            <div className="absolute bottom-2 inset-x-4 flex justify-between items-end px-2">
              {/* Lower Left Quadrant Group (Patient Right = Quadrant 4) */}
              <div
                className={`flex gap-1.5 p-1 rounded-2xl transition-all duration-300 ${
                  currentQuadrant === 4 ? 'bg-amber-400/30 ring-4 ring-amber-400 ring-offset-2' : ''
                }`}
              >
                {[1, 2, 3, 4].map((tooth) => (
                  <div
                    key={`lower-q4-${tooth}`}
                    className={`w-7 sm:w-10 h-10 sm:h-14 bg-gradient-to-t from-slate-100 to-white rounded-t-2xl border-2 border-slate-300 shadow-md relative overflow-hidden transition-all ${
                      cleanliness > 60 ? 'shadow-white/80' : ''
                    }`}
                  >
                    <div className="absolute bottom-1 left-1 w-2 h-6 bg-white/70 rounded-full rotate-6" />
                    <div className="absolute bottom-0 inset-x-0 h-2 bg-rose-400 rounded-t-md" />
                  </div>
                ))}
              </div>

              {/* Lower Right Quadrant Group (Patient Left = Quadrant 3) */}
              <div
                className={`flex gap-1.5 p-1 rounded-2xl transition-all duration-300 ${
                  currentQuadrant === 3 ? 'bg-amber-400/30 ring-4 ring-amber-400 ring-offset-2' : ''
                }`}
              >
                {[5, 6, 7, 8].map((tooth) => (
                  <div
                    key={`lower-q3-${tooth}`}
                    className={`w-7 sm:w-10 h-10 sm:h-14 bg-gradient-to-t from-slate-100 to-white rounded-t-2xl border-2 border-slate-300 shadow-md relative overflow-hidden transition-all ${
                      cleanliness > 60 ? 'shadow-white/80' : ''
                    }`}
                  >
                    <div className="absolute bottom-1 left-1 w-2 h-6 bg-white/70 rounded-full rotate-6" />
                    <div className="absolute bottom-0 inset-x-0 h-2 bg-rose-400 rounded-t-md" />
                  </div>
                ))}
              </div>
            </div>

            {/* GERMS / BAKTERI CHARACTERS */}
            {germs.map((germ) => {
              if (germ.isDefeated) return null;
              const hpPct = Math.max(0, (germ.health / germ.maxHealth) * 100);

              return (
                <div
                  key={germ.id}
                  style={{
                    left: `${germ.x}%`,
                    top: `${germ.y}%`,
                    transform: `translate(-50%, -50%) rotate(${germ.wobble}deg)`,
                    width: `${germ.size}px`,
                    height: `${germ.size}px`,
                  }}
                  className="absolute pointer-events-none transition-transform duration-100 z-20 flex flex-col items-center justify-center"
                >
                  {/* Germ Character Icon Blob */}
                  <div
                    style={{ backgroundColor: germ.color }}
                    className="w-full h-full rounded-full shadow-lg border-2 border-white/60 flex items-center justify-center animate-bounce relative"
                  >
                    {/* Cute Eyes */}
                    <div className="flex gap-1">
                      <span className="w-2 h-2.5 bg-white rounded-full flex items-center justify-center">
                        <span className="w-1 h-1 bg-black rounded-full" />
                      </span>
                      <span className="w-2 h-2.5 bg-white rounded-full flex items-center justify-center">
                        <span className="w-1 h-1 bg-black rounded-full" />
                      </span>
                    </div>
                    {/* Tiny Horns or Antennas */}
                    <span className="absolute -top-1 left-1 w-1.5 h-1.5 bg-white/80 rounded-full" />
                    <span className="absolute -top-1 right-1 w-1.5 h-1.5 bg-white/80 rounded-full" />
                  </div>

                  {/* Germ Mini Health Bar */}
                  <div className="w-8 h-1.5 bg-black/60 rounded-full mt-1 overflow-hidden border border-white/40">
                    <div
                      style={{ width: `${hpPct}%` }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-yellow-400 transition-all duration-75"
                    />
                  </div>
                </div>
              );
            })}

            {/* Toothpaste Foam Particles */}
            {foamParticles.map((foam) => (
              <div
                key={foam.id}
                style={{
                  left: `${foam.x}%`,
                  top: `${foam.y}%`,
                  width: `${foam.size}px`,
                  height: `${foam.size}px`,
                  opacity: foam.opacity,
                  backgroundColor: foam.color,
                }}
                className="absolute pointer-events-none rounded-full border border-white/80 shadow-xs z-30 transition-all duration-75"
              />
            ))}

            {/* Sparkle Twinkles */}
            {sparkles.map((sp) => (
              <div
                key={sp.id}
                style={{
                  left: `${sp.x}%`,
                  top: `${sp.y}%`,
                  width: `${sp.size}px`,
                  height: `${sp.size}px`,
                }}
                className="absolute pointer-events-none z-40 text-yellow-300 animate-ping"
              >
                ✨
              </div>
            ))}

            {/* VIRTUAL TOOTHBRUSH (Follows BrushPos) */}
            {isPlaying && (
              <div
                style={{
                  left: `${brushPos.x}%`,
                  top: `${brushPos.y}%`,
                  transform: 'translate(-30%, -30%) rotate(-25deg)',
                }}
                className="absolute pointer-events-none z-50 flex items-center transition-transform duration-75 drop-shadow-2xl"
              >
                {/* Toothbrush Head */}
                <div
                  style={{ backgroundColor: activeSkin.neckColor }}
                  className="w-14 h-6 rounded-r-2xl border-2 border-white flex items-center pl-1 relative shadow-lg"
                >
                  {/* Bristles */}
                  <div
                    style={{ backgroundColor: activeSkin.bristleColor }}
                    className="w-8 h-3.5 rounded-sm border-b-2 border-slate-300 flex items-center justify-around px-0.5"
                  >
                    <span className="w-0.5 h-full bg-slate-300/60" />
                    <span className="w-0.5 h-full bg-slate-300/60" />
                    <span className="w-0.5 h-full bg-slate-300/60" />
                  </div>
                  {/* Toothpaste Dollop */}
                  <div
                    style={{ backgroundColor: activeSkin.pasteColor }}
                    className="absolute -top-2 left-2 w-5 h-3 rounded-full border border-white animate-pulse"
                  />
                </div>

                {/* Toothbrush Neck & Long Handle */}
                <div
                  style={{ backgroundColor: activeSkin.handleColor }}
                  className="w-24 h-4 rounded-l-full border-2 border-white shadow-md relative"
                >
                  {/* Grip Ribs */}
                  <div className="absolute inset-y-0 left-4 w-8 flex justify-around items-center">
                    <span className="w-1 h-2 bg-white/50 rounded-full" />
                    <span className="w-1 h-2 bg-white/50 rounded-full" />
                    <span className="w-1 h-2 bg-white/50 rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {/* OVERLAY: START SCREEN */}
            {!isPlaying && !isCompleted && (
              <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-50">
                <div className="w-20 h-20 bg-gradient-to-tr from-sky-400 to-emerald-400 rounded-3xl flex items-center justify-center text-4xl shadow-xl border-4 border-white mb-4 animate-bounce">
                  🦷
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Waktunya Basmi Kuman!
                </h3>
                <p className="text-sm md:text-base text-sky-100 max-w-md mt-2">
                  Gerakkan sikat gigimu ke seluruh bagian gigi untuk membersihkan kuman gula & plak selama 2 menit.
                </p>

                {/* Duration mode picker */}
                <div className="flex gap-2 mt-4 bg-white/20 p-1.5 rounded-2xl">
                  <button
                    onClick={() => setGameMode('full')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      gameMode === 'full'
                        ? 'bg-white text-slate-800 shadow-md'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    ⭐ Mode Standar (2 Menit)
                  </button>
                  <button
                    onClick={() => setGameMode('practice')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      gameMode === 'practice'
                        ? 'bg-white text-slate-800 shadow-md'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    ⚡ Latihan Cepat (30 Detik)
                  </button>
                </div>

                {/* Start Button */}
                <button
                  onClick={startGame}
                  className="mt-6 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-black text-lg shadow-xl shadow-teal-500/30 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
                >
                  <Play className="w-6 h-6 fill-current" />
                  <span>Mulai Sikat Gigi Sekarang!</span>
                </button>
              </div>
            )}

            {/* OVERLAY: PAUSE SCREEN */}
            {isPaused && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-50">
                <h3 className="text-2xl font-black text-white">Sikat Gigi Dijeda ⏸️</h3>
                <p className="text-sm text-sky-100 mt-1">Jangan biarkan kuman kabur! Lanjutkan sikat gigimu.</p>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setIsPaused(false)}
                    className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Lanjutkan Sikat</span>
                  </button>
                  <button
                    onClick={resetGame}
                    className="px-5 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Ulangi</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM CONTROLS & INSTRUCTIONS */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {isPlaying
                ? '👉 Geser sikat gigi ke atas kuman menggunakan sentuhan layar atau mouse.'
                : 'Pilih sesi pagi/malam, lalu tekan tombol mulai.'}
            </span>
          </div>

          {isPlaying && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Lanjut' : 'Jeda'}</span>
              </button>
              <button
                onClick={resetGame}
                className="px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Berhenti</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VICTORY MODAL */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border-4 border-sky-300 text-center relative overflow-hidden animate-scale-up">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-yellow-300 to-amber-400 border-4 border-white shadow-xl flex items-center justify-center text-5xl mb-4 animate-bounce">
              🌟
            </div>

            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              Hebat! Gigimu Bersih Berkilau!
            </h3>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Kamu berhasil menyelesaikan sesi sikat gigi {sessionType === 'morning' ? 'Pagi ☀️' : 'Malam 🌙'} dengan sangat baik!
            </p>

            {/* Achievement Stats Box */}
            <div className="grid grid-cols-3 gap-2 my-5 bg-sky-50 p-4 rounded-2xl border border-sky-100">
              <div className="flex flex-col items-center">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-400 mb-1" />
                <span className="text-xs text-slate-500 font-bold">Bintang</span>
                <span className="text-base font-black text-slate-800">+50</span>
              </div>
              <div className="flex flex-col items-center border-x border-sky-200">
                <span className="text-2xl mb-0.5">🦠</span>
                <span className="text-xs text-slate-500 font-bold">Kuman Mati</span>
                <span className="text-base font-black text-rose-600">{germsDefeated}</span>
              </div>
              <div className="flex flex-col items-center">
                <Flame className="w-6 h-6 text-orange-500 fill-orange-400 mb-1" />
                <span className="text-xs text-slate-500 font-bold">Streak</span>
                <span className="text-base font-black text-orange-600">+1 Hari</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 mb-5 text-left">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Sesi ini otomatis tercatat di Kalender & Streak harianmu secara offline!</span>
            </div>

            <button
              onClick={() => {
                setIsCompleted(false);
                resetGame();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-black text-base shadow-lg cursor-pointer transition active:scale-95"
            >
              Lihat Kalender & Koleksi Stiker!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
