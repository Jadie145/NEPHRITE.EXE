import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Battery, 
  Wifi, 
  ChevronLeft,
  Gamepad2,
  Calculator,
  Volume2,
  VolumeX,
  Play,
  Pause,
  XCircle,
  Trophy,
  Rocket
} from 'lucide-react';

// --- Retro Sound Engine (Web Audio API) ---
const useRetroSound = () => {
  const audioContextRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const playTone = (freq, type = 'square', duration = 0.1, vol = 0.1) => {
    if (isMuted || !audioContextRef.current) return;
    const osc = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(vol, audioContextRef.current.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    osc.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    osc.start();
    osc.stop(audioContextRef.current.currentTime + duration);
  };

  const playClick = () => { initAudio(); playTone(800, 'square', 0.05, 0.05); };
  const playNav = () => { initAudio(); playTone(300, 'square', 0.05, 0.05); };
  
  const playConfirm = () => {
    initAudio();
    if (isMuted || !audioContextRef.current) return;
    const now = audioContextRef.current.currentTime;
    const osc1 = audioContextRef.current.createOscillator();
    const gain1 = audioContextRef.current.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
    gain1.gain.setValueAtTime(0.1, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(audioContextRef.current.destination);
    osc1.start();
    osc1.stop(now + 0.3);
  };

  const playCancel = () => { initAudio(); playTone(150, 'sawtooth', 0.2, 0.08); };
  const playEat = () => { initAudio(); playTone(600, 'triangle', 0.1, 0.1); };
  const playCrash = () => { initAudio(); playTone(100, 'sawtooth', 0.4, 0.15); };
  
  // Asteroid Specific Sounds
  const playLaser = () => { 
      initAudio(); 
      if (isMuted || !audioContextRef.current) return;
      const now = audioContextRef.current.currentTime;
      const osc = audioContextRef.current.createOscillator();
      const gain = audioContextRef.current.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(audioContextRef.current.destination);
      osc.start();
      osc.stop(now + 0.2);
  };

  const playThrust = () => {
      initAudio();
      playTone(100, 'sawtooth', 0.1, 0.05);
  };
  
  const playHyperspace = () => {
      initAudio();
      playTone(1200, 'sine', 0.3, 0.1);
  };

  return { playClick, playNav, playConfirm, playCancel, playEat, playCrash, playLaser, playThrust, playHyperspace, isMuted, setIsMuted, initAudio };
};

// --- Physics Hook (Unchanged) ---
const useElasticPhysics = (anchorRef) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const velocity = useRef({ x: 0, y: 0 });
  const requestRef = useRef();
  const draggingRef = useRef(false);

  useEffect(() => {
    if (anchorRef.current && !isDragging) {
        const rect = anchorRef.current.getBoundingClientRect();
        setPosition({ 
            x: rect.left + rect.width / 2, 
            y: rect.top + rect.height / 2 + 60 
        });
    }
  }, [anchorRef]);

  const updatePhysics = useCallback(() => {
    if (!anchorRef.current) return;
    if (!draggingRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const anchorX = rect.left + rect.width / 2;
      const anchorY = rect.top + rect.height / 2;
      const tension = 0.05, friction = 0.85, gravity = 2;
      const targetX = anchorX, targetY = anchorY + 80;
      velocity.current.x += (targetX - position.x) * tension;
      velocity.current.y += (targetY - position.y) * tension + gravity;
      velocity.current.x *= friction;
      velocity.current.y *= friction;
      setPosition(prev => ({ x: prev.x + velocity.current.x, y: prev.y + velocity.current.y }));
    }
    requestRef.current = requestAnimationFrame(updatePhysics);
  }, [anchorRef, position]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(requestRef.current);
  }, [updatePhysics]);

  const startDrag = () => { setIsDragging(true); draggingRef.current = true; };
  const onDrag = (e) => {
    if (!draggingRef.current || !anchorRef.current) return;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    const rect = anchorRef.current.getBoundingClientRect();
    const anchorX = rect.left + rect.width / 2;
    const anchorY = rect.top + rect.height / 2;
    const maxDist = 250;
    const dx = clientX - anchorX;
    const dy = clientY - anchorY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < maxDist) setPosition({ x: clientX, y: clientY });
    else {
        const angle = Math.atan2(dy, dx);
        setPosition({ x: anchorX + Math.cos(angle) * maxDist, y: anchorY + Math.sin(angle) * maxDist });
    }
  };
  const stopDrag = () => { setIsDragging(false); draggingRef.current = false; };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onDrag); window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchmove', onDrag, { passive: false }); window.addEventListener('touchend', stopDrag);
    }
    return () => {
      window.removeEventListener('mousemove', onDrag); window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', onDrag); window.removeEventListener('touchend', stopDrag);
    };
  }, [isDragging]);
  return { position, startDrag, isDragging };
};

// --- App Definitions ---
const APPS = [
  { id: 'calc', label: 'Calc', icon: Calculator, color: 'bg-cyan-400' },
  { id: 'game', label: 'Snake+', icon: Gamepad2, color: 'bg-purple-400' },
  { id: 'asteroids', label: 'Astro', icon: Rocket, color: 'bg-indigo-500' },
];

