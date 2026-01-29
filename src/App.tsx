import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import GameDetails from "./pages/GameDetails";
import GamePlay from "./pages/GamePlay";
import CreateGame from "./pages/CreateGame";
import Leaderboard from "./pages/Leaderboard";
import Search from "./pages/Search";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import DailyChallenge from "./pages/DailyChallenge";
import Favourites from "./pages/Favourites";
import MyGames from "./pages/MyGames";
import Tags from "./pages/Tags";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/game-details" element={<GameDetails />} />
          <Route path="/gameplay" element={<GamePlay />} />
          <Route path="/create" element={<CreateGame />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/daily-challenge" element={<DailyChallenge />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/my-games" element={<MyGames />} />
          <Route path="/tags" element={<Tags />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
