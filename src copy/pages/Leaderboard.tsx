import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, Clock, Target } from "lucide-react";

const globalLeaderboard = [
  { rank: 1, name: "TankMaster", avatar: "TM", score: 12450, time: "2:34", accuracy: "98%" },
  { rank: 2, name: "QuizKing", avatar: "QK", score: 11890, time: "2:45", accuracy: "96%" },
  { rank: 3, name: "BrainTank", avatar: "BT", score: 11200, time: "2:52", accuracy: "95%" },
  { rank: 4, name: "SmartShooter", avatar: "SS", score: 10850, time: "3:01", accuracy: "94%" },
  { rank: 5, name: "QuizNinja", avatar: "QN", score: 10500, time: "3:15", accuracy: "92%" },
  { rank: 6, name: "TankGenius", avatar: "TG", score: 10200, time: "3:22", accuracy: "91%" },
  { rank: 7, name: "BattleBrain", avatar: "BB", score: 9850, time: "3:34", accuracy: "90%" },
  { rank: 8, name: "QuizWarrior", avatar: "QW", score: 9500, time: "3:45", accuracy: "89%" },
];

const Leaderboard = () => {
  const [timeFilter, setTimeFilter] = useState<"daily" | "weekly" | "alltime">("alltime");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Page Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-warning" />
            <h1 className="text-4xl font-bold text-foreground">Leaderboard</h1>
          </div>
          <p className="text-muted-foreground text-lg">Compete with the best quiz warriors</p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex justify-center gap-3 mb-8">
          <Button
            variant={timeFilter === "daily" ? "default" : "outline"}
            onClick={() => setTimeFilter("daily")}
            className="rounded-full"
          >
            Daily
          </Button>
          <Button
            variant={timeFilter === "weekly" ? "default" : "outline"}
            onClick={() => setTimeFilter("weekly")}
            className="rounded-full"
          >
            Weekly
          </Button>
          <Button
            variant={timeFilter === "alltime" ? "default" : "outline"}
            onClick={() => setTimeFilter("alltime")}
            className="rounded-full"
          >
            All Time
          </Button>
        </div>

        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="global">Global Leaderboard</TabsTrigger>
            <TabsTrigger value="room">My Game Room</TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-8">
            {/* Top 3 Podium */}
            <Card className="p-8 shadow-elevated animate-fade-in">
              <div className="flex items-end justify-center gap-8 mb-8">
                {/* 2nd Place */}
                <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  <Medal className="w-12 h-12 text-muted-foreground mb-3" />
                  <Avatar className="w-20 h-20 border-4 border-muted mb-3">
                    <AvatarFallback className="text-2xl font-bold bg-muted text-muted-foreground">
                      {globalLeaderboard[1].avatar}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg text-foreground">{globalLeaderboard[1].name}</h3>
                  <p className="text-primary font-bold text-xl">{globalLeaderboard[1].score}</p>
                  <div className="w-24 h-32 bg-muted/50 rounded-t-xl mt-4 flex items-center justify-center">
                    <span className="text-4xl font-bold text-muted-foreground">2</span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: "0s" }}>
                  <Crown className="w-14 h-14 text-warning mb-3 animate-pulse-glow" />
                  <Avatar className="w-24 h-24 border-4 border-warning mb-3 shadow-glow">
                    <AvatarFallback className="text-2xl font-bold bg-warning text-warning-foreground">
                      {globalLeaderboard[0].avatar}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-xl text-foreground">{globalLeaderboard[0].name}</h3>
                  <p className="text-primary font-bold text-2xl">{globalLeaderboard[0].score}</p>
                  <div className="w-24 h-40 bg-gradient-to-t from-warning/30 to-warning/10 rounded-t-xl mt-4 flex items-center justify-center border-2 border-warning">
                    <span className="text-5xl font-bold text-warning">1</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <Medal className="w-10 h-10 text-muted-foreground mb-3" />
                  <Avatar className="w-20 h-20 border-4 border-muted mb-3">
                    <AvatarFallback className="text-2xl font-bold bg-muted text-muted-foreground">
                      {globalLeaderboard[2].avatar}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg text-foreground">{globalLeaderboard[2].name}</h3>
                  <p className="text-primary font-bold text-xl">{globalLeaderboard[2].score}</p>
                  <div className="w-24 h-24 bg-muted/50 rounded-t-xl mt-4 flex items-center justify-center">
                    <span className="text-4xl font-bold text-muted-foreground">3</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Full Rankings Table */}
            <Card className="p-6 shadow-neumorphic">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Target className="w-4 h-4" />
                        Score
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        Time
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Accuracy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {globalLeaderboard.map((player, index) => (
                    <TableRow 
                      key={player.rank}
                      className="hover:bg-muted/50 transition-smooth"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <TableCell className="font-bold">
                        {player.rank <= 3 ? (
                          <div className="flex items-center gap-2">
                            {player.rank === 1 && <Crown className="w-5 h-5 text-warning" />}
                            {player.rank === 2 && <Medal className="w-5 h-5 text-muted-foreground" />}
                            {player.rank === 3 && <Medal className="w-5 h-5 text-muted-foreground" />}
                            {player.rank}
                          </div>
                        ) : (
                          player.rank
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                              {player.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{player.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-primary">{player.score}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{player.time}</TableCell>
                      <TableCell className="text-center">
                        <span className="px-3 py-1 rounded-full bg-success/10 text-success font-medium text-sm">
                          {player.accuracy}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="room">
            <Card className="p-12 text-center shadow-neumorphic">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No Room Selected</h3>
              <p className="text-muted-foreground mb-6">Join a game room to see its leaderboard</p>
              <Button variant="game">Browse Games</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Leaderboard;
