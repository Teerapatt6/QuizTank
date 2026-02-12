import { useEffect, useRef, useState } from "react";
import { QuizModal, QuizType } from "../QuizModal";
import { GameQuestion, sampleQuestions } from "../../data/questionData";


const TILE = 16;
const SCALE = 2;
const MAP_W = 24;
const MAP_H = 20;

type Direction = "up" | "down" | "left" | "right";

interface Player {
  x: number; y: number; speed: number; dir: Direction;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;
}

// Question box trigger interface
interface TriggerBox {
  id: string;
  x: number; // pixel coordinate
  y: number; // pixel coordinate
  active: boolean; // false when collected
  questionId: string; // links to question data
}

// Game state for pause/quiz management
type GameState = "playing" | "quiz";

// Player stats (ammo and hearts)
interface PlayerStats {
  ammo: number;
  hearts: number;
}


// Initial immutable map layout (will be copied into a mutable ref inside component)
const initialMap: number[][] = Array.from({ length: MAP_H }, (_, y) =>
  Array.from({ length: MAP_W }, (_, x) => {
    if (x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1) return 1;
    if ((x === 6 && y > 3 && y < MAP_H - 4) || (y === 10 && x > 2 && x < MAP_W - 6)) return 1;
    if ((x > 16 && x < 20 && y > 4 && y < 12) || (x === 14 && y > 12 && y < MAP_H - 4)) return 2;
    if ((y === 12 && x > 3 && x < 10) || (x === 8 && y > 11 && y < 15)) return 3;
    return 0;
  })
);

// hitsSolidTile unchanged semantics but made to accept a map param so it can use mutable mapRef
function hitsSolidTile(mapData: number[][], x: number, y: number, w: number, h: number): boolean {
  const left = Math.floor(x / TILE);
  const right = Math.floor((x + w - 1) / TILE);
  const top = Math.floor(y / TILE);
  const bottom = Math.floor((y + h - 1) / TILE);
  if (left < 0 || top < 0 || right >= MAP_W || bottom >= MAP_H) return true;
  for (let ty = top; ty <= bottom; ty++) {
    for (let tx = left; tx <= right; tx++) {
      const t = mapData[ty][tx];
      if (t === 1 || t === 2) return true;
    }
  }
  return false;
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color; ctx.fillRect(x, y, 1, 1);
}

function drawBrickTile(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  ctx.fillStyle = "#6b2a17"; ctx.fillRect(ox, oy, TILE, TILE);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const mH = (y === 4 || y === 9 || y === 14);
      const mV = (x === 0 || x === 8) && (y % 5 !== 4);
      if (mH || mV) px(ctx, ox + x, oy + y, "#2a0c06");
      else if ((x + y) % 7 === 0) px(ctx, ox + x, oy + y, "#b4532a");
    }
  }
}
function drawSteelTile(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  ctx.fillStyle = "#c9c9c9"; ctx.fillRect(ox, oy, TILE, TILE);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const b = (x === 0 || y === 0 || x === TILE - 1 || y === TILE - 1);
      if (b) px(ctx, ox + x, oy + y, "#7a7a7a");
      else if ((x % 4 === 0) || (y % 4 === 0)) px(ctx, ox + x, oy + y, "#9a9a9a");
      else if ((x + y) % 11 === 0) px(ctx, ox + x, oy + y, "#efefef");
    }
  }
}
function drawBushTile(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const r = (x * 13 + y * 7) % 17;
      if (r < 6) px(ctx, ox + x, oy + y, "#0f5f2b");
      else if (r < 9) px(ctx, ox + x, oy + y, "#2fb34a");
      else if (r < 10) px(ctx, ox + x, oy + y, "#0a3b1a");
    }
  }
}
function drawTank(ctx: CanvasRenderingContext2D, p: Player) {
  const { x, y, dir } = p;
  ctx.fillStyle = "#d9f0ff"; ctx.fillRect(x, y, 16, 16);
  ctx.fillStyle = "#2b4d66";
  ctx.fillRect(x, y, 16, 1); ctx.fillRect(x, y + 15, 16, 1);
  ctx.fillRect(x, y, 1, 16); ctx.fillRect(x + 15, y, 1, 16);
  ctx.fillStyle = "#3a6f8f"; ctx.fillRect(x + 2, y + 2, 3, 12); ctx.fillRect(x + 11, y + 2, 3, 12);
  ctx.fillStyle = "#7bbde0"; ctx.fillRect(x + 6, y + 5, 4, 6);
  ctx.fillStyle = "#2b4d66";
  if (dir === "up") ctx.fillRect(x + 7, y - 3, 2, 6);
  if (dir === "down") ctx.fillRect(x + 7, y + 13, 2, 6);
  if (dir === "left") ctx.fillRect(x - 3, y + 7, 6, 2);
  if (dir === "right") ctx.fillRect(x + 13, y + 7, 6, 2);
}

