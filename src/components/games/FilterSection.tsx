import { useState } from "react";
import { Search, Filter, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSectionProps {
  searchPlaceholder?: string;
  showSortBy?: boolean;
  showViewToggle?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onSearchChange?: (value: string) => void;
  onCategoryChange?: (value: string) => void;
  onDifficultyChange?: (value: string) => void;
  onSortChange?: (value: string) => void;
}

export function FilterSection({
  searchPlaceholder = "Search by Title, Category, or Topic...",
  showSortBy = false,
  showViewToggle = false,
  viewMode = 'grid',
  onViewModeChange,
  onSearchChange,
  onCategoryChange,
  onDifficultyChange,
  onSortChange,
}: FilterSectionProps) {
  const [showFilters, setShowFilters] = useState(true);

  return (
    <div className="rounded-xl bg-card p-6 card-shadow">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-10 bg-muted border-0 h-12"
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="gap-2 h-12 px-6"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mt-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Category */}
            <div className="flex flex-col gap-2 min-w-[180px]">
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select onValueChange={onCategoryChange}>
                <SelectTrigger className="bg-muted border-0 h-10">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="math">Math</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="geography">Geography</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="flex flex-col gap-2 min-w-[180px]">
              <label className="text-sm font-medium text-foreground">Difficulty</label>
              <Select onValueChange={onDifficultyChange}>
                <SelectTrigger className="bg-muted border-0 h-10">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By - optional */}
            {showSortBy && (
              <div className="flex flex-col gap-2 min-w-[180px]">
                <label className="text-sm font-medium text-foreground">Sort By</label>
                <Select onValueChange={onSortChange}>
                  <SelectTrigger className="bg-muted border-0 h-10">
                    <SelectValue placeholder="Most Popular" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="questions">Most Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* View Toggle - optional */}
          {showViewToggle && (
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className={`px-3 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => onViewModeChange?.('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className={`px-3 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => onViewModeChange?.('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
