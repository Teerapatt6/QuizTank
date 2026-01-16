export type Difficulty = 'easy' | 'medium' | 'hard';

export type Category = 
  | 'math' 
  | 'science' 
  | 'history' 
  | 'geography' 
  | 'language' 
  | 'technology' 
  | 'art' 
  | 'general';

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  questionCount: number;
  xpReward: number;
  rating: number;
  imageUrl?: string;
  isAiGenerated?: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  avatarUrl?: string;
}

export interface GameSession {
  id: string;
  pin: string;
  quizId: string;
  hostId: string;
  participants: string[];
  status: 'waiting' | 'playing' | 'finished';
}
