import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DailyChallengeProps {
  isLoggedIn?: boolean;
}

const DailyChallenge = ({ isLoggedIn = false }: DailyChallengeProps) => {
  return (
    <section className="py-4 md:py-6">
      <div className="container px-4">
        <div className="hero-gradient rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col items-center text-center md:text-left md:flex-row md:items-center md:justify-between gap-4 border border-primary/20">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
            <Badge variant="warning" className="py-1 px-3 text-xs md:text-sm">
              Daily Challenge
            </Badge>
            <div>
              <h3 className="font-bold text-base md:text-lg flex items-center justify-center md:justify-start gap-2">
                <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                {isLoggedIn ? "Today's Challenge" : "Come Play with Us"}
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm mt-1">
                {isLoggedIn 
                  ? "Complete daily challenges to earn exclusive rewards and climb the leaderboard."
                  : "Have fun, learn something new, and collect rewards along the way."
                }
              </p>
            </div>
          </div>
          <Button variant="hero" size="sm" className="w-full md:w-auto">
            {isLoggedIn ? "Start Challenge" : "Join Now"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DailyChallenge;
