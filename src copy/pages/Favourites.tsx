import { useState } from "react";
import Navbar from "@/components/Navbar";
import { GameCard } from "@/components/GameCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon, Heart, X, Sparkles, Grid3x3, List, Play, Eye, Share2, Star } from "lucide-react";
import gameMap from "@/assets/game-map.jpg";
import heroTank from "@/assets/hero-tank.jpg";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const favouriteGames = [
  { id: 1, title: "Math Battle Arena", category: "Mathematics", difficulty: "Medium" as const, players: 156, rating: 4.8, description: "Test your math skills in this intense battle arena", duration: "15 min", image: gameMap },
  { id: 2, title: "History Wars", category: "History", difficulty: "Hard" as const, players: 89, rating: 4.6, description: "Journey through historical events and battles", duration: "20 min", image: heroTank },
  { id: 3, title: "Science Quest", category: "Science", difficulty: "Easy" as const, players: 234, rating: 4.9, description: "Explore the wonders of science and discovery", duration: "10 min", image: gameMap },
  { id: 4, title: "English Grammar Tank", category: "Language", difficulty: "Easy" as const, players: 201, rating: 4.8, description: "Master English grammar through battle", duration: "15 min", image: gameMap },
  { id: 5, title: "Geography Challenge", category: "Geography", difficulty: "Medium" as const, players: 167, rating: 4.7, description: "Explore the world through interactive challenges", duration: "18 min", image: heroTank },
];

const Favourites = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [games, setGames] = useState(favouriteGames);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "all" || game.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleRemoveFavourite = (gameId: number, gameTitle: string) => {
    setGames(games.filter(game => game.id !== gameId));
    toast.success(`Removed "${gameTitle}" from favourites`);
  };

  const handlePlayNow = () => {
    navigate("/gameplay");
  };

  const handleViewDetails = () => {
    navigate("/game-details");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Page Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-10 h-10 text-primary fill-primary" />
            <h1 className="text-4xl font-bold text-foreground">My Favourites</h1>
          </div>
          <p className="text-muted-foreground text-lg">Your saved games, ready to play anytime</p>
        </div>

        {/* Search, Filter, and View Toggle */}
        <Card className="p-6 mb-8 shadow-elevated animate-fade-in">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search your favourite games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Category" />
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
          </div>

          {/* Stats and View Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">{games.length}</span> Saved Games
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">{filteredGames.length}</span> Showing
                </span>
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Games Display */}
        {filteredGames.length > 0 ? (
          <>
            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {filteredGames.map((game, index) => (
                  <div key={game.id} className="relative group" style={{ animationDelay: `${index * 50}ms` }}>
                    <GameCard
                      title={game.title}
                      description={game.description}
                      difficulty={game.difficulty}
                      players={game.players}
                      duration={game.duration}
                      rating={game.rating}
                      imageUrl={game.image}
                      onPlay={handlePlayNow}
                    />
                    
                    {/* Remove Button */}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavourite(game.id, game.title);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-4 animate-fade-in">
                {filteredGames.map((game, index) => (
                  <Card 
                    key={game.id} 
                    className="p-6 shadow-neumorphic hover-lift group transition-smooth"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex gap-6">
                      {/* Thumbnail */}
                      <div className="relative w-48 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                        <img 
                          src={game.image} 
                          alt={game.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Game Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-2xl font-bold text-foreground mb-1">{game.title}</h3>
                            <p className="text-sm text-muted-foreground">{game.category}</p>
                          </div>
                          <div className="flex items-center gap-1 text-warning">
                            <Star className="w-5 h-5 fill-warning" />
                            <span className="text-lg font-bold">{game.rating}</span>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-4">{game.description}</p>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-3 mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            game.difficulty === "Easy" ? "bg-success/10 text-success" :
                            game.difficulty === "Medium" ? "bg-warning/10 text-warning" :
                            "bg-destructive/10 text-destructive"
                          }`}>
                            {game.difficulty}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground">
                            {game.players} players
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground">
                            {game.duration}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button onClick={handlePlayNow} variant="game" size="sm">
                            <Play className="w-4 h-4 mr-2" />
                            Play
                          </Button>
                          <Button onClick={handleViewDetails} variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveFavourite(game.id, game.title)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          // Empty State
          <Card className="p-12 text-center shadow-elevated animate-fade-in">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">No Favourites Found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || category !== "all" 
                  ? "No games match your search criteria. Try adjusting your filters."
                  : "You haven't saved any games yet. Explore and add your favourite games to play them anytime!"}
              </p>
              <div className="flex gap-3 justify-center">
                {(searchQuery || category !== "all") && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setCategory("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                <Button onClick={() => navigate("/search")}>
                  <SearchIcon className="w-4 h-4 mr-2" />
                  Browse Games
                </Button>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Favourites;
