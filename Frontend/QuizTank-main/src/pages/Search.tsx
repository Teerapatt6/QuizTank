import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GameCard } from "@/components/GameCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gamepad2, Search as SearchIcon, Loader2 } from "lucide-react";
import { GameFilters } from "@/components/GameFilters";
import { gameRoomService } from "@/services/gameRoomService";
import { calculateDifficulty } from "@/utils/gameDifficulty";
import coverImg from "@/assets/cover-img.jpg";
import { toast } from "sonner";

const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [showFilters, setShowFilters] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    // Check for search query updates
    setOffset(0);
    setHasMore(true);
    // Debounce search
    const timer = setTimeout(() => {
      fetchGames(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, sortBy]);

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
  }, [isLoading, isLoadingMore, hasMore, searchQuery]);

  const loadMore = () => {
    setIsLoadingMore(true);
    const newOffset = offset + 12;
    setOffset(newOffset);
    fetchGames(newOffset, true);
  };


  const fetchGames = async (currentOffset = 0, isLoadMore = false) => {
    if (!isLoadMore) setIsLoading(true);
    try {
      let data;
      if (searchQuery.trim()) {
        data = await gameRoomService.searchGames(searchQuery, 12, currentOffset, sortBy);
      } else {
        if (!isLoadMore) {
          setGames([]);
          setIsLoading(false);
          return;
        }
        // Assuming Load More works for general/public games if no query?
        // If no query, we showed "Find a Game" card.
        // So loadMore shouldn't happen?
        // But wait, if user lands on /search and sees "Find Game", there is NO LIST.
        // So scroll doesn't trigger load more.
        // But what if user clears query?
        // If query is empty, we don't fetch public games anymore (per step 10123 logic).
        // So infinite scroll only applies when there IS a query.
        data = [];
      }

      if (data.length < 12) setHasMore(false); else setHasMore(true);

      if (isLoadMore) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const processed = data.map((g: any) => {
        const qCount = Array.isArray(g.questions) ? g.questions.length : 0;

        const gameStats = {
          questions: qCount,
          knowledges: Array.isArray(g.knowledges) ? g.knowledges.length : 0,
          enemies: g.enemies || 5,
          duration: Number(g.duration) || 10,
          hearts: g.hearts || 3,
          brains: g.brains || 3,
          initial_ammo: g.initial_ammo || 50,
          ammo_per_correct: g.ammo_per_correct || 5
        };

        return {
          id: g.id,
          title: g.name,
          category: g.category,
          gameStats, // Pass stats object
          difficulty: calculateDifficulty(gameStats).level,
          rating: g.rating || 0,
          ratingCount: g.rating_count || 0,
          play_count: g.play_count || 0,
          description: g.description,
          image: g.cover_image || coverImg,
          isFavourite: g.is_favourite,
          isAiGenerated: !!g.ai_generated,
          gameCode: g.gameCode,
          created_at: g.created_at
        };
      });
      if (isLoadMore) {
        setGames((prev) => [...prev, ...processed]);
      } else {
        setGames(processed);
      }
    } catch (error) {
      console.error("Failed to fetch games:", error);
      toast.error("Failed to load games");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const filteredGames = games.filter((game) => {
    // Search query is handled server-side
    const matchesCategory = category === "all" || game.category === category;
    const matchesDifficulty = difficulty === "all" || game.difficulty === difficulty;
    return matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-8 pb-20">
        {/* Page Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-4">Discover Games</h1>
          <p className="text-muted-foreground text-lg">Find the perfect quiz battle for your learning journey</p>
        </div>

        {/* Search Bar and Filters Card*/}
        {/* Search Bar and Filters */}
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

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Found <span className="font-bold text-primary">{filteredGames.length}</span> games
          </p>
        </div>

        {/* Search Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !searchQuery.trim() ? (
          <Card className="p-12 text-center shadow-neumorphic">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Find a Game</h3>
            <p className="text-muted-foreground mb-6">
              Search for games by name, category, or tags to start playing
            </p>
          </Card>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game, index) => (
              <div
                key={game.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <GameCard
                  id={game.id}
                  name={game.title}
                  description={game.description}
                  imageUrl={game.image}
                  category={game.category}
                  gameStats={game.gameStats}
                  rating={game.rating}
                  ratingCount={game.ratingCount}
                  isFavourite={game.isFavourite}
                  isAiGenerated={game.isAiGenerated}
                  onPlay={() => navigate(`/game/${game.gameCode || game.id}`)}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center shadow-neumorphic">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gamepad2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No games found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters to find more games
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setCategory("all");
                setDifficulty("all");
              }}
            >
              Clear All Filters
            </Button>
          </Card>
        )}
        {isLoadingMore && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
