import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyGames from "./pages/MyGames";
import GameDetails from "./pages/GameDetails";
import EditGame from "./pages/EditGame";
import CreateGame from "./pages/CreateGame";
import DiscoverGames from "./pages/DiscoverGames";
import Favourites from "./pages/Favourites";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DiscoverGames />} />
          <Route path="/my-games" element={<MyGames />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/game/:id" element={<GameDetails />} />
          <Route path="/edit/:id" element={<EditGame />} />
          <Route path="/create" element={<CreateGame />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
