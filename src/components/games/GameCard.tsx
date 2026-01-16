import { Star, Eye, Pencil, Trash2, Play, Share2, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Game } from "@/types/game";
import { Link } from "react-router-dom";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const difficultyVariant = {
    easy: "easy",
    medium: "medium",
    hard: "hard",
  } as const;

  return (
    <div className="flex flex-col md:flex-row gap-4 rounded-xl bg-card p-4 card-shadow">
      {/* Thumbnail */}
      <div className="relative w-full md:w-48 h-32 md:h-36 rounded-lg bg-primary/20 flex-shrink-0 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/30 to-primary/10">
          <span className="text-2xl font-bold text-primary/60">{game.title.substring(0, 2).toUpperCase()}</span>
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge variant={game.status === "published" ? "published" : "draft"}>
            {game.status === "published" ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{game.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant={game.visibility === "public" ? "public" : "private"} className="gap-1">
                {game.visibility === "public" ? (
                  <Globe className="h-3 w-3" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
                {game.visibility === "public" ? "Public" : "Private"}
              </Badge>
              <Badge variant="math">{game.subject}</Badge>
              <Badge variant={difficultyVariant[game.difficulty]}>
                {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
              </Badge>
            </div>
          </div>
          {game.rating && (
            <div className="flex items-center gap-1 text-warning">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">{game.rating}</span>
              <span className="text-xs text-muted-foreground">({game.ratingCount})</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Created {game.createdAt}</span>
          <span>|</span>
          <span>{game.players} Players</span>
          <span>|</span>
          <span>{game.questions} Questions</span>
          <span>|</span>
          <span>{game.knowledges} Knowledges</span>
          <span>|</span>
          <span className="text-primary font-medium">+{game.xp} XP</span>
        </div>

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
          {game.status === "draft" && (
            <Link to={`/edit/${game.id}`}>
              <Button variant="outline" size="sm" className="gap-1">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
          <div className="ml-auto">
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 className="h-4 w-4" />
              Share PIN
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
