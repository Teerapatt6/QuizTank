import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Play, 
  Eye, 
  Edit, 
  Trash2, 
  Users,
  Trophy,
  Clock,
  Target,
  BarChart3,
  Globe,
  Lock,
  CalendarDays,
  Star,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
import gameMap from "@/assets/game-map.jpg";
import heroTank from "@/assets/hero-tank.jpg";

interface Game {
  id: number;
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questions: number;
  players: number;
  rating: number;
  status: "published" | "draft";
  image: string;
  createdAt: string;
}

const myGames: Game[] = [
  { id: 1, title: "Math Battle Arena", category: "Mathematics", difficulty: "Medium", questions: 20, players: 156, rating: 4.8, status: "published", image: gameMap, createdAt: "2024-01-15" },
  { id: 2, title: "History Wars", category: "History", difficulty: "Hard", questions: 25, players: 89, rating: 4.6, status: "published", image: heroTank, createdAt: "2024-02-10" },
  { id: 3, title: "Science Quest", category: "Science", difficulty: "Easy", questions: 15, players: 234, rating: 4.9, status: "published", image: gameMap, createdAt: "2024-03-05" },
  { id: 4, title: "Grammar Challenge", category: "Language", difficulty: "Medium", questions: 18, players: 0, rating: 0, status: "draft", image: heroTank, createdAt: "2024-03-20" },
];

// Mock user profile data
const userProfile = {
  displayName: "Wittawin Susutti",
  username: "DSGas",
  avatar: "",
  bio: "Creating fun quiz battles for my class. Love teaching math and science!",
  joinedDate: "2024-01-01",
  badges: ["Creator", "Educator"],
};

const MyGames = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>(myGames);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 5;

  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = games.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(games.length / gamesPerPage);

  const totalPlayers = games.reduce((sum, g) => sum + g.players, 0);
  const avgRating = games.filter(g => g.rating > 0).length > 0
    ? (games.reduce((sum, g) => sum + g.rating, 0) / games.filter(g => g.rating > 0).length).toFixed(1)
    : "0.0";

  const handleDeleteClick = (game: Game) => {
    setSelectedGame(game);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedGame) {
      setGames(games.filter(g => g.id !== selectedGame.id));
      toast.success(`"${selectedGame.title}" has been deleted`);
      setDeleteDialogOpen(false);
      setSelectedGame(null);
    }
  };

  const handleToggleStatus = (gameId: number) => {
    setGames(games.map(game => {
      if (game.id === gameId) {
        const newStatus = game.status === "published" ? "draft" : "published";
        toast.success(`Game ${newStatus === "published" ? "published" : "unpublished"} successfully`);
        return { ...game, status: newStatus };
      }
      return game;
    }));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers with ellipsis for large page counts
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Page Header - Removed New Game button */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Games</h1>
          <p className="text-muted-foreground text-lg">Manage and track your created games</p>
        </div>

        {/* User Profile Section */}
        <Card className="p-6 md:p-8 shadow-neumorphic mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Left Side - Identity */}
            <div className="flex items-start gap-4 flex-1">
              <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-primary/20">
                <AvatarImage src={userProfile.avatar} alt={userProfile.displayName} />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {userProfile.displayName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-0.5">@{userProfile.username}</p>
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">{userProfile.displayName}</h2>
                <p className="text-muted-foreground text-sm md:text-base mb-3 line-clamp-2">{userProfile.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {userProfile.badges.map((badge) => (
                    <Badge key={badge} variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Quick Stats & Actions */}
            <div className="flex flex-col gap-4 md:items-end md:justify-between">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined {new Date(userProfile.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="font-medium">{games.length} games</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-warning" />
                  <span className="font-medium">{totalPlayers} plays</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  <span className="font-medium">{avgRating} avg</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/settings")}
                className="self-start md:self-end"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
          <Card className="p-6 shadow-neumorphic">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{games.length}</p>
                <p className="text-sm text-muted-foreground">Total Games</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 shadow-neumorphic">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{games.filter(g => g.status === "published").length}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 shadow-neumorphic">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalPlayers}</p>
                <p className="text-sm text-muted-foreground">Total Players</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 shadow-neumorphic">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{avgRating}</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Games List */}
        <div className="space-y-4 mb-8">
          {currentGames.map((game, index) => (
            <Card 
              key={game.id} 
              className="p-6 shadow-neumorphic hover-lift transition-smooth animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex gap-6">
                {/* Thumbnail */}
                <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                  <img 
                    src={game.image} 
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                  {game.status === "draft" && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Game Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-foreground">{game.title}</h3>
                        <Badge variant={game.status === "published" ? "default" : "secondary"}>
                          {game.status === "published" ? (
                            <><Globe className="w-3 h-3 mr-1" /> Published</>
                          ) : (
                            <><Lock className="w-3 h-3 mr-1" /> Draft</>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{game.category} • {game.questions} questions</p>
                    </div>
                    {game.rating > 0 && (
                      <div className="flex items-center gap-1 text-warning">
                        <Trophy className="w-5 h-5 fill-warning" />
                        <span className="text-lg font-bold">{game.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      game.difficulty === "Easy" ? "bg-success/10 text-success" :
                      game.difficulty === "Medium" ? "bg-warning/10 text-warning" :
                      "bg-destructive/10 text-destructive"
                    }`}>
                      {game.difficulty}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {game.players} players
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Created {new Date(game.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button onClick={() => navigate("/game-details")} variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button onClick={() => navigate("/gameplay")} variant="game" size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </Button>
                    <Button onClick={() => navigate("/create")} variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Stats
                    </Button>
                    <Button 
                      variant={game.status === "published" ? "secondary" : "default"}
                      size="sm"
                      onClick={() => handleToggleStatus(game.id)}
                    >
                      {game.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClick(game)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Improved Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-10 animate-fade-in">
            <nav className="flex items-center gap-1" aria-label="Pagination">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                  currentPage === 1
                    ? "text-muted-foreground/40 cursor-not-allowed"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page, index) => (
                page === "..." ? (
                  <span key={`ellipsis-${index}`} className="flex items-center justify-center w-10 h-10 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                )
              ))}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                  currentPage === totalPages
                    ? "text-muted-foreground/40 cursor-not-allowed"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </nav>
          </div>
        )}

        {/* Empty State */}
        {games.length === 0 && (
          <Card className="p-12 text-center shadow-elevated animate-fade-in">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">No Games Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start creating engaging quiz games for your students or learners!
              </p>
              <Button onClick={() => navigate("/create")} size="lg">
                Create Your First Game
              </Button>
            </div>
          </Card>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Game?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedGame?.title}"? This action cannot be undone and all game data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyGames;