// --- Calculator App ---
const CalculatorApp = ({ onClose, playSound, playNav, playConfirm }) => {
    const [display, setDisplay] = useState('0');
    const [prevValue, setPrevValue] = useState(null);
    const [operator, setOperator] = useState(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    // New state to show the full equation string for visual feedback
    const [equation, setEquation] = useState('');

    const inputDigit = useCallback((digit) => {
        playNav();
        if (waitingForOperand) {
            setDisplay(String(digit));
            setWaitingForOperand(false);
            setEquation(prev => prev + digit);
        } else {
            const newDisplay = display === '0' ? String(digit) : display + digit;
            setDisplay(newDisplay);
            if (display === '0' && equation === '') setEquation(String(digit));
            else setEquation(prev => prev + digit);
        }
    }, [display, equation, waitingForOperand, playNav]);

    const performOperation = useCallback((nextOperator) => {
        playConfirm();
        const inputValue = parseFloat(display);

        if (prevValue === null) {
            setPrevValue(inputValue);
            setEquation(String(inputValue) + nextOperator);
        } else if (operator) {
            const currentValue = prevValue || 0;
            const CalculatorOperations = { '/': (p, n) => p / n, '*': (p, n) => p * n, '+': (p, n) => p + n, '-': (p, n) => p - n, '=': (p, n) => n };
            
            if (nextOperator === '=') {
                 const newValue = CalculatorOperations[operator](currentValue, inputValue);
                 setPrevValue(null);
                 setDisplay(String(newValue));
                 setEquation(String(newValue)); 
                 setOperator(null);
                 setWaitingForOperand(true); 
                 return;
            }

            const newValue = CalculatorOperations[operator](currentValue, inputValue);
            setPrevValue(newValue);
            setDisplay(String(newValue));
            setEquation(String(newValue) + nextOperator);
        } else {
             setEquation(String(inputValue) + nextOperator);
        }

        setWaitingForOperand(true);
        setOperator(nextOperator);
    }, [display, prevValue, operator, playConfirm]);

    const clear = useCallback(() => { 
        playSound(); 
        setDisplay('0'); 
        setEquation('');
        setPrevValue(null); 
        setOperator(null); 
        setWaitingForOperand(false); 
    }, [playSound]);

    // Bind Physical Buttons to Calculator Functions
    useEffect(() => {
        const handleController = (e) => {
            const { action } = e.detail;
            if (action === 'BTN_START') clear();
            if (action === 'BTN_B') onClose();
            if (action === 'BTN_A') performOperation('=');
        };
        window.addEventListener('RETRO_CONTROLLER', handleController);
        return () => window.removeEventListener('RETRO_CONTROLLER', handleController);
    }, [clear, onClose, performOperation]);

    return (
         <div className="flex flex-col h-full bg-[#9ea792] font-mono text-[#2c3327] overflow-hidden">
            <div className="px-2 py-1 flex items-center justify-between border-b-2 border-[#2c3327]/10 shrink-0">
                <button onClick={() => { playSound(); onClose(); }} className="hover:bg-[#2c3327]/10 rounded"><ChevronLeft size={14}/></button>
                <span className="font-bold text-[10px] tracking-widest">CALC-86</span>
                <div className="w-4"></div>
            </div>
            {/* Added bottom padding to lift content above the bezel area */}
            <div className="flex-1 flex flex-col p-2 min-h-0 pb-6">
                 {/* Display Screen */}
                 <div className="bg-[#8b9680]/40 border-2 border-[#2c3327] rounded-sm mb-2 h-12 shrink-0 flex flex-col items-end justify-center px-2 font-mono shadow-inner overflow-hidden">
                    <span className="text-[10px] opacity-70 h-3 leading-none">{equation}</span>
                    <span className="text-xl sm:text-2xl font-bold leading-none tracking-widest">{display}</span>
                 </div>
                 <div className="grid grid-cols-4 gap-1 flex-1 min-h-0">
                     {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map((btn) => (
                         <button 
                            key={btn} 
                            onClick={() => { 
                                if (/\d/.test(btn) || btn === '.') inputDigit(btn); 
                                else performOperation(btn); 
                            }} 
                            className={`rounded-sm border-2 border-[#2c3327] active:translate-y-[1px] transition-all font-bold text-sm sm:text-lg flex items-center justify-center shadow-[1px_1px_0px_rgba(44,51,39,0.2)] ${['/','*','-','+','='].includes(btn) ? 'bg-[#2c3327] text-[#9ea792]' : 'hover:bg-[#2c3327]/10'}`}
                        >
                            {btn}
                        </button>
                     ))}
                     <button 
                        onClick={clear} 
                        className="col-span-4 border-2 border-[#2c3327] text-[#2c3327] font-bold text-[10px] sm:text-xs rounded-sm active:translate-y-[1px] hover:bg-[#2c3327] hover:text-[#9ea792] transition-colors uppercase tracking-widest flex items-center justify-center py-2"
                     >
                        Reset (Start)
                     </button>
                 </div>
            </div>
         </div>
    );
};

// --- Micro Snake+ Game ---
const SnakeGame = ({ onClose, playNav, playClick, playConfirm, playCancel, playEat, playCrash }) => {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('MENU');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('snake_highscore') || '0'));
    const [snake, setSnake] = useState([{x: 10, y: 10}]);
    const [food, setFood] = useState({x: 5, y: 5});
    const [direction, setDirection] = useState({x: 0, y: 0});
    const [nextDirection, setNextDirection] = useState({x: 0, y: 0});
    const [wrapWalls, setWrapWalls] = useState(false);
    const gridSize = 20, tileCountX = 16, tileCountY = 12, speed = 100;

    useEffect(() => {
        if (gameState !== 'PLAYING') return;
        const moveSnake = () => {
            setDirection(nextDirection);
            const head = { x: snake[0].x + nextDirection.x, y: snake[0].y + nextDirection.y };
            if (wrapWalls) {
                if (head.x < 0) head.x = tileCountX - 1; if (head.x >= tileCountX) head.x = 0;
                if (head.y < 0) head.y = tileCountY - 1; if (head.y >= tileCountY) head.y = 0;
            } else if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) { gameOver(); return; }
            for (let i = 0; i < snake.length; i++) if (head.x === snake[i].x && head.y === snake[i].y) { gameOver(); return; }
            const newSnake = [head, ...snake];
            if (head.x === food.x && head.y === food.y) {
                playEat();
                setScore(s => { const newScore = s + 10; if (newScore > highScore) { setHighScore(newScore); localStorage.setItem('snake_highscore', newScore.toString()); } return newScore; });
                generateFood(newSnake);
            } else newSnake.pop();
            setSnake(newSnake);
        };
        const gameInterval = setInterval(moveSnake, speed);
        return () => clearInterval(gameInterval);
    }, [gameState, snake, nextDirection, food, wrapWalls, highScore]);

    const generateFood = (currentSnake) => {
        let newFood, isSafe;
        do { 
            // Avoid top row (y=0) to prevent HUD overlap
            // Avoid bottom row (y=tileCountY-1) to prevent "gray area" overlap
            newFood = { 
                x: Math.floor(Math.random() * tileCountX), 
                y: Math.floor(Math.random() * (tileCountY - 2)) + 1 
            }; 
            isSafe = true;
            for (let part of currentSnake) if (part.x === newFood.x && part.y === newFood.y) { isSafe = false; break; }
        } while (!isSafe);
        setFood(newFood);
    };
    const gameOver = () => { playCrash(); setGameState('GAME_OVER'); };
    const resetGame = () => { setSnake([{x: 10, y: 10}]); setScore(0); setDirection({x: 1, y: 0}); setNextDirection({x: 1, y: 0}); setGameState('PLAYING'); generateFood([{x: 10, y: 10}]); playConfirm(); };

    useEffect(() => {
        const handleController = (e) => {
            const { action } = e.detail;
            if (action === 'DPAD_U' && direction.y === 0) setNextDirection({x: 0, y: -1});
            if (action === 'DPAD_D' && direction.y === 0) setNextDirection({x: 0, y: 1});
            if (action === 'DPAD_L' && direction.x === 0) setNextDirection({x: -1, y: 0});
            if (action === 'DPAD_R' && direction.x === 0) setNextDirection({x: 1, y: 0});
            if (action === 'BTN_A') { if (gameState === 'MENU' || gameState === 'GAME_OVER') resetGame(); else if (gameState === 'PAUSED') setGameState('PLAYING'); }
            if (action === 'BTN_B') { if (gameState === 'PLAYING') setGameState('PAUSED'); else if (gameState === 'PAUSED' || gameState === 'GAME_OVER' || gameState === 'MENU') onClose(); }
            if (action === 'BTN_Y') { setWrapWalls(prev => !prev); playClick(); }
            if (action === 'BTN_START') { if (gameState === 'PLAYING' || gameState === 'PAUSED') resetGame(); }
        };
        window.addEventListener('RETRO_CONTROLLER', handleController);
        return () => window.removeEventListener('RETRO_CONTROLLER', handleController);
    }, [direction, gameState]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#9ea792'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#2c3327';
        snake.forEach((part) => { ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2); });
        
        // Draw Food (Solid - removed blinking for better visibility)
        if (gameState !== 'PLAYING' || true) {
             const cx = food.x * gridSize + gridSize/2, cy = food.y * gridSize + gridSize/2, r = gridSize/3;
             ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = 'rgba(44, 51, 39, 0.1)'; ctx.lineWidth = 1;
        for(let i=0; i<=tileCountX; i++) { ctx.beginPath(); ctx.moveTo(i*gridSize,0); ctx.lineTo(i*gridSize, canvas.height); ctx.stroke(); }
        for(let i=0; i<=tileCountY; i++) { ctx.beginPath(); ctx.moveTo(0, i*gridSize); ctx.lineTo(canvas.width, i*gridSize); ctx.stroke(); }
    }, [snake, food, gameState]);

    return (
        <div className="flex flex-col h-full bg-[#9ea792] font-mono relative overflow-hidden">
            <div className="absolute top-2 left-2 right-2 flex justify-between text-[#2c3327] z-10 pointer-events-none">
                <span className="text-xs font-bold">SCORE:{score}</span>
                <span className="text-xs font-bold">HI:{highScore}</span>
            </div>
            <div className="flex-1 flex items-center justify-center p-1">
                 <canvas ref={canvasRef} width={tileCountX * gridSize} height={tileCountY * gridSize} className="border-2 border-[#2c3327]/20 w-full h-full object-contain"/>
            </div>
            {gameState === 'MENU' && <div className="absolute inset-0 bg-[#9ea792]/90 flex flex-col items-center justify-center text-[#2c3327] animate-in fade-in"><Gamepad2 size={48} className="mb-2" /><h1 className="text-2xl font-bold tracking-tighter">SNAKE+</h1><p className="text-xs mt-4 animate-pulse">PRESS A TO START</p></div>}
            {gameState === 'PAUSED' && <div className="absolute inset-0 bg-[#9ea792]/80 flex flex-col items-center justify-center text-[#2c3327]"><Pause size={32} className="mb-2" /><h2 className="text-xl font-bold">PAUSED</h2></div>}
            {gameState === 'GAME_OVER' && <div className="absolute inset-0 bg-[#9ea792]/90 flex flex-col items-center justify-center text-[#2c3327] animate-in zoom-in-95"><XCircle size={48} className="mb-2" /><h2 className="text-xl font-bold">GAME OVER</h2><p className="text-sm font-bold mt-2">SCORE: {score}</p><p className="text-xs mt-6 animate-pulse">PRESS A TO RETRY</p></div>}
        </div>
    );
};