// Draw question box trigger with pulsing glow effect
function drawQuestionBox(ctx: CanvasRenderingContext2D, box: TriggerBox, time: number) {
  if (!box.active) return; // Don't draw if collected

  const { x, y } = box;
  const size = TILE;

  // Pulsing glow effect (0.5 to 1.0 opacity)
  const pulse = 0.5 + Math.sin(time * 0.003) * 0.5;

  // Outer glow
  ctx.fillStyle = `rgba(255, 200, 0, ${pulse * 0.3})`;
  ctx.fillRect(x - 2, y - 2, size + 4, size + 4);

  // Main red box
  ctx.fillStyle = "#dc2626"; // Red-600
  ctx.fillRect(x, y, size, size);

  // Border
  ctx.fillStyle = "#991b1b"; // Red-800
  ctx.fillRect(x, y, size, 1);
  ctx.fillRect(x, y + size - 1, size, 1);
  ctx.fillRect(x, y, 1, size);
  ctx.fillRect(x + size - 1, y, 1, size);

  // Draw "?" symbol
  ctx.fillStyle = "#ffffff";
  // Question mark - pixel art style
  const qx = x + 5;
  const qy = y + 3;
  // Top curve
  ctx.fillRect(qx, qy, 6, 1);
  ctx.fillRect(qx + 5, qy + 1, 1, 2);
  ctx.fillRect(qx + 4, qy + 3, 1, 1);
  ctx.fillRect(qx + 3, qy + 4, 1, 2);
  // Dot
  ctx.fillRect(qx + 3, qy + 7, 1, 1);
  ctx.fillRect(qx + 3, qy + 9, 1, 2);
}

// Check collision between player tank and trigger box (AABB)
function checkTriggerCollision(player: Player, box: TriggerBox): boolean {
  if (!box.active) return false;

  const tankSize = 16;
  const boxSize = TILE;

  // AABB collision detection
  return (
    player.x < box.x + boxSize &&
    player.x + tankSize > box.x &&
    player.y < box.y + boxSize &&
    player.y + tankSize > box.y
  );
}


