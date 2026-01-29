import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Zap, Target, Clock, CheckCircle, XCircle } from "lucide-react";

type CellType = "empty" | "player" | "enemy" | "brick" | "steel" | "water" | "bullet";
type Direction = "up" | "down" | "left" | "right";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number | number[]; // Single or multiple correct answers
  correctAnswerText?: string; // For text-input mode
  type: "single" | "multiple" | "text";
}

export default function GamePlay() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState({
    health: 3,
    ammo: 10,
    score: 0,
    time: 0,
    enemiesLeft: 3,
  });
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]); // For multi-select
  const [textAnswer, setTextAnswer] = useState(""); // For text input
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 5, y: 12 });
  const [playerDirection, setPlayerDirection] = useState<Direction>("up");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions] = useState(10);

  // Sample quiz questions with different types
  const quizQuestions: QuizQuestion[] = [
    {
      question: "What is 15 × 8?",
      options: ["110", "120", "130", "140"],
      correctAnswer: 1,
      type: "single",
    },
    {
      question: "Select all prime numbers:",
      options: ["2", "4", "7", "9", "11", "15"],
      correctAnswer: [0, 2, 4],
      type: "multiple",
    },
    {
      question: "What is 7³?",
      options: ["243", "343", "443", "543"],
      correctAnswer: 1,
      type: "single",
    },
    {
      question: "What is the chemical symbol for gold?",
      options: [],
      correctAnswer: 0,
      correctAnswerText: "Au",
      type: "text",
    },
  ];

  // Initialize game grid (14x14)
  const createInitialGrid = (): CellType[][] => {
    const grid: CellType[][] = Array(14)
      .fill(null)
      .map(() => Array(14).fill("empty"));

    // Add walls (brick and steel)
    for (let i = 3; i < 11; i += 2) {
      for (let j = 3; j < 11; j += 2) {
        grid[i][j] = Math.random() > 0.5 ? "brick" : "steel";
      }
    }

    // Add water
    for (let i = 1; i < 13; i++) {
      if (Math.random() > 0.8) {
        grid[i][Math.floor(Math.random() * 14)] = "water";
      }
    }

    // Add enemies
    grid[2][2] = "enemy";
    grid[2][11] = "enemy";
    grid[11][6] = "enemy";

    // Add player
    grid[playerPos.y][playerPos.x] = "player";

    return grid;
  };

  const [grid, setGrid] = useState<CellType[][]>(createInitialGrid());

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState((prev) => ({ ...prev, time: prev.time + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Show quiz periodically
  useEffect(() => {
    const quizTimer = setInterval(() => {
      if (!showQuiz && gameState.enemiesLeft > 0) {
        setCurrentQuestion(quizQuestions[Math.floor(Math.random() * quizQuestions.length)]);
        setShowQuiz(true);
      }
    }, 15000);
    return () => clearInterval(quizTimer);
  }, [showQuiz, gameState.enemiesLeft]);

  const handleMove = (direction: Direction) => {
    setPlayerDirection(direction);
    let newX = playerPos.x;
    let newY = playerPos.y;

    switch (direction) {
      case "up":
        newY = Math.max(0, playerPos.y - 1);
        break;
      case "down":
        newY = Math.min(13, playerPos.y + 1);
        break;
      case "left":
        newX = Math.max(0, playerPos.x - 1);
        break;
      case "right":
        newX = Math.min(13, playerPos.x + 1);
        break;
    }

    const targetCell = grid[newY][newX];
    if (targetCell !== "brick" && targetCell !== "steel" && targetCell !== "water") {
      setPlayerPos({ x: newX, y: newY });
      const newGrid = [...grid];
      newGrid[playerPos.y][playerPos.x] = "empty";
      newGrid[newY][newX] = "player";
      setGrid(newGrid);
    }
  };

  const handleShoot = () => {
    if (gameState.ammo > 0) {
      setGameState((prev) => ({ ...prev, ammo: prev.ammo - 1 }));
      // Trigger quiz for shooting
      if (!showQuiz) {
        setCurrentQuestion(quizQuestions[Math.floor(Math.random() * quizQuestions.length)]);
        setShowQuiz(true);
      }
    }
  };

  const handleAnswerQuiz = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    const correct = currentQuestion && answerIndex === currentQuestion.correctAnswer;
    setIsCorrect(!!correct);
    setShowResult(true);

    setTimeout(() => {
      if (correct) {
        setGameState((prev) => ({
          ...prev,
          ammo: prev.ammo + 3,
          score: prev.score + 100,
          enemiesLeft: Math.max(0, prev.enemiesLeft - 1),
        }));
      } else {
        setGameState((prev) => ({
          ...prev,
          health: Math.max(0, prev.health - 1),
        }));
      }
      
      resetQuizState();
    }, 1500);
  };

  const handleMultiSelectToggle = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswers((prev) =>
      prev.includes(answerIndex)
        ? prev.filter((i) => i !== answerIndex)
        : [...prev, answerIndex]
    );
  };

  const handleSubmitMultiSelect = () => {
    if (showResult || selectedAnswers.length === 0) return;
    
    const correctAnswers = currentQuestion?.correctAnswer as number[];
    const correct =
      selectedAnswers.length === correctAnswers.length &&
      selectedAnswers.every((ans) => correctAnswers.includes(ans));
    
    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      if (correct) {
        setGameState((prev) => ({
          ...prev,
          ammo: prev.ammo + 3,
          score: prev.score + 100,
          enemiesLeft: Math.max(0, prev.enemiesLeft - 1),
        }));
      } else {
        setGameState((prev) => ({
          ...prev,
          health: Math.max(0, prev.health - 1),
        }));
      }
      
      resetQuizState();
    }, 1500);
  };

  const handleSubmitTextAnswer = () => {
    if (showResult || !textAnswer.trim()) return;
    
    const correct =
      currentQuestion?.correctAnswerText?.toLowerCase().trim() ===
      textAnswer.toLowerCase().trim();
    
    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      if (correct) {
        setGameState((prev) => ({
          ...prev,
          ammo: prev.ammo + 3,
          score: prev.score + 100,
          enemiesLeft: Math.max(0, prev.enemiesLeft - 1),
        }));
      } else {
        setGameState((prev) => ({
          ...prev,
          health: Math.max(0, prev.health - 1),
        }));
      }
      
      resetQuizState();
    }, 1500);
  };

  const resetQuizState = () => {
    setShowQuiz(false);
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setSelectedAnswers([]);
    setTextAnswer("");
    setShowResult(false);
    setQuestionNumber((prev) => Math.min(prev + 1, totalQuestions));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCellColor = (cell: CellType) => {
    switch (cell) {
      case "player":
        return "bg-tank-player shadow-glow";
      case "enemy":
        return "bg-tank-enemy animate-pulse-glow";
      case "brick":
        return "bg-wall-brick";
      case "steel":
        return "bg-wall-steel";
      case "water":
        return "bg-water";
      case "bullet":
        return "bg-warning";
      default:
        return "bg-muted/30";
    }
  };

  // Game Over
  if (gameState.health <= 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center bg-card rounded-3xl p-12 shadow-elevated max-w-md animate-fade-in">
          <div className="text-6xl mb-4">💥</div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Game Over</h1>
          <p className="text-xl text-muted-foreground mb-2">Final Score: {gameState.score}</p>
          <p className="text-lg text-muted-foreground mb-8">Time: {formatTime(gameState.time)}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/")}>
              Exit
            </Button>
            <Button variant="game" onClick={() => window.location.reload()}>
              Play Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Victory
  if (gameState.enemiesLeft <= 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center bg-card rounded-3xl p-12 shadow-elevated max-w-md animate-fade-in">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Victory!</h1>
          <p className="text-xl text-primary mb-2">Score: {gameState.score}</p>
          <p className="text-lg text-muted-foreground mb-8">Time: {formatTime(gameState.time)}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button variant="game" onClick={() => window.location.reload()}>
              Play Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Enhanced Header Status Bar */}
      <div className="container mx-auto mb-6">
        <div className="bg-card rounded-2xl p-4 shadow-neumorphic">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-primary transition-smooth p-2 hover:bg-muted rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              {/* Health */}
              <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-xl">
                <Heart className="w-5 h-5 text-destructive fill-destructive" />
                <span className="font-bold text-foreground text-lg">{gameState.health}</span>
              </div>

              {/* Ammo */}
              <div className="flex items-center gap-2 px-4 py-2 bg-warning/10 rounded-xl">
                <Zap className="w-5 h-5 text-warning fill-warning" />
                <span className="font-bold text-foreground text-lg">{gameState.ammo}</span>
              </div>

              {/* Score */}
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl">
                <Target className="w-5 h-5 text-primary" />
                <span className="font-bold text-foreground text-lg">{gameState.score}</span>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-xl">
                <Clock className="w-5 h-5 text-accent" />
                <span className="font-bold text-foreground text-lg">{formatTime(gameState.time)}</span>
              </div>
            </div>

            {/* Enemies Remaining */}
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl">
              <span className="text-sm font-semibold text-muted-foreground">Enemies:</span>
              <span className="font-bold text-foreground text-lg">{gameState.enemiesLeft}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Grid */}
      <div className="container mx-auto flex justify-center">
        <div className="bg-card rounded-2xl p-6 shadow-elevated">
          <div className="grid grid-cols-14 gap-1 mb-6">
            {grid.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`w-8 h-8 rounded transition-smooth ${getCellColor(cell)} ${
                    cell === "player" ? "animate-tank-move" : ""
                  }`}
                />
              ))
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            <div className="grid grid-cols-3 gap-2">
              <div />
              <Button variant="outline" size="icon" onClick={() => handleMove("up")}>
                ↑
              </Button>
              <div />
              <Button variant="outline" size="icon" onClick={() => handleMove("left")}>
                ←
              </Button>
              <Button variant="game" size="icon" onClick={handleShoot}>
                🎯
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleMove("right")}>
                →
              </Button>
              <div />
              <Button variant="outline" size="icon" onClick={() => handleMove("down")}>
                ↓
              </Button>
              <div />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Quiz Modal with Answer States */}
      {showQuiz && currentQuestion && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-card rounded-3xl p-8 md:p-12 max-w-4xl w-full shadow-elevated border border-primary/10 animate-scale-in">
            
            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => navigate(-1)} 
                className="text-muted-foreground hover:text-primary transition-smooth p-2 hover:bg-muted/50 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-3 px-6 py-2 bg-primary/5 rounded-full border border-primary/20">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    Question {questionNumber} of {totalQuestions}
                  </span>
                </div>
              </div>
              
              <div className="w-[52px]" /> {/* Spacer for alignment */}
            </div>

            {/* Quiz Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl mb-4 shadow-glow animate-pulse">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Answer to Fire!
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                {currentQuestion.question}
              </p>
            </div>

            {/* Answer Options - Single Choice Mode */}
            {currentQuestion.type === "single" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === currentQuestion.correctAnswer;
                  const showCorrectState = showResult && isCorrectAnswer;
                  const showIncorrectState = showResult && isSelected && !isCorrect;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerQuiz(index)}
                      disabled={showResult}
                      className={`
                        group relative flex items-center gap-4 p-6 rounded-2xl text-left font-semibold text-lg
                        transition-all duration-300 ease-out
                        ${!showResult && !isSelected ? 'bg-card border-2 border-border hover:border-primary hover:bg-primary/5 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]' : ''}
                        ${isSelected && !showResult ? 'bg-primary/10 border-2 border-primary scale-[0.98]' : ''}
                        ${showCorrectState ? 'bg-success/10 border-2 border-success shadow-glow animate-scale-in' : ''}
                        ${showIncorrectState ? 'bg-destructive/10 border-2 border-destructive animate-shake' : ''}
                        ${showResult && !isSelected && !isCorrectAnswer ? 'opacity-40' : ''}
                        disabled:cursor-not-allowed
                      `}
                    >
                      <div className={`
                        flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl
                        transition-all duration-300
                        ${!showResult ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground' : ''}
                        ${showCorrectState ? 'bg-success text-success-foreground' : ''}
                        ${showIncorrectState ? 'bg-destructive text-destructive-foreground' : ''}
                      `}>
                        {showCorrectState ? (
                          <CheckCircle className="w-6 h-6 animate-scale-in" />
                        ) : showIncorrectState ? (
                          <XCircle className="w-6 h-6 animate-scale-in" />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </div>
                      
                      <span className={`
                        flex-1 transition-colors duration-300
                        ${!showResult ? 'text-foreground group-hover:text-primary' : ''}
                        ${showCorrectState ? 'text-success font-bold' : ''}
                        ${showIncorrectState ? 'text-destructive' : ''}
                      `}>
                        {option}
                      </span>

                      {!showResult && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Answer Options - Multi-Select Mode */}
            {currentQuestion.type === "multiple" && (
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswers.includes(index);
                    const correctAnswers = currentQuestion.correctAnswer as number[];
                    const isCorrectAnswer = correctAnswers.includes(index);
                    const showCorrectState = showResult && isCorrectAnswer;
                    const showIncorrectState = showResult && isSelected && !isCorrectAnswer;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleMultiSelectToggle(index)}
                        disabled={showResult}
                        className={`
                          group relative flex items-center gap-4 p-5 rounded-xl text-left font-semibold text-base
                          transition-all duration-300 ease-out
                          ${!showResult && !isSelected ? 'bg-card border-2 border-border hover:border-primary hover:bg-primary/5 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]' : ''}
                          ${isSelected && !showResult ? 'bg-primary/10 border-2 border-primary scale-[0.98]' : ''}
                          ${showCorrectState ? 'bg-success/10 border-2 border-success shadow-glow' : ''}
                          ${showIncorrectState ? 'bg-destructive/10 border-2 border-destructive' : ''}
                          ${showResult && !isSelected && !isCorrectAnswer ? 'opacity-40' : ''}
                          disabled:cursor-not-allowed
                        `}
                      >
                        <div className={`
                          flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold border-2
                          transition-all duration-300
                          ${!showResult && !isSelected ? 'border-border bg-background' : ''}
                          ${isSelected && !showResult ? 'border-primary bg-primary text-primary-foreground' : ''}
                          ${showCorrectState ? 'border-success bg-success text-success-foreground' : ''}
                          ${showIncorrectState ? 'border-destructive bg-destructive text-destructive-foreground' : ''}
                        `}>
                          {showCorrectState ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : showIncorrectState ? (
                            <XCircle className="w-5 h-5" />
                          ) : isSelected ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span className="text-muted-foreground text-sm">{index + 1}</span>
                          )}
                        </div>
                        
                        <span className={`
                          flex-1 transition-colors duration-300
                          ${!showResult ? 'text-foreground group-hover:text-primary' : ''}
                          ${showCorrectState ? 'text-success font-bold' : ''}
                          ${showIncorrectState ? 'text-destructive' : ''}
                        `}>
                          {option}
                        </span>

                        {!showResult && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Submit Button for Multi-Select */}
                <Button
                  onClick={handleSubmitMultiSelect}
                  disabled={selectedAnswers.length === 0 || showResult}
                  variant="game"
                  size="lg"
                  className="w-full mt-4"
                >
                  Submit Answers ({selectedAnswers.length} selected)
                </Button>
              </div>
            )}

            {/* Answer Input - Text Mode */}
            {currentQuestion.type === "text" && (
              <div className="space-y-6 mb-8">
                <div className="relative">
                  <input
                    type="text"
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && textAnswer.trim()) {
                        handleSubmitTextAnswer();
                      }
                    }}
                    disabled={showResult}
                    placeholder="Type your answer..."
                    className={`
                      w-full px-6 py-5 rounded-xl text-lg font-medium
                      transition-all duration-300
                      ${!showResult ? 'bg-card border-2 border-border focus:border-primary focus:bg-primary/5 focus:shadow-lg focus:outline-none' : ''}
                      ${showResult && isCorrect ? 'bg-success/10 border-2 border-success text-success' : ''}
                      ${showResult && !isCorrect ? 'bg-destructive/10 border-2 border-destructive text-destructive' : ''}
                      disabled:cursor-not-allowed disabled:opacity-70
                    `}
                  />
                  
                  {showResult && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {isCorrect ? (
                        <CheckCircle className="w-7 h-7 text-success animate-scale-in" />
                      ) : (
                        <XCircle className="w-7 h-7 text-destructive animate-scale-in" />
                      )}
                    </div>
                  )}
                </div>

                {showResult && !isCorrect && (
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20 animate-fade-in">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Correct Answer:</p>
                    <p className="text-lg font-bold text-success">{currentQuestion.correctAnswerText}</p>
                  </div>
                )}

                <Button
                  onClick={handleSubmitTextAnswer}
                  disabled={!textAnswer.trim() || showResult}
                  variant="game"
                  size="lg"
                  className="w-full"
                >
                  Submit Answer
                </Button>
              </div>
            )}

            {/* Rewards Info */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-6 border-t border-border">
              <div className="flex items-center gap-2 px-4 py-2 bg-warning/5 rounded-xl border border-warning/20">
                <Zap className="w-5 h-5 text-warning fill-warning" />
                <span className="text-sm font-medium text-foreground">+3 Ammo for correct answer</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-destructive/5 rounded-xl border border-destructive/20">
                <Heart className="w-5 h-5 text-destructive fill-destructive" />
                <span className="text-sm font-medium text-foreground">-1 Health for wrong answer</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
