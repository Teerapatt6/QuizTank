import { Star, Play, Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Game } from "@/types/game";
import { Link } from "react-router-dom";

interface FavouriteListCardProps {
  game: Game;
}

export function FavouriteListCard({ game }: FavouriteListCardProps) {
  const difficultyVariant = {
    easy: "easy",
    medium: "medium",
    hard: "hard",
  } as const;

  return (
    <div className="flex flex-col md:flex-row gap-4 rounded-xl bg-card p-4 card-shadow">
      {/* Thumbnail */}
      <div className="relative w-full md:w-52 h-36 rounded-lg bg-primary/10 flex-shrink-0 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
          <span className="text-2xl font-bold text-primary/40">{game.title.substring(0, 2).toUpperCase()}</span>
        </div>
        {/* Red flag decoration */}
        <div className="absolute top-0 right-4 w-6 h-10 bg-destructive" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)' }} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{game.title}</h3>
            <div className="mt-1">
              <Badge variant="subject" className="text-xs">
                {game.subject}
              </Badge>
            </div>
          </div>
          {game.rating && (
            <div className="flex items-center gap-1 text-warning">
              <Star className="h-5 w-5 fill-current" />
              <span className="text-base font-medium">{game.rating}</span>
            </div>
          )}
        </div>

        {game.description && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {game.description}
          </p>
        )}

        {/* Stats badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={difficultyVariant[game.difficulty]} className="text-xs">
            {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
          </Badge>
          <Badge variant="outline" className="text-xs bg-background">
            {game.questions} Questions
          </Badge>
          <Badge variant="outline" className="text-xs bg-background">
            +{game.xp} XP
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 mt-auto">
          <Link to={`/game/${game.id}`}>
            <Button variant="primary" size="sm" className="gap-1">
              <Play className="h-4 w-4" />
              Play Now
            </Button>
          </Link>
          <Link to={`/game/${game.id}`}>
            <Button variant="outline" size="sm" className="gap-1">
              <Eye className="h-4 w-4" />
              View
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-1">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