// --- Micro Asteroids Game ---
const MicroAsteroidsGame = ({ onClose, playNav, playConfirm, playLaser, playCrash, playThrust, playHyperspace }) => {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('MENU');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('asteroids_highscore') || '0'));
    
    const gameRef = useRef({
        ship: { x: 160, y: 120, a: 0, xv: 0, yv: 0, thrust: false, shield: 0, cooldown: 0 },
        asteroids: [],
        bullets: [],
        particles: [],
        lastTime: 0
    });

    const initGame = () => {
        gameRef.current.ship = { x: 160, y: 120, a: -Math.PI/2, xv: 0, yv: 0, thrust: false, shield: 0, cooldown: 0 };
        gameRef.current.bullets = [];
        gameRef.current.particles = [];
        const asteroids = [];
        for(let i=0; i<4; i++) {
            asteroids.push({
                x: Math.random() * 320,
                y: Math.random() * 240,
                xv: (Math.random() - 0.5) * 1.5,
                yv: (Math.random() - 0.5) * 1.5,
                r: 16,
                verts: createAsteroidVerts(16)
            });
        }
        gameRef.current.asteroids = asteroids;
        setScore(0);
        setGameState('PLAYING');
    };

    const createAsteroidVerts = (r) => {
        const verts = [];
        const segs = 8;
        for(let i=0; i<segs; i++) {
            const angle = (i / segs) * Math.PI * 2;
            const dist = r * (0.6 + Math.random() * 0.4);
            verts.push({x: Math.cos(angle) * dist, y: Math.sin(angle) * dist});
        }
        return verts;
    };

    const update = (dt) => {
        const g = gameRef.current;
        const w = 320, h = 240;

        if (gameState === 'PLAYING') {
            if (g.ship.thrust) {
                g.ship.xv += Math.cos(g.ship.a) * 0.1;
                g.ship.yv += Math.sin(g.ship.a) * 0.1;
                g.particles.push({x: g.ship.x - Math.cos(g.ship.a)*8, y: g.ship.y - Math.sin(g.ship.a)*8, xv: -g.ship.xv + (Math.random()-0.5), yv: -g.ship.yv + (Math.random()-0.5), life: 10 });
            }
            g.ship.xv *= 0.99;
            g.ship.yv *= 0.99;
            g.ship.x += g.ship.xv;
            g.ship.y += g.ship.yv;
            if (g.ship.x < 0) g.ship.x += w; if (g.ship.x > w) g.ship.x -= w;
            if (g.ship.y < 0) g.ship.y += h; if (g.ship.y > h) g.ship.y -= h;
            if (g.ship.cooldown > 0) g.ship.cooldown--;
            if (g.ship.shield > 0) g.ship.shield--;
        }

        for(let i = g.bullets.length - 1; i >= 0; i--) {
            let b = g.bullets[i];
            b.x += b.xv; b.y += b.yv;
            b.life--;
            if (b.x < 0) b.x += w; if (b.x > w) b.x -= w;
            if (b.y < 0) b.y += h; if (b.y > h) b.y -= h;
            if (b.life <= 0) g.bullets.splice(i, 1);
        }

        for(let i = g.asteroids.length - 1; i >= 0; i--) {
            let a = g.asteroids[i];
            a.x += a.xv; a.y += a.yv;
            if (a.x < 0) a.x += w; if (a.x > w) a.x -= w;
            if (a.y < 0) a.y += h; if (a.y > h) a.y -= h;
            
            if (gameState === 'PLAYING' && dist(g.ship.x, g.ship.y, a.x, a.y) < a.r + 8) {
                if (g.ship.shield > 0) {
                    const ang = Math.atan2(g.ship.y - a.y, g.ship.x - a.x);
                    g.ship.xv = Math.cos(ang) * 3;
                    g.ship.yv = Math.sin(ang) * 3;
                    playCrash();
                } else {
                    explode(g.ship.x, g.ship.y, 20);
                    playCrash();
                    setGameState('GAME_OVER');
                }
            }

            for(let j = g.bullets.length - 1; j >= 0; j--) {
                if (dist(g.bullets[j].x, g.bullets[j].y, a.x, a.y) < a.r) {
                    explode(a.x, a.y, a.r);
                    playCrash();
                    g.bullets.splice(j, 1);
                    setScore(s => {
                        const ns = s + (32 - a.r) * 10;
                        if (ns > highScore) { setHighScore(ns); localStorage.setItem('asteroids_highscore', ns.toString()); }
                        return ns;
                    });
                    if (a.r > 8) {
                        for(let k=0; k<2; k++) {
                            g.asteroids.push({
                                x: a.x, y: a.y,
                                xv: (Math.random() - 0.5) * 2, yv: (Math.random() - 0.5) * 2,
                                r: a.r / 2,
                                verts: createAsteroidVerts(a.r / 2)
                            });
                        }
                    }
                    g.asteroids.splice(i, 1);
                    break;
                }
            }
        }
        
        for(let i = g.particles.length - 1; i >= 0; i--) {
            let p = g.particles[i];
            p.x += p.xv; p.y += p.yv;
            p.life--;
            if (p.life <= 0) g.particles.splice(i, 1);
        }

        if (g.asteroids.length === 0 && gameState === 'PLAYING') {
            for(let i=0; i<4; i++) {
                g.asteroids.push({
                    x: Math.random() * w,
                    y: (Math.random() > 0.5 ? 0 : h),
                    xv: (Math.random() - 0.5) * 2,
                    yv: (Math.random() - 0.5) * 2,
                    r: 16,
                    verts: createAsteroidVerts(16)
                });
            }
        }
    };

    const explode = (x, y, size) => {
        for(let i=0; i<size; i++) {
            gameRef.current.particles.push({
                x: x, y: y,
                xv: (Math.random() - 0.5) * 4,
                yv: (Math.random() - 0.5) * 4,
                life: 20 + Math.random() * 10
            });
        }
    };

    const dist = (x1, y1, x2, y2) => Math.sqrt((x2-x1)**2 + (y2-y1)**2);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let rAF;

        const loop = () => {
            update();
            ctx.fillStyle = '#9ea792'; ctx.fillRect(0, 0, 320, 240);
            ctx.strokeStyle = '#2c3327'; ctx.lineWidth = 1.5; ctx.shadowBlur = 0;
            const g = gameRef.current;

            if (gameState === 'PLAYING') {
                ctx.save();
                ctx.translate(g.ship.x, g.ship.y);
                ctx.rotate(g.ship.a);
                ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-6, 5); ctx.lineTo(-4, 0); ctx.lineTo(-6, -5); ctx.closePath(); ctx.stroke();
                if (g.ship.shield > 0) {
                    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI*2); ctx.strokeStyle = `rgba(44, 51, 39, ${g.ship.shield/30})`; ctx.stroke();
                }
                ctx.restore();
            }

            for(let a of g.asteroids) {
                ctx.save(); ctx.translate(a.x, a.y); ctx.beginPath(); ctx.moveTo(a.verts[0].x, a.verts[0].y);
                for(let v of a.verts) ctx.lineTo(v.x, v.y);
                ctx.closePath(); ctx.stroke(); ctx.restore();
            }

            ctx.fillStyle = '#2c3327';
            for(let b of g.bullets) ctx.fillRect(b.x-1, b.y-1, 2, 2);
            for(let p of g.particles) { ctx.fillStyle = `rgba(44, 51, 39, ${p.life/30})`; ctx.fillRect(p.x, p.y, 1, 1); }

            rAF = requestAnimationFrame(loop);
        };
        rAF = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rAF);
    }, [gameState]);

    useEffect(() => {
        const handleController = (e) => {
            const { action } = e.detail;
            const g = gameRef.current;
            
            if (action === 'DPAD_L') g.ship.a -= 0.3;
            if (action === 'DPAD_R') g.ship.a += 0.3;
            if (action === 'DPAD_U') { g.ship.thrust = true; playThrust(); setTimeout(() => g.ship.thrust = false, 150); }
            if (action === 'DPAD_D') { g.ship.xv *= 0.5; g.ship.yv *= 0.5; }
            
            if (action === 'BTN_A' && gameState === 'PLAYING') {
                if (g.ship.cooldown <= 0) {
                    g.bullets.push({ x: g.ship.x + Math.cos(g.ship.a)*10, y: g.ship.y + Math.sin(g.ship.a)*10, xv: Math.cos(g.ship.a)*4, yv: Math.sin(g.ship.a)*4, life: 60 });
                    g.ship.cooldown = 10;
                    playLaser();
                }
            }
            if (action === 'BTN_B' && gameState === 'PLAYING') {
                g.ship.x = Math.random() * 320; g.ship.y = Math.random() * 240; g.ship.xv = 0; g.ship.yv = 0; playHyperspace();
            }
            if (action === 'BTN_X' && gameState === 'PLAYING') {
                if (g.ship.shield <= 0) { g.ship.shield = 100; playNav(); }
            }
            if (action === 'BTN_START') {
                 if (gameState === 'MENU' || gameState === 'GAME_OVER') initGame();
                 else if (gameState === 'PLAYING') setGameState('MENU');
            }
            if (action === 'BTN_B' && gameState !== 'PLAYING') onClose();
        };
        window.addEventListener('RETRO_CONTROLLER', handleController);
        return () => window.removeEventListener('RETRO_CONTROLLER', handleController);
    }, [gameState]);

    return (
        <div className="flex flex-col h-full bg-[#9ea792] font-mono relative overflow-hidden">
            <div className="absolute top-2 left-2 right-2 flex justify-between text-[#2c3327] z-10 pointer-events-none opacity-80">
                <span className="text-xs font-bold tracking-widest">SCORE:{score}</span>
                <span className="text-xs font-bold">HI:{highScore}</span>
            </div>
            <div className="flex-1 flex items-center justify-center p-1">
                 <canvas ref={canvasRef} width={320} height={240} className="w-full h-full object-contain border-2 border-[#2c3327]/20" />
            </div>
            {gameState === 'MENU' && (
                <div className="absolute inset-0 bg-[#9ea792]/90 flex flex-col items-center justify-center text-[#2c3327] animate-in fade-in">
                    <Rocket size={48} className="mb-2 animate-bounce" />
                    <h1 className="text-2xl font-bold tracking-tighter">ASTRO-VECTOR</h1>
                    <p className="text-xs mt-4 animate-pulse">PRESS A TO START</p>
                    <div className="mt-8 text-[10px] space-y-1 text-center opacity-70">
                        <p>D-PAD: PILOT</p>
                        <p>A: FIRE | B: WARP</p>
                        <p>X: SHIELD</p>
                    </div>
                </div>
            )}
            {gameState === 'GAME_OVER' && (
                <div className="absolute inset-0 bg-[#9ea792]/90 flex flex-col items-center justify-center text-[#2c3327] animate-in zoom-in-95">
                    <h2 className="text-2xl font-bold tracking-widest">DESTROYED</h2>
                    <p className="text-sm font-bold mt-2">FINAL: {score}</p>
                    <p className="text-xs mt-6 animate-pulse">PRESS A TO RETRY</p>
                </div>
            )}
        </div>
    );
};

