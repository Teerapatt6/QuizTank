import { Star, Bookmark } from 'lucide-react';
import { Quiz, Difficulty, Category } from '@/types/quiz';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface QuizCardProps {
  quiz: Quiz;
  onPlay?: (quiz: Quiz) => void;
  onBookmark?: (quiz: Quiz) => void;
  showBookmark?: boolean;
}

const difficultyVariant: Record<Difficulty, 'easy' | 'medium' | 'hard'> = {
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
};

const categoryLabels: Record<Category, string> = {
  math: 'Math',
  science: 'Science',
  history: 'History',
  geography: 'Geography',
  language: 'Language',
  technology: 'Technology',
  art: 'Art',
  general: 'General',
};

const QuizCard = ({ quiz, onPlay, onBookmark, showBookmark = true }: QuizCardProps) => {
  return (
    <div className="group bg-card rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-0.5">
      {/* Card Header / Image - Compact height */}
      <div className="relative h-32 overflow-hidden">
        {quiz.image ? (
          <img
            src={quiz.image}
            alt={quiz.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30" />
        )}
        
        {/* Category Badge - Top Left - SOLID */}
        <div className="absolute top-2 left-2">
          <Badge className="bg-primary text-primary-foreground text-xs">
            {categoryLabels[quiz.category]}
          </Badge>
        </div>

        {/* Difficulty Badge - Top Right - SOLID, no border */}
        <div className="absolute top-2 right-2">
          <Badge variant={difficultyVariant[quiz.difficulty]} className="capitalize text-xs border-0">
            {quiz.difficulty}
          </Badge>
        </div>
        
        {/* AI Generated Badge - Bottom Left */}
        {quiz.isAiGenerated && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="ai" className="text-xs">
              ✨ AI
            </Badge>
          </div>
        )}
      </div>

      {/* Card Content - Compact padding */}
      <div className="p-4">
        <h3 className="font-bold text-foreground mb-1 line-clamp-1">
          {quiz.title}
        </h3>
        
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 min-h-[2rem]">
          {quiz.description}
        </p>

        {/* Stats Row - Single Line */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>📝 {quiz.questionCount} Questions</span>
          <span className="text-success font-semibold">+{quiz.xpReward} XP</span>
          <span className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-warning text-warning" />
            {quiz.rating.toFixed(1)}
          </span>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2">
          <Button 
            variant="game" 
            size="sm"
            className="flex-1"
            onClick={() => onPlay?.(quiz)}
          >
            Play Now
          </Button>
          
          {showBookmark && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onBookmark?.(quiz)}
              className="p-2"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
