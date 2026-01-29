import { categories } from '@/data/mockQuizzes';
import { Category } from '@/types/quiz';

interface CategoryBarProps {
  selectedCategory?: Category;
  onSelectCategory?: (category: Category | undefined) => void;
}

const allCategories = [
  { id: undefined, name: 'All', icon: '🎯' },
  ...categories,
];

const CategoryBar = ({ selectedCategory, onSelectCategory }: CategoryBarProps) => {
  return (
    <div className="w-full overflow-hidden py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-1 md:gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {allCategories.map((category) => (
            <button
              key={category.id ?? 'all'}
              onClick={() => onSelectCategory?.(category.id as Category | undefined)}
              className={`flex flex-col items-center gap-1 p-2 md:p-2.5 rounded-xl transition-all duration-200 hover:bg-secondary group shrink-0 min-w-[60px] md:min-w-[70px] ${
                selectedCategory === category.id ? 'bg-secondary' : ''
              }`}
            >
              <span className="text-xl md:text-2xl group-hover:scale-110 transition-transform">
                {category.icon}
              </span>
              <span className="text-[10px] md:text-xs font-medium text-muted-foreground group-hover:text-foreground whitespace-nowrap">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
