import { Clock, Star, Zap, Bookmark } from 'lucide-react';
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

const categoryEmojis: Record<Category, string> = {
  math: '➗',
  science: '🔬',
  history: '🏛️',
  geography: '🌍',
  language: '💬',
  technology: '💻',
  art: '🎨',
  general: '📚',
};

const QuizCard = ({ quiz, onPlay, onBookmark, showBookmark = false }: QuizCardProps) => {
  return (
    <div className="group bg-card rounded-2xl overflow-hidden card-shadow hover:card-hover-shadow transition-all duration-300 hover:-translate-y-1 animate-fade-in flex flex-col">
      {/* Card Header / Image */}
      <div className="relative h-36 bg-gradient-to-br from-secondary to-primary/20 flex items-center justify-center">
        <span className="text-5xl">{categoryEmojis[quiz.category]}</span>
        
        {/* Badges */}
        <div className="absolute top-3 left-3">
          <Badge variant="category" className="text-xs">
            {categoryLabels[quiz.category]}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant={difficultyVariant[quiz.difficulty]} className="text-xs capitalize">
            {quiz.difficulty}
          </Badge>
        </div>
        
        {/* AI Generated Badge */}
        {quiz.isAiGenerated && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="ai" className="text-xs">
              AI Generated
            </Badge>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-lg line-clamp-1">{quiz.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {quiz.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{quiz.questionCount} Question</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-accent" />
            <span>+{quiz.xpReward} XP</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            <span className="font-semibold text-foreground">{quiz.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Play Button */}
        <div className="flex gap-2">
          <Button 
            variant="default" 
            className={showBookmark ? "flex-1" : "w-full"}
            onClick={() => onPlay?.(quiz)}
          >
            Play Now
          </Button>
          {showBookmark && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onBookmark?.(quiz)}
              className="shrink-0"
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
