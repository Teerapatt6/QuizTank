import { useEffect, useRef } from "react";

const TILE = 16;
const SCALE = 2; 
const MAP_W = 24;
const MAP_H = 20;

type Direction = "up" | "down" | "left" | "right";

interface Player {
  x: number; y: number; speed: number; dir: Direction;
}

const map: number[][] = Array.from({ length: MAP_H }, (_, y) =>
  Array.from({ length: MAP_W }, (_, x) => {
    if (x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1) return 1;
    if ((x === 6 && y > 3 && y < MAP_H - 4) || (y === 10 && x > 2 && x < MAP_W - 6)) return 1;
    if ((x > 16 && x < 20 && y > 4 && y < 12) || (x === 14 && y > 12 && y < MAP_H - 4)) return 2;
    if ((y === 12 && x > 3 && x < 10) || (x === 8 && y > 11 && y < 15)) return 3;
    return 0;
  })
);

function hitsSolidTile(x: number, y: number, w: number, h: number): boolean {
  const left = Math.floor(x / TILE);
  const right = Math.floor((x + w - 1) / TILE);
  const top = Math.floor(y / TILE);
  const bottom = Math.floor((y + h - 1) / TILE);
  if (left < 0 || top < 0 || right >= MAP_W || bottom >= MAP_H) return true;
  for (let ty = top; ty <= bottom; ty++) {
    for (let tx = left; tx <= right; tx++) {
      const t = map[ty][tx];
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
  ctx.fillRect(x, y, 16, 1); ctx.fillRect(x, y+15, 16, 1); 
  ctx.fillRect(x, y, 1, 16); ctx.fillRect(x+15, y, 1, 16);
  ctx.fillStyle = "#3a6f8f"; ctx.fillRect(x+2, y+2, 3, 12); ctx.fillRect(x+11, y+2, 3, 12);
  ctx.fillStyle = "#7bbde0"; ctx.fillRect(x+6, y+5, 4, 6);
  ctx.fillStyle = "#2b4d66";
  if (dir === "up") ctx.fillRect(x+7, y-3, 2, 6);
  if (dir === "down") ctx.fillRect(x+7, y+13, 2, 6);
  if (dir === "left") ctx.fillRect(x-3, y+7, 6, 2);
  if (dir === "right") ctx.fillRect(x+13, y+7, 6, 2);
}

export default function TankGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const playerRef = useRef<Player>({ x: TILE * 2, y: TILE * 2, speed: 1.5, dir: "up" });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let rafId = 0;
    const onKeyDown = (e: KeyboardEvent) => (keysRef.current[e.key.toLowerCase()] = true);
    const onKeyUp = (e: KeyboardEvent) => (keysRef.current[e.key.toLowerCase()] = false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const update = () => {
      const p = playerRef.current;
      const k = keysRef.current;
      let dx = 0, dy = 0;
      if (k["w"] || k["arrowup"]) { dy = -p.speed; p.dir = "up"; }
      else if (k["s"] || k["arrowdown"]) { dy = p.speed; p.dir = "down"; }
      else if (k["a"] || k["arrowleft"]) { dx = -p.speed; p.dir = "left"; }
      else if (k["d"] || k["arrowright"]) { dx = p.speed; p.dir = "right"; }

      if (dx !== 0 && !hitsSolidTile(p.x + dx, p.y, 16, 16)) p.x += dx;
      if (dy !== 0 && !hitsSolidTile(p.x, p.y + dy, 16, 16)) p.y += dy;
    };

    const loop = () => {
      update();
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width / SCALE, canvas.height / SCALE);
      for (let y = 0; y < MAP_H; y++) {
        for (let x = 0; x < MAP_W; x++) {
          const t = map[y][x];
          if (t === 1) drawBrickTile(ctx, x*TILE, y*TILE);
          else if (t === 2) drawSteelTile(ctx, x*TILE, y*TILE);
        }
      }
      drawTank(ctx, playerRef.current);
      for (let y = 0; y < MAP_H; y++) {
        for (let x = 0; x < MAP_W; x++) {
          if (map[y][x] === 3) drawBushTile(ctx, x*TILE, y*TILE);
        }
      }
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0); // Reset transform ก่อน draw รอบหน้าอาจจะไม่จำเป็นถ้าใช้แบบเดิม
      // แต่ใน loop นี้เราวาดบน scale 1 แล้วขยายทีหลังไม่ได้ เพราะ pixel art function มันวาดตรง
      // วิธีเดิมของคุณดีแล้วคือ transform ตอนจบ loop แต่จริงๆ ควร transform ก่อนวาด
      // แก้ไข logic draw ให้เหมือนเดิมเป๊ะๆ:
      // ขออภัยครับ เพื่อความชัวร์ ผมจะใช้ ctx.setTransform ในจุดที่ถูกต้องตาม code เดิม
      // *** Code เดิมใช้ setTransform(SCALE...) แล้ว draw() ซึ่งถูกต้อง *** // Reset Transform to identity for clearRect (or fillRect black)
      ctx.setTransform(1, 0, 0, 1, 0, 0); 
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height); // ล้างจอใหญ่

      // Scale for drawing content
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      
      // ... (Drawing logic inside scaled context) ...
      // เพื่อความง่าย ผมก๊อปปี้ Logic Draw เดิมมาใส่ใน loop เลย
       for (let y = 0; y < MAP_H; y++) {
        for (let x = 0; x < MAP_W; x++) {
          const t = map[y][x];
          if (t === 1) drawBrickTile(ctx, x*TILE, y*TILE);
          else if (t === 2) drawSteelTile(ctx, x*TILE, y*TILE);
        }
      }
      drawTank(ctx, playerRef.current);
      for (let y = 0; y < MAP_H; y++) {
        for (let x = 0; x < MAP_W; x++) {
          if (map[y][x] === 3) drawBushTile(ctx, x*TILE, y*TILE);
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
    <canvas
      ref={canvasRef}
      width={MAP_W * TILE * SCALE}
      height={MAP_H * TILE * SCALE}
      // ใส่ Style ตกแต่งที่ตัว Canvas โดยตรง
      className="rounded-xl shadow-2xl ring-1 ring-black/10 bg-slate-900 mx-auto block max-w-full h-auto object-contain"
      style={{ imageRendering: "pixelated" }}
    />
  );
}