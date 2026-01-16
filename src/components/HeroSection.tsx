import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const HeroSection = () => {
  const [pin, setPin] = useState('');

  const handleJoinGame = () => {
    if (pin.length < 4) {
      toast.error('กรุณากรอก PIN อย่างน้อย 4 หลัก');
      return;
    }
    toast.success(`กำลังเข้าร่วมเกม PIN: ${pin}`);
    // TODO: Connect to backend to join game
  };

  return (
    <section className="py-6 md:py-8 lg:py-12">
      <div className="container px-4">
        {/* Single Hero Box */}
        <div className="relative hero-gradient rounded-2xl md:rounded-3xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 p-6 md:p-8 lg:p-12">
            {/* Left Content */}
            <div className="flex-1 space-y-4 md:space-y-6 z-10 text-center md:text-left">
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                  <span className="text-foreground">Learn. Play. Fun.</span>
                  <br />
                  <span className="text-primary">Conquer</span>
                  <br />
                  <span className="text-primary">Knowledge</span>
                </h1>
              </div>

              {/* PIN Input */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto md:mx-0">
                <Input
                  type="text"
                  placeholder="Enter PIN..."
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="bg-card border-2 border-border focus:border-primary h-11 md:h-12 text-base md:text-lg font-medium"
                />
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={handleJoinGame}
                  className="px-6 h-11 md:h-12 w-full sm:w-auto"
                >
                  Join Game
                </Button>
              </div>
            </div>

            {/* Right Content - Tank Illustration */}
            <div className="flex-1 flex justify-center md:justify-end z-10">
              <div className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] animate-float">
                🎮
              </div>
            </div>
          </div>

          {/* Decorative Wave Pattern */}
          <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16 bg-gradient-to-t from-primary/10 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
