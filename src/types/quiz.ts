export type Category = 'math' | 'science' | 'history' | 'geography' | 'language' | 'technology' | 'art' | 'general';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  questionCount: number;
  duration: number; // in minutes
  xpReward: number;
  rating: number;
  playCount: number;
  image?: string;
  isAiGenerated?: boolean;
  createdAt: Date;
}

export interface CategoryInfo {
  id: Category;
  name: string;
  icon: string;
}
