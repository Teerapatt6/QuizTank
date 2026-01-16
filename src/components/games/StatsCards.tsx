import { Gamepad2, Globe, Users, Star } from "lucide-react";
import { GameStats } from "@/types/game";

interface StatsCardsProps {
  stats: GameStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const items = [
    { icon: Gamepad2, value: stats.totalGames, label: "Total Games" },
    { icon: Globe, value: stats.published, label: "Published" },
    { icon: Users, value: stats.totalPlayers, label: "Total Players" },
    { icon: Star, value: stats.avgRating, label: "Avg Rating" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-xl bg-card p-4 card-shadow"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <item.icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{item.value}</div>
            <div className="text-sm text-muted-foreground">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
