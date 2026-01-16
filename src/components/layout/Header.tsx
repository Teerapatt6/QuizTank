import { Link, useLocation } from "react-router-dom";
import { Home, Target, LayoutGrid, Gamepad2, ChevronDown, Heart, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const location = useLocation();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary bg-card">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Gamepad2 className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground">QuizTank</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link 
            to="/challenges" 
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === '/challenges' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Target className="h-4 w-4" />
            Challenges
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <LayoutGrid className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/my-games" className="flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  My Games
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/favourites" className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  Favourites
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Gamepad2 className="h-5 w-5" />
          </button>
          
          {/* User */}
          <button className="flex items-center gap-2 text-sm font-medium">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-xs">J</span>
            </div>
            <span className="hidden sm:inline">John</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Create Game Button */}
          <Link to="/create">
            <Button variant="primary" size="sm" className="gap-1">
              Create Game
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
