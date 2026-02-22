import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { gameRoomService } from '@/services/gameRoomService';
import { gameService } from '@/services/gameService';
import { toast } from 'sonner';

const PlayPage = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Play State
    const [playStatus, setPlayStatus] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [playId, setPlayId] = useState<number | null>(null);
    const [counter, setCounter] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [showExitDialog, setShowExitDialog] = useState(false);

    // Refs for event listeners
    const playingRef = useRef(false);
    const playIdRef = useRef<number | null>(null);
    const counterRef = useRef(0);

    useEffect(() => {
        playingRef.current = playStatus === 'playing';
        playIdRef.current = playId;
        counterRef.current = counter;
    }, [playStatus, playId, counter]);

    useEffect(() => {
        const fetchGame = async () => {
            try {
                if (!code) return;
                const data = await gameRoomService.getGame(code);
                setGame(data);
            } catch (error) {
                console.error("Failed to load game", error);
                toast.error("Failed to load game details");
            } finally {
                setLoading(false);
            }
        };
        fetchGame();
    }, [code]);

    const startTimer = () => {
        setCounter(0);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCounter(c => c + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => stopTimer();
    }, []);

    // 1. Browser Refresh / Close Handling (Native Dialog)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (playingRef.current) {
                e.preventDefault();
                e.returnValue = ''; // Shows native browser warning
            }
        };

        const handleUnload = () => {
            if (playingRef.current && playIdRef.current) {
                const token = localStorage.getItem('token');
                const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                const url = `${apiBase}/game-plays/${playIdRef.current}/end`;

                const data = {
                    status: 4, // Canceled
                    completionTime: counterRef.current
                };

                fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data),
                    keepalive: true
                }).catch(err => console.error("Failed to update status on unload", err));
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('pagehide', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('pagehide', handleUnload);
        };
    }, []);

    // 2. Back Button Handling (Custom Popup)
    useEffect(() => {
        // Push state when playing starts to intercept back button
        if (playStatus === 'playing') {
            window.history.pushState(null, '', window.location.href);
        }

        const handlePopState = (event: PopStateEvent) => {
            if (playingRef.current) {
                // Prevent navigation by pushing state again
                window.history.pushState(null, '', window.location.href);
                // Show our custom warning
                setShowExitDialog(true);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [playStatus]);

    const handleConfirmExit = async () => {
        setShowExitDialog(false);
        stopTimer();

        // Update status to Canceled
        if (playId) {
            try {
                await gameService.endPlay(playId, 4, counter);
            } catch (e) {
                console.error(e);
            }
        }

        // Update state so we don't intercept anymore
        setPlayStatus('finished');

        // Navigate away (Back to game details)
        if (code) {
            navigate(`/game/${code}`);
        } else {
            navigate(-1);
        }
    };

    const handleCancelExit = () => {
        setShowExitDialog(false);
    };

    const handleStartGame = async () => {
        if (!game) return;
        try {
            const play = await gameService.startPlay(game.id);
            setPlayId(play.id);
            setPlayStatus('playing');
            startTimer();
            toast.info("Game Started!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to start game session");
        }
    };

    const handleEndGame = async (status: number) => { // 2=Win, 3=Lost, 4=Cancel
        if (!playId) return;
        stopTimer();
        try {
            const result = await gameService.endPlay(playId, status, counter);
            setPlayStatus('finished');

            if (status === 2) {
                if (result.xp_awarded) {
                    toast.success(`You Won! +${result.xp_awarded} XP`);
                } else {
                    toast.success("You Won!");
                }
            }
            else if (status === 3) toast.error("You Lost!");
            else toast.info("Game Canceled");

        } catch (error) {
            console.error(error);
            toast.error("Failed to update game status");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading game...</div>;
    if (!game) return <div className="p-10 text-center">Game not found</div>;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="container mx-auto max-w-2xl py-20 px-4">
            <AlertDialog open={showExitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your game progress will be lost and marked as canceled.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelExit}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmExit} className="bg-red-500 hover:bg-red-600">
                            Leave Game
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Card className="shadow-lg border-2">
                <CardContent className="p-8 text-center space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{game.name}</h1>
                        <p className="text-muted-foreground">{game.category}</p>
                    </div>

                    <div className="flex justify-center">
                        <div className="text-6xl font-mono font-bold tracking-wider bg-slate-100 px-6 py-4 rounded-xl border border-slate-200">
                            {formatTime(counter)}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {playStatus !== 'playing' ? (
                            <Button
                                size="lg"
                                className="w-full text-lg h-14"
                                onClick={handleStartGame}
                            >
                                {playStatus === 'idle' ? "Start Game" : "Play Again"}
                            </Button>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                <Button
                                    className="h-24 text-lg bg-green-500 hover:bg-green-600 border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all"
                                    onClick={() => handleEndGame(2)}
                                >
                                    WON
                                </Button>
                                <Button
                                    className="h-24 text-lg bg-red-500 hover:bg-red-600 border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all"
                                    onClick={() => handleEndGame(3)}
                                >
                                    LOST
                                </Button>
                                <Button
                                    className="h-24 text-lg bg-gray-500 hover:bg-gray-600 border-b-4 border-gray-700 active:border-b-0 active:translate-y-1 transition-all"
                                    onClick={() => handleEndGame(4)}
                                >
                                    CANCEL
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PlayPage;
