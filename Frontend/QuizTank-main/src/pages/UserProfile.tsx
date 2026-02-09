import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Gamepad2,
    Loader2
} from "lucide-react";
import { gameRoomService } from "@/services/gameRoomService";
import { userService, UserProfile as IUserProfile } from "@/services/userService";
import { GameCard } from "@/components/GameCard";
import { GameFilters } from "@/components/GameFilters";
import { calculateDifficulty } from "@/utils/gameDifficulty";
import { toast } from "sonner";
import coverImg from "@/assets/cover-img.jpg";
import NotFound from "./NotFound";

export default function UserProfile() {
    const navigate = useNavigate();
    const { username } = useParams<{ username: string }>();
    const [games, setGames] = useState<any[]>([]);
    const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotFound, setIsNotFound] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [category, setCategory] = useState("all");
    const [difficulty, setDifficulty] = useState("all");
    const [sortBy, setSortBy] = useState("popularity");
    const [showFilters, setShowFilters] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        if (username) {
            setIsNotFound(false);
            setOffset(0);
            setHasMore(true);
            fetchGames(0);
            fetchUserProfile();
        }
    }, [username, sortBy]);

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200 &&
                !isLoading &&
                !isLoadingMore &&
                hasMore
            ) {
                loadMore();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isLoading, isLoadingMore, hasMore, username]);

    const loadMore = () => {
        setIsLoadingMore(true);
        const newOffset = offset + 12;
        setOffset(newOffset);
        fetchGames(newOffset, true);
    };


    const fetchUserProfile = async () => {
        if (!username) return;
        try {
            const data = await userService.getProfile(username);
            if (data && data.user) {
                setUserProfile(data.user);
            }
        } catch (error: any) {
            console.error("Failed to load user profile", error);
            if (error.response?.status === 404) {
                setIsNotFound(true);
            }
        }
    };

    const fetchGames = async (currentOffset = 0, isLoadMore = false) => {
        if (!username) return;
        if (!isLoadMore) setIsLoading(true);
        try {
            const data = await gameRoomService.getGamesByUsername(username, 12, currentOffset, sortBy);

            if (data.length < 12) setHasMore(false); else setHasMore(true);

            if (isLoadMore) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            const processedGames = data.map((game: any) => {
                const questionCount = Array.isArray(game.questions) ? game.questions.length : 0;

                const gameStats = {
                    questions: questionCount,
                    knowledges: Array.isArray(game.knowledges) ? game.knowledges.length : 0,
                    enemies: game.enemies || 5,
                    duration: Number(game.duration) || 10,
                    hearts: game.hearts || 3,
                    brains: game.brains || 3,
                    initial_ammo: game.initial_ammo || 50,
                    ammo_per_correct: game.ammo_per_correct || 5
                };

                const diffResult = calculateDifficulty(gameStats);

                return {
                    ...game,
                    gameStats,
                    difficulty: diffResult.level,
                    rating: game.rating || 0,
                    play_count: game.play_count || 0,
                    rating_count: game.rating_count || 0,
                    imageUrl: game.cover_image || coverImg,
                    isFavourite: game.is_favourite
                };
            });

            if (isLoadMore) {
                setGames((prev) => [...prev, ...processedGames]);
            } else {
                setGames(processedGames);
            }
        } catch (error) {
            console.error("Failed to fetch user games:", error);
            toast.error("Failed to load games");
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    const filteredGames = games.filter(game => {
        const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (game.category && game.category.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = category === "all" || game.category === category;
        const matchesDifficulty = difficulty === "all" || game.difficulty === difficulty;

        return matchesSearch && matchesCategory && matchesDifficulty;
    });

    if (isNotFound) {
        return <NotFound />;
    }

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            <div className="container mx-auto px-4 py-8">
                {/* User Info Header */}
                <div className="flex items-center gap-6 md:gap-8 mb-10">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 border-2 border-white shadow-lg">
                        <AvatarImage src={userProfile?.profile_pic_url} className="object-cover" />
                        <AvatarFallback className="text-4xl bg-muted text-muted-foreground">
                            {username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="text-left space-y-2 flex-1 min-w-0">
                        <div>
                            <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">
                                {userProfile?.full_name || username}
                            </h1>
                            <p className="text-primary font-medium text-sm md:text-base">@{username}</p>
                        </div>

                        {userProfile?.biography && (
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed line-clamp-2 break-words">
                                {userProfile.biography}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mb-10">
                    <GameFilters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        category={category}
                        onCategoryChange={setCategory}
                        difficulty={difficulty}
                        onDifficultyChange={setDifficulty}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        showFilters={showFilters}
                        onToggleFilters={() => setShowFilters(!showFilters)}
                    />
                </div>
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredGames.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Gamepad2 className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No games found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">
                            This user hasn't created any public games yet
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredGames.map((game) => (
                            <GameCard
                                key={game.id}
                                id={game.id}
                                name={game.name}
                                description={game.description}
                                imageUrl={game.imageUrl}
                                category={game.category}
                                gameStats={game.gameStats}
                                rating={game.rating}
                                onPlay={() => navigate(`/game/${(game as any).gameCode || game.id}`)}
                                isFavourite={game.isFavourite}
                                isAiGenerated={!!game.ai_generated}
                            />
                        ))}
                    </div>
                )}
                {isLoadingMore && (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}
            </div>
        </div>
    );
}
