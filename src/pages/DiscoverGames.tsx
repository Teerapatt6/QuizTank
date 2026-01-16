import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FilterSection } from "@/components/games/FilterSection";
import { DiscoverCard } from "@/components/games/DiscoverCard";
import { discoverGames } from "@/data/mockData";

export default function DiscoverGames() {
  const [bookmarkedGames, setBookmarkedGames] = useState<string[]>([]);

  const handleBookmark = (gameId: string) => {
    setBookmarkedGames((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">Discover Games</h1>
            <p className="text-muted-foreground mt-2">
              Find the perfect quiz battle for your learning journey
            </p>
          </div>

          {/* Filter Section */}
          <FilterSection showSortBy />

          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {discoverGames.map((game) => (
              <DiscoverCard
                key={game.id}
                game={game}
                onBookmark={handleBookmark}
                isBookmarked={bookmarkedGames.includes(game.id)}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
