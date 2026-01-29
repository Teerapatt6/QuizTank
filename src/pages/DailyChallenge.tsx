import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy, Star, Zap, Target, CheckCircle2 } from "lucide-react";

interface Challenge {
  id: number;
  title: string;
  description: string;
  reward: string;
  progress: number;
  total: number;
  icon: typeof Zap;
  difficulty: "Easy" | "Medium" | "Hard";
  active: boolean;
}

interface CompletedChallenge {
  id: number;
  title: string;
  description: string;
  reward: string;
  completedDate: string;
}

const dailyChallenges: Challenge[] = [
  {
    id: 1,
    title: "Speed Demon",
    description: "Complete any quiz in under 2 minutes",
    reward: "500 XP + Speed Badge",
    progress: 0,
    total: 1,
    icon: Zap,
    difficulty: "Medium",
    active: true,
  },
  {
    id: 2,
    title: "Perfect Score",
    description: "Answer all questions correctly in one game",
    reward: "1000 XP + Perfectionist Badge",
    progress: 0,
    total: 1,
    icon: Target,
    difficulty: "Hard",
    active: true,
  },
  {
    id: 3,
    title: "Tank Destroyer",
    description: "Destroy 50 enemy tanks today",
    reward: "300 XP + Destroyer Medal",
    progress: 23,
    total: 50,
    icon: Trophy,
    difficulty: "Easy",
    active: true,
  },
];

const weeklyChallenges: Challenge[] = [
  {
    id: 4,
    title: "Learning Marathon",
    description: "Play 20 games this week",
    reward: "2000 XP + Speed Badge",
    progress: 10,
    total: 20,
    icon: Zap,
    difficulty: "Medium",
    active: true,
  },
  {
    id: 5,
    title: "Knowledge Champion",
    description: "Score above 90% in 10 different categories",
    reward: "5000 XP + Champion Crown",
    progress: 0,
    total: 1,
    icon: Target,
    difficulty: "Hard",
    active: true,
  },
];

const completedChallenges: CompletedChallenge[] = [
  {
    id: 6,
    title: "First Victory",
    description: "Win your first game",
    reward: "100 XP",
    completedDate: "2 days ago",
  },
  {
    id: 7,
    title: "Social Tank",
    description: "Play 5 multiplayer Games",
    reward: "500 XP + Social Badge",
    completedDate: "10 hours ago",
  },
];

type TabType = "daily" | "weekly" | "completed";

