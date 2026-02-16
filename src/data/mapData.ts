// src/data/map.ts
/**
 * Map data for TankGame - 5 themed levels (60x40)
 *
 * Tile Legend:
 * '.' = ground (walkable)
 * '#' = solid wall (collision)
 * 'B' = destructible brick
 * 'W' = water (player dies instantly)
 * 'G' = grass (walkable, slows movement 25%)
 * 'P' = player spawn
 * 'E' = enemy spawn (optional)
 * 'C' = checkpoint/quiz trigger
 */

export interface MapData {
    id: number;
    name: string;
    theme: string;
    layout: string[];
}

const W = 60;
const H = 40;

type Grid = string[][];

function makeGrid(fill: string = "."): Grid {
    const g: Grid = Array.from({ length: H }, () => Array.from({ length: W }, () => fill));
    // border walls
    for (let x = 0; x < W; x++) {
        g[0][x] = "#";
        g[H - 1][x] = "#";
    }
    for (let y = 0; y < H; y++) {
        g[y][0] = "#";
        g[y][W - 1] = "#";
    }
    return g;
}

function place(g: Grid, x: number, y: number, ch: string) {
    if (x <= 0 || x >= W - 1 || y <= 0 || y >= H - 1) return;
    g[y][x] = ch;
}

function rect(g: Grid, x0: number, y0: number, w: number, h: number, ch: string) {
    for (let y = y0; y < y0 + h; y++) {
        for (let x = x0; x < x0 + w; x++) {
            if (x <= 0 || x >= W - 1 || y <= 0 || y >= H - 1) continue;
            g[y][x] = ch;
        }
    }
}

function frame(g: Grid, x0: number, y0: number, w: number, h: number, ch: string) {
    for (let x = x0; x < x0 + w; x++) {
        if (y0 > 0 && y0 < H - 1) g[y0][x] = ch;
        if (y0 + h - 1 > 0 && y0 + h - 1 < H - 1) g[y0 + h - 1][x] = ch;
    }
    for (let y = y0; y < y0 + h; y++) {
        if (x0 > 0 && x0 < W - 1) g[y][x0] = ch;
        if (x0 + w - 1 > 0 && x0 + w - 1 < W - 1) g[y][x0 + w - 1] = ch;
    }
}

function carvePath(g: Grid, x0: number, y0: number, x1: number, y1: number) {
    // simple L-shaped corridor on ground
    let x = x0;
    let y = y0;
    while (x !== x1) {
        place(g, x, y, ".");
        x += x < x1 ? 1 : -1;
    }
    while (y !== y1) {
        place(g, x, y, ".");
        y += y < y1 ? 1 : -1;
    }
    place(g, x1, y1, ".");
}

function toLayout(g: Grid): string[] {
    return g.map((row) => row.join(""));
}

function validateMap(name: string, layout: string[]) {
    if (layout.length !== H) {
        throw new Error(`[${name}] height=${layout.length} expected=${H}`);
    }
    for (let y = 0; y < layout.length; y++) {
        if (layout[y].length !== W) {
            throw new Error(`[${name}] row ${y} length=${layout[y].length} expected=${W}`);
        }
    }
    // must have exactly one P
    const pCount = layout.join("\n").split("P").length - 1;
    if (pCount !== 1) {
        throw new Error(`[${name}] must contain exactly 1 'P' (found ${pCount})`);
    }
    // at least 3 checkpoints
    const cCount = layout.join("\n").split("C").length - 1;
    if (cCount < 3) {
        throw new Error(`[${name}] must contain at least 3 'C' (found ${cCount})`);
    }
}

/** =======================
 *  BUILD 5 LARGE MAPS
 *  ======================= */

function buildRiverTrap(): MapData {
    const g = makeGrid(".");

    // big river band + island gaps
    rect(g, 6, 12, 48, 4, "W");
    rect(g, 28, 13, 4, 2, "."); // bridge gap
    rect(g, 10, 22, 40, 3, "W");
    rect(g, 18, 22, 6, 3, "."); // safe passage

    // brick cover zones
    rect(g, 8, 6, 10, 4, "B");
    rect(g, 42, 28, 10, 4, "B");

    // steel framed room (just walls)
    frame(g, 20, 6, 20, 10, "#");

    // grass patch
    rect(g, 8, 30, 16, 6, "G");

    // spawns / checkpoints / enemies
    place(g, 2, 2, "P");
    place(g, 12, 18, "C");
    place(g, 30, 8, "C");
    place(g, 52, 34, "C");
    place(g, 54, 6, "E");
    place(g, 54, 32, "E");

    const layout = toLayout(g);
    validateMap("River Trap", layout);

    return { id: 0, name: "River Trap", theme: "Water hazards and bridges", layout };
}

function buildGrassland(): MapData {
    const g = makeGrid(".");

    // huge grass field
    rect(g, 2, 2, 56, 18, "G");
    rect(g, 2, 22, 56, 16, "G");

    // clearings
    rect(g, 18, 8, 24, 6, ".");
    rect(g, 30, 28, 18, 6, ".");

    // brick clusters
    rect(g, 6, 26, 10, 6, "B");
    rect(g, 44, 6, 10, 6, "B");

    // checkpoints
    place(g, 10, 10, "C");
    place(g, 30, 18, "C");
    place(g, 48, 30, "C");

    // spawns
    place(g, 2, 2, "P");
    place(g, 54, 34, "E");
    place(g, 50, 10, "E");

    const layout = toLayout(g);
    validateMap("Grassland", layout);

    return { id: 1, name: "Grassland", theme: "Lots of grass slows movement", layout };
}

