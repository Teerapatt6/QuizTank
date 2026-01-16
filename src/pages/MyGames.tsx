import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { StatsCards } from "@/components/games/StatsCards";
import { GameCard } from "@/components/games/GameCard";
import { Pagination } from "@/components/games/Pagination";
import { mockStats, mockGames } from "@/data/mockData";

export default function MyGames() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <PageLayout title="My Games" subtitle="Your saved games, ready to play anytime">
      {/* Stats Cards */}
      <StatsCards stats={mockStats} />

      {/* Games List */}
      <div className="mt-8 space-y-4">
        {mockGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={10}
        onPageChange={setCurrentPage}
      />
    </PageLayout>
  );
}
