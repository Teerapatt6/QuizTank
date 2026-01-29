import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { GameCard } from "@/components/GameCard";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Hash, Tag, ChevronDown, Filter, ArrowUpDown } from "lucide-react";
import gameMap from "@/assets/game-map.jpg";
import heroTank from "@/assets/hero-tank.jpg";

// All available tags with game counts
const allTags = [
  { name: "math", count: 12 },
  { name: "science", count: 8 },
  { name: "history", count: 5 },
  { name: "geography", count: 7 },
  { name: "english", count: 10 },
  { name: "technology", count: 6 },
  { name: "programming", count: 4 },
  { name: "physics", count: 5 },
  { name: "chemistry", count: 3 },
  { name: "biology", count: 4 },
  { name: "literature", count: 3 },
  { name: "algebra", count: 6 },
  { name: "calculus", count: 4 },
  { name: "geometry", count: 5 },
  { name: "statistics", count: 2 },
  { name: "coding", count: 8 },
  { name: "python", count: 5 },
  { name: "javascript", count: 4 },
  { name: "art", count: 3 },
  { name: "music", count: 2 },
];

// Sample games data
const allGames = [
  { id: 1, title: "Math Battle Arena", category: "Mathematics", difficulty: "Medium" as const, players: 156, rating: 4.8, description: "Test your math skills in this intense battle arena", duration: "15 min", image: gameMap, tags: ["math", "algebra"] },
  { id: 2, title: "History Wars", category: "History", difficulty: "Hard" as const, players: 89, rating: 4.6, description: "Journey through historical events and battles", duration: "20 min", image: heroTank, tags: ["history"] },
  { id: 3, title: "Science Quest", category: "Science", difficulty: "Easy" as const, players: 234, rating: 4.9, description: "Explore the wonders of science and discovery", duration: "10 min", image: gameMap, tags: ["science", "physics", "chemistry"] },
  { id: 4, title: "Geography Challenge", category: "Geography", difficulty: "Medium" as const, players: 178, rating: 4.7, description: "Navigate the world with geography knowledge", duration: "12 min", image: heroTank, tags: ["geography"] },
  { id: 5, title: "English Grammar Tank", category: "Language", difficulty: "Easy" as const, players: 201, rating: 4.8, description: "Master English grammar through battle", duration: "15 min", image: gameMap, tags: ["english", "literature"] },
  { id: 6, title: "Physics Fusion", category: "Science", difficulty: "Hard" as const, players: 95, rating: 4.5, description: "Dive deep into physics concepts", duration: "25 min", image: heroTank, tags: ["science", "physics"] },
  { id: 7, title: "Calculus Challenge", category: "Mathematics", difficulty: "Hard" as const, players: 67, rating: 4.4, description: "Advanced calculus problems await", duration: "30 min", image: gameMap, tags: ["math", "calculus"] },
  { id: 8, title: "Python Basics", category: "Technology", difficulty: "Easy" as const, players: 312, rating: 4.9, description: "Learn Python programming fundamentals", duration: "20 min", image: heroTank, tags: ["technology", "programming", "python", "coding"] },
];

