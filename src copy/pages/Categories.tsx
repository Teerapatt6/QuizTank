import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { GameCard } from "@/components/GameCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calculator, 
  Atom, 
  BookOpen, 
  Globe, 
  MessageSquare, 
  Cpu, 
  Palette, 
  Target,
  Search,
  ArrowLeft
} from "lucide-react";
import tankIcon from "@/assets/tank-icon.jpg";
import gameMap from "@/assets/game-map.jpg";

interface CategoryData {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  glow: string;
  gameCount: number;
  description: string;
}

const categories: CategoryData[] = [
  {
    id: "math",
    name: "Math",
    icon: Calculator,
    color: "text-[#FF6B6B]",
    gradient: "from-[#FF6B6B]/20 to-[#FF6B6B]/5",
    glow: "shadow-[0_0_30px_rgba(255,107,107,0.3)]",
    gameCount: 156,
    description: "Arithmetic, algebra, geometry & calculus challenges"
  },
  {
    id: "science",
    name: "Science",
    icon: Atom,
    color: "text-[#4ECDC4]",
    gradient: "from-[#4ECDC4]/20 to-[#4ECDC4]/5",
    glow: "shadow-[0_0_30px_rgba(78,205,196,0.3)]",
    gameCount: 142,
    description: "Physics, chemistry, biology & earth sciences"
  },
  {
    id: "history",
    name: "History",
    icon: BookOpen,
    color: "text-[#FFD93D]",
    gradient: "from-[#FFD93D]/20 to-[#FFD93D]/5",
    glow: "shadow-[0_0_30px_rgba(255,217,61,0.3)]",
    gameCount: 98,
    description: "World history, civilizations & historical events"
  },
  {
    id: "geography",
    name: "Geography",
    icon: Globe,
    color: "text-[#6BCB77]",
    gradient: "from-[#6BCB77]/20 to-[#6BCB77]/5",
    glow: "shadow-[0_0_30px_rgba(107,203,119,0.3)]",
    gameCount: 87,
    description: "Countries, capitals, landmarks & physical geography"
  },
  {
    id: "language",
    name: "Language",
    icon: MessageSquare,
    color: "text-[#A78BFA]",
    gradient: "from-[#A78BFA]/20 to-[#A78BFA]/5",
    glow: "shadow-[0_0_30px_rgba(167,139,250,0.3)]",
    gameCount: 124,
    description: "Vocabulary, grammar, literature & linguistics"
  },
  {
    id: "technology",
    name: "Technology",
    icon: Cpu,
    color: "text-[#3B82F6]",
    gradient: "from-[#3B82F6]/20 to-[#3B82F6]/5",
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]",
    gameCount: 201,
    description: "Programming, computers, AI & digital innovation"
  },
  {
    id: "art",
    name: "Art",
    icon: Palette,
    color: "text-[#F472B6]",
    gradient: "from-[#F472B6]/20 to-[#F472B6]/5",
    glow: "shadow-[0_0_30px_rgba(244,114,182,0.3)]",
    gameCount: 76,
    description: "Visual arts, music, design & creative expression"
  },
  {
    id: "general",
    name: "General",
    icon: Target,
    color: "text-[#FB923C]",
    gradient: "from-[#FB923C]/20 to-[#FB923C]/5",
    glow: "shadow-[0_0_30px_rgba(251,146,60,0.3)]",
    gameCount: 189,
    description: "Mixed topics, trivia & general knowledge"
  }
];

