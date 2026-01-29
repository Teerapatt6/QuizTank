import { Play, Users, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameCardProps {
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  players: number;
  duration: string;
  rating: number;
  imageUrl?: string;
  onPlay: () => void;
}

export const GameCard = ({
  title,
  description,
  difficulty,
  players,
  duration,
  rating,
  imageUrl,
  onPlay,
}: GameCardProps) => {
  const difficultyColor = {
    Easy: "bg-success/10 text-success",
    Medium: "bg-warning/10 text-warning",
    Hard: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="game-card group">
      {/* Image Section */}
      <div className="relative h-40 rounded-xl overflow-hidden mb-4 bg-muted">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColor[difficulty]}`}>
            {difficulty}
          </span>
          <div className="flex items-center gap-1 text-warning">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-semibold">{rating}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

      {/* Stats Section */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{players}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{duration}</span>
        </div>
      </div>

      {/* Action Button */}
      <Button onClick={onPlay} variant="game" size="lg" className="w-full">
        <Play className="w-4 h-4 mr-2" />
        Play Now
      </Button>
    </div>
  );
};
