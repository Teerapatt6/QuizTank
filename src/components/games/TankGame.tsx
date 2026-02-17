import { useEffect, useRef, useState } from "react";
import { QuizModal } from "../QuizModal";
import { GameQuestion, sampleQuestions } from "../../data/questionData";
import { MAPS, parseMap } from "../../data/mapData";

const TILE = 16;
const HUD_UPDATE_INTERVAL = 200; // ms

type Direction = "up" | "down" | "left" | "right";

interface Player {
  x: number; // pixel coordinate
  y: number; // pixel coordinate
  speed: number;
  dir: Direction;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;
}

interface TriggerBox {
  id: string;
  x: number; // tile coordinate
  y: number; // tile coordinate
  active: boolean;
  questionId: string;
}

type GameState = "playing" | "quiz" | "dead" | "levelComplete";

interface PlayerStats {
  ammo: number;
  hearts: number;
}

export interface HudPayload {
  level: number;
  totalLevels: number;
  levelName: string;
  ammo: number;
  hearts: number;
  enemies: number;
  timeMs: number;
}

interface TankGameProps {
  onHudChange?: (hud: HudPayload) => void;
}

// Tile collision check
function hitsSolidTile(mapData: number[][], x: number, y: number, w: number, h: number): boolean {
  const left = Math.floor(x / TILE);
  const right = Math.floor((x + w - 1) / TILE);
  const top = Math.floor(y / TILE);
  const bottom = Math.floor((y + h - 1) / TILE);

  const mapH = mapData.length;
  const mapW = mapData[0]?.length || 0;

  if (left < 0 || top < 0 || right >= mapW || bottom >= mapH) return true;

  for (let ty = top; ty <= bottom; ty++) {
    for (let tx = left; tx <= right; tx++) {
      const t = mapData[ty][tx];
      if (t === 1 || t === 2) return true; // wall or brick
    }
  }
  return false;
}

// Check if player is on water tile
function isOnWater(mapData: number[][], x: number, y: number, w: number, h: number): boolean {
  const centerX = Math.floor((x + w / 2) / TILE);
  const centerY = Math.floor((y + h / 2) / TILE);

  const mapH = mapData.length;
  const mapW = mapData[0]?.length || 0;

  if (centerX < 0 || centerY < 0 || centerX >= mapW || centerY >= mapH) return false;

  return mapData[centerY][centerX] === 4; // water tile
}

// Check if player is on grass tile
function isOnGrass(mapData: number[][], x: number, y: number, w: number, h: number): boolean {
  const centerX = Math.floor((x + w / 2) / TILE);
  const centerY = Math.floor((y + h / 2) / TILE);

  const mapH = mapData.length;
  const mapW = mapData[0]?.length || 0;

  if (centerX < 0 || centerY < 0 || centerX >= mapW || centerY >= mapH) return false;

  return mapData[centerY][centerX] === 3; // grass tile
}

// Drawing functions
function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

function drawBrickTile(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  ctx.fillStyle = "#6b2a17";
  ctx.fillRect(ox, oy, TILE, TILE);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const mH = y === 4 || y === 9 || y === 14;
      const mV = (x === 0 || x === 8) && y % 5 !== 4;
      if (mH || mV) px(ctx, ox + x, oy + y, "#2a0c06");
      else if ((x + y) % 7 === 0) px(ctx, ox + x, oy + y, "#b4532a");
    }
  }
}

function drawSteelTile(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  ctx.fillStyle = "#c9c9c9";
  ctx.fillRect(ox, oy, TILE, TILE);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const b = x === 0 || y === 0 || x === TILE - 1 || y === TILE - 1;
      if (b) px(ctx, ox + x, oy + y, "#7a7a7a");
      else if (x % 4 === 0 || y % 4 === 0) px(ctx, ox + x, oy + y, "#9a9a9a");
      else if ((x + y) % 11 === 0) px(ctx, ox + x, oy + y, "#efefef");
    }
  }
}