const mockGames = [
  {
    title: "Math Blitz Battle",
    description: "Fast-paced arithmetic quiz with power-ups and special abilities",
    difficulty: "Medium" as const,
    players: 1248,
    duration: "15 min",
    rating: 4.8,
    imageUrl: tankIcon,
    category: "math"
  },
  {
    title: "Science Lab Assault",
    description: "Chemistry and physics questions in an exciting tank battle",
    difficulty: "Easy" as const,
    players: 2134,
    duration: "10 min",
    rating: 4.7,
    imageUrl: gameMap,
    category: "science"
  },
  {
    title: "History Tank Warfare",
    description: "Test your knowledge of world history while commanding your tank",
    difficulty: "Hard" as const,
    players: 892,
    duration: "20 min",
    rating: 4.9,
    imageUrl: tankIcon,
    category: "history"
  },
  {
    title: "Geography Explorer",
    description: "Navigate through world capitals and landmarks",
    difficulty: "Medium" as const,
    players: 1567,
    duration: "12 min",
    rating: 4.6,
    imageUrl: gameMap,
    category: "geography"
  },
  {
    title: "Language Master Quest",
    description: "Vocabulary and grammar challenges across multiple languages",
    difficulty: "Hard" as const,
    players: 934,
    duration: "18 min",
    rating: 4.8,
    imageUrl: tankIcon,
    category: "language"
  },
  {
    title: "Tech Warriors",
    description: "Programming and technology trivia with coding challenges",
    difficulty: "Hard" as const,
    players: 2341,
    duration: "25 min",
    rating: 4.9,
    imageUrl: gameMap,
    category: "technology"
  }
];

export default function Categories() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    navigate(`/categories?category=${categoryId}`);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
    navigate("/categories");
  };

  const filteredGames = selectedCategory
    ? mockGames.filter(game => game.category === selectedCategory)
    : mockGames;

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              Choose Your
              <span className="text-primary"> Battle Arena</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select a category to discover quiz games tailored to your learning goals
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search categories or games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-card/80 backdrop-blur-sm border-2 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" />
      </section>

      {/* Category Selection */}
      {!selectedCategory && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="group relative bg-card rounded-2xl p-8 border-2 border-border hover:border-transparent 
                             transition-all duration-300 hover:scale-105 hover:-translate-y-2
                             shadow-neumorphic hover:shadow-elevated animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} rounded-2xl opacity-0 
                                   group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                                   transition-opacity duration-300 ${category.glow}`} />

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.gradient} 
                                    flex items-center justify-center mb-4 mx-auto
                                    group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-8 h-8 ${category.color}`} />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {category.description}
                      </p>

                      {/* Game Count Badge */}
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full 
                                    bg-gradient-to-r ${category.gradient} border border-border`}>
                        <Target className="w-3.5 h-3.5" />
                        <span className="text-sm font-semibold">{category.gameCount} Games</span>
                      </div>

                      {/* View Games CTA */}
                      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className={`text-sm font-semibold ${category.color} flex items-center justify-center gap-1`}>
                          View Games
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </div>

                    {/* Corner Accent */}
                    <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${category.color.replace('text-', 'bg-')} 
                                   opacity-0 group-hover:opacity-100 transition-opacity animate-pulse`} />
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Filtered Games View */}
      {selectedCategory && selectedCategoryData && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Category Header */}
            <div className={`bg-gradient-to-br ${selectedCategoryData.gradient} rounded-3xl p-8 mb-8 
                          border-2 border-border shadow-elevated animate-fade-in`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearCategory}
                    className="hover:bg-background/50"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${selectedCategoryData.gradient} 
                                flex items-center justify-center border-2 border-border`}>
                    <selectedCategoryData.icon className={`w-8 h-8 ${selectedCategoryData.color}`} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-1">
                      {selectedCategoryData.name} Games
                    </h2>
                    <p className="text-muted-foreground">{selectedCategoryData.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-border`}>
                    <span className="font-semibold">{filteredGames.length} Available</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Games Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game, index) => (
                <div 
                  key={index} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <GameCard {...game} onPlay={() => navigate("/game-details")} />
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredGames.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">No games found</h3>
                <p className="text-muted-foreground mb-6">Try selecting a different category</p>
                <Button variant="outline" onClick={handleClearCategory}>
                  View All Categories
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Total Games", value: "1,073", icon: Target },
              { label: "Active Players", value: "45.2K", icon: Globe },
              { label: "Questions", value: "28.5K", icon: BookOpen },
              { label: "Categories", value: "8", icon: Palette }
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-card rounded-2xl p-6 text-center shadow-neumorphic animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="mb-2">© 2025 QuizTank. Transform learning into an adventure.</p>
          <p className="text-sm">Made with ❤️ for learners and educators worldwide</p>
        </div>
      </footer>
    </div>
  );
}