// --- Keychain Component ---
const Keychain = ({ anchorRef }) => {
    const { position, startDrag } = useElasticPhysics(anchorRef);

    if (position.x === 0 && position.y === 0) return null;

    let startX = 0;
    let startY = 0;
    if (anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
    }

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
             <svg className="w-full h-full drop-shadow-md">
                <line 
                    x1={startX} 
                    y1={startY} 
                    x2={position.x} 
                    y2={position.y} 
                    stroke="#555" 
                    strokeWidth="3"
                    strokeLinecap="round"
                />
             </svg>
             
             <div 
                className="absolute cursor-grab active:cursor-grabbing pointer-events-auto flex items-center justify-center group touch-none"
                style={{ 
                    left: position.x - 20, 
                    top: position.y - 20,
                    width: 40,
                    height: 40
                }}
                onMouseDown={startDrag}
                onTouchStart={startDrag}
             >
                <div className="absolute inset-0 rounded-full border-[6px] border-gray-400 bg-transparent shadow-sm"></div>
                <div className="absolute top-full mt-[-5px] bg-yellow-400 w-12 h-14 rounded-lg border-2 border-orange-500 shadow-lg flex flex-col items-center justify-center transform group-hover:rotate-6 transition-transform origin-top">
                     <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-orange-200">
                        <span className="text-xl">🧡</span>
                     </div>
                </div>
             </div>
        </div>
    )
}

