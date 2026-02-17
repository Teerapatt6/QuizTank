import { useState } from "react";
import TankGame, { HudPayload } from "./games/TankGame";

/**
 * Sample parent component demonstrating how to integrate TankGame
 * with an external top navigation bar HUD.
 */
export default function GamePage() {
    const [hudData, setHudData] = useState<HudPayload>({
        level: 1,
        totalLevels: 5,
        levelName: "",
        ammo: 10,
        hearts: 3,
        enemies: 0,
        timeMs: 0
    });

    // Format time from milliseconds to MM:SS
    const formatTime = (ms: number): string => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Top Navigation Bar with HUD */}
            <nav className="bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Left: Game Title */}
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-white">🎮 QuizTank</h1>
                            <div className="hidden sm:block text-sm text-gray-400">
                                {hudData.levelName}
                            </div>
                        </div>

                        {/* Right: HUD Stats */}
                        <div className="flex items-center gap-6">
                            {/* Level */}
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🗺️</span>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 uppercase tracking-wide">Level</span>
                                    <span className="text-lg font-bold text-blue-400">
                                        {hudData.level}/{hudData.totalLevels}
                                    </span>
                                </div>
                            </div>

                            <div className="w-px h-8 bg-white/20" />

                            {/* Timer */}
                            <div className="flex items-center gap-2">
                                <span className="text-xl">⏱️</span>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 uppercase tracking-wide">Time</span>
                                    <span className="text-lg font-bold text-green-400">
                                        {formatTime(hudData.timeMs)}
                                    </span>
                                </div>
                            </div>

                            <div className="w-px h-8 bg-white/20" />

                            {/* Ammo */}
                            <div className="flex items-center gap-2">
                                <span className="text-xl">⚡</span>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 uppercase tracking-wide">Ammo</span>
                                    <span className="text-lg font-bold text-yellow-400">{hudData.ammo}</span>
                                </div>
                            </div>

                            <div className="w-px h-8 bg-white/20" />

                            {/* Hearts */}
                            <div className="flex items-center gap-2">
                                <span className="text-xl">❤️</span>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 uppercase tracking-wide">Hearts</span>
                                    <span className="text-lg font-bold text-red-400">{hudData.hearts}</span>
                                </div>
                            </div>

                            <div className="w-px h-8 bg-white/20" />

                            {/* Enemies */}
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🎯</span>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 uppercase tracking-wide">Targets</span>
                                    <span className="text-lg font-bold text-purple-400">{hudData.enemies}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Game Container */}
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
                <TankGame onHudChange={setHudData} />
            </div>
        </div>
    );
}
