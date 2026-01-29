import { useState } from "react";
import Navbar from "@/components/Navbar";
import { GameCard } from "@/components/GameCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon, Filter, Hash, X } from "lucide-react";
import gameMap from "@/assets/game-map.jpg";
import heroTank from "@/assets/hero-tank.jpg";

const allGames = [
  { id: 1, title: "Math Battle Arena", category: "Mathematics", difficulty: "Medium" as const, players: 156, rating: 4.8, description: "Test your math skills in this intense battle arena", duration: "15 min", image: gameMap },
  { id: 2, title: "History Wars", category: "History", difficulty: "Hard" as const, players: 89, rating: 4.6, description: "Journey through historical events and battles", duration: "20 min", image: heroTank },
  { id: 3, title: "Science Quest", category: "Science", difficulty: "Easy" as const, players: 234, rating: 4.9, description: "Explore the wonders of science and discovery", duration: "10 min", image: gameMap },
  { id: 4, title: "Geography Challenge", category: "Geography", difficulty: "Medium" as const, players: 178, rating: 4.7, description: "Navigate the world with geography knowledge", duration: "12 min", image: heroTank },
  { id: 5, title: "English Grammar Tank", category: "Language", difficulty: "Easy" as const, players: 201, rating: 4.8, description: "Master English grammar through battle", duration: "15 min", image: gameMap },
  { id: 6, title: "Physics Fusion", category: "Science", difficulty: "Hard" as const, players: 95, rating: 4.5, description: "Dive deep into physics concepts", duration: "25 min", image: heroTank },
];

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [roomCode, setRoomCode] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const filteredGames = allGames.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "all" || game.category === category;
    const matchesDifficulty = difficulty === "all" || game.difficulty === difficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Page Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-4">Discover Games</h1>
          <p className="text-muted-foreground text-lg">Find the perfect quiz battle for your learning journey</p>
        </div>

        {/* Search Bar */}
        <Card className="p-6 mb-8 shadow-elevated animate-fade-in">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by title, category, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-6"
            >
              <Filter className="w-5 h-5 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border animate-fade-in">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Geography">Geography</SelectItem>
                    <SelectItem value="Language">Language</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Difficulty</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Sort By</label>
                <Select defaultValue="popularity">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </Card>

        {/* Quick Join with Room Code */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Hash className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-bold text-foreground">Have a Room Code?</h3>
                <p className="text-sm text-muted-foreground">Join a private game instantly</p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                placeholder="Enter 6-digit code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="md:w-40 font-mono text-center text-lg"
              />
              <Button variant="game" disabled={roomCode.length !== 6}>
                Join Now
              </Button>
            </div>
          </div>
        </Card>

        {/* Active Filters */}
        {(category !== "all" || difficulty !== "all") && (
          <div className="flex items-center gap-2 mb-4 animate-fade-in">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {category !== "all" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCategory("all")}
                className="h-7 gap-1"
              >
                {category}
                <X className="w-3 h-3" />
              </Button>
            )}
            {difficulty !== "all" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDifficulty("all")}
                className="h-7 gap-1"
              >
                {difficulty}
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Found <span className="font-bold text-primary">{filteredGames.length}</span> games
          </p>
        </div>

        {/* Search Results Grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game, index) => (
              <div
                key={game.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <GameCard
                  title={game.title}
                  description={game.description}
                  difficulty={game.difficulty}
                  players={game.players}
                  rating={game.rating}
                  duration={game.duration}
                  imageUrl={game.image}
                  onPlay={() => {}}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center shadow-neumorphic">
            <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
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
      </main>
    </div>
  );
};

export default Search;