export default function TankGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const playerRef = useRef<Player>({ x: TILE * 2, y: TILE * 2, speed: 1.5, dir: "up" });

  // Mutable map so bricks can be destroyed
  const mapRef = useRef<number[][]>(initialMap.map(row => row.slice()));

  // Bullets
  const bulletsRef = useRef<Bullet[]>([]);
  const lastShotRef = useRef<number>(0);
  const SHOOT_COOLDOWN = 200; // ms
  const MAX_BULLETS = 3;
  const BULLET_SPEED = 5;
  const BULLET_SIZE = 3;

  // Game state for pause/quiz management
  const gameStateRef = useRef<GameState>("playing");

  // Player stats (ammo and hearts) - using useState for HUD reactivity
  const [playerStats, setPlayerStats] = useState<PlayerStats>({ ammo: 10, hearts: 3 });

  // Quiz state (using useState for React rendering)
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);

  // Trigger boxes (question collectibles on the map)
  const triggerBoxesRef = useRef<TriggerBox[]>([
    { id: 't1', x: TILE * 10, y: TILE * 5, active: true, questionId: 'q1' },
    { id: 't2', x: TILE * 4, y: TILE * 15, active: true, questionId: 'q2' },
    { id: 't3', x: TILE * 18, y: TILE * 14, active: true, questionId: 'q3' },
    { id: 't4', x: TILE * 12, y: TILE * 10, active: true, questionId: 'q4' },
    { id: 't5', x: TILE * 20, y: TILE * 3, active: true, questionId: 'q5' },
  ]);


  function spawnBullet(player: Player) {
    const now = performance.now();
    if (now - lastShotRef.current < SHOOT_COOLDOWN) return;
    if (bulletsRef.current.length >= MAX_BULLETS) return;
    lastShotRef.current = now;

    let bx = player.x;
    let by = player.y;
    let vx = 0, vy = 0;
    if (player.dir === "up") { bx = player.x + 7; by = player.y - BULLET_SIZE; vx = 0; vy = -BULLET_SPEED; }
    if (player.dir === "down") { bx = player.x + 7; by = player.y + 16; vx = 0; vy = BULLET_SPEED; }
    if (player.dir === "left") { bx = player.x - BULLET_SIZE; by = player.y + 7; vx = -BULLET_SPEED; vy = 0; }
    if (player.dir === "right") { bx = player.x + 16; by = player.y + 7; vx = BULLET_SPEED; vy = 0; }

    bulletsRef.current.push({ x: bx, y: by, vx, vy, alive: true });
  }

  function bulletHitsTile(b: Bullet): { tx: number; ty: number } | null {
    // Use a point near bullet center
    const cx = b.x + Math.floor(BULLET_SIZE / 2);
    const cy = b.y + Math.floor(BULLET_SIZE / 2);
    const tx = Math.floor(cx / TILE);
    const ty = Math.floor(cy / TILE);
    if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return null;
    return { tx, ty };
  }

  function updateBullets() {
    const map = mapRef.current;
    const bullets = bulletsRef.current;
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      if (!b.alive) { bullets.splice(i, 1); continue; }
      b.x += b.vx;
      b.y += b.vy;
      // out of bounds?
      if (b.x < -BULLET_SIZE || b.y < -BULLET_SIZE || b.x > MAP_W * TILE || b.y > MAP_H * TILE) {
        bullets.splice(i, 1); continue;
      }
      const hit = bulletHitsTile(b);
      if (hit === null) continue;
      const t = map[hit.ty][hit.tx];
      if (t === 1) {
        // destroy brick
        map[hit.ty][hit.tx] = 0;
        bullets.splice(i, 1);
      } else if (t === 2) {
        // steel absorbs bullet
        bullets.splice(i, 1);
      } else {
        // no tile or bush -> bullet continues
      }
    }
  }

  // Quiz handlers
  const handleQuizSubmit = (result: { correct: boolean; selectedAnswers: string[] }) => {
    if (result.correct) {
      // Correct answer: add ammo
      setPlayerStats(prev => ({ ...prev, ammo: prev.ammo + 3 }));
      console.log('✅ Correct! +3 Ammo');
    } else {
      // Wrong answer: lose heart
      setPlayerStats(prev => ({ ...prev, hearts: Math.max(0, prev.hearts - 1) }));
      console.log('❌ Wrong! -1 Heart');
    }

    // Close modal and resume game
    setTimeout(() => {
      setIsQuizOpen(false);
      setCurrentQuestion(null);
      gameStateRef.current = "playing";
      console.log('Game resumed');
    }, 100);
  };

  const handleQuizClose = () => {
    // Close without penalty (player chose to skip)
    setIsQuizOpen(false);
    setCurrentQuestion(null);
    gameStateRef.current = "playing";
    console.log('Quiz closed, game resumed');
  };

  useEffect(() => {

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let rafId = 0;
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.code === "Space" || e.key === " ") {
        // Attempt to spawn bullet on space
        spawnBullet(playerRef.current);
        // prevent page scroll
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => (keysRef.current[e.key.toLowerCase()] = false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const update = () => {
      // Only update game logic when in "playing" state
      if (gameStateRef.current !== "playing") return;

      const p = playerRef.current;
      const k = keysRef.current;
      let dx = 0, dy = 0;
      if (k["w"] || k["arrowup"]) { dy = -p.speed; p.dir = "up"; }
      else if (k["s"] || k["arrowdown"]) { dy = p.speed; p.dir = "down"; }
      else if (k["a"] || k["arrowleft"]) { dx = -p.speed; p.dir = "left"; }
      else if (k["d"] || k["arrowright"]) { dx = p.speed; p.dir = "right"; }

      if (dx !== 0 && !hitsSolidTile(mapRef.current, p.x + dx, p.y, 16, 16)) p.x += dx;
      if (dy !== 0 && !hitsSolidTile(mapRef.current, p.x, p.y + dy, 16, 16)) p.y += dy;

      updateBullets();

      // Check for trigger box collisions
      const triggers = triggerBoxesRef.current;
      for (const trigger of triggers) {
        if (checkTriggerCollision(p, trigger)) {
          // Collision detected! Trigger quiz
          trigger.active = false; // Mark as collected
          gameStateRef.current = "quiz"; // Pause game

          // Find and set the question
          const question = sampleQuestions.find(q => q.id === trigger.questionId);
          if (question) {
            setCurrentQuestion(question);
            setIsQuizOpen(true);
            console.log('Question box collected! Quiz opened:', question.id);
          }
          break; // Only trigger one quiz at a time
        }
      }
    };


    const loop = () => {
      update();

      // Clear full canvas (device pixels) then scale for crisp pixel rendering
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);

      // Draw ground / brick / steel first (non-overlay)
      const map = mapRef.current;
      for (let y = 0; y < MAP_H; y++) {
        for (let x = 0; x < MAP_W; x++) {
          const t = map[y][x];
          if (t === 1) drawBrickTile(ctx, x * TILE, y * TILE);
          else if (t === 2) drawSteelTile(ctx, x * TILE, y * TILE);
        }
      }

      // Draw trigger boxes (question collectibles)
      const currentTime = performance.now();
      for (const trigger of triggerBoxesRef.current) {
        drawQuestionBox(ctx, trigger, currentTime);
      }

      // Draw tank

      drawTank(ctx, playerRef.current);

      // Draw bullets (above tank, below bush)
      ctx.fillStyle = "#fff8a3";
      for (const b of bulletsRef.current) {
        ctx.fillRect(b.x, b.y, BULLET_SIZE, BULLET_SIZE);
      }

      // Draw bushes as overlay
      for (let y = 0; y < MAP_H; y++) {
        for (let x = 0; x < MAP_W; x++) {
          if (map[y][x] === 3) drawBushTile(ctx, x * TILE, y * TILE);
        }
      }

      rafId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <div className="relative inline-block">
      {/* HUD Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-black/70 backdrop-blur-sm rounded-xl px-6 py-3 shadow-2xl border border-white/10">
          <div className="flex items-center gap-6">
            {/* Ammo Display */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wide">Ammo</span>
                <span className="text-xl font-bold text-yellow-400">{playerStats.ammo}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-white/20" />

            {/* Hearts Display */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">❤️</span>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wide">Hearts</span>
                <span className="text-xl font-bold text-red-400">{playerStats.hearts}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={MAP_W * TILE * SCALE}
        height={MAP_H * TILE * SCALE}
        className="rounded-xl shadow-2xl ring-1 ring-black/10 bg-slate-900 mx-auto block max-w-full h-auto object-contain"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Quiz Modal Overlay */}
      {currentQuestion && (
        <QuizModal
          type={currentQuestion.type}
          question={currentQuestion}
          onSubmit={handleQuizSubmit}
          onClose={handleQuizClose}
          isOpen={isQuizOpen}
        />
      )}
    </div>
  );
}