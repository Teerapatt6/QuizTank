import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowLeft,
  Play,
  Heart,
  Share2,
  MoreHorizontal,
  Flag,
  Star,
  Trophy,
  Crown,
  Target,
  Crosshair,
  Shield,
  Zap,
  ChevronDown,
  HelpCircle,
  Bookmark,
} from "lucide-react";
import tankIcon from "@/assets/tank-icon.jpg";
import gameMap from "@/assets/game-map.jpg";
import heroTank from "@/assets/hero-tank.jpg";

// Related games data
const relatedGames = [
  {
    id: 1,
    title: "Calculus I",
    description: "พื้นฐานแคลคูลัสสำหรับผู้เริ่มต้น ครอบคลุมลิมิต อนุพันธ์ และการประยุกต์ใช้งานเบื้องต้น",
    questions: 20,
    xp: 100,
    rating: 5.0,
    difficulty: "Hard" as const,
    category: "Math",
    image: gameMap,
  },
  {
    id: 2,
    title: "Calculus II",
    description: "ต่อยอดจาก Calculus I เน้นอินทิกรัล เทคนิคการอินทิเกรต และอนุกรมอนันต์",
    questions: 10,
    xp: 100,
    rating: 4.6,
    difficulty: "Hard" as const,
    category: "Math",
    image: heroTank,
  },
  {
    id: 3,
    title: "Calculus III",
    description: "แคลคูลัสหลายตัวแปร ครอบคลุมเวกเตอร์ พื้นผิว และอินทิกรัลเชิงซ้อน",
    questions: 5,
    xp: 100,
    rating: 4.3,
    difficulty: "Hard" as const,
    category: "Math",
    image: gameMap,
  },
  {
    id: 4,
    title: "Python Language",
    description: "เรียนพิมพ์โค้ด Python ตั้งแต่พื้นฐานจนเข้าใจ ฟังก์ชัน ไปจนถึงการทำโปรเจกต์ง่ายๆ",
    questions: 25,
    xp: 50,
    rating: 4.6,
    difficulty: "Easy" as const,
    category: "Technology",
    image: heroTank,
  },
];

// Leaderboard data
const leaderboardData = [
  { rank: 1, name: "TankMaster", score: 9850, time: "12:34" },
  { rank: 2, name: "QuizKing", score: 9720, time: "13:02" },
  { rank: 3, name: "MathNinja", score: 9680, time: "13:15" },
  { rank: 4, name: "BrainTank", score: 9540, time: "14:01" },
  { rank: 5, name: "QuickShot", score: 9420, time: "14:22" },
];