const Tags = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
  const [selectedTag, setSelectedTag] = useState<string | null>(searchParams.get("tag") || null);
  const [difficulty, setDifficulty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");

  // Sync URL params with state on mount
  useEffect(() => {
    const queryParam = searchParams.get("query");
    const tagParam = searchParams.get("tag");
    if (queryParam) {
      setSearchQuery(queryParam);
    }
    if (tagParam) {
      setSelectedTag(tagParam);
    }
  }, [searchParams]);

  // Filter tags based on search
  const filteredTags = allTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter and sort games based on selected tag, difficulty, and sort
  const getFilteredGames = () => {
    let games = selectedTag
      ? allGames.filter((game) => game.tags.includes(selectedTag))
      : [];

    // Apply difficulty filter
    if (difficulty !== "all") {
      games = games.filter((game) => game.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    // Apply sorting
    switch (sortBy) {
      case "popular":
        games = [...games].sort((a, b) => b.players - a.players);
        break;
      case "newest":
        games = [...games].sort((a, b) => b.id - a.id);
        break;
      case "oldest":
        games = [...games].sort((a, b) => a.id - b.id);
        break;
    }

    return games;
  };

  const filteredGames = getFilteredGames();

  // Similar tags suggestions
  const getSimilarTags = () => {
    if (!searchQuery) return [];
    return allTags
      .filter((tag) => tag.name.includes(searchQuery.toLowerCase()) && tag.name !== searchQuery.toLowerCase())
      .slice(0, 5);
  };

  const handleTagClick = (tagName: string) => {
    setSelectedTag(tagName);
    setSearchQuery("");
    setSearchParams({ tag: tagName });
  };

  const clearSelection = () => {
    setSelectedTag(null);
    setSearchQuery("");
    setSearchParams({});
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedTag(null);
    if (value) {
      setSearchParams({ query: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tags</h1>
          <p className="text-gray-500">Discover games by topic</p>
        </div>

        {/* Search Bar + Filters Row */}
        <Card className="p-4 mb-6 shadow-sm border-gray-100 bg-white">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search #tags"
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-12 h-12 text-lg border-gray-200 focus:border-blue-300"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex gap-2">
              {/* Difficulty Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-4 gap-2 border-gray-200 hover:bg-gray-50">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {difficulty === "all" ? "Difficulty" : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuRadioGroup value={difficulty} onValueChange={setDifficulty}>
                    <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="easy">Easy</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="medium">Medium</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="hard">Hard</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort By Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-4 gap-2 border-gray-200 hover:bg-gray-50">
                    <ArrowUpDown className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {sortBy === "popular" ? "Most Popular" : sortBy === "newest" ? "Newest First" : "Oldest First"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                    <DropdownMenuRadioItem value="popular">Most Popular</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">Oldest First</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Similar Tags Suggestion */}
          {searchQuery && getSimilarTags().length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Did you mean:</p>
              <div className="flex flex-wrap gap-2">
                {getSimilarTags().map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => handleTagClick(tag.name)}
                    className="text-[#007BFF] hover:underline text-sm"
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          {selectedTag ? (
            <div className="flex items-center gap-2">
              <p className="text-gray-600">
                Showing games tagged with{" "}
                <span className="font-semibold text-[#007BFF]">#{selectedTag}</span>
                {difficulty !== "all" && (
                  <span className="text-gray-500"> • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} difficulty</span>
                )}
              </p>
              <button
                onClick={clearSelection}
                className="text-sm text-gray-400 hover:text-gray-600 underline"
              >
                Clear
              </button>
            </div>
          ) : (
            <p className="text-gray-600">
              {searchQuery ? (
                <>Showing tags related to <span className="font-semibold text-[#007BFF]">#{searchQuery}</span></>
              ) : (
                <>Found <span className="font-bold text-[#007BFF]">{filteredTags.length}</span> tags</>
              )}
            </p>
          )}
        </div>

        {/* Content */}
        {selectedTag ? (
          // Show games for selected tag
          <>
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGames.map((game, index) => (
                  <div
                    key={game.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <GameCard
                      title={game.title}
                      description={game.description}
                      difficulty={game.difficulty}
                      players={game.players}
                      rating={game.rating}
                      duration={game.duration}
                      imageUrl={game.image}
                      onPlay={() => navigate("/gameplay")}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center shadow-sm border-gray-100 bg-white">
                <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No games found</h3>
                <p className="text-gray-500 mb-4">
                  {difficulty !== "all" 
                    ? `No ${difficulty} difficulty games are tagged with #${selectedTag}`
                    : `No games are tagged with #${selectedTag}`
                  }
                </p>
                {difficulty !== "all" && (
                  <Button
                    variant="outline"
                    onClick={() => setDifficulty("all")}
                    className="text-[#007BFF] border-[#007BFF] hover:bg-blue-50"
                  >
                    Clear difficulty filter
                  </Button>
                )}
              </Card>
            )}
          </>
        ) : (
          // Show tag chips grid
          <>
            {filteredTags.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {filteredTags.map((tag, index) => (
                  <button
                    key={tag.name}
                    onClick={() => handleTagClick(tag.name)}
                    className="animate-fade-in group"
                    style={{ animationDelay: `${index * 0.02}s` }}
                  >
                    <Badge
                      variant="outline"
                      className="px-4 py-2 text-sm bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-[#007BFF] transition-all cursor-pointer group-hover:shadow-md"
                    >
                      <Hash className="w-3 h-3 mr-1 opacity-50" />
                      {tag.name}
                      <span className="ml-2 text-gray-400 group-hover:text-blue-400">
                        ({tag.count})
                      </span>
                    </Badge>
                  </button>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center shadow-sm border-gray-100 bg-white">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No tags found</h3>
                <p className="text-gray-500 mb-4">
                  Try a different keyword
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchParams({});
                  }}
                  className="text-[#007BFF] hover:underline"
                >
                  Clear search
                </button>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Tags;
