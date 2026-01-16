import { useState } from 'react';
import Layout from '@/components/Layout';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CategoryBar from '@/components/CategoryBar';
import DailyChallenge from '@/components/DailyChallenge';
import QuizSection from '@/components/QuizSection';
import LoadMoreButton from '@/components/LoadMoreButton';
import Footer from '@/components/Footer';
import { recentlyPublished, trendingNow, aiGenerated } from '@/data/mockQuizzes';
import { Category } from '@/types/quiz';
import { toast } from 'sonner';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category === selectedCategory ? undefined : category);
    toast.info(`หมวดหมู่: ${category}`);
  };

  const handleLoadMore = () => {
    toast.info('กำลังโหลดเกมเพิ่มเติม...');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={false} />
      
      <Layout>
        <HeroSection />
        <CategoryBar 
          selectedCategory={selectedCategory} 
          onSelectCategory={handleCategorySelect} 
        />
        <DailyChallenge isLoggedIn={false} />
        <QuizSection title="Recently Published" quizzes={recentlyPublished} />
        <QuizSection title="Trending Now" quizzes={trendingNow} />
        <QuizSection title="Popular Quiz Created by AI" quizzes={aiGenerated} />
        <LoadMoreButton onClick={handleLoadMore} />
      </Layout>

      <Footer />
    </div>
  );
};

export default Index;