const DailyChallenge = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("daily");
  const [animatingTab, setAnimatingTab] = useState<TabType | null>(null);
  const [dailyTimeUntilReset, setDailyTimeUntilReset] = useState("");
  const [weeklyTimeUntilReset, setWeeklyTimeUntilReset] = useState("");
  const totalXpEarned = 999;

  // Handle tab change with animation
  const handleTabChange = (newTab: TabType) => {
    if (newTab === activeTab) return;
    setAnimatingTab(newTab);
    // Short delay for exit animation
    setTimeout(() => {
      setActiveTab(newTab);
      setAnimatingTab(null);
    }, 150);
  };

  useEffect(() => {
    const calculateTimes = () => {
      const now = new Date();

      // Daily reset (midnight)
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const dailyDiff = tomorrow.getTime() - now.getTime();
      const dailyHours = Math.floor(dailyDiff / (1000 * 60 * 60));
      const dailyMinutes = Math.floor((dailyDiff % (1000 * 60 * 60)) / (1000 * 60));
      setDailyTimeUntilReset(`${dailyHours}h ${dailyMinutes}m`);

      // Weekly reset (next Monday)
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0);
      const weeklyDiff = nextMonday.getTime() - now.getTime();
      const weeklyDays = Math.floor(weeklyDiff / (1000 * 60 * 60 * 24));
      const weeklyHours = Math.floor((weeklyDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const weeklyMinutes = Math.floor((weeklyDiff % (1000 * 60 * 60)) / (1000 * 60));
      setWeeklyTimeUntilReset(`${weeklyDays}d ${weeklyHours}h ${weeklyMinutes}m`);
    };

    calculateTimes();
    const interval = setInterval(calculateTimes, 60000);
    return () => clearInterval(interval);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-success/10 text-success";
      case "Medium":
        return "bg-primary/10 text-primary";
      case "Hard":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getActiveChallengesCount = () => {
    if (activeTab === "daily") return dailyChallenges.filter((c) => c.active).length;
    if (activeTab === "weekly") return weeklyChallenges.filter((c) => c.active).length;
    return completedChallenges.length;
  };

  const getTimeUntilReset = () => {
    if (activeTab === "daily") {
      return dailyTimeUntilReset;
    }
    return weeklyTimeUntilReset;
  };

  const getTimerLabel = () => {
    if (activeTab === "daily") {
      return "Daily";
    }
    return "Weekly";
  };

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
    const Icon = challenge.icon;
    const progressPercent = (challenge.progress / challenge.total) * 100;

    return (
      <Card className="shadow-neumorphic border-border hover:shadow-elevated transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-foreground">{challenge.title}</h3>
                <Badge className={`${getDifficultyColor(challenge.difficulty)} text-xs border-0`}>
                  {challenge.difficulty}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-semibold text-primary">
                    {challenge.progress}/{challenge.total}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-1.5 bg-muted" />
              </div>

              {/* Reward and CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  <span className="font-medium text-foreground">{challenge.reward}</span>
                </div>
                <Button
                  size="sm"
                  variant="game"
                  onClick={() => navigate("/gameplay")}
                >
                  Play Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CompletedChallengeCard = ({ challenge }: { challenge: CompletedChallenge }) => {
    return (
      <Card className="shadow-neumorphic border-success/20 bg-success/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Checkmark Icon */}
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-foreground">{challenge.title}</h3>
                <span className="text-sm text-muted-foreground">{challenge.completedDate}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>

              {/* Reward */}
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="font-medium text-foreground">Earned {challenge.reward}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Animation classes for tab content
  const getContentAnimationClass = () => {
    if (animatingTab) {
      return "opacity-0 translate-x-2";
    }
    return "opacity-100 translate-x-0";
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Challenges</h1>
          <p className="text-muted-foreground">Complete Challenges to earn rewards and level up</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div
            className="inline-flex bg-card rounded-full p-1 shadow-neumorphic border border-border"
            role="tablist"
            aria-label="Challenge tabs"
          >
            {(["daily", "weekly", "completed"] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`${tab}-panel`}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Time Until Reset */}
          <Card className="shadow-neumorphic border-border bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-foreground">
                    {getTimerLabel()} Time Until Reset
                  </p>
                  <p className="text-sm text-muted-foreground">New Challenges Coming Soon</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-primary">{getTimeUntilReset()}</span>
            </CardContent>
          </Card>

          {/* Total XP / Challenge Yourself */}
          <Card className="shadow-neumorphic border-border bg-success/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-warning" />
                <div>
                  <p className="font-semibold text-foreground">Challenge Yourself!</p>
                  <p className="text-sm text-muted-foreground">Complete All Challenges</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">{totalXpEarned}</span>
                <p className="text-xs text-muted-foreground">Total XP Earned</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Section with Animation */}
        <div
          className={`transition-all duration-200 ease-out ${getContentAnimationClass()}`}
          role="tabpanel"
          id={`${activeTab}-panel`}
          aria-labelledby={activeTab}
        >
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">
              {activeTab === "daily" && "Today's Challenges"}
              {activeTab === "weekly" && "This Week's Challenges"}
              {activeTab === "completed" && "Completed Challenges"}
            </h2>
            <Badge
              variant="outline"
              className={`px-3 py-1 ${
                activeTab === "completed"
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {getActiveChallengesCount()} {activeTab === "completed" ? "Done" : "Active"}
            </Badge>
          </div>

          {/* Challenge Cards */}
          <div className="space-y-4">
            {activeTab === "daily" &&
              dailyChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}

            {activeTab === "weekly" &&
              weeklyChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}

            {activeTab === "completed" && (
              <>
                {completedChallenges.length > 0 ? (
                  completedChallenges.map((challenge) => (
                    <CompletedChallengeCard key={challenge.id} challenge={challenge} />
                  ))
                ) : (
                  <Card className="p-12 text-center shadow-neumorphic border-border">
                    <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      No completed challenges yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Start playing to complete your first challenge!
                    </p>
                    <Button variant="game" onClick={() => handleTabChange("daily")}>
                      View Active Challenges
                    </Button>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DailyChallenge;