function drawGrassTile(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const r = (x * 13 + y * 7) % 17;
      if (r < 6) px(ctx, ox + x, oy + y, "#0f5f2b");
      else if (r < 9) px(ctx, ox + x, oy + y, "#2fb34a");
      else if (r < 10) px(ctx, ox + x, oy + y, "#0a3b1a");
    }
  }
}

function drawWaterTile(ctx: CanvasRenderingContext2D, ox: number, oy: number, time: number) {
  // Animated water
  const wave = Math.sin(time * 0.002 + ox * 0.1) * 0.2;
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const r = (x * 11 + y * 13 + Math.floor(time * 0.01)) % 19;
      if (r < 8) px(ctx, ox + x, oy + y, "#1e3a8a"); // blue-900
      else if (r < 12) px(ctx, ox + x, oy + y, "#2563eb"); // blue-600
      else if (r < 14) px(ctx, ox + x, oy + y, "#3b82f6"); // blue-500
      else px(ctx, ox + x, oy + y, "#60a5fa"); // blue-400
    }
  }
}

function drawTank(ctx: CanvasRenderingContext2D, p: Player) {
  const { x, y, dir } = p;
  ctx.fillStyle = "#d9f0ff";
  ctx.fillRect(x, y, 16, 16);
  ctx.fillStyle = "#2b4d66";
  ctx.fillRect(x, y, 16, 1);
  ctx.fillRect(x, y + 15, 16, 1);
  ctx.fillRect(x, y, 1, 16);
  ctx.fillRect(x + 15, y, 1, 16);
  ctx.fillStyle = "#3a6f8f";
  ctx.fillRect(x + 2, y + 2, 3, 12);
  ctx.fillRect(x + 11, y + 2, 3, 12);
  ctx.fillStyle = "#7bbde0";
  ctx.fillRect(x + 6, y + 5, 4, 6);
  ctx.fillStyle = "#2b4d66";
  if (dir === "up") ctx.fillRect(x + 7, y - 3, 2, 6);
  if (dir === "down") ctx.fillRect(x + 7, y + 13, 2, 6);
  if (dir === "left") ctx.fillRect(x - 3, y + 7, 6, 2);
  if (dir === "right") ctx.fillRect(x + 13, y + 7, 6, 2);
}

function drawQuestionBox(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  const pulse = 0.5 + Math.sin(time * 0.003) * 0.5;

  // Outer glow
  ctx.fillStyle = `rgba(255, 200, 0, ${pulse * 0.3})`;
  ctx.fillRect(x - 2, y - 2, TILE + 4, TILE + 4);

  // Main box
  ctx.fillStyle = "#dc2626";
  ctx.fillRect(x, y, TILE, TILE);

  // Border
  ctx.fillStyle = "#991b1b";
  ctx.fillRect(x, y, TILE, 1);
  ctx.fillRect(x, y + TILE - 1, TILE, 1);
  ctx.fillRect(x, y, 1, TILE);
  ctx.fillRect(x + TILE - 1, y, 1, TILE);

  // "?" symbol
  ctx.fillStyle = "#ffffff";
  const qx = x + 5;
  const qy = y + 3;
  ctx.fillRect(qx, qy, 6, 1);
  ctx.fillRect(qx + 5, qy + 1, 1, 2);
  ctx.fillRect(qx + 4, qy + 3, 1, 1);
  ctx.fillRect(qx + 3, qy + 4, 1, 2);
  ctx.fillRect(qx + 3, qy + 9, 1, 2);
}