function buildBrickMaze(): MapData {
    const g = makeGrid(".");

    // fill with brick stripes
    for (let y = 3; y < H - 3; y += 2) {
        rect(g, 2, y, 56, 1, "B");
    }

    // carve vertical corridors
    for (let x = 6; x < W - 6; x += 8) {
        rect(g, x, 2, 2, 36, ".");
    }

    // add some steel blocks as hard obstacles
    rect(g, 24, 14, 12, 6, "#");
    frame(g, 10, 26, 18, 8, "#");

    // ensure paths between checkpoints
    carvePath(g, 2, 2, 8, 8);
    carvePath(g, 8, 8, 30, 18);
    carvePath(g, 30, 18, 50, 32);

    // spawns/checkpoints/enemies
    place(g, 2, 2, "P");
    place(g, 8, 8, "C");
    place(g, 30, 18, "C");
    place(g, 50, 32, "C");
    place(g, 54, 6, "E");
    place(g, 54, 34, "E");

    const layout = toLayout(g);
    validateMap("Brick Maze", layout);

    return { id: 2, name: "Brick Maze", theme: "Destructible brick maze", layout };
}

function buildOpenArena(): MapData {
    const g = makeGrid(".");

    // central steel block
    rect(g, 26, 14, 8, 8, "#");

    // scattered brick covers
    for (let i = 0; i < 10; i++) {
        const x = 6 + i * 5;
        const y = 6 + (i % 4) * 7;
        rect(g, x, y, 2, 2, "B");
    }

    // grass zones on bottom corners
    rect(g, 6, 28, 16, 8, "G");
    rect(g, 38, 28, 16, 8, "G");

    // checkpoints (3+)
    place(g, 12, 20, "C");
    place(g, 46, 12, "C");
    place(g, 30, 34, "C");

    // spawns/enemies
    place(g, 2, 2, "P");
    place(g, 54, 8, "E");
    place(g, 54, 20, "E");
    place(g, 54, 34, "E");

    const layout = toLayout(g);
    validateMap("Open Arena", layout);

    return { id: 3, name: "Open Arena", theme: "Big open battlefield with cover", layout };
}

function buildWaterLabyrinth(): MapData {
    const g = makeGrid(".");

    // water maze walls (inside border)
    rect(g, 6, 6, 48, 2, "W");
    rect(g, 6, 10, 2, 24, "W");
    rect(g, 52, 10, 2, 24, "W");
    rect(g, 10, 34, 44, 2, "W");

    rect(g, 20, 14, 20, 2, "W");
    rect(g, 20, 18, 2, 12, "W");
    rect(g, 38, 18, 2, 12, "W");
    rect(g, 24, 22, 12, 2, "W");

    // carve safe corridors inside maze
    carvePath(g, 2, 2, 8, 8);
    carvePath(g, 8, 8, 14, 30);
    carvePath(g, 14, 30, 48, 30);

    // bricks + grass for variety
    rect(g, 10, 12, 6, 6, "B");
    rect(g, 44, 12, 6, 6, "B");
    rect(g, 26, 26, 8, 6, "G");

    // checkpoints (3+)
    place(g, 12, 28, "C");
    place(g, 30, 20, "C");
    place(g, 48, 32, "C");

    // spawns/enemies
    place(g, 2, 2, "P");
    place(g, 54, 6, "E");
    place(g, 54, 34, "E");

    const layout = toLayout(g);
    validateMap("Water Labyrinth", layout);

    return { id: 4, name: "Water Labyrinth", theme: "Deadly water maze walls", layout };
}

/** Exported maps (TankGame uses MAPS[level].layout and MAPS[level].name) */
export const MAPS: MapData[] = [
    buildRiverTrap(),
    buildGrassland(),
    buildBrickMaze(),
    buildOpenArena(),
    buildWaterLabyrinth(),
];

/**
 * Parse a string-based map into a 2D tile array
 * Returns: { tiles, playerSpawn, enemySpawns, checkpoints }
 */
export function parseMap(layout: string[]) {
    const height = layout.length;
    const width = layout[0]?.length ?? 0;

    const tiles: number[][] = [];
    let playerSpawn = { x: 2, y: 2 };
    const enemySpawns: { x: number; y: number }[] = [];
    const checkpoints: { x: number; y: number }[] = [];

    for (let y = 0; y < height; y++) {
        const row: number[] = [];
        for (let x = 0; x < width; x++) {
            const char = layout[y][x];
            let tile = 0;

            switch (char) {
                case ".":
                    tile = 0;
                    break;
                case "#":
                    tile = 1;
                    break;
                case "B":
                    tile = 2;
                    break;
                case "G":
                    tile = 3;
                    break;
                case "W":
                    tile = 4;
                    break;
                case "P":
                    tile = 0;
                    playerSpawn = { x, y };
                    break;
                case "E":
                    tile = 0;
                    enemySpawns.push({ x, y });
                    break;
                case "C":
                    tile = 0;
                    checkpoints.push({ x, y });
                    break;
                default:
                    tile = 0;
            }

            row.push(tile);
        }
        tiles.push(row);
    }

    return { tiles, playerSpawn, enemySpawns, checkpoints };
}
