import { useState } from 'react';
import { Home, Trophy, LayoutGrid, Gamepad2, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';

interface NavbarProps {
  isLoggedIn?: boolean;
  username?: string;
}

const Navbar = ({ isLoggedIn = false, username = 'John' }: NavbarProps) => {
  const navigate = useNavigate();
  const [gamePin, setGamePin] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pinDialogOpen, setPinDialogOpen] = useState(false);

  const handleLogout = () => {
    // Mock logout - in real app, clear auth state
    navigate('/');
  };

  const handleJoinGame = () => {
    if (gamePin.trim()) {
      toast.success(`Joining game with PIN: ${gamePin}`);
      setPinDialogOpen(false);
      setGamePin('');
    } else {
      toast.error('Please enter a game PIN');
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      toast.success(`Searching for room: ${searchQuery}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 md:gap-2 font-bold text-lg md:text-xl">
            <span className="text-xl md:text-2xl">🎮</span>
            <span className="text-foreground">Quiz<span className="text-primary">Tank</span></span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/">
              <Button variant="nav" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link to="/challenges">
              <Button variant="nav" size="sm" className="gap-2">
                <Trophy className="h-4 w-4" />
                Challenges
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Side */}
        {isLoggedIn ? (
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Nav Links */}
            <div className="flex md:hidden items-center gap-1">
              <Link to="/">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/challenges">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trophy className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Icons */}
            <div className="hidden sm:flex items-center gap-1 md:gap-2">
              {/* Enter Game PIN Dialog */}
              <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8 md:h-10 md:w-10">
                    <LayoutGrid className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90vw] max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle>Enter Game PIN</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 py-4">
                    <Input
                      placeholder="Enter PIN..."
                      value={gamePin}
                      onChange={(e) => setGamePin(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => e.key === 'Enter' && handleJoinGame()}
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    <Button onClick={handleJoinGame} variant="accent">
                      Join Game
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Search Room Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8 md:h-10 md:w-10">
                    <Gamepad2 className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72" align="end">
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium">Search Room</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter room name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-1"
                      />
                      <Button size="icon" variant="accent" onClick={handleSearch}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1 md:gap-2 px-1 md:px-2">
                  <Avatar className="h-7 w-7 md:h-8 md:w-8">
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                      {username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline font-medium text-sm md:text-base">{username}</span>
                  <ChevronDown className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Mobile-only menu items */}
                <DropdownMenuItem className="sm:hidden" onClick={() => setPinDialogOpen(true)}>
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Enter PIN
                </DropdownMenuItem>
                <DropdownMenuItem>My Game</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
                <DropdownMenuItem>Favourite Game</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Create Game Button */}
            <Button variant="accent" size="sm" className="font-semibold text-xs md:text-sm px-2 md:px-4 h-8 md:h-9">
              <span className="hidden sm:inline">Create Game</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-3">
            <Link to="/login">
              <Button variant="navOutline" size="sm" className="text-xs md:text-sm h-8 md:h-9 px-2 md:px-4">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="hero" size="sm" className="text-xs md:text-sm h-8 md:h-9 px-2 md:px-4">
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