export default function GameDetails() {
  const navigate = useNavigate();
  const [isFavourite, setIsFavourite] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState<'gameplay' | 'leaderboard'>('gameplay');

  const game = {
    title: "Math Blitz Battle",
    creator: "DSGas",
    description:
      "Math Blitz Battle is a fast-paced math challenge where you solve questions under time pressure. It tests your accuracy, speed, and quick decision-making as each round becomes progressively harder. Perfect for students looking to sharpen their mathematical skills while having fun in an arcade-style environment.",
    difficulty: "Medium",
    questions: 9,
    xp: 100,
    rating: 4.8,
    tags: ["Math", "Mathematics", "Maths"],
    imageUrl: tankIcon,
  };

  const userProgress = {
    level: 25,
    currentXp: 3400,
    maxXp: 5000,
    gamesPlayed: 100,
    passed: 50,
    failed: 50,
  };

  const gameSettings = [
    { label: "Initial Ammo", value: "50 bullets", icon: Crosshair, color: "bg-pink-50 border-pink-100" },
    { label: "Hearts", value: "3 hearts", icon: Heart, color: "bg-pink-50 border-pink-100" },
    { label: "Ammo per Answer", value: "+5 bullets", icon: Zap, color: "bg-blue-50 border-blue-100" },
    { label: "Enemies", value: "8 tanks", icon: Shield, color: "bg-blue-50 border-blue-100" },
  ];

  const handleToggleFavourite = () => {
    setIsFavourite(!isFavourite);
    toast.success(isFavourite ? "Removed from favourites" : "Added to favourites");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: game.title,
          text: game.description,
          url: window.location.href,
        });
      } catch {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const handleSubmitReport = () => {
    if (reportMessage.trim()) {
      // POST /report/{game_id} with message
      toast.success("Report sent!");
      setIsReportOpen(false);
      setReportMessage("");
    }
  };

  const handlePlayNow = () => {
    navigate("/gameplay");
  };

  const handleTagClick = (tag: string) => {
    navigate(`/tags?query=${encodeURIComponent(tag)}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-600 border-green-200";
      case "Medium":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "Hard":
        return "bg-red-100 text-red-600 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Simple Back Button - No full-width bar */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-500 hover:underline transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Games</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Header Card */}
            <Card className="shadow-lg border-gray-100 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-6 flex-col md:flex-row">
                  {/* Game Image */}
                  <div className="relative w-full md:w-48 h-48 rounded-2xl overflow-hidden shadow-md flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200">
                    <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Game Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{game.title}</h1>
                        <div className="flex items-center gap-2 text-gray-500 mb-4">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs">👤</span>
                          </div>
                          <span>{game.creator}</span>
                        </div>
                      </div>
                      {/* Rating Badge */}
                      <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-full border border-yellow-200">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{game.rating}</span>
                      </div>
                    </div>

                    {/* Badges Row */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge className={`${getDifficultyColor(game.difficulty)} border`}>
                        {game.difficulty}
                      </Badge>
                      <span className="text-gray-500 text-sm">{game.questions} Questions</span>
                      <span className="text-green-600 font-medium text-sm">+{game.xp} XP</span>
                    </div>

                    {/* Clickable Tags - Positioned below with proper spacing */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {game.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleTagClick(tag)}
                          className="text-blue-500 text-sm hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Combined Gameplay Info + Leaderboard Tabbed Card */}
            <Card className="shadow-md border-gray-100">
              <CardContent className="p-6">
                {/* Tab Bar */}
                <div 
                  role="tablist" 
                  className="flex border-b border-gray-200 mb-6"
                >
                  <button
                    role="tab"
                    aria-selected={activeInfoTab === 'gameplay'}
                    aria-controls="gameplay-panel"
                    id="gameplay-tab"
                    onClick={() => setActiveInfoTab('gameplay')}
                    className={`px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2 -mb-px ${
                      activeInfoTab === 'gameplay'
                        ? 'text-[#007BFF] border-[#007BFF] font-semibold'
                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Gameplay Info
                  </button>
                  <button
                    role="tab"
                    aria-selected={activeInfoTab === 'leaderboard'}
                    aria-controls="leaderboard-panel"
                    id="leaderboard-tab"
                    onClick={() => setActiveInfoTab('leaderboard')}
                    className={`px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2 -mb-px ${
                      activeInfoTab === 'leaderboard'
                        ? 'text-[#007BFF] border-[#007BFF] font-semibold'
                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Leaderboard
                  </button>
                </div>

                {/* Tab Content */}
                {activeInfoTab === 'gameplay' && (
                  <div
                    role="tabpanel"
                    id="gameplay-panel"
                    aria-labelledby="gameplay-tab"
                  >
                    <h3 className="text-md font-bold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">{game.description}</p>
                    
                    {/* Game Settings */}
                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-md font-bold text-gray-900 mb-4">Game Settings</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {gameSettings.map((setting) => {
                          const Icon = setting.icon;
                          return (
                            <div key={setting.label} className={`${setting.color} border rounded-xl p-4 flex items-center gap-3`}>
                              <div className="p-2 rounded-lg bg-white/50">
                                <Icon className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">{setting.label}</p>
                                <p className="font-semibold text-gray-900">{setting.value}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeInfoTab === 'leaderboard' && (
                  <div
                    role="tabpanel"
                    id="leaderboard-panel"
                    aria-labelledby="leaderboard-tab"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-bold text-gray-900">Top Players</h3>
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </div>
                    {leaderboardData.length > 0 ? (
                      <div className="space-y-3">
                        {leaderboardData.map((entry) => (
                          <div
                            key={entry.rank}
                            className={`flex items-center justify-between p-4 rounded-xl ${
                              entry.rank <= 3
                                ? "bg-gradient-to-r from-yellow-50 to-transparent border-l-4 border-yellow-400"
                                : "bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                  entry.rank === 1
                                    ? "bg-yellow-400 text-yellow-900"
                                    : entry.rank === 2
                                    ? "bg-gray-300 text-gray-700"
                                    : entry.rank === 3
                                    ? "bg-orange-300 text-orange-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                #{entry.rank}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{entry.name}</p>
                                <p className="text-sm text-gray-500">{entry.time}</p>
                              </div>
                            </div>
                            <div className="text-xl font-bold text-blue-600">{entry.score.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No leaderboard data yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Games Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Games</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedGames.map((relatedGame) => (
                  <Card key={relatedGame.id} className="shadow-md hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer">
                    <div className="relative h-32 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                      <img
                        src={relatedGame.image}
                        alt={relatedGame.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-blue-500 text-white text-xs">{relatedGame.category}</Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge className={`${getDifficultyColor(relatedGame.difficulty)} text-xs`}>
                          {relatedGame.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{relatedGame.title}</h3>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{relatedGame.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>📝 {relatedGame.questions} Question</span>
                        <span className="text-green-600">+{relatedGame.xp} XP</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {relatedGame.rating}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => navigate("/gameplay")}
                        >
                          Play Now
                        </Button>
                        <Button variant="outline" size="sm" className="p-2">
                          <Bookmark className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Play Card */}
            <Card className="shadow-lg border-gray-100 sticky top-24">
              <CardContent className="p-6">
                {/* Start Game Button - Primary Blue */}
                <Button
                  onClick={handlePlayNow}
                  size="lg"
                  className="w-full bg-[#007BFF] hover:bg-blue-600 text-white font-bold text-lg h-14 shadow-md mb-4"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Game
                </Button>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-6">
                  <Button
                    variant="outline"
                    className={`flex-1 ${isFavourite ? 'bg-red-50 border-red-200' : ''}`}
                    onClick={handleToggleFavourite}
                  >
                    <Heart className={`w-4 h-4 ${isFavourite ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsReportOpen(true)}>
                        <Flag className="w-4 h-4 mr-2" />
                        Report Issue
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Your Progress Section - White background with gray progress bar */}
                <Card className="bg-white border border-gray-200 shadow-sm mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <Crown className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Your Progress</h3>
                        <p className="text-sm text-gray-500">Keep playing to level up!</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">Level {userProgress.level}</span>
                          <span className="text-sm text-gray-500">
                            {userProgress.currentXp} / {userProgress.maxXp} XP
                          </span>
                        </div>
                        {/* Neutral gray progress bar */}
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gray-500 rounded-full transition-all"
                            style={{ width: `${(userProgress.currentXp / userProgress.maxXp) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Games Played</span>
                          <span className="font-semibold text-gray-900">{userProgress.gamesPlayed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Passed</span>
                          <span className="font-semibold text-green-600">{userProgress.passed}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Failed</span>
                          <span className="font-semibold text-red-500">{userProgress.failed}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* How to Play - Only location (right column) */}
                <Collapsible open={isHowToPlayOpen} onOpenChange={setIsHowToPlayOpen}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">How to Play</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isHowToPlayOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <ul className="space-y-2 text-gray-600 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        Answer quiz questions correctly to earn ammo for your tank
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        Use your ammo to destroy enemy tanks before they reach your base
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        Wrong answers reduce your hearts - lose all hearts and it's game over
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        Complete all rounds to earn XP and climb the leaderboard
                      </li>
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Report Modal */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-500" />
              Report Issue
            </DialogTitle>
            <DialogDescription>
              Let us know if you found a bug or inappropriate content.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Describe the issue, e.g. game bug or inappropriate content..."
            value={reportMessage}
            onChange={(e) => setReportMessage(e.target.value)}
            className="min-h-32"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#007BFF] hover:bg-blue-600"
              onClick={handleSubmitReport}
              disabled={!reportMessage.trim()}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
