import Layout from '@/components/Layout';
import HeroSection from '@/components/HeroSection';
import CategoryBar from '@/components/CategoryBar';
import DailyChallengeCard from '@/components/DailyChallengeCard';
import QuizSection from '@/components/QuizSection';
import LoadMoreButton from '@/components/LoadMoreButton';
import { recentlyPublished, trendingNow, aiGenerated } from '@/data/mockQuizzes';
import { Category } from '@/types/quiz';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { gameService } from '@/services/gameService';

// Set to true to show logged-in view, false for guest view
const isLoggedIn = false;
const username = "John";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [trendingQuizzes, setTrendingQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const [recent, trending] = await Promise.all([
          gameService.getRecentGames(),
          gameService.getTrendingGames()
        ]);
        setRecentQuizzes(recent.games || []);
        setTrendingQuizzes(trending.games || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadGames();
  }, []);

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category === selectedCategory ? undefined : category);
    toast.success(`Selected category: ${category}`);
  };

  const handleLoadMore = () => {
    toast.success("Loading more games...");
  };

  return (
    <Layout>
      <HeroSection />
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />
      <DailyChallengeCard isLoggedIn={isLoggedIn} />

      {isLoggedIn ? (
        <>
          {/* Personalized recommendations for logged-in users */}
          <QuizSection
            title="Recommendations"
            quizzes={recentQuizzes}
            username={username}
            isPersonalized={true}
            showBookmark={true}
          />
          <QuizSection
            title="Trending Now"
            quizzes={trendingQuizzes}
            showBookmark={true}
          />
          <QuizSection
            title="AI Generated"
            quizzes={[]} // Not implemented yet
            showBookmark={true}
          />
        </>
      ) : (
        <>
          {/* Generic sections for guests */}
          <QuizSection
            title="Recently Published"
            quizzes={recentQuizzes}
          />
          <QuizSection
            title="Trending Now"
            quizzes={trendingQuizzes}
          />
          <QuizSection
            title="AI Generated"
            quizzes={[]} // Not implemented yet
          />
        </>
      )}

      <LoadMoreButton onClick={handleLoadMore} />
    </Layout>
  );
};

export default Home;
