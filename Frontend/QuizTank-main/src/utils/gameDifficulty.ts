export interface GameStats {
    questions: number;
    knowledges: number;
    enemies: number;
    duration: number;
    hearts: number;
    brains: number;
    initial_ammo: number;
    ammo_per_correct: number;
}

export type DifficultyLevel = "Very Easy" | "Easy" | "Medium" | "Hard" | "Very Hard";

export interface DifficultyResult {
    level: DifficultyLevel;
    xp: number;
    score: number;
    color: string;
}

export const getDifficultyColor = (level: string): string => {
    switch (level) {
        case "Very Easy":
            return "bg-green-500 text-white border-green-500";
        case "Easy":
            return "bg-teal-500 text-white border-teal-500";
        case "Medium":
            return "bg-blue-500 text-white border-blue-500";
        case "Hard":
            return "bg-orange-500 text-white border-orange-500";
        case "Very Hard":
            return "bg-red-500 text-white border-red-500";
        default:
            return "bg-gray-500 text-white border-gray-500";
    }
};

export const calculateDifficulty = (stats: GameStats): DifficultyResult => {
    // Weights for "High Value = Hard"
    // Questions: More questions = fatigue/endurance (Weight: 1.5)
    // Enemies: More enemies = more management (Weight: 2.0)
    const scoreHigh = (stats.questions * 1.5) + (stats.enemies * 2.0);

    // Weights for "Low Value = Hard" (Inams)
    // Using inverse proportionally or difference from a baseline.
    // Let's use simple inversions with limits to avoid Infinity.

    // Knowledges: Less knowledge = less help. (Base 5. Score += 10 if < 2?)
    // Let's use: 10 / max(1, knowledges)
    const sKnowledges = 10 / Math.max(1, stats.knowledges);

    // Duration: Less time = stressful.
    // Assume standard is 10 mins. 
    // Score += 20 / max(1, duration) * 2 ?
    // If duration 1 min -> 20 pts. 10 mins -> 2 pts.
    const sDuration = 20 / Math.max(0.5, stats.duration);

    // Hearts: Less lives.
    // 1 heart -> 30 pts. 3 hearts -> 10 pts.
    const sHearts = 30 / Math.max(1, stats.hearts);

    // Brains (Mistakes): Less brains.
    // 1 brain -> 20 pts. 5 brains -> 4 pts.
    const sBrains = 20 / Math.max(1, stats.brains);

    // Initial Ammo:
    // 10 ammo -> 10 pts. 50 ammo -> 2 pts.
    const sInitAmmo = 100 / Math.max(10, stats.initial_ammo);

    // Ammo per correct:
    // 1 ammo/correct -> 20 pts. 5 ammo/correct -> 4 pts.
    const sAmmoPer = 20 / Math.max(1, stats.ammo_per_correct);

    const totalScore = scoreHigh + sKnowledges + sDuration + sHearts + sBrains + sInitAmmo + sAmmoPer;

    // Determine Level based on Total Score
    let level: DifficultyLevel = "Medium";
    let xp = 200;

    if (totalScore < 35) {
        level = "Very Easy";
        xp = 50;
    } else if (totalScore < 50) {
        level = "Easy";
        xp = 100;
    } else if (totalScore < 70) {
        level = "Medium";
        xp = 200;
    } else if (totalScore < 90) {
        level = "Hard";
        xp = 300;
    } else {
        level = "Very Hard";
        xp = 500;
    }

    return {
        level,
        xp,
        score: totalScore,
        color: getDifficultyColor(level)
    };
};
