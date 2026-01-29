import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, Trophy, Search, Gamepad2, ChevronDown, LogOut, Settings, Heart, GamepadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface NavbarProps {
  isLoggedIn?: boolean;
  username?: string;
}

const Navbar = ({ isLoggedIn = false, username = "John" }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [gamePin, setGamePin] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pinDialogOpen, setPinDialogOpen] = useState(false);

  const handleLogout = () => {
    // Mock logout - in real app, clear auth state
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleJoinGame = () => {
    if (gamePin.trim()) {
      toast.success(`Joining game with PIN: ${gamePin}`);
      setPinDialogOpen(false);
      setGamePin("");
    } else {
      toast.error("Please enter a game PIN");
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, label }: { to: string; icon: typeof Home; label: string }) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive(to)
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
            <span className="text-2xl">🎮</span>
          </div>
          <span className="text-xl font-bold text-foreground hidden sm:block">QuizTank</span>
        </Link>

        {/* Nav Links - Desktop */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" icon={Home} label="Home" />
          <NavLink to="/search" icon={Search} label="Search" />
          <NavLink to="/daily-challenge" icon={Trophy} label="Challenges" />
        </div>

        {/* Right Side */}
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            {/* Mobile Nav Links */}
            <div className="flex md:hidden items-center gap-1">
              <Link
                to="/"
                className={`p-2 rounded-lg ${isActive("/") ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
              >
                <Home className="w-5 h-5" />
              </Link>
              <Link
                to="/daily-challenge"
                className={`p-2 rounded-lg ${isActive("/daily-challenge") ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
              >
                <Trophy className="w-5 h-5" />
              </Link>
            </div>

            {/* Enter Game PIN Dialog */}
            <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Gamepad2 className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Enter Game PIN</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <Input
                    placeholder="Enter 6-digit PIN"
                    value={gamePin}
                    onChange={(e) => setGamePin(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && handleJoinGame()}
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                    inputMode="numeric"
                  />
                  <Button onClick={handleJoinGame} className="w-full">
                    Join Game
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Search Room Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Search className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Search Games</h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search games..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1"
                    />
                    <Button size="icon" onClick={handleSearch}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline font-medium">{username}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* Mobile-only menu items */}
                <DropdownMenuItem
                  className="md:hidden"
                  onClick={() => setPinDialogOpen(true)}
                >
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Enter PIN
                </DropdownMenuItem>
                <DropdownMenuSeparator className="md:hidden" />
                <DropdownMenuItem onClick={() => navigate("/my-games")}>
                  <GamepadIcon className="w-4 h-4 mr-2" />
                  My Games
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/favourites")}>
                  <Heart className="w-4 h-4 mr-2" />
                  Favourites
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Create Game Button */}
            <Link to="/create">
              <Button variant="game" className="hidden sm:flex">
                Create Game
              </Button>
              <Button variant="game" size="sm" className="sm:hidden">
                Create
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" className="font-medium">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="game">Register</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
