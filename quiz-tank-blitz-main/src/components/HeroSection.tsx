import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');

  const handleJoinGame = () => {
    if (pin.length < 4) {
      toast.error('Please enter at least 4 digits');
      return;
    }
    toast.success(`Joining game with PIN: ${pin}`);
    navigate(`/game/${pin}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Compact Hero Box */}
        <div className="relative bg-card rounded-2xl shadow-neumorphic overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 p-4 md:p-6">
            {/* Left Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="space-y-1">
                <p className="text-primary font-semibold text-xs md:text-sm tracking-wide uppercase">
                  Learn. Play. Fun.
                </p>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  Conquer <span className="text-primary">Knowledge</span>
                </h1>
              </div>

              {/* PIN Input */}
              <div className="flex gap-2 mt-4 max-w-sm mx-auto md:mx-0">
                <Input
                  placeholder="Enter Game PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinGame()}
                  className="bg-card border-2 border-border focus:border-primary h-10 text-sm font-medium"
                />
                <Button 
                  onClick={handleJoinGame} 
                  variant="game" 
                  size="default"
                  className="shrink-0"
                >
                  Join Game
                </Button>
              </div>
            </div>

            {/* Right Content - Compact Illustration */}
            <div className="flex-shrink-0 hidden md:block">
              <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <span className="text-4xl lg:text-5xl">🎮</span>
              </div>
            </div>
          </div>

          {/* Decorative Wave Pattern */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
