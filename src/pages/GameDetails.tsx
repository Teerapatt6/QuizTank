import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Share2, Pencil, User, ThumbsUp, Star, Image } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { GameTabs } from "@/components/games/GameTabs";
import { ReadOnlyField } from "@/components/games/FormComponents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockGameDetails } from "@/data/mockData";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "general", label: "General" },
  { id: "questions", label: "Questions" },
  { id: "knowledge", label: "Knowledge" },
  { id: "gameplay", label: "Gameplay" },
];

export default function GameDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const game = mockGameDetails;

  const winRateData = [
    { name: "Win", value: game.stats.winRate, color: "hsl(142, 71%, 45%)" },
    { name: "Lose", value: 100 - game.stats.winRate, color: "hsl(0, 84%, 60%)" },
  ];

  return (
    <PageLayout title="Game Details">
      <div className="rounded-xl bg-card card-shadow overflow-hidden">
        <GameTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="border-t-4 border-primary" />
        
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Column */}
              <div className="space-y-4">
                {/* Players */}
                <div className="flex items-center gap-4 bg-muted rounded-xl p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
                    <User className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Players</div>
                    <div className="text-2xl font-bold">{game.stats.players.toLocaleString()}</div>
                  </div>
                </div>
                
                {/* Favourites */}
                <div className="flex items-center gap-4 bg-muted rounded-xl p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
                    <ThumbsUp className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Favourite</div>
                    <div className="text-2xl font-bold">{game.stats.favorites}</div>
                  </div>
                </div>
                
                {/* Reviews */}
                <div className="flex items-center gap-4 bg-muted rounded-xl p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
                    <Star className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Reviews</div>
                    <div className="text-2xl font-bold">{game.stats.rating}</div>
                  </div>
                </div>
              </div>

              {/* Win Rate Chart */}
              <div className="lg:col-span-2 bg-muted rounded-xl p-6">
                <h3 className="text-xl font-semibold text-center mb-4">Win Rate</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={winRateData}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={80}
                        dataKey="value"
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text
                              x={x}
                              y={y}
                              fill="white"
                              textAnchor="middle"
                              dominantBaseline="central"
                              className="text-lg font-bold"
                            >
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                      >
                        {winRateData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value, entry) => (
                          <span className="text-foreground">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "general" && (
            <div className="space-y-6">
              <ReadOnlyField label="Name" value={game.name} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReadOnlyField label="Visibility" value={game.visibility === "public" ? "Public" : "Private"} />
                <ReadOnlyField label="Category" value={game.category} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReadOnlyField label="Language" value={game.language} />
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {game.tags.map((tag) => (
                      <Badge key={tag} variant="tag">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReadOnlyField label="Description" value={game.description} />
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">Cover Image</label>
                  <div className="bg-muted rounded-lg h-40 flex items-center justify-center">
                    <div className="bg-primary/80 text-primary-foreground px-8 py-6 rounded-lg text-center">
                      <div className="text-2xl font-bold">MATH</div>
                      <div className="text-xl font-bold">QUIZ</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "questions" && (
            <div className="space-y-6">
              {game.questions.map((question, index) => (
                <div key={question.id} className="space-y-4">
                  <h3 className="text-lg font-semibold">Question #{index + 1}</h3>
                  
                  <ReadOnlyField label="Type" value={`Choice (${question.type === "single" ? "Single Answer" : "Multiple Answers"})`} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ReadOnlyField label="Question" value={question.question} />
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground">Question Media</label>
                      <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  
                  <ReadOnlyField label="Number of Choices" value={question.choices.length.toString()} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.choices.map((choice, choiceIndex) => (
                      <div 
                        key={choice.id} 
                        className={`relative rounded-xl border-2 transition-all ${
                          choice.isCorrect 
                            ? "border-primary bg-primary/5" 
                            : "border-border bg-muted"
                        }`}
                      >
                        {/* Header with choice number and correct indicator */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
                          <div className="flex items-center gap-2">
                            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                              choice.isCorrect 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-primary/20 text-primary"
                            }`}>
                              {choiceIndex + 1}
                            </span>
                            <span className="text-sm font-medium text-muted-foreground">
                              Choice {choiceIndex + 1}
                            </span>
                          </div>
                          {choice.isCorrect && (
                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-primary text-primary-foreground shadow-sm">
                              <span className="flex h-4 w-4 items-center justify-center shrink-0 border-2 rounded-full border-primary-foreground bg-primary-foreground">
                                <span className="text-primary text-xs">✓</span>
                              </span>
                              Correct
                            </span>
                          )}
                        </div>
                        {/* Read-only choice content */}
                        <div className="p-3">
                          <div className="bg-background rounded-lg px-4 py-3 min-h-[80px] text-sm text-foreground">
                            {choice.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "knowledge" && (
            <div className="space-y-6">
              {game.knowledges.map((knowledge, index) => (
                <div key={knowledge.id} className="space-y-4">
                  <h3 className="text-lg font-semibold">Knowledge #{index + 1}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ReadOnlyField label="Text Content" value={knowledge.content} />
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground">Media Content</label>
                      <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
                        <div className="bg-success/20 w-full h-full flex items-center justify-center rounded-lg">
                          <span className="text-xs text-muted-foreground">Triangle Area Formula</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "gameplay" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReadOnlyField label="Game Duration" value={`${game.gameplay.duration} min`} />
                <ReadOnlyField label="Number of Enemies" value={game.gameplay.enemies.toString()} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReadOnlyField label="Number of Hearts" value={game.gameplay.hearts.toString()} />
                <ReadOnlyField label="Number of Brains" value={game.gameplay.brains.toString()} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReadOnlyField label="Initial Ammo" value={game.gameplay.initialAmmo.toString()} />
                <ReadOnlyField label="Ammo per Correct Answer" value={game.gameplay.ammoPerCorrect.toString()} />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">Map</label>
                <div className="bg-muted rounded-lg px-4 py-3 text-sm">{game.gameplay.mapName}</div>
                <div className="bg-muted rounded-lg h-48 flex items-center justify-center mt-2">
                  <div className="text-muted-foreground text-sm">Map Preview</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share PIN
        </Button>
        <Link to={`/edit/${id}`}>
          <Button variant="primary" className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>
    </PageLayout>
  );
}
