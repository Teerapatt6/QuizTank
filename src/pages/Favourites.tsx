import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { FilterSection } from "@/components/games/FilterSection";
import { DiscoverCard } from "@/components/games/DiscoverCard";
import { FavouriteListCard } from "@/components/games/FavouriteListCard";
import { favouriteGames } from "@/data/mockData";

export default function Favourites() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">Favourites</h1>
            <p className="text-muted-foreground mt-2">
              Your saved games, ready to play anytime
            </p>
          </div>

          {/* Filter Section */}
          <FilterSection 
            showViewToggle 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Games Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {favouriteGames.map((game) => (
                <DiscoverCard
                  key={game.id}
                  game={game}
                  isBookmarked
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-8">
              {favouriteGames.map((game) => (
                <FavouriteListCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