// --- Main App ---

export default function RetroHandheld() {
  const [selectedApp, setSelectedApp] = useState(0); 
  const [activeAppId, setActiveAppId] = useState(null); 
  const [currentTime, setCurrentTime] = useState(new Date());
  const [backlight, setBacklight] = useState(true);
  
  const lanyardRef = useRef(null);
  const { playClick, playNav, playConfirm, playCancel, playEat, playCrash, playLaser, playThrust, playHyperspace, isMuted, setIsMuted, initAudio } = useRetroSound();

  // Handle first interaction
  useEffect(() => {
    const unlockAudio = () => {
        initAudio();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    return () => {
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
    };
  }, [initAudio]);

  // Unified Controller Input Handler (Handles both UI Buttons and Keyboard)
  const handleControllerInput = useCallback((action) => {
      initAudio();
      
      // If an app is active, dispatch event to it (Game logic, etc.)
      if (activeAppId) {
          window.dispatchEvent(new CustomEvent('RETRO_CONTROLLER', { detail: { action } }));
          return;
      }

      // OS Navigation Logic
      if (action === 'DPAD_R' || action === 'DPAD_D') {
          playNav();
          setSelectedApp(prev => (prev + 1) % APPS.length);
      }
      else if (action === 'DPAD_L' || action === 'DPAD_U') {
          playNav();
          setSelectedApp(prev => (prev - 1 + APPS.length) % APPS.length);
      }
      else if (action === 'BTN_A' || action === 'BTN_START') {
          playConfirm();
          setActiveAppId(APPS[selectedApp].id);
      }
      else if (action === 'BTN_X') {
          playClick();
          setBacklight(prev => !prev);
      }
      else if (action === 'BTN_Y') {
           playClick();
           const random = Math.floor(Math.random() * APPS.length);
           handleAppClick(random);
      }
  }, [activeAppId, selectedApp, playNav, playConfirm, playClick, setBacklight, initAudio]);

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
        initAudio(); // Ensure audio context is ready
        
        let action = null;
        const key = e.key.toLowerCase();

        // New Mapping
        if (e.key === 'ArrowUp') action = 'DPAD_U';
        else if (e.key === 'ArrowDown') action = 'DPAD_D';
        else if (e.key === 'ArrowLeft') action = 'DPAD_L';
        else if (e.key === 'ArrowRight') action = 'DPAD_R';
        else if (key === 'z') action = 'BTN_A';      // A -> z
        else if (key === 'x') action = 'BTN_B';      // B -> x
        else if (key === 'c') action = 'BTN_X';      // X -> c
        else if (key === 'v') action = 'BTN_Y';      // Y -> v
        else if (e.key === 'Enter') action = 'BTN_START'; // Start -> Enter
        
        // Safety / Fallbacks
        else if (e.key === 'Backspace' || e.key === 'Escape') action = 'BTN_B';

        if (action) {
            handleControllerInput(action);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleControllerInput, initAudio]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAppClick = (index) => {
    playConfirm();
    setSelectedApp(index);
    setActiveAppId(APPS[index].id);
  };

  return (
    <div className="min-h-screen bg-stone-200 flex items-center justify-center p-4 sm:p-8 select-none overflow-hidden relative font-sans">
      
      <Keychain anchorRef={lanyardRef} />

      {/* --- Device Body --- */}
      <div className="relative w-full max-w-[480px] bg-[#f0f0f0] rounded-[2rem] sm:rounded-[3rem] shadow-[0px_30px_60px_-10px_rgba(0,0,0,0.3),0px_10px_0px_#d4d4d4,inset_-5px_-5px_15px_rgba(0,0,0,0.05)] border-[4px] sm:border-[6px] border-white p-4 sm:p-8 flex flex-col gap-4 sm:gap-6 transform transition-transform duration-300">
        
        {/* Lanyard Hole */}
        <div 
            ref={lanyardRef} 
            className="absolute top-6 sm:top-8 left-[-10px] sm:left-[-12px] w-5 sm:w-6 h-10 sm:h-12 bg-gray-300 rounded-l-md border-y-2 border-l-2 border-gray-400 shadow-inner flex items-center justify-center"
        >
            <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-black/20 rounded-full"></div>
        </div>

        {/* Top Decor */}
        <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-1.5 sm:h-2 bg-gray-200 rounded-full inset-shadow"></div>

        {/* --- Screen Section --- */}
        <div className="mt-6 sm:mt-8 relative bg-gray-400 rounded-t-xl rounded-b-[2rem] sm:rounded-b-[2.5rem] p-4 sm:p-5 pb-6 sm:pb-8 shadow-[inset_0px_2px_15px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-center mb-1 px-1 sm:px-2">
                 <div className="flex gap-1">
                    <div className="w-8 sm:w-10 h-1 bg-gray-600/30 rounded-full"></div>
                    <div className="w-1.5 sm:w-2 h-1 bg-gray-600/30 rounded-full"></div>
                 </div>
                 <div className="text-[8px] sm:text-[9px] font-bold text-gray-600 tracking-[0.1em] sm:tracking-[0.2em] font-mono">STEREO SOUND</div>
                 
                 <div className="flex gap-2 items-center">
                    <button onClick={() => setIsMuted(!isMuted)} className="text-gray-500 hover:text-gray-800 transition">
                         {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    </button>
                    <div className="w-6 sm:w-8 h-1.5 sm:h-2 bg-red-500/80 rounded-full shadow-[0px_0px_5px_rgba(255,0,0,0.5)] animate-pulse"></div>
                 </div>
            </div>
            
            {/* The Actual LCD Screen */}
            <div className={`
                relative bg-[#9ea792] overflow-hidden rounded-md border-[4px] sm:border-[6px] border-[#78826d] shadow-inner aspect-[4/3]
                ${backlight ? 'brightness-110 saturate-[0.8]' : 'brightness-75 saturate-[0.4]'}
                transition-all duration-300
            `}>
                <div className="absolute inset-0 z-20 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#4a5240 1.5px, transparent 1.5px)', backgroundSize: '4px 4px'}}></div>
                <div className="absolute inset-0 z-20 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px]"></div>

                {/* Content Container */}
                <div className="relative z-10 h-full flex flex-col text-[#2c3327]">
                    
                    {/* Status Bar */}
                    <div className="flex justify-between items-center px-2 py-1 border-b-2 border-[#8b9680]/50 text-[10px] font-mono font-bold tracking-tighter">
                        <div className="flex gap-2">
                            <span>SIG:OK</span>
                            <span>{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <Battery size={12} />
                    </div>

                    {/* View Manager */}
                    {activeAppId === 'calc' ? (
                        <div className="flex-1 animate-in fade-in zoom-in-95 duration-200 p-2">
                            <CalculatorApp 
                                onClose={() => { playCancel(); setActiveAppId(null); }}
                                playSound={playClick}
                                playNav={playNav}
                                playConfirm={playConfirm}
                            />
                        </div>
                    ) : activeAppId === 'game' ? (
                        <div className="flex-1 animate-in fade-in zoom-in-95 duration-200 p-1">
                             <SnakeGame 
                                onClose={() => { playCancel(); setActiveAppId(null); }}
                                playNav={playNav}
                                playClick={playClick}
                                playConfirm={playConfirm}
                                playCancel={playCancel}
                                playEat={playEat}
                                playCrash={playCrash}
                             />
                        </div>
                    ) : activeAppId === 'asteroids' ? (
                         <div className="flex-1 animate-in fade-in zoom-in-95 duration-200 p-1">
                            <MicroAsteroidsGame 
                                onClose={() => { playCancel(); setActiveAppId(null); }}
                                playNav={playNav}
                                playConfirm={playConfirm}
                                playLaser={playLaser}
                                playCrash={playCrash}
                                playThrust={playThrust}
                                playHyperspace={playHyperspace}
                            />
                         </div>
                    ) : (
                        <div className="flex-1 p-2 sm:p-3 flex items-center justify-center gap-6">
                            {APPS.map((app, idx) => (
                                <div 
                                    key={app.id}
                                    onClick={() => handleAppClick(idx)}
                                    className={`
                                        w-24 h-24 flex flex-col items-center justify-center rounded-xl border-4 transition-all duration-150 cursor-pointer
                                        ${idx === selectedApp 
                                            ? 'bg-[#2c3327] text-[#9ea792] border-[#2c3327] shadow-[4px_4px_0px_rgba(0,0,0,0.2)] scale-110' 
                                            : 'border-[#2c3327] hover:bg-[#8b9680]/40'
                                        }
                                    `}
                                >
                                    <app.icon size={32} strokeWidth={2.5} />
                                    <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">{app.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
             <div className="mt-2 text-center text-[9px] sm:text-[10px] font-black italic text-gray-500 font-serif opacity-50">Handheld System</div>
        </div>

        {/* --- Controls Section --- */}
        <div className="flex justify-between items-end px-2 sm:px-4 pb-4 sm:pb-8 mt-2">
            
            {/* Seamless D-Pad */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0">
                 {/* D-Pad Container Hole */}
                <div className="absolute inset-0 bg-[#e5e5e5] rounded-full border border-gray-300 shadow-inner"></div>
                
                {/* Cross Construction */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-28 sm:h-28">
                     
                     {/* Horizontal Bar */}
                     <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-8 sm:h-10 bg-orange-500 rounded-sm border-2 border-black shadow-[0px_4px_0px_#000000] z-10 flex justify-between">
                        <button onMouseDown={() => handleControllerInput('DPAD_L')} className="w-8 sm:w-10 h-full hover:bg-black/10 active:bg-black/20 rounded-l-sm active:scale-95 transition-all flex items-center justify-center z-30">
                           <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-black/50" />
                        </button>
                        <button onMouseDown={() => handleControllerInput('DPAD_R')} className="w-8 sm:w-10 h-full hover:bg-black/10 active:bg-black/20 rounded-r-sm active:scale-95 transition-all flex items-center justify-center z-30">
                           <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-black/50 rotate-180" />
                        </button>
                     </div>

                     {/* Vertical Bar */}
                     <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-8 sm:w-10 bg-orange-500 rounded-sm border-2 border-black shadow-[0px_4px_0px_#000000] z-10 flex flex-col justify-between">
                        <button onMouseDown={() => handleControllerInput('DPAD_U')} className="h-8 sm:h-10 w-full hover:bg-black/10 active:bg-black/20 rounded-t-sm active:scale-95 transition-all flex items-center justify-center z-30">
                           <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-black/50 rotate-90" />
                        </button>
                        <button onMouseDown={() => handleControllerInput('DPAD_D')} className="h-8 sm:h-10 w-full hover:bg-black/10 active:bg-black/20 rounded-b-sm active:scale-95 transition-all flex items-center justify-center z-30">
                           <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-black/50 -rotate-90" />
                        </button>
                     </div>

                     {/* Center Patch to Hide Internal Borders */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(2rem-4px)] h-[calc(2rem-4px)] sm:w-[calc(2.5rem-4px)] sm:h-[calc(2.5rem-4px)] bg-orange-500 z-20 pointer-events-none">
                          <div className="absolute inset-0 m-1 rounded-full bg-orange-600/20 shadow-inner"></div>
                     </div>
                </div>
            </div>

            {/* Action Buttons Row: [Start, Y, X, B, A] */}
            <div className="flex gap-1.5 sm:gap-3 items-end">
                {/* Start */}
                <div className="flex flex-col items-center gap-1 sm:gap-2 group">
                    <button 
                        onClick={() => handleControllerInput('BTN_START')}
                        className="w-7 sm:w-9 h-10 sm:h-14 bg-gray-800 rounded-md border-b-4 border-gray-950 shadow-md active:border-b-0 active:translate-y-1 transition-all"
                    ></button>
                    <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-600">Start</span>
                </div>

                {/* Y */}
                <div className="flex flex-col items-center gap-1 sm:gap-2 group">
                    <button 
                        onClick={() => handleControllerInput('BTN_Y')}
                        className="w-7 sm:w-9 h-10 sm:h-14 bg-gray-200 rounded-md border-b-4 border-gray-400 shadow-md active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center"
                    >
                         <span className="text-gray-500 font-bold text-xs sm:text-sm">Y</span>
                    </button>
                </div>

                {/* X */}
                <div className="flex flex-col items-center gap-1 sm:gap-2 group">
                    <button 
                         onClick={() => handleControllerInput('BTN_X')}
                         className="w-7 sm:w-9 h-10 sm:h-14 bg-gray-200 rounded-md border-b-4 border-gray-400 shadow-md active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center"
                    >
                         <span className="text-gray-500 font-bold text-xs sm:text-sm">X</span>
                    </button>
                </div>

                 {/* B */}
                 <div className="flex flex-col items-center gap-1 sm:gap-2 group">
                    <button 
                         onClick={() => handleControllerInput('BTN_B')}
                         className="w-7 sm:w-9 h-10 sm:h-14 bg-gray-200 rounded-md border-b-4 border-gray-400 shadow-md active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center"
                    >
                         <span className="text-gray-500 font-bold text-xs sm:text-sm">B</span>
                    </button>
                </div>

                {/* A (Orange) */}
                <div className="flex flex-col items-center gap-1 sm:gap-2 group">
                    <button 
                        onClick={() => handleControllerInput('BTN_A')}
                        className="w-7 sm:w-9 h-10 sm:h-14 bg-orange-500 rounded-md border-b-4 border-orange-700 shadow-md active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center"
                    >
                         <span className="text-white font-bold text-xs sm:text-sm">A</span>
                    </button>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}