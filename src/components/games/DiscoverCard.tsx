import { Star, HelpCircle, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Game } from "@/types/game";
import { Link } from "react-router-dom";

interface DiscoverCardProps {
  game: Game;
  onBookmark?: (gameId: string) => void;
  isBookmarked?: boolean;
}

export function DiscoverCard({ game, onBookmark, isBookmarked = false }: DiscoverCardProps) {
  const difficultyVariant = {
    easy: "easy",
    medium: "medium",
    hard: "hard",
  } as const;

  return (
    <div className="flex flex-col rounded-xl bg-card overflow-hidden card-shadow">
      {/* Thumbnail */}
      <div className="relative w-full aspect-[4/3] bg-primary/10 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
          <span className="text-3xl font-bold text-primary/40">{game.title.substring(0, 2).toUpperCase()}</span>
        </div>
        {/* Badges on thumbnail */}
        <div className="absolute top-2 left-2">
          <Badge variant="subject" className="text-xs">
            {game.subject}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant={difficultyVariant[game.difficulty]} className="text-xs">
            {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col p-4 gap-2">
        <h3 className="text-base font-semibold text-foreground line-clamp-1">{game.title}</h3>
        
        {game.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {game.description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <div className="flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{game.questions} Question</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-primary font-medium">+{game.xp} XP</span>
          </div>
          {game.rating && (
            <div className="flex items-center gap-1 ml-auto text-warning">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="font-medium">{game.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2">
          <Link to={`/game/${game.id}`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              Play Now
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className={`px-3 ${isBookmarked ? 'text-warning border-warning' : ''}`}
            onClick={() => onBookmark?.(game.id)}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
}
