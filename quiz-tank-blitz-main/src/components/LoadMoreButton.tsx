import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadMoreButtonProps {
  onClick?: () => void;
  isLoading?: boolean;
}

const LoadMoreButton = ({ onClick, isLoading = false }: LoadMoreButtonProps) => {
  return (
    <div className="flex justify-center py-8">
      <Button 
        variant="outline" 
        size="lg" 
        onClick={onClick}
        disabled={isLoading}
        className="gap-2 group"
      >
        {isLoading ? (
          <span className="animate-spin">⏳</span>
        ) : (
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        )}
        {isLoading ? 'Loading...' : 'Load More Games'}
      </Button>
    </div>
  );
};

export default LoadMoreButton;
