import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import CategoryBar from "@/components/CategoryBar";
import QuizCard from "@/components/QuizCard";
import { Button } from "@/components/ui/button";
import { mockQuizzes } from "@/data/mockQuizzes";
import { Category, Quiz } from "@/types/quiz";
import { toast } from "sonner";

// Horizontal scroll carousel component
interface GameCarouselProps {
  title: string;
  subtitle?: string;
  games: Quiz[];
  onPlay: (quiz: Quiz) => void;
  onBookmark: (quiz: Quiz) => void;
}

const GameCarousel = ({ title, subtitle, games, onPlay, onBookmark }: GameCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (games.length === 0) return null;

  return (
    <section className="py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {games.map((quiz) => (
            <div 
              key={quiz.id} 
              className="flex-none w-[280px] md:w-[300px] snap-start"
            >
              <QuizCard 
                quiz={quiz} 
                onPlay={onPlay}
                onBookmark={onBookmark}
                showBookmark={true}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);

  // Filter quizzes by category for main display
  const filteredQuizzes = useMemo(() => {
    if (!selectedCategory) return mockQuizzes;
    return mockQuizzes.filter(quiz => quiz.category === selectedCategory);
  }, [selectedCategory]);

  // Recently Published - sorted by createdAt
  const recentlyPublished = useMemo(() => {
    return [...mockQuizzes]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, []);

  // Trending Now - sorted by playCount
  const trendingNow = useMemo(() => {
    return [...mockQuizzes]
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 8);
  }, []);

  // Popular AI Created - only AI generated, sorted by rating
  const aiPopular = useMemo(() => {
    return mockQuizzes
      .filter(quiz => quiz.isAiGenerated)
      .sort((a, b) => b.rating - a.rating);
  }, []);

  const handleCategorySelect = (category: Category | undefined) => {
    setSelectedCategory(category);
  };

  const handlePlayQuiz = (quiz: Quiz) => {
    navigate("/game-details", { state: { quiz } });
  };

  const handleBookmarkQuiz = (quiz: Quiz) => {
    toast.success(`"${quiz.title}" added to favourites!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* 1) Hero Section - Compact */}
        <HeroSection />

        {/* 2) Category Bar - Centered */}
        <CategoryBar 
          selectedCategory={selectedCategory} 
          onSelectCategory={handleCategorySelect} 
        />

        {/* 3) Daily Challenge Section - Below Categories */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 md:p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                  <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2 justify-center sm:justify-start">
                    🏆 Daily Challenge
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Complete today's mission to earn bonus XP!
                  </p>
                </div>
                <Button 
                  variant="game"
                  onClick={() => navigate('/daily-challenge')}
                >
                  Start Challenge
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 4) Recently Published Carousel */}
        <GameCarousel
          title="Recently Published"
          subtitle="Fresh new quizzes just added"
          games={recentlyPublished}
          onPlay={handlePlayQuiz}
          onBookmark={handleBookmarkQuiz}
        />

        {/* 5) Trending Now Carousel */}
        <GameCarousel
          title="Trending Now"
          subtitle="Most played this week"
          games={trendingNow}
          onPlay={handlePlayQuiz}
          onBookmark={handleBookmarkQuiz}
        />

        {/* 6) Popular AI Created Carousel */}
        <GameCarousel
          title="Popular Quiz Created by AI"
          subtitle="AI-generated quizzes loved by the community"
          games={aiPopular}
          onPlay={handlePlayQuiz}
          onBookmark={handleBookmarkQuiz}
        />

        {/* 7) Browse by Category Section */}
        {selectedCategory && (
          <section className="py-6">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground">
                    {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Quizzes
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {filteredQuizzes.length} games available
                  </p>
                </div>
              </div>

              {filteredQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredQuizzes.map((quiz) => (
                    <QuizCard 
                      key={quiz.id}
                      quiz={quiz} 
                      onPlay={handlePlayQuiz}
                      onBookmark={handleBookmarkQuiz}
                      showBookmark={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No quizzes found in this category yet.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