export default function TankGame({ onHudChange }: TankGameProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const playerRef = useRef<Player>({ x: TILE * 2, y: TILE * 2, speed: 1.5, dir: "up" });
  const scaleRef = useRef<number>(1);

  // Time tracking
  const startTimeRef = useRef<number>(0);
  const lastHudUpdateRef = useRef<number>(0);

  // Current level
  const [currentLevel, setCurrentLevel] = useState(0);
  const mapRef = useRef<number[][]>([]);
  const mapWidthRef = useRef(0);
  const mapHeightRef = useRef(0);

  // Bullets
  const bulletsRef = useRef<Bullet[]>([]);
  const lastShotRef = useRef<number>(0);
  const SHOOT_COOLDOWN = 200;
  const MAX_BULLETS = 3;
  const BULLET_SPEED = 5;
  const BULLET_SIZE = 3;

  // Game state
  const gameStateRef = useRef<GameState>("playing");
  const [playerStats, setPlayerStats] = useState<PlayerStats>({ ammo: 10, hearts: 3 });

  // Quiz state
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);

  // Trigger boxes
  const triggerBoxesRef = useRef<TriggerBox[]>([]);

  // Load level function
  const loadLevel = (levelIndex: number) => {
    if (levelIndex < 0 || levelIndex >= MAPS.length) return;

    const mapData = MAPS[levelIndex];
    const parsed = parseMap(mapData.layout);

    // Set map
    mapRef.current = parsed.tiles.map(row => row.slice());
    mapHeightRef.current = parsed.tiles.length;
    mapWidthRef.current = parsed.tiles[0]?.length || 0;

    // Reset player to spawn
    playerRef.current = {
      x: parsed.playerSpawn.x * TILE,
      y: parsed.playerSpawn.y * TILE,
      speed: 1.5,
      dir: "up"
    };



    // Clear bullets
    bulletsRef.current = [];

    // Create trigger boxes from checkpoints
    triggerBoxesRef.current = parsed.checkpoints.map((cp, idx) => ({
      id: `trigger_${idx}`,
      x: cp.x,
      y: cp.y,
      active: true,
      questionId: sampleQuestions[idx % sampleQuestions.length].id
    }));

    // Reset game state
    gameStateRef.current = "playing";

    // Reset timer
    startTimeRef.current = performance.now();

    console.log(`Loaded level ${levelIndex}: ${mapData.name}`);
  };

  // Initialize first level
  useEffect(() => {
    loadLevel(currentLevel);
  }, [currentLevel]);

  // Next level function
  const nextLevel = () => {
    const next = currentLevel + 1;
    if (next < MAPS.length) {
      setCurrentLevel(next);
      setPlayerStats(prev => ({ ...prev, ammo: prev.ammo + 5 })); // Bonus ammo
    } else {
      console.log("All levels completed!");
      gameStateRef.current = "levelComplete";
    }
  };

  // Spawn bullet
  function spawnBullet(player: Player) {
    const now = performance.now();
    if (now - lastShotRef.current < SHOOT_COOLDOWN) return;
    if (bulletsRef.current.length >= MAX_BULLETS) return;
    if (playerStats.ammo <= 0) return;

    lastShotRef.current = now;
    setPlayerStats(prev => ({ ...prev, ammo: prev.ammo - 1 }));

    let bx = player.x;
    let by = player.y;
    let vx = 0,
      vy = 0;
    if (player.dir === "up") {
      bx = player.x + 7;
      by = player.y - BULLET_SIZE;
      vx = 0;
      vy = -BULLET_SPEED;
    }
    if (player.dir === "down") {
      bx = player.x + 7;
      by = player.y + 16;
      vx = 0;
      vy = BULLET_SPEED;
    }
    if (player.dir === "left") {
      bx = player.x - BULLET_SIZE;
      by = player.y + 7;
      vx = -BULLET_SPEED;
      vy = 0;
    }
    if (player.dir === "right") {
      bx = player.x + 16;
      by = player.y + 7;
      vx = BULLET_SPEED;
      vy = 0;
    }

    bulletsRef.current.push({ x: bx, y: by, vx, vy, alive: true });
  }

  // Bullet hits tile
  function bulletHitsTile(b: Bullet): { tx: number; ty: number } | null {
    const cx = b.x + Math.floor(BULLET_SIZE / 2);
    const cy = b.y + Math.floor(BULLET_SIZE / 2);
    const tx = Math.floor(cx / TILE);
    const ty = Math.floor(cy / TILE);
    if (tx < 0 || ty < 0 || tx >= mapWidthRef.current || ty >= mapHeightRef.current) return null;
    return { tx, ty };
  }

  // Update bullets
  function updateBullets() {
    const map = mapRef.current;
    const bullets = bulletsRef.current;
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      if (!b.alive) {
        bullets.splice(i, 1);
        continue;
      }
      b.x += b.vx;
      b.y += b.vy;

      // Out of bounds
      if (
        b.x < -BULLET_SIZE ||
        b.y < -BULLET_SIZE ||
        b.x > mapWidthRef.current * TILE ||
        b.y > mapHeightRef.current * TILE
      ) {
        bullets.splice(i, 1);
        continue;
      }

      const hit = bulletHitsTile(b);
      if (hit === null) continue;
      const t = map[hit.ty][hit.tx];
      if (t === 1) {
        // Steel wall - bullet stops
        bullets.splice(i, 1);
      } else if (t === 2) {
        // Brick - destroy it
        map[hit.ty][hit.tx] = 0;
        bullets.splice(i, 1);
      }
    }
  }

  // Check trigger collision
  function checkTriggerCollision(player: Player): TriggerBox | null {
    const playerTileX = Math.floor((player.x + 8) / TILE);
    const playerTileY = Math.floor((player.y + 8) / TILE);

    for (const trigger of triggerBoxesRef.current) {
      if (trigger.active && trigger.x === playerTileX && trigger.y === playerTileY) {
        return trigger;
      }
    }
    return null;
  }

  // Quiz handlers
  const handleQuizSubmit = (result: { correct: boolean; selectedAnswers: string[] }) => {
    if (result.correct) {
      setPlayerStats(prev => ({ ...prev, ammo: prev.ammo + 3 }));
      console.log("✅ Correct! +3 Ammo");
    } else {
      setPlayerStats(prev => ({ ...prev, hearts: Math.max(0, prev.hearts - 1) }));
      console.log("❌ Wrong! -1 Heart");
    }

    setTimeout(() => {
      setIsQuizOpen(false);
      setCurrentQuestion(null);
      gameStateRef.current = "playing";
    }, 100);
  };

  const handleQuizClose = () => {
    setIsQuizOpen(false);
    setCurrentQuestion(null);
    gameStateRef.current = "playing";
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let rafId = 0;

    // Calculate and update scale based on window size
    const updateCanvasSize = () => {
      const mapPixelWidth = mapWidthRef.current * TILE;
      const mapPixelHeight = mapHeightRef.current * TILE;

      // Target: fit map in 95% of window width and 75% of window height
      const maxWidth = window.innerWidth * 0.95;
      const maxHeight = window.innerHeight * 0.75;

      // Calculate scale to fit both dimensions
      const scaleX = Math.floor(maxWidth / mapPixelWidth);
      const scaleY = Math.floor(maxHeight / mapPixelHeight);

      // Use the smaller scale to ensure map fits in both dimensions
      const scale = Math.max(1, Math.min(scaleX, scaleY));

      scaleRef.current = scale;
      canvas.width = mapPixelWidth * scale;
      canvas.height = mapPixelHeight * scale;

      // Reapply imageSmoothingEnabled after canvas resize
      ctx.imageSmoothingEnabled = false;
    };

    // Initial size calculation
    updateCanvasSize();

    // Update on window resize
    const onResize = () => updateCanvasSize();
    window.addEventListener("resize", onResize);

    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.code === "Space" || e.key === " ") {
        spawnBullet(playerRef.current);
        e.preventDefault();
      }
      // Level switching for testing
      if (e.key === "n" || e.key === "N") {
        nextLevel();
      }
      if (e.key === "r" || e.key === "R") {
        loadLevel(currentLevel);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => (keysRef.current[e.key.toLowerCase()] = false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const update = () => {
      // Only update when playing
      if (gameStateRef.current !== "playing") return;

      const p = playerRef.current;
      const k = keysRef.current;
      const map = mapRef.current;

      let dx = 0,
        dy = 0;
      if (k["w"] || k["arrowup"]) {
        dy = -p.speed;
        p.dir = "up";
      } else if (k["s"] || k["arrowdown"]) {
        dy = p.speed;
        p.dir = "down";
      } else if (k["a"] || k["arrowleft"]) {
        dx = -p.speed;
        p.dir = "left";
      } else if (k["d"] || k["arrowright"]) {
        dx = p.speed;
        p.dir = "right";
      }

      // Check if on grass (slow movement)
      if (isOnGrass(map, p.x, p.y, 16, 16)) {
        dx *= 0.75; // 25% slower
        dy *= 0.75;
      }

      // Move if no collision
      if (dx !== 0 && !hitsSolidTile(map, p.x + dx, p.y, 16, 16)) p.x += dx;
      if (dy !== 0 && !hitsSolidTile(map, p.x, p.y + dy, 16, 16)) p.y += dy;

      // Check water death
      if (isOnWater(map, p.x, p.y, 16, 16)) {
        console.log("💀 Player died in water!");
        gameStateRef.current = "dead";
        setPlayerStats(prev => ({ ...prev, hearts: Math.max(0, prev.hearts - 1) }));
        setTimeout(() => {
          loadLevel(currentLevel); // Respawn
        }, 1000);
        return;
      }

      // Update bullets
      updateBullets();

      // Check trigger collision
      const trigger = checkTriggerCollision(p);
      if (trigger) {
        trigger.active = false;
        gameStateRef.current = "quiz";

        const question = sampleQuestions.find(q => q.id === trigger.questionId);
        if (question) {
          setCurrentQuestion(question);
          setIsQuizOpen(true);
        }
      }

    };

    const loop = () => {
      update();

      const map = mapRef.current;
      const currentTime = performance.now();
      const scale = scaleRef.current;

      // Update HUD (throttled)
      if (onHudChange && currentTime - lastHudUpdateRef.current >= HUD_UPDATE_INTERVAL) {
        lastHudUpdateRef.current = currentTime;
        const elapsedTime = currentTime - startTimeRef.current;

        // Count active enemies (triggers in this case)
        const activeEnemies = triggerBoxesRef.current.filter(t => t.active).length;

        onHudChange({
          level: currentLevel + 1,
          totalLevels: MAPS.length,
          levelName: MAPS[currentLevel]?.name || "",
          ammo: playerStats.ammo,
          hearts: playerStats.hearts,
          enemies: activeEnemies,
          timeMs: elapsedTime
        });
      }

      // Clear canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply integer scaling
      ctx.setTransform(scale, 0, 0, scale, 0, 0);

      // Draw all tiles (no culling)
      for (let y = 0; y < mapHeightRef.current; y++) {
        for (let x = 0; x < mapWidthRef.current; x++) {
          const t = map[y]?.[x];
          if (t === undefined) continue;

          const screenX = x * TILE;
          const screenY = y * TILE;

          if (t === 1) drawSteelTile(ctx, screenX, screenY);
          else if (t === 2) drawBrickTile(ctx, screenX, screenY);
          else if (t === 3) drawGrassTile(ctx, screenX, screenY);
          else if (t === 4) drawWaterTile(ctx, screenX, screenY, currentTime);
        }
      }

      // Draw all trigger boxes
      for (const trigger of triggerBoxesRef.current) {
        if (trigger.active) {
          const screenX = trigger.x * TILE;
          const screenY = trigger.y * TILE;
          drawQuestionBox(ctx, screenX, screenY, currentTime);
        }
      }

      // Draw tank
      drawTank(ctx, playerRef.current);

      // Draw bullets
      ctx.fillStyle = "#fff8a3";
      for (const b of bulletsRef.current) {
        ctx.fillRect(b.x, b.y, BULLET_SIZE, BULLET_SIZE);
      }

      rafId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [currentLevel, onHudChange, playerStats.ammo, playerStats.hearts]);

  return (
    <div className="relative inline-block">

      <canvas
        ref={canvasRef}
        className="rounded-xl shadow-2xl ring-1 ring-black/10 bg-slate-900 mx-auto block max-w-full h-auto object-contain"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Quiz Modal */}
      {currentQuestion && (
        <QuizModal
          type={currentQuestion.type}
          question={currentQuestion}
          onSubmit={handleQuizSubmit}
          onClose={handleQuizClose}
          isOpen={isQuizOpen}
        />
      )}

      {/* Controls hint */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>WASD/Arrows: Move | Space: Shoot | N: Next Level | R: Restart Level</p>
      </div>
    </div>
  );
}